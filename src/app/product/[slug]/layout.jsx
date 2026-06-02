import { wixClient } from "@/lib/wixClient";
import { extractProductDetails } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const [productsRes, collectionsRes] = await Promise.all([
      wixClient.products.queryProducts().limit(100).find(),
      wixClient.collections.queryCollections().limit(100).find(),
    ]);
    const rawProducts = productsRes.items || [];
    const collections = collectionsRes.items || [];
    // Look up by slug first; fall back to legacy UUID for safety.
    const rawProduct = rawProducts.find(
      (p) => p.slug === slug || (p._id || p.id) === slug,
    );
    if (rawProduct) {
      const product = extractProductDetails(rawProduct, collections);
      const canonicalSlug = product.slug || slug;
      const title = `${product.brand?.toUpperCase() || ""} ${product.name} | SNH Golf Carts LLC`;
      const description =
        product.description?.replace(/<[^>]*>/g, "").substring(0, 150) ||
        "Electric Golf Carts in Southern NH";
      return {
        title,
        description,
        alternates: {
          canonical: `/product/${canonicalSlug}`,
        },
      };
    }
  } catch (err) {
    console.error("Error generating product metadata:", err);
  }
  return {
    title: "Product Detail | SNH Golf Carts LLC",
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

export default function ProductLayout({ children }) {
  return <>{children}</>;
}
