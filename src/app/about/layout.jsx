export const metadata = {
  title: "About Us | SNH Golf Carts LLC",
  description:
    "Learn more about SNH Golf Carts LLC, a veteran-owned electric golf cart dealer in Londonderry, NH. Read about our values and history.",
  alternates: {
    canonical: "/about",
  },
};

const aboutSchema = {
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
          "name": "About",
          "item": "https://www.snhgolfcarts.com/about",
        },
      ],
    },
    {
      "@type": "AboutPage",
      "url": "https://www.snhgolfcarts.com/about",
      "name": "About SNH Golf Carts LLC — Veteran-Owned Golf Cart Dealer in NH",
      "description":
        "SNH Golf Carts LLC is a veteran-owned electric golf cart dealer in Londonderry, NH. 500+ carts sold, 15+ years experience, 1,000+ happy customers.",
      "mainEntity": {
        "@id": "https://www.snhgolfcarts.com/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.snhgolfcarts.com/#organization",
      "name": "SNH Golf Carts LLC",
      "url": "https://www.snhgolfcarts.com/",
      "description":
        "Veteran-owned electric golf cart dealer in Londonderry, NH. New & used golf carts, street-legal LSVs, rentals, repairs, and battery replacement.",
      "foundingDate": "2010",
      "foundingLocation": {
        "@type": "Place",
        "name": "Londonderry, NH",
      },
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "5",
      },
      "slogan": "Local. Honest. Veteran-Built.",
      "telephone": "+1-603-777-7831",
      "email": "info@snhgolfcarts.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "574 Mammoth Rd, Building B-2",
        "addressLocality": "Londonderry",
        "addressRegion": "NH",
        "postalCode": "03053",
        "addressCountry": "US",
      },
      "sameAs": [
        "https://www.instagram.com/snhgolfcarts/",
        "https://www.facebook.com/profile.php?id=100085891995936",
        "https://share.google/qhJKzIP77xtGCT68V",
      ],
    },
  ],
};

export default function AboutLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
