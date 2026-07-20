type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProperties }) => void;
  }
}

export function trackEvent(event: string, properties: AnalyticsProperties = {}) {
  if (import.meta.env.ANALYTICS_PROVIDER !== 'plausible' || !import.meta.env.ANALYTICS_ID || typeof window === 'undefined') return;

  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(([key]) => !/(email|name|phone|address)/i.test(key)),
  );
  window.plausible?.(event, { props: safeProperties });
}
