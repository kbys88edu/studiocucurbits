type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue>;
type AnalyticsEvent =
  | 'audio_comparison_played'
  | 'newsletter_subscription_confirmed'
  | 'view_suspended'
  | 'click_notify_suspended'
  | 'play_suspended_audio'
  | 'switch_suspended_audio'
  | 'view_suspended_presets'
  | 'view_suspended_beta_info'
  | 'click_suspended_demo'
  | 'click_suspended_buy'
  | 'open_suspended_support';

const allowedProperties: Record<AnalyticsEvent, Record<string, ReadonlySet<string>>> = {
  audio_comparison_played: { variant: new Set(['dry', 'wet']) },
  newsletter_subscription_confirmed: {},
  view_suspended: {},
  click_notify_suspended: {},
  play_suspended_audio: {},
  switch_suspended_audio: {},
  view_suspended_presets: {},
  view_suspended_beta_info: {},
  click_suspended_demo: {},
  click_suspended_buy: {},
  open_suspended_support: {},
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
