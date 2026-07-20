type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue>;
type AnalyticsEvent = 'audio_comparison_played' | 'newsletter_subscription_confirmed';

const allowedProperties: Record<AnalyticsEvent, Record<string, ReadonlySet<string>>> = {
  audio_comparison_played: { variant: new Set(['dry', 'wet']) },
  newsletter_subscription_confirmed: {},
} as const;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProperties }) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
  if (import.meta.env.ANALYTICS_PROVIDER !== 'plausible' || !import.meta.env.ANALYTICS_ID || typeof window === 'undefined') return;

  const allowed = allowedProperties[event];
  const safeProperties = Object.fromEntries(Object.entries(properties).filter(([key, value]) => allowed[key]?.has(String(value))));
  window.plausible?.(event, { props: safeProperties });
}
