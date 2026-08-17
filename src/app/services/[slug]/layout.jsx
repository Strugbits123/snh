// Page <title>/description are fixed per slug — not CMS-driven — so they stay
// stable and unique for SEO/analytics regardless of what's in the Wix collection.
const SEO = {
  repair: {
    title: "Golf Cart Repair Services | SNH Golf Carts LLC",
    description:
      "Professional golf cart repair and maintenance in Southern New Hampshire — diagnostics, battery replacement, and mobile service from SNH Golf Carts.",
  },
  winterization: {
    title: "Golf Cart Winterization Services | SNH Golf Carts LLC",
    description:
      "Professional golf cart winterization services in Southern New Hampshire. Protect your investment before the cold sets in with SNH Golf Carts.",
  },
  upgrades: {
    title: "Golf Cart Upgrades & Customization | SNH Golf Carts LLC",
    description:
      "Golf cart upgrades and customization in Southern New Hampshire — lithium conversions, lift kits, custom builds, and more from SNH Golf Carts.",
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const seo = SEO[slug];

  return {
    title: seo?.title || "Golf Cart Services & Repair | SNH Golf Carts LLC",
    description:
      seo?.description ||
      "Full-service golf cart care including repairs, battery replacement, custom upgrades, and winterization services in Southern NH.",
    alternates: {
      canonical: `/services/${slug}`,
    },
  };
}

export default async function ServiceDetailLayout({ children, params }) {
  const { slug } = await params;

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
        "name": "Services",
        "item": `https://www.snhgolfcarts.com/services/${slug}`,
      },
    ],
  };

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Golf Cart Repair & Maintenance Services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "SNH Golf Carts LLC",
      "url": "https://www.snhgolfcarts.com/",
      "telephone": "+1-603-777-7831",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "574 Mammoth Rd, Building B-2",
        "addressLocality": "Londonderry",
        "addressRegion": "NH",
        "postalCode": "03053",
        "addressCountry": "US",
      },
    },
    "serviceType": "Golf Cart Repair and Maintenance",
    "areaServed": {
      "@type": "State",
      "name": "New Hampshire",
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Golf Cart Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "General Repairs",
            "description":
              "Mechanical, electrical, and body repairs. Starting at $50.",
            "url": "https://www.snhgolfcarts.com/service-page/general-repairs",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Battery Replacement",
            "description":
              "Lithium battery packages: 36V, 51.2V, and 72V. Starting at $1,350.",
            "url":
              "https://www.snhgolfcarts.com/service-page/battery-replacement",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Golf Cart Rentals",
            "description":
              "Street-legal LSV rentals for events, campgrounds, and vacations. Starting at $125/day.",
            "url":
              "https://www.snhgolfcarts.com/service-page/golf-cart-rentals",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Semi-Annual Service Package",
            "description":
              "Full maintenance including lubrication, inspection, battery check, and safety review.",
            "url":
              "https://www.snhgolfcarts.com/service-page/semi-annual-service-packages",
          },
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Upgrades",
            "description":
              "Battery upgrades, custom wheels, performance boosts, new paint, and interior customization.",
            "url": "https://www.snhgolfcarts.com/service-page/inquire-within",
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(servicesSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
