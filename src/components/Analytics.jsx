"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initGA, trackEvent, trackPageView } from "@/lib/analytics";

const SCROLL_THRESHOLDS = [25, 50, 75, 90];

// GA4 caps event parameter strings at 100 characters.
const truncate = (value) => (value ? value.slice(0, 100) : undefined);

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams?.toString();
  const url = query ? `${pathname}?${query}` : pathname;

  const previousUrl = useRef(null);
  const started = useRef(false);

  // One page_view per view, including client-side navigations. Filter changes
  // on /shop are separate views, hence keying on the query string too.
  useEffect(() => {
    if (!started.current) {
      initGA();
      started.current = true;
    }

    trackPageView({
      referrer: previousUrl.current
        ? `${window.location.origin}${previousUrl.current}`
        : undefined,
    });

    previousUrl.current = url;
  }, [url]);

  // A single delegated listener in the capture phase covers every tel: and
  // mailto: link on the site — a dozen across the navbar, footer, hero,
  // product pages and CTAs — and keeps covering any added later. GA4's
  // enhanced measurement never reports these: its `click` event only fires for
  // links to another domain, which tel: and mailto: are not.
  useEffect(() => {
    function handleClick(event) {
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const linkText = truncate(link.textContent?.trim());

      if (href.startsWith("tel:")) {
        trackEvent("phone_call_click", {
          phone_number: href.slice("tel:".length),
          link_text: linkText,
          page_location: window.location.href,
        });
      } else if (href.startsWith("mailto:")) {
        trackEvent("email_click", {
          email_address: href.slice("mailto:".length),
          link_text: linkText,
          page_location: window.location.href,
        });
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Enhanced measurement's `scroll` event binds to a full document load, so in
  // an app that navigates client-side it would only ever measure the first page
  // of a session — no use for judging whether blog readers reach the bottom.
  // Measure depth here instead and reset the thresholds on every route change.
  useEffect(() => {
    const fired = new Set();
    let queued = false;

    function measure() {
      queued = false;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const percent = (window.scrollY / scrollable) * 100;

      for (const threshold of SCROLL_THRESHOLDS) {
        if (percent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          trackEvent("scroll_depth", {
            percent_scrolled: threshold,
            page_location: window.location.href,
          });
        }
      }
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(measure);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [url]);

  return null;
}
