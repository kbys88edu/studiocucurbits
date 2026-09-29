export {};

const root = document.querySelector<HTMLElement>('[data-setup]');
const t = (en: string, ja: string) => document.documentElement.lang === 'ja' ? ja : en;
let token = new URLSearchParams(location.hash.slice(1)).get('token');
if (location.search || location.hash) history.replaceState(null, '', location.pathname);

if (root && window.top !== window.self) {
  token = null;
  root.textContent = t('Open this page directly to set up your licence.', 'ライセンスを設定するには、このページを直接開いてください。');
} else if (root?.dataset.base) {
  const base = root.dataset.base;
  const status = root.querySelector<HTMLElement>('#setup-status')!;
  const error = root.querySelector<HTMLElement>('#setup-error')!;
  const retry = root.querySelector<HTMLButtonElement>('#setup-retry')!;
  const generate = root.querySelector<HTMLButtonElement>('#setup-generate')!;
  const confirmEmail = root.querySelector<HTMLButtonElement>('#setup-confirm-email')!;
  const result = root.querySelector<HTMLElement>('#setup-result')!;
  const code = root.querySelector<HTMLInputElement>('#setup-code')!;
  const codeTitle = root.querySelector<HTMLElement>('#setup-result-title')!;
  const transactionIdPattern = /^txn_[a-z0-9]{26}$/;
  const codePattern = /^[A-Za-z0-9_-]{43}$/;
  const accountIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  let proof: { transactionId: string; secret: string } | undefined;
  let busy = false;
  let closed = false;
  let requestController: AbortController | undefined;

  async function post(path: string, body: object): Promise<unknown> {
    const controller = new AbortController();
    requestController = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const response = await fetch(`${base}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer', signal: controller.signal,
      });
      if (!response.ok) throw Error(String(response.status));
      reader = response.body?.getReader();
      if (!reader) throw Error('response');
      const chunks: Uint8Array[] = [];
      let length = 0;
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        length += next.value.length;
        if (length > 4096) throw Error('response');
        chunks.push(next.value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    } finally {
      clearTimeout(timeout);
      await reader?.cancel().catch(() => {});
      if (requestController === controller) requestController = undefined;
    }
  }

  function readProof() {
    try {
      const transactionId = sessionStorage.getItem('sc-setup-v1:latest');
      if (!transactionId || !transactionIdPattern.test(transactionId)) return;
      const secret = sessionStorage.getItem(`sc-setup-v1:${transactionId}`);
      if (!secret || !codePattern.test(secret)) return;
      proof = { transactionId, secret };
    } catch { /* Email setup remains available when tab storage is blocked. */ }
  }

  function clearProof() {
    try {
      if (proof) sessionStorage.removeItem(`sc-setup-v1:${proof.transactionId}`);
      sessionStorage.removeItem('sc-setup-v1:latest');
    } catch { /* The service still enforces one-time setup. */ }
    proof = undefined;
  }

  function isCanonicalCode(value: unknown): value is string {
    if (typeof value !== 'string' || !codePattern.test(value)) return false;
    try {
      const raw = atob(value.replaceAll('-', '+').replaceAll('_', '/') + '=');
      return raw.length === 32 && btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '') === value;
    } catch { return false; }
  }

  function showCode(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).sort().join() !== 'accountId,activationCode') throw Error('response');
    const data = value as { accountId: unknown; activationCode: unknown };
    if (typeof data.accountId !== 'string' || !accountIdPattern.test(data.accountId)
      || !isCanonicalCode(data.activationCode)) throw Error('response');
    code.value = data.activationCode;
    result.hidden = false;
    status.textContent = t('Your code is ready. Copy it before leaving this page.', 'コードを作成しました。このページを離れる前にコピーしてください。');
    codeTitle.focus();
  }

  async function checkStatus() {
    if (busy || closed || !proof) return;
    busy = true;
    retry.hidden = true;
    error.textContent = '';
    for (let attempt = 0; attempt < 3 && !closed; attempt++) {
      status.textContent = t('Checking your purchase and licence…', '購入とライセンスを確認しています…');
      try {
        const answer = await post('/v2/setup/status', proof);
        if (closed) break;
        if (!answer || typeof answer !== 'object' || Array.isArray(answer)
          || Object.keys(answer).join() !== 'status') throw Error('response');
        const state = (answer as { status?: unknown }).status;
        if (state === 'ready') {
          status.textContent = t('Your purchase is ready. Generate your activation code.', '購入を確認しました。アクティベーションコードを作成してください。');
          generate.hidden = false;
          break;
        }
        if (state === 'existing') {
          status.textContent = t('This purchase belongs to an existing licence account. Keep using your existing activation code, or use licence recovery if you have lost it.', 'この購入は既存のライセンスアカウントに追加されました。現在のアクティベーションコードを引き続き使用するか、紛失した場合はライセンスを再発行してください。');
          break;
        }
        if (state === 'unavailable') {
          status.textContent = t('Setup is unavailable for this purchase. Check your setup email or use licence recovery; contact support if the purchase was refunded.', 'この購入では設定を利用できません。設定用メールまたはライセンスの再発行をご確認ください。返金された購入についてはサポートへご連絡ください。');
          break;
        }
        if (state !== 'waiting') throw Error('response');
        status.textContent = t('Waiting for purchase confirmation. Your setup email is also a backup.', '購入の確認を待っています。設定用メールも予備としてご利用いただけます。');
        if (attempt === 2) retry.hidden = false;
        else await new Promise(resolve => setTimeout(resolve, 750));
      } catch {
        if (!closed) {
          error.textContent = t('The activation service is unavailable. Check again or use licence recovery.', '認証サービスを利用できません。もう一度確認するか、ライセンスを再発行してください。');
          retry.hidden = false;
        }
        break;
      }
    }
    busy = false;
  }

  async function confirm(path: string, body: object) {
    if (busy || closed) return;
    busy = true;
    generate.hidden = confirmEmail.hidden = retry.hidden = true;
    error.textContent = '';
    status.textContent = t('Creating your activation code…', 'アクティベーションコードを作成しています…');
    if (path === '/v2/setup/confirm') clearProof();
    try {
      const answer = await post(path, body);
      if (!closed) showCode(answer);
    } catch {
      if (!closed) {
        status.textContent = '';
        error.textContent = t('We could not confirm whether a code was created. Use licence recovery for a fresh code.', 'コードが作成されたか確認できませんでした。ライセンスを再発行して新しいコードを取得してください。');
      }
    } finally {
      busy = false;
      token = null;
    }
  }

  retry.addEventListener('click', () => { void checkStatus(); });
  generate.addEventListener('click', () => {
    if (proof) void confirm('/v2/setup/confirm', { transactionId: proof.transactionId, secret: proof.secret });
  });
  confirmEmail.addEventListener('click', () => {
    if (token) void confirm('/v2/recovery/confirm', {
      schema: 'studio.cucurbits.licensing.v2', protocolVersion: 2, type: 'recovery-confirmation',
      requestId: crypto.randomUUID(), token,
    });
  });
  window.addEventListener('pagehide', () => {
    closed = true;
    requestController?.abort();
    code.value = '';
    result.hidden = true;
    proof = undefined;
    token = null;
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) location.reload();
  });

  if (token) {
    if (!codePattern.test(token)) {
      token = null;
      error.textContent = t('This setup link is invalid. Use licence recovery.', 'この設定用リンクは無効です。ライセンスを再発行してください。');
    } else {
      status.textContent = t('Opening this link has not changed your code. Confirm below to create an activation code. This link expires after 15 minutes and can be used once.', 'このリンクを開いただけではコードは変更されません。下のボタンでアクティベーションコードを作成してください。リンクの有効期限は15分で、1回のみ使用できます。');
      confirmEmail.hidden = false;
    }
  } else {
    readProof();
    if (proof) void checkStatus();
    else status.textContent = t('We cannot find this tab’s checkout setup. Check your setup email or use licence recovery.', 'このタブの購入情報を確認できません。設定用メールまたはライセンスの再発行をご利用ください。');
  }
}
