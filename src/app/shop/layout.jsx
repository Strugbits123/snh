export const metadata = {
  title: "Electric Golf Carts for Sale | SNH Golf Carts LLC",
  description:
    "Browse new and used electric golf carts and street-legal LSVs from DACH, TEKO, Tomberlin, and Evolution Series. Starting at $8,000.",
  alternates: {
    canonical: "/shop",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
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
  ],
};

export default function ShopLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
