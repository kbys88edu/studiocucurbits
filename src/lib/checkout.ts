export function resolveCheckout(value: string | undefined, environment: string | undefined, buildMode: string) {
  const disabled = { url: null, sandbox: false, token: null, priceId: null };
  const sandbox = environment === 'sandbox' && buildMode === 'sandbox';
  const live = environment === 'live' && buildMode === 'production';
  const token = value?.trim();
  if ((!sandbox && !live) || !token || !new RegExp(`^${sandbox ? 'test' : 'live'}_[a-zA-Z0-9]{27}$`).test(token)) return disabled;
  return {
    // A useful no-JavaScript fallback, not a payment confirmation or grant route.
    url: 'https://www.studiocucurbits.com/purchase/', sandbox, token,
    priceId: sandbox ? 'pri_01m3eaewadnm7grc2armnnkbsr' : 'pri_01m3ghef9jmn9tx2f7ja5z62he',
  };
}
