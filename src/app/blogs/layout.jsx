export const metadata = {
  title: "Our Blog | SNH Golf Carts LLC",
  description:
    "Read our latest news, articles, and guides on electric golf carts, street-legal LSVs, winterization, and maintenance.",
  alternates: {
    canonical: "/blogs",
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
      "name": "Blog",
      "item": "https://www.snhgolfcarts.com/blogs",
    },
  ],
};

export default function BlogsLayout({ children }) {
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
