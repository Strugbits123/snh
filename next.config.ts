import type { NextConfig } from "next";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { products } from "@wix/stores";

// Slugify fallback for products that lack a Wix slug — keep in sync with
// `slugify` in src/lib/utils.js.
function slugify(text: string): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Build-time fetch of every product so we can emit 301 redirects from the
// old UUID URLs (which Google has already indexed) to the new slug URLs.
async function buildProductRedirects() {
  const apiKey = process.env.WIX_API_KEY || process.env.NEXT_PUBLIC_WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID || process.env.NEXT_PUBLIC_WIX_SITE_ID;

  if (!apiKey || !siteId) {
    console.warn(
      "[next.config] WIX_API_KEY / WIX_SITE_ID missing — skipping product UUID → slug redirects.",
    );
    return [];
  }

  try {
    const client = createClient({
      modules: { products },
      auth: ApiKeyStrategy({ apiKey, siteId }),
    });
    const res = await client.products.queryProducts().limit(100).find();
    const items = res.items || [];

    const redirects = items
      .map((p: any) => {
        const id = p._id || p.id;
        const slug = p.slug || slugify(p.name);
        if (!id || !slug || id === slug) return null;
        return {
          source: `/product/${id}`,
          destination: `/product/${slug}`,
          permanent: true,
        };
      })
      .filter(Boolean) as {
      source: string;
      destination: string;
      permanent: boolean;
    }[];

    console.log(
      `[next.config] Generated ${redirects.length} product UUID → slug redirects.`,
    );
    return redirects;
  } catch (err) {
    console.error(
      "[next.config] Failed to fetch products for redirects:",
      err,
    );
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return await buildProductRedirects();
  },
};

export default nextConfig;
