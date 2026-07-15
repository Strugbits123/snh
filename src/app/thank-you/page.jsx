"use client";
import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  useEffect(() => {
    // Register a GA4 page_view for /thank-you so conversion tracking fires
    // even under client-side (SPA) navigation from the forms.
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("event", "page_view", {
        page_path: "/thank-you",
        page_location: window.location.href,
        page_title: "Thank You | SNH Golf Carts LLC",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full bg-card border border-border rounded-3xl p-8 sm:p-12 text-center shadow-xl"
      >
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3 text-foreground">
          Thank You!
        </h1>
        <p className="text-muted-foreground mb-2">
          Your message has been submitted successfully. Thanks for reaching out
          to SNH Golf Carts LLC — we&apos;ll get back to you within 1 business
          day.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          Need something sooner? Call us at{" "}
          <a href="tel:6037777831" className="text-accent font-semibold">
            603-777-7831
          </a>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="flex-1">
            <Button className="w-full bg-accent hover:bg-accent/90 text-white rounded-full h-12">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Inventory
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-white rounded-full h-12"
            >
              Back to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
