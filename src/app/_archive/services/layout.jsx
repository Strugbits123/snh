export const metadata = {
  title: "Golf Cart Services & Repair | SNH Golf Carts LLC",
  description:
    "Full-service golf cart care including repairs, battery replacement, custom upgrades, and winterization services in Southern NH.",
  alternates: {
    canonical: "/services",
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
      "name": "Services",
      "item": "https://www.snhgolfcarts.com/services",
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

export default function ServicesLayout({ children }) {
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
