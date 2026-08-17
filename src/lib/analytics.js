// GA4 measurement ID for snhgolfcarts.com. Defined once here and imported by
// the gtag loader in the root layout as well as every helper below.
export const GA_MEASUREMENT_ID = "G-C3CZL24B69";

// Mirrors Google's own snippet: push an `arguments` object onto window.dataLayer
// (gtag.js ignores plain arrays) and let gtag.js drain the queue in order once
// it loads. Because the queue survives the script not being there yet, none of
// this has to race the loader against hydration.
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

// Bootstraps the tag. `send_page_view: false` is deliberate: this is a single
// page app, and gtag's automatic page_view only fires on a full document load,
// so every client-side navigation went unrecorded. `trackPageView` owns
// page_view instead — including the first one — so the count stays exact.
export function initGA() {
  if (typeof window === "undefined") return;

  // The contact form and the home page lead form both send their form_submit
  // through `window.gtag`, so it has to stay available globally.
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  gtag("event", name, params);
}

export function trackPageView({ referrer } = {}) {
  if (typeof window === "undefined") return;
  gtag("event", "page_view", {
    page_location: window.location.href,
    page_title: document.title,
    // On a hard load gtag reads document.referrer itself; on a client-side
    // navigation we have to supply the page they came from.
    ...(referrer ? { page_referrer: referrer } : {}),
  });
}
