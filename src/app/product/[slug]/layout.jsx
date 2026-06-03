import { cache } from "react";
import { wixClient } from "@/lib/wixClient";
import { extractProductDetails } from "@/lib/utils";

const getProduct = cache(async (slug) => {
  try {
    const [productsRes, collectionsRes] = await Promise.all([
      wixClient.products.queryProducts().limit(100).find(),
      wixClient.collections.queryCollections().limit(100).find(),
    ]);
    const rawProducts = productsRes.items || [];
    const collections = collectionsRes.items || [];
    const rawProduct = rawProducts.find(
      (p) => p.slug === slug || (p._id || p.id) === slug,
    );
    if (rawProduct) {
      return extractProductDetails(rawProduct, collections);
    }
  } catch (err) {
    console.error("Error fetching product:", err);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (product) {
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
  return {
    title: "Product Detail | SNH Golf Carts LLC",
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

export default async function ProductLayout({ children, params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return <>{children}</>;
  }

  const canonicalSlug = product.slug || slug;
  const productSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.snhgolfcarts.com/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Shop",
            "item": "https://www.snhgolfcarts.com/shop",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `${product.brand?.toUpperCase() || ""} ${product.name}`,
            "item": `https://www.snhgolfcarts.com/product/${canonicalSlug}`,
          },
        ],
      },
      {
        "@type": "Product",
        "@id": `https://www.snhgolfcarts.com/product/${canonicalSlug}#product`,
        "name": `${product.brand?.toUpperCase() || ""} ${product.name}`,
        "url": `https://www.snhgolfcarts.com/product/${canonicalSlug}`,
        "image": product.image || "",
        "description":
          product.description?.replace(/<[^>]*>/g, "").substring(0, 300) || "",
        "brand": {
          "@type": "Brand",
          "name": product.brand || "SNH Golf Carts",
        },
        "seller": {
          "@type": "Organization",
          "name": "SNH Golf Carts LLC",
          "url": "https://www.snhgolfcarts.com/",
        },
        "offers": {
          "@type": "Offer",
          "url": `https://www.snhgolfcarts.com/product/${canonicalSlug}`,
          "priceCurrency": "USD",
          "price": product.price || "0",
          "availability":
            product.inStock ?
              "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "SNH Golf Carts LLC",
          },
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "22",
          "bestRating": "5",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
