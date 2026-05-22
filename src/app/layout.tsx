import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import ScrollToTop from "@/components/ScrollToTop";

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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C3CZL24B69"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C3CZL24B69');
          `}
        </Script>
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
