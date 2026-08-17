import { cache } from "react";
import { wixClient } from "@/lib/wixClient";

// Collection ID of the "Services" Wix Data collection (see wix-cms/services-import.csv).
// Falls back to the known-good collection ID if the env var isn't set on a
// given deployment (e.g. a forgotten .env entry in production), so the
// pages don't 404 just because the environment variable was missed.
const COLLECTION_ID = process.env.WIX_SERVICES_COLLECTION_ID || "Import2";

// Button labels stay hardcoded per slug — not editable from the CMS.
const CTA_LABELS = {
  repair: {
    heroCtaLabel: "Schedule a Repair or Maintenance Service",
    closingCtaLabel: "Schedule a Repair or Maintenance Service",
  },
  winterization: {
    heroCtaLabel: "Book Your Winterization Service",
    closingCtaLabel: "Book Your Winterization Service",
  },
  upgrades: {
    heroCtaLabel: "Schedule a Service",
    closingCtaLabel: "Talk to Our Upgrade Team",
  },
};

const splitLines = (s) =>
  (s ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// A zigzagNBullets field should be a Wix "Array" (Tags) field, so the SDK
// already hands back a real JS array — one bullet per list entry, editable
// as a clean repeating list in the Wix CMS rather than a raw text blob.
// Still tolerates a plain Text field (newline- or comma-separated) as a
// fallback in case the field was left as Text.
function readBullets(data, n) {
  const value = data[`zigzag${n}Bullets`];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    const parts = value.includes("\n") ? value.split("\n") : value.split(",");
    return parts.map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeServiceItem(data) {
  const ctaLabels = CTA_LABELS[data.slug] || {};

  const zigzagItems = [1, 2, 3]
    .map((n) => ({
      title: data[`zigzag${n}Title`],
      paragraphs: splitLines(data[`zigzag${n}Paragraphs`]),
      bullets: readBullets(data, n),
    }))
    .filter((item) => item.title)
    .map((item) => ({
      ...item,
      // Omit the key entirely when empty so `{item.bullets && (...)}` in the
      // page component behaves exactly as it does for the hardcoded content today.
      bullets: item.bullets.length ? item.bullets : undefined,
    }));

  return {
    slug: data.slug,
    hero: {
      heading: data.heroHeading,
      paragraph: data.heroParagraph,
      ctaLabel: ctaLabels.heroCtaLabel,
    },
    intro: {
      heading: data.introHeading,
      paragraphs: splitLines(data.introParagraphs),
    },
    zigzag: { items: zigzagItems },
    closing: {
      heading: data.closingHeading,
      paragraphs: splitLines(data.closingParagraphs),
      ctaLabel: ctaLabels.closingCtaLabel,
    },
  };
}

// React `cache()` dedupes this within one render pass — the layout's
// `generateMetadata` and the page body share a single Wix Data fetch.
// No fallback: a missing collection ID, a failed query, or an unknown slug
// all resolve to `null`, which the page turns into a real 404 via notFound().
export const getServiceContent = cache(async (slug) => {
  if (!COLLECTION_ID) return null;

  const { items } = await wixClient.items
    .query(COLLECTION_ID)
    .eq("slug", slug)
    .find();

  return items?.length ? normalizeServiceItem(items[0]) : null;
});
