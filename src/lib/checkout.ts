export function resolveCheckout(value: string | undefined, environment: string | undefined, buildMode: string, priceId?: string | null) {
  const disabled = { url: null, sandbox: false, token: null, priceId: null };
  const sandbox = environment === 'sandbox' && (buildMode === 'sandbox' || buildMode === 'development');
  const live = environment === 'live' && buildMode === 'production';
  const token = value?.trim();
  if ((!sandbox && !live) || !token || !new RegExp(`^${sandbox ? 'test' : 'live'}_[a-zA-Z0-9]{27}$`).test(token) || !priceId || !/^pri_[a-z0-9]+$/.test(priceId)) return disabled;
  return {
    // A useful no-JavaScript fallback, not a payment confirmation or grant route.
    url: 'https://www.studiocucurbits.com/purchase/suspended/', sandbox, token,
    priceId,
  };
}
