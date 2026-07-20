/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NEWSLETTER_PROVIDER?: string;
  readonly NEWSLETTER_FORM_ACTION?: string;
  readonly NEWSLETTER_API_ENDPOINT?: string;
  readonly ANALYTICS_PROVIDER?: string;
  readonly ANALYTICS_ID?: string;
}
