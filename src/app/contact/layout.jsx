export const metadata = {
  title: "Contact Us | SNH Golf Carts LLC",
  description:
    "Get in touch with SNH Golf Carts LLC in Londonderry, NH. Call 603-777-7831, email info@snhgolfcarts.com, or visit our shop today.",
  alternates: {
    canonical: "/contact",
  },
};

const contactSchema = {
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
          "name": "Contact",
          "item": "https://www.snhgolfcarts.com/contact",
        },
      ],
    },
    {
      "@type": "ContactPage",
      "url": "https://www.snhgolfcarts.com/contact",
      "name": "Contact SNH Golf Carts LLC",
      "description":
        "Get in touch with SNH Golf Carts LLC for sales, service, rentals, or general enquiries. Call 603-777-7831 or visit us in Londonderry, NH.",
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.snhgolfcarts.com/#localbusiness",
      "name": "SNH Golf Carts LLC",
      "telephone": "+1-603-777-7831",
      "email": "info@snhgolfcarts.com",
      "url": "https://www.snhgolfcarts.com/",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "574 Mammoth Rd, Building B-2",
        "addressLocality": "Londonderry",
        "addressRegion": "NH",
        "postalCode": "03053",
        "addressCountry": "US",
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          "opens": "09:00",
          "closes": "18:00",
        },
      ],
      "sameAs": [
        "https://www.instagram.com/snhgolfcarts/",
        "https://www.facebook.com/profile.php?id=100085891995936",
        "https://share.google/qhJKzIP77xtGCT68V",
      ],
    },
  ],
};

export default function ContactLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
