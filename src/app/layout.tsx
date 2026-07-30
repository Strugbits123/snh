import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import ScrollToTop from "@/components/ScrollToTop";
import Analytics from "@/components/Analytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.snhgolfcarts.com"),
  title: "SNH Golf Carts LLC | Electric Golf Carts in Southern NH",
  description:
    "Shop new and used electric golf carts, street-legal LSVs, and flexible rentals. Sold, serviced, and delivered across Southern NH.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SNH Golf Carts LLC",
    url: "https://www.snhgolfcarts.com/",
    title: "SNH Golf Carts LLC | Electric Golf Carts in Southern NH",
    description:
      "Shop new and used electric golf carts, street-legal LSVs, and flexible rentals. Sold, serviced, and delivered across Southern NH.",
    locale: "en_US",
    images: [
      {
        url: "/Logo-png-b.png",
        width: 1200,
        height: 630,
        alt: "SNH Golf Carts LLC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SNH Golf Carts LLC | Electric Golf Carts in Southern NH",
    description:
      "Shop new and used electric golf carts, street-legal LSVs, and flexible rentals. Sold, serviced, and delivered across Southern NH.",
    images: ["/Logo-png-b.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/favicon-b@2x.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-w@2x.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/favicon-b@2x.png",
    apple: "/favicon-b@2x.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* The gtag loader only fetches the library. Configuration and every
            event live in <Analytics /> so there is no ordering dependency
            between this script and hydration — gtag.js drains whatever the
            component has already queued on window.dataLayer. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        {/* Suspense boundary: <Analytics /> reads useSearchParams, which would
            otherwise opt every prerendered page out of static rendering. */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
