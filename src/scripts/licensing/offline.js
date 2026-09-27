const SCHEMA = 'studio.cucurbits.licensing.v2';
export const MAX_BYTES = 65536;
const encoder = new TextEncoder();
const invalid = () => new Error('Invalid activation data. Export the challenge again and retry.');
const size = text => encoder.encode(text).length;

export function encodeText(raw) {
  const bytes = encoder.encode(raw);
  if (bytes.length > MAX_BYTES) throw invalid();
  return 'SC-ACT1-' + btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

export function parseChallenge(input) {
  if (typeof input !== 'string' || input.length > 87390) throw invalid();
  let raw = input.trim();
  if (raw.startsWith('SC-ACT1-')) {
    const encoded = raw.slice(8);
    if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) throw invalid();
    try {
      const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
      raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (encodeText(raw) !== input.trim()) throw invalid();
    } catch { throw invalid(); }
  } else if (size(input) > MAX_BYTES) throw invalid();
  if (size(raw) > MAX_BYTES) throw invalid();
  let value;
  try { value = JSON.parse(raw); } catch { throw invalid(); }
  const fields = ['schema', 'type', 'requestId', 'createdAt', 'protocolVersion', 'challengeNonce', 'productId', 'machineBindingDigest', 'machineLabel'];
  if (!value || Object.keys(value).sort().join() !== fields.sort().join()
      || value.schema !== SCHEMA || value.type !== 'offline-challenge' || value.protocolVersion !== 2
      || !fields.filter(f => f !== 'protocolVersion').every(f => typeof value[f] === 'string' && value[f].length > 0)
      || size(value.machineLabel) > 256 || /[\u0000-\u001f\u007f]/.test(value.machineLabel)
      || !/^[a-f0-9]{64}$/.test(value.machineBindingDigest)) throw invalid();
  return value; // The service performs complete protocol and freshness validation.
}

export function serviceUrl(configuredBase, origin, replacement) {
  const url = new URL(configuredBase || origin);
  if (!configuredBase) url.pathname = url.pathname.replace(/\/(offline|accounts|recovery)\/?$/, '');
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Activation service is not configured with a valid HTTPS address.');
  return url.href.replace(/\/+$/, '') + (typeof replacement === 'string' ? replacement : '/v1/offline' + (replacement ? '/replace' : ''));
}

async function post(url, body, fetcher) {
  const raw = JSON.stringify(body);
  if (size(raw) > MAX_BYTES) throw new Error('Activation request is too large. Export a smaller challenge and retry.');
  let reader;
  let message = 'Connection or response failed. Retry the same request.';
  try {
    const response = await fetcher(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw, credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      const messages = { 400: 'The request is invalid. Check it and start again.', 401: 'Check your activation code and retry.', 403: 'This code does not include the requested product.', 409: 'This request has expired, has already been used or has changed. Start again.', 413: 'Activation data is too large.', 429: 'Too many requests. Wait a minute and retry.' };
      message = messages[response.status] || 'The service is unavailable. Retry the same request.';
      throw new Error();
    }
    reader = response.body.getReader();
    let length = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > MAX_BYTES) throw invalid();
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new Error(message);
  } finally { await reader?.cancel().catch(() => {}); }
}

export function createFlow(base, origin, fetcher = fetch) {
  let context;
  function reset() { context = undefined; }
  async function receive(body, replacement) {
    const result = await post(serviceUrl(base, origin, replacement), body, fetcher);
    const challenge = context.challenge;
    if (result?.schema !== SCHEMA) throw invalid();
    if (!replacement && result.type === 'seat-limit-response') {
      const p = result.signedPayload;
      if (p?.protocolVersion !== 2 || p.requestId !== challenge.requestId || p.productId !== challenge.productId
          || p.machineBindingDigest !== challenge.machineBindingDigest || typeof p.replacementNonce !== 'string'
          || !Array.isArray(result.activeSeats) || !result.activeSeats.length || result.activeSeats.length > 24
          || p.used !== result.activeSeats.length || p.used < p.total
          || !result.activeSeats.every(s => typeof s.activationId === 'string' && typeof s.machineLabel === 'string' && typeof s.lastSeenAt === 'string')
          || new Set(result.activeSeats.map(s => s.activationId)).size !== result.activeSeats.length) throw invalid();
      context.chooser = result;
    } else {
      if (result.type !== 'offline-response' || result.requestId !== challenge.requestId || result.challengeNonce !== challenge.challengeNonce
          || result.signedPayload?.challengeNonce !== challenge.challengeNonce || result.signedPayload?.machineBindingDigest !== challenge.machineBindingDigest
          || result.signedPayload?.productId !== challenge.productId) throw invalid();
      reset();
    }
    return result;
  }
  return {
    reset,
    async submit(text, code) {
      if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(code)) throw new Error('Enter a valid activation code.');
      context = { challenge: parseChallenge(text), code };
      return receive({ schema: SCHEMA, type: 'offline-submission', protocolVersion: 2, activationCode: code, challenge: context.challenge }, false);
    },
    async replace(id, scope = 'product') {
      if (!context?.chooser) throw new Error('Import a challenge first.');
      const p = context.chooser.signedPayload;
      if (!['product', 'backing-account'].includes(scope) || !context.chooser.activeSeats.some(s => s.activationId === id)
        || (context.selected && (context.selected !== id || context.scope !== scope))) throw new Error('Select the same computer and scope to retry its replacement.');
      context.selected = id; context.scope = scope;
      return receive({ schema: SCHEMA, type: 'seat-replacement-confirmation', protocolVersion: 2, requestId: context.challenge.requestId,
        replacementNonce: p.replacementNonce, activationCode: context.code, replaceActivationId: id, replacementScope: scope }, true);
    }
  };
}

export function createAccountFlow(base, origin, fetcher = fetch) {
  let linkNonce;
  const reset = () => { linkNonce = undefined; };
  async function send(path, type, fields) {
    const requestId = crypto.randomUUID();
    const result = await post(serviceUrl(base, origin, path), { schema: SCHEMA, protocolVersion: 2, type, requestId, ...fields }, fetcher);
    if (type === 'recovery-request') {
      if (result?.accepted !== true) throw invalid();
    } else if (type === 'recovery-confirmation') {
      if (typeof result?.accountId !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(result?.activationCode)) throw invalid();
    } else {
      const p = result?.signedPayload;
      if (result?.schema !== SCHEMA || p?.protocolVersion !== 2 || p.domain !== SCHEMA
        || result.requestId !== requestId || p.requestId !== requestId || p.type !== result.type) throw invalid();
      if (type === 'account-link-request') {
        if (result.type !== 'account-link-preview' || !Array.isArray(result.accounts) || result.accounts.length < 2
          || result.accounts.length > 8 || !/^[A-Za-z0-9_-]{43}$/.test(p.linkNonce)) throw invalid();
      } else if (result.type !== 'account-update' || !Array.isArray(result.accountSummary?.accounts)
        || p.action !== (type === 'account-link-confirmation' ? 'link' : 'unlink')
        || (type === 'account-link-confirmation' && p.linkNonce !== fields.linkNonce)) throw invalid();
    }
    return result;
  }
  return {
    reset,
    async beginLink(activationCode, otherActivationCode) {
      reset();
      const result = await send('/v2/accounts/link', 'account-link-request', { activationCode, otherActivationCode });
      linkNonce = result.signedPayload.linkNonce;
      return result;
    },
    async confirmLink() {
      if (!linkNonce) throw new Error('Request a link preview first.');
      const result = await send('/v2/accounts/link/confirm', 'account-link-confirmation', { linkNonce });
      reset(); return result;
    },
    unlink: (activationCode, accountId) => send('/v2/accounts/unlink', 'account-unlink-request', { activationCode, accountId }),
    recover: email => send('/v2/recovery', 'recovery-request', { email }),
    confirmRecovery: token => send('/v2/recovery/confirm', 'recovery-confirmation', { token }),
  };
}
