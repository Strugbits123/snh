import { wixClient } from "@/lib/wixClient";
import { extractProductDetails } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const [productsRes, collectionsRes] = await Promise.all([
      wixClient.products.queryProducts().limit(100).find(),
      wixClient.collections.queryCollections().limit(100).find()
    ]);
    const rawProducts = productsRes.items || [];
    const collections = collectionsRes.items || [];
    const rawProduct = rawProducts.find((p) => (p._id || p.id) === id);
    if (rawProduct) {
      const product = extractProductDetails(rawProduct, collections);
      const title = `${product.brand?.toUpperCase() || ""} ${product.name} | SNH Golf Carts LLC`;
      const description =
        product.description?.replace(/<[^>]*>/g, "").substring(0, 150) ||
        "Electric Golf Carts in Southern NH";
      return {
        title,
        description,
        alternates: {
          canonical: `/product/${id}`,
        },
      };
    }
  } catch (err) {
    console.error("Error generating product metadata:", err);
  }
  return {
    title: "Product Detail | SNH Golf Carts LLC",
    alternates: {
      canonical: `/product/${id}`,
    },
  };
}

export default function ProductLayout({ children }) {
  return <>{children}</>;
}
