import { createAccountFlow, createFlow, encodeText, MAX_BYTES, parseChallenge } from './offline.js';

const root = document.querySelector('[data-licensing]');
const t = (en, ja) => document.documentElement.lang === 'ja' ? ja : en;
let token = new URLSearchParams(location.hash.slice(1)).get('token');
// Remove even invalid tokens before the customer follows another link.
if (location.search || location.hash) history.replaceState(null, '', location.pathname);
if (window.top !== window.self) {
  token = undefined;
  if (root) root.textContent = t('Open this page directly to use licence services.', 'ライセンスサービスを利用するには、このページを直接開いてください。');
} else if (root?.dataset.base) initialize(root);
else token = undefined;

function initialize(root) {
  const el = id => root.querySelector(`#${id}`);
  const flow = createFlow(root.dataset.base, location.origin);
  const accounts = createAccountFlow(root.dataset.base, location.origin);
  const offline = root.dataset.mode === 'offline';
  let downloadUrl, selected;
  let busy = false, revision = 0;
  const fields = () => root.querySelectorAll('fieldset');
  fields().forEach(field => { field.disabled = false; });
  function clear() {
    revision++;
    flow.reset(); accounts.reset(); token = selected = undefined;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = undefined;
    root.querySelectorAll('form').forEach(form => form.reset());
    root.querySelectorAll('input, textarea').forEach(input => { if (!['checkbox', 'radio'].includes(input.type)) input.value = ''; });
    for (const id of ['replacement', 'result', 'recover-confirm', 'new-code-result']) if (el(id)) el(id).hidden = true;
    el('download')?.removeAttribute('href'); el('seats')?.replaceChildren();
    if (el('recover')) el('recover').hidden = false;
    if (el('scope')) el('scope').disabled = false;
    fields().forEach(field => { field.disabled = false; });
    el('status').textContent = el('error').textContent = '';
  }
  async function run(action, display) {
    if (busy) return;
    busy = true;
    const current = revision;
    el('error').textContent = '';
    el('status').textContent = t('Contacting the activation service…', '認証サービスに接続中…');
    fields().forEach(field => { field.disabled = true; });
    el('clear').disabled = true;
    try { const result = await action(); if (current === revision) display(result); }
    catch (error) {
      if (current === revision) {
        el('error').textContent = t(error.message, `リクエストを完了できませんでした。同じ内容で再試行するか、入力を確認してください。 (${error.message})`);
        el('status').textContent = '';
      }
    } finally {
      busy = false; fields().forEach(field => { field.disabled = false; });
      el('clear').disabled = false;
      if (offline) {
        el('inputs').disabled = !el('replacement').hidden || !el('result').hidden;
        if (selected) {
          el('seats').querySelectorAll('input').forEach(radio => { radio.disabled = radio.value !== selected; });
          el('scope').disabled = true;
        }
      }
    }
  }
  if (offline) {
    token = undefined;
    function show(result) {
      el('code').value = '';
      if (result.type === 'seat-limit-response') {
        el('seats').replaceChildren();
        for (const seat of result.activeSeats) {
          const label = document.createElement('label'), radio = document.createElement('input');
          radio.type = 'radio'; radio.name = 'seat'; radio.value = seat.activationId; radio.required = true;
          label.append(radio, document.createTextNode(` ${seat.machineLabel} — ${t('last seen', '最終確認')} ${seat.lastSeenAt}`));
          el('seats').append(label);
        }
        el('replacement').hidden = false;
        el('status').textContent = t('Select a computer and confirm its replacement.', 'コンピューターを選択し、認証の置き換えを確定してください。');
        el('seats').querySelector('input').focus();
      } else {
        el('challenge').value = el('file').value = '';
        el('replacement').hidden = true; el('seats').replaceChildren();
        const raw = JSON.stringify(result);
        el('response').value = encodeText(raw);
        downloadUrl = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
        el('download').href = downloadUrl; el('result').hidden = false;
        el('status').textContent = t('Response ready. Transfer it before clearing or closing this page.', 'レスポンスを取得しました。ページを閉じる前に保存してください。');
        el('result-title').focus();
      }
    }
    el('import').addEventListener('submit', event => {
      event.preventDefault(); const text = el('challenge').value, code = el('code').value;
      void run(() => flow.submit(text, code), show);
    });
    el('replacement').addEventListener('submit', event => {
      event.preventDefault(); selected = el('seats').querySelector('input:checked')?.value;
      if (!selected || !el('confirm').checked) return;
      const scope = el('scope').value;
      void run(() => flow.replace(selected, scope), show);
    });
    el('file').addEventListener('change', async () => {
      const file = el('file').files[0], current = revision;
      if (!file || busy) return;
      busy = true; el('inputs').disabled = el('clear').disabled = true; el('error').textContent = '';
      try {
        if (file.size > MAX_BYTES) throw Error();
        const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
        parseChallenge(text);
        if (current === revision) el('challenge').value = text;
      } catch {
        if (current === revision) {
          el('challenge').value = '';
          el('error').textContent = t('Choose a valid UTF-8 challenge file no larger than 65,536 bytes.', '65,536バイト以下の有効なUTF-8チャレンジファイルを選択してください。');
        }
      } finally { busy = false; el('inputs').disabled = el('clear').disabled = false; }
    });
  } else {
    if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
      el('recover').hidden = true; el('recover-confirm').hidden = false;
    } else if (token) {
      token = undefined; el('error').textContent = t('Invalid recovery link. Request a new link.', '無効なリンクです。再発行リンクを再度リクエストしてください。');
    }
    el('recover').addEventListener('submit', event => {
      event.preventDefault(); const email = el('recovery-email').value; el('recover').reset();
      void run(() => accounts.recover(email), () => {
        el('status').textContent = t('If an account matches this email address, a recovery link will arrive shortly. Check your inbox and spam folder.', 'このメールアドレスに一致するアカウントがある場合、再発行リンクを送信します。受信トレイと迷惑メールフォルダーをご確認ください。');
      });
    });
    el('recover-confirm').addEventListener('submit', event => {
      event.preventDefault(); if (!token) return;
      void run(() => accounts.confirmRecovery(token), result => {
        token = undefined; el('new-code').value = result.activationCode;
        el('recover-confirm').hidden = true; el('new-code-result').hidden = false;
        el('status').textContent = t('Your code has changed. Copy the new code before leaving this page.', 'コードを変更しました。このページを離れる前に新しいコードをコピーしてください。');
        el('new-code-title').focus();
      });
    });
  }
  el('clear').addEventListener('click', () => { clear(); el(offline ? 'challenge' : 'recovery-email').focus(); });
  window.addEventListener('pagehide', clear);
}
