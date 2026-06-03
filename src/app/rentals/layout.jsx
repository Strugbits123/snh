export const metadata = {
  title: "Golf Cart & LSV Rentals | SNH Golf Carts LLC",
  description:
    "Rent a street-legal golf cart or LSV in Southern NH for events, weddings, campgrounds, or vacations. Rates start at $125/day.",
  alternates: {
    canonical: "/rentals",
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
      "name": "Rentals",
      "item": "https://www.snhgolfcarts.com/rentals",
    },
  ],
};

const rentalsSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Golf Cart & LSV Rentals — SNH Golf Carts LLC",
  "url": "https://www.snhgolfcarts.com/rentals",
  "description":
    "Rent a street-legal golf cart or LSV in Southern NH. Perfect for events, weddings, campgrounds, and vacations. Starting at $125/day. Easy online booking.",
  "provider": {
    "@type": "LocalBusiness",
    "name": "SNH Golf Carts LLC",
    "url": "https://www.snhgolfcarts.com/",
    "telephone": "+1-603-777-7831",
  },
  "serviceType": "Vehicle Rental",
  "areaServed": {
    "@type": "State",
    "name": "New Hampshire",
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "125",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "125",
      "priceCurrency": "USD",
      "unitText": "DAY",
    },
    "availability": "https://schema.org/InStock",
    "url": "https://www.sargeslsvrentals.com/",
  },
};

export default function RentalsLayout({ children }) {
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
          __html: JSON.stringify(rentalsSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
