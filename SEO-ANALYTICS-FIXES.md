# SEO & Analytics Audit — Fix Log

Working log for the issues raised in the Google Analytics review of **26 Jun – 23 Jul 2026**.
Branch: `seo-fixes`. One section per reported issue; further issues get appended.

**Status key:** ✅ fixed in code · ⚪️ not applicable (the thing doesn't exist) · ⏳ waiting on someone else

---

## Issue 1 — Missing redirects after the Wix migration

~147 views on 404 pages over 28 days, 404 views up 362% week-over-week. Traffic was still
arriving on three dead URL patterns with no 301s configured. Every one showed 0s average
engagement time vs 33s–1m19s on live pages.

### Fixed ✅

All rules live in [`next.config.ts`](next.config.ts). They emit **308 Permanent Redirect**, which is
Next.js's equivalent of a 301 for SEO purposes and additionally preserves the request method.

| Pattern | Count | Destination |
| --- | --- | --- |
| `/product-page/<slug>` | 19 URLs | Real product page, else `/shop` |
| `/products/<slug>` | 21 URLs | Real product page, else `/shop` |
| `.html` pages | 6 + 2 nested | Clean URLs (`/about.html` → `/about`, etc.) |
| `/booking-calendar/*` | 2 known + wildcard | `/rentals`, `/services/upgrades`, else `/contact` |
| `/service-page/*` | 3 known + wildcard | `/services/<slug>`, else `/contact` |
| `/book-online` | 1 | `/contact` |
| `/category/*` | 3 known + wildcard | `/shop` |
| `/dach`, `/teko`, `/tomberlin` | 3 | `/shop?make=DACH`, `?make=TEKO`, `/shop` |
| `/product/<uuid>` (deleted products) | generic rule | `/shop` |

**Design note — the product mapping is generated, not hardcoded.** The build-time Wix product
fetch that already existed in `next.config.ts` now also emits `/product-page/<slug>` and
`/products/<slug>` → `/product/<slug>` for every product that actually exists. Consequences:

- The mapping self-corrects. Publish a missing product and its old URL starts resolving to the
  real page on the next build, with no code change.
- Wildcards on both dead prefixes (`/product-page/:path*`, `/products/:path*`) catch everything
  left over and send it to `/shop`, so **nothing under either prefix can 404 again** — including
  old URLs that never appeared in the GA export.
- The product query was also capped at `limit(100)` with no paging; now paged.

**Two improvements on the original spec:** `/dach` → `/shop?make=DACH` and `/teko` →
`/shop?make=TEKO`, since the shop page supports that filter and the footer already links it that
way — better than dumping brand traffic on the unfiltered listing.

### Fixed ✅ — 404 page

New global 404 at [`src/app/not-found.jsx`](src/app/not-found.jsx). Next's root `not-found`
catches all unmatched URLs. Cards link to Shop, the three service pages individually, and
Contact, plus a home link. `robots: noindex, follow`. Styled to match the existing blog 404.

There is no `/services` overview page by design, so the Services card links the three service
pages separately rather than a dead parent path.

### Not applicable ⚪️

| What | Why |
| --- | --- |
| 31 of 38 old product URLs → real product pages | **The products are gone from Wix.** Only 11 products are live. The entire Evolution D5 / D5 Ranger / D5 Maverick / Carrier / Turfman / Froster / Classic range is deleted — not just the six flagged in the report. These go to `/shop`. |
| `/services.html` → `/services` | **No `/services` page exists** — archived in commit `3367d0d` when the `/services/[slug]` pages were built, and confirmed as intentional. Redirects to `/services/repair` instead, the closest equivalent of that content. |

Only **7 of the 38** old product URLs (~30 of the 404 views) map to a product that still exists:
`teko-turbo`, `teko-trophy`, `teko-trophy-plus`, `dach-apollo-4-2`, `dach-falcon-ultra-2-2`,
`tomberlin-lxr`.

### Verification

Tested all 28 URL patterns from the report against a production build (`next build` +
`next start`): every pattern returns 308 to the intended destination, and every destination
returns 200. The 404 page renders with all expected links and `noindex`.

### Open decisions ⏳

- **`teko-triumph`** — 4 views. The store has `teko-trophy` but no `teko-triumph`. If Triumph is a
  real product that was never published, publishing it makes the redirect resolve automatically.
- **`/product-page/dach-apollo`** — 11 views, the highest-traffic single product URL. The store has
  `dach-apollo-gen-1` and `dach-apollo-gen-2`; currently goes to `/shop` rather than guessing the
  generation. Needs a decision.
- **`src/lib/PageNotFound.jsx`** is dead base44 leftover code (imports `useLocation` from
  `next/navigation` and `@tanstack/react-query`, neither of which exists in this project). Left
  in place, but it should be deleted.

---

## Issue 2 — Incomplete GA4 tracking

Reported: the GA4 property only receives `page_view` and `form_submit`; standard Enhanced
Measurement events were assumed to be failing across the board.

### Correction to the diagnosis

**The Google tag is installed correctly.** [`src/app/layout.tsx`](src/app/layout.tsx) is the root
layout, so the tag is on every route. Verified a single `gtag/js?id=G-C3CZL24B69` load across 10
page types including 404s — correct ID, no duplicates, no gaps. "Partial implementation" was not
the cause.

**Four of the six "missing" events cannot fire, because the site has no trigger for them** — see
Not applicable below. `scroll` was the only genuine gap.

### Fixed ✅

New [`src/lib/analytics.js`](src/lib/analytics.js) (measurement ID defined once, guarded
`trackEvent` / `trackPageView` helpers using Google's own `dataLayer` queue pattern) and
[`src/components/Analytics.jsx`](src/components/Analytics.jsx), mounted in the root layout.

| Event | Detail |
| --- | --- |
| `phone_call_click` | All 12 `tel:` links — navbar ×2, footer, hero, product page, shop, CTA section, finance popover, contact, thank-you, order-confirmation. Params: `phone_number`, `link_text`, `page_location`. |
| `email_click` | Both `mailto:` links. Params: `email_address`, `link_text`, `page_location`. |
| `scroll_depth` | Thresholds 25 / 50 / 75 / 90%, param `percent_scrolled`. Resets on every route change. |
| `page_view` | **Bug fix, not in the original report** — see below. |

**Why phone calls were invisible:** GA4's Enhanced Measurement `click` event only fires for links
to *another domain*. `tel:` and `mailto:` are neither outbound nor same-domain links, so Enhanced
Measurement never reports them at any setting. This required code regardless of the dashboard
toggle.

**Implementation choice — one delegated listener.** A single `click` listener on `document` in the
**capture phase** handles every `tel:`/`mailto:` link rather than 12 separate handlers. It keeps
working for links added later, and because `document` is the root of the capture path nothing
upstream can `stopPropagation` past it.

**Why phone tracking is in code, not GTM.** The report asked for a GTM trigger, but **the site has
no GTM container** — it is a direct `gtag.js` install. Adding GTM would mean a new container and a
second tag layer. The code implementation is more reliable than a GTM DOM trigger and needs no
container. If GTM is preferred, supply the `GTM-XXXXXXX` ID and it can be swapped.

### Fixed ✅ — page_view bug (not in the original report)

This is a single-page app, and `gtag('config')` only sends `page_view` on a full document load.
**Every client-side navigation was going unrecorded**, so `page_view` has been undercounting,
probably substantially.

Fix: `send_page_view: false` on config, and `page_view` is now sent per route change — query
strings included, so `/shop?make=DACH` counts as its own view.

> ⚠️ **Expect page_view volume to jump after deploy.** That is the fix landing, not a data
> anomaly. Note the trend break so it isn't misread later.

The same SPA issue is why `scroll_depth` is implemented in code rather than left to Enhanced
Measurement: GA4's `scroll` binds to a document load, so even with the toggle on it would only
ever measure the first page of a session — useless for blog reading depth, which was the stated
goal. `scroll_depth` is named distinctly so the two can coexist without colliding.

The existing manual `form_submit` calls in
[`src/app/contact/page.jsx`](src/app/contact/page.jsx) and
[`src/components/home/LeadForm.jsx`](src/components/home/LeadForm.jsx) still work — `initGA`
keeps `window.gtag` assigned for them.

### Not applicable ⚪️

| Event | Why it cannot fire |
| --- | --- |
| `file_download` | No downloadable files anywhere on the site — no PDFs, docs, or `download` links. |
| `view_search_results` | No site search exists. GA4 needs a `?q=` / `?s=` param; the only query param is `/shop?make=`. |
| `video_start` / `video_complete` | GA4 only instruments **embedded YouTube** players. The hero video is a native `<video>` background loop; both `<iframe>`s are Google Maps embeds. |
| `click` (outbound) | Exists, but only **3 outbound links sitewide** — sargeslsvrentals.com ×2 on `/rentals`, one Google Maps link on the homepage. Near-zero volume is correct behaviour, not a bug. |
| Phone tracking via GTM | No GTM container exists — implemented via `gtag` instead (above). |

### Verification

Build passes. Prerendered pages stayed statically rendered (the `useSearchParams` Suspense
boundary works). All four event names confirmed present in the shipped client bundle. Tag load
confirmed on 10 route types. Old inline snippet confirmed removed.

> ⚠️ **Event delivery to GA4 is not yet verified.** That needs a real browser, and the only option
> was installing Playwright into this repo, which was not done unasked. After deploy: open the
> site with the Google Analytics Debugger extension, click a phone number, and watch GA4
> **Admin → DebugView** (or Realtime).

### Waiting on GA4 admin ⏳

No API access to GA4 admin from the codebase — these are dashboard actions:

1. **Admin → Data streams → stream → Enhanced measurement** — confirm it's on. Expect only
   `scroll` and outbound `click` to change; the other four cannot fire regardless.
2. **Admin → Custom definitions → Create custom dimension** (event-scoped), one each for
   `phone_number`, `link_text`, `email_address`, `percent_scrolled`. Without these the params
   appear in DebugView but cannot be used in reports.
3. **Admin → Key events → mark `phone_call_click`.** Do this *after* the first event lands, or it
   won't be selectable.

### Open decision ⏳

**`form_submit` name collision.** The manual `form_submit` collides with Enhanced Measurement's
automatic `form_submit` event. Once Enhanced Measurement is on, the two will mix and real lead
submissions can't be separated from any form interaction. Left alone to avoid breaking existing
reports; renaming to `generate_lead` (GA4's recommended lead event) is the clean fix.

---

## Issue 3 — Skipped for now

Reported but deferred; to be added later.

---

## Issue 4 — Placeholder pages are live

Reported: `/services/something` (16 views) and `/services/121` (1 view) look like unfinished pages
that shouldn't be public.

### What was actually happening

The report was correct for the period it covers, and the cause is now confirmed. Before commit
`24452e4`, `src/app/services/[slug]/page.jsx` resolved unknown slugs like this:

```js
const hero = HERO_CONTENT[slug] || HERO_CONTENT.repair;
```

Any slug fell back to the **repair** content. So during the GA window (26 Jun – 23 Jul) those two
URLs served a complete, indexable **HTTP 200** page of Repair & Maintenance content at a junk
URL — duplicate content on an arbitrary path.

Commit `24452e4` replaced that fallback with a CMS lookup plus `notFound()`, so unknown slugs now
return a real 404. Verified: the Services collection contains exactly three entries — `repair`,
`winterization`, `upgrades` — and `/services/something` and `/services/121` both return 404 today.

**So there is no live placeholder page left to remove.** The remaining problem is that a 404 still
records a `page_view` at the dead URL (see the GA4 explainer below), so the hits keep accruing.

### Fixed ✅

| URL | Result |
| --- | --- |
| `/services/something` | 308 → `/services/repair` |
| `/services/121` | 308 → `/services/repair` |

`/services/repair` is the exact content those URLs used to serve, so the redirect preserves
whatever Google already associated with them.

Listed as two explicit rules rather than a `/services/:slug` wildcard — a wildcard runs before the
filesystem and would hijack the three live service pages plus any service added to the CMS later.
Other unknown service slugs continue to 404 onto the new 404 page, which is the correct outcome.

Verified: both redirect with 308; `/services/repair`, `/services/winterization` and
`/services/upgrades` all still return 200; `/services/random-junk` still 404s.

### Side finding ⏳

The `upgrades` CMS entry has `heroHeading` = **"Upgrades and Customization1"** — a stray `1` from
editing, visible on the live page heading. Fix in the Wix CMS (content, not code).

---

## Reference — how 404s and redirects appear in GA4

Worth recording, since it determines whether a fix makes the numbers move.

**A 404 records a `page_view` at the dead URL.** A 404 is still a real page load: Next serves the
not-found page *at the requested URL* with a 404 status code. GA4 has no awareness of HTTP status
codes — gtag fires `page_view` with `page_location = window.location.href`, which is the dead URL.
The 404 page inherits the root layout, so it carries the tag. This is exactly why the dead URLs
were visible in the report at all, and why they showed the 0s-engagement signature.

**A server-side redirect records nothing at the old URL.** A 308/301 is emitted before any HTML
exists. The browser receives headers and a `Location` only — no HTML, no JavaScript, no gtag,
therefore no `page_view` for the old path. It then loads the destination, which fires exactly one
`page_view` for the *new* URL.

Consequences once the Issue 1 and Issue 4 redirects deploy:

- Redirected URLs stop appearing in GA4 for new data entirely.
- Each hit is credited to the destination page instead.
- 404 page views should collapse toward zero.
- Those hits stop showing 0s engagement — they inherit the destination's engagement.

Two caveats:

1. **Historical data does not change.** `/product-page/*` and the rest will still appear in any
   report whose date range includes pre-deploy days. Compare like-for-like windows after deploy.
2. **This only holds for server-side redirects.** A client-side redirect (meta refresh, or JS
   `location.href`) loads the page first, fires a `page_view` for the old URL, *then* moves — so
   the old URL keeps accumulating views. Every redirect here is a server-side 308 in
   `next.config.ts`, so this does not apply.

---

## Files changed

| File | Change |
| --- | --- |
| [`next.config.ts`](next.config.ts) | Redirect rules; product fetch paged and reused for legacy path mapping |
| [`src/app/layout.tsx`](src/app/layout.tsx) | Inline gtag snippet replaced by `<Analytics />` behind a Suspense boundary |
| [`src/app/not-found.jsx`](src/app/not-found.jsx) | New — global 404 page |
| [`src/lib/analytics.js`](src/lib/analytics.js) | New — measurement ID and event helpers |
| [`src/components/Analytics.jsx`](src/components/Analytics.jsx) | New — page views, phone/email click tracking, scroll depth |
