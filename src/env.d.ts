/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Read at build time by src/lib/analytics.ts. Plausible stays disabled
  // unless ANALYTICS_PROVIDER is exactly 'plausible' and ANALYTICS_ID is set.
  readonly ANALYTICS_PROVIDER?: string;
  readonly ANALYTICS_ID?: string;

  // Read at build time by src/data/products.ts. Unset means "no checkout /
  // no demo / no manual", and the page falls back to the newsletter CTA.
  readonly STRIPE_SUSPENDED_PAYMENT_LINK_JPY?: string;
  readonly STRIPE_SUSPENDED_PAYMENT_LINK_USD?: string;
  readonly SUSPENDED_DEMO_URL?: string;
  readonly SUSPENDED_MANUAL_URL?: string;

  // Reserved for the generic newsletter module (src/scripts/newsletter.ts).
  // The live form is currently the hard-coded MailerLite embed in
  // src/components/NewsletterForm.astro, so these are not read today.
  readonly NEWSLETTER_PROVIDER?: string;
  readonly NEWSLETTER_FORM_ACTION?: string;
  readonly NEWSLETTER_API_ENDPOINT?: string;
}
