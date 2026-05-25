import { wixClient } from "@/lib/wixClient";

// Revalidate every hour so new/edited products show up in the sitemap promptly.
export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = "https://www.snhgolfcarts.com";

  let products = [];
  try {
    const res = await wixClient.products.queryProducts().limit(100).find();
    products = (res.items || []).filter(
      (p) => p.name?.toLowerCase() !== "speed upgrade service",
    );
  } catch (err) {
    console.error("Product sitemap: error fetching products from Wix:", err);
  }

  return products.map((p) => ({
    url: `${baseUrl}/product/${p._id || p.id}`,
    lastModified: p.lastUpdated ? new Date(p.lastUpdated) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));
}
