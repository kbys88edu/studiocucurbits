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
  | 'open_suspended_support'
  | 'suspended_page_view'
  | 'suspended_demo_play'
  | 'suspended_demo_complete'
  | 'suspended_video_play'
  | 'suspended_notify_click'
  | 'suspended_notify_success'
  | 'suspended_support_click'
  | 'suspended_buy_click';

const allowedProperties: Record<AnalyticsEvent, Record<string, ReadonlySet<string> | true>> = {
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
  suspended_page_view: { locale: true, release_state: true },
  suspended_demo_play: { locale: true, demo_name: true, source: true, release_state: true },
  suspended_demo_complete: { locale: true, demo_name: true, source: true, release_state: true },
  suspended_video_play: { locale: true, source: true, release_state: true },
  suspended_notify_click: { locale: true, source: true, release_state: true },
  suspended_notify_success: { locale: true, source: true, release_state: true },
  suspended_support_click: { locale: true, source: true, release_state: true },
  suspended_buy_click: { locale: true, source: true, release_state: true },
} as const;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProperties }) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, properties: AnalyticsProperties = {}) {
  if (import.meta.env.ANALYTICS_PROVIDER !== 'plausible' || !import.meta.env.ANALYTICS_ID || typeof window === 'undefined') return;

  const allowed = allowedProperties[event];
  const safeProperties = Object.fromEntries(Object.entries(properties).filter(([key, value]) => {
    const rule = allowed[key];
    return rule === true || (rule instanceof Set && rule.has(String(value)));
  }));
  window.plausible?.(event, { props: safeProperties });
}
