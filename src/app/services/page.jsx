"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Wrench,
  Key,
  Snowflake,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import CTASection from "@/components/CTASection";
import WaiverModal from "@/components/WaiverModal";
import { wixProxy } from "@/lib/wixProxy";
import { extractProductDetails } from "@/lib/utils";

const ICON_MAP = {
  Wrench,
  Key,
  Snowflake,
  Sparkles,
};

const HERO_IMAGE =
  "https://media.base44.com/images/public/69d94b2ecf7e326359363f38/d664d13bc_generated_a8a9485b.png";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWaiver, setShowWaiver] = useState(false);
  const [waiverSubmitting, setWaiverSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const defaultServices = [
      {
        id: "1",
        slug: "rentals",
        name: "Rentals",
        icon: "Key",
        description:
          "Rent a golf cart for a weekend, an event, or the full summer. Street-legal LSV rentals available — perfect for weddings, campgrounds, and lakeside cruising.",
        price_info: "Starting at $125/day",
        benefits: [
          "Daily, weekend & seasonal rentals",
          "Street-legal LSV options",
          "Perfect for events & weddings",
          "Free local delivery available",
        ],
        cta_text: "Book a Rental",
        cta_link: "/rentals",
        image: "/images/services/rentals.jpg",
      },
      {
        id: "2",
        slug: "repair",
        name: "Repair & Maintenance",
        icon: "Wrench",
        description:
          "From battery replacement to electrical diagnostics, our technicians service every major make and model. Most jobs turned around in under a week.",
        benefits: [
          "Battery replacement & diagnostics",
          "Electrical, motor & controller repair",
          "Brakes, tires, steering & suspension",
          "All makes & models welcome",
          "Pickup & delivery available",
        ],
        cta_text: "Schedule Service",
        cta_link: "/contact",
        image: "/images/services/repair.jpg",
      },
      {
        id: "3",
        slug: "winterization",
        name: "Winterization",
        icon: "Snowflake",
        description:
          "New England winters are hard on electric carts. Our seasonal winterization service protects your battery, motor, and electronics — so spring starts strong, every year.",
        benefits: [
          "Battery prep & maintenance charging",
          "Full electrical & undercarriage inspection",
          "Tire pressure, fluids & lubrication",
          "Spring tune-up included",
        ],
        cta_text: "Book Winterization",
        cta_link: "/contact",
        image: "/images/services/winterization.jpg",
      },
      {
        id: "4",
        slug: "upgrades",
        name: "Upgrades",
        icon: "Sparkles",
        description:
          "Make your cart yours. From lithium conversions and lift kits to premium audio and lighting — we install dealer-quality upgrades, backed by warranty.",
        benefits: [
          "Lithium battery conversions",
          "Lift kits & all-terrain tires",
          "LED light bars, headlights & sound systems",
          "Custom seats, enclosures & wraps",
         
        ],
        cta_text: "Plan Your Upgrade",
        cta_link: "/contact",
        image: "/images/services/upgrades.png",
      },
    ];
    setServices(defaultServices);
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.scrollIntoView({ behavior: "smooth" });
            });
          });
        }
      }
    };

    if (!loading) {
      handleScroll();

      window.addEventListener("hashchange", handleScroll);
      return () => window.removeEventListener("hashchange", handleScroll);
    }
  }, [loading]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => {
        if (res.products) {
          console.log("Products==>", res.products)
           const vehicleData = res.products
             .map((p) => extractProductDetails(p, res.collections || []))
             .filter(
               (p) =>
                 !p.isAccessory &&
                 p.fullName?.toLowerCase() !== "speed upgrade service",
             )
             .map((p) => ({ name: p.fullName, isLSV: p.isLSV }))
             .filter((p) => p.name);
           
           // Deduplicate by name
           const uniqueVehicles = [];
           const seen = new Set();
           vehicleData.forEach(v => {
             if (!seen.has(v.name)) {
               seen.add(v.name);
               uniqueVehicles.push(v);
             }
           });

           setVehicles(uniqueVehicles.sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);

  const handleWaiverSubmit = async (waiverData) => {
    setWaiverSubmitting(true);
    setCheckoutLoading(true);
    try {
      // 1. Upload Waiver
      const waiverRes = await fetch("/api/waiver-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waiverData),
      });
      const waiverResult = await waiverRes.json();
      const waiverPdfUrl =
        waiverResult.pdfUrl || waiverResult.pdfBase64 || "Waiver submitted";

      // 2. Fetch "Speed Upgrade" product
      let speedProduct = null;
      try {
        // Use a filtered query for exact name match (case-sensitive in Wix)
        const productsData = await wixProxy("products", "query", {
          filters: { name: "Speed Upgrade Service" }
        });

        // Handle both 'items' and '_items' to be safe
        speedProduct = (productsData.items || productsData._items)?.[0];

        // Fallback: If exact match fails, try a broader search with a higher limit
        if (!speedProduct) {
          const allProducts = await wixProxy("products", "query", { limit: 100 });
          speedProduct = (allProducts.items || allProducts._items)?.find(
            (p) => p.name?.toLowerCase().includes("speed upgrade service")
          );
        }
      } catch (err) {
        console.warn("Failed to fetch speed product from Wix:", err);
      }

      if (!speedProduct) {
        alert("The 'Speed Upgrade Service' product was not found in Wix. Please ensure it is created as described in the instructions.");
        setCheckoutLoading(false);
        setWaiverSubmitting(false);
        return;
      }

      // 3. Initiate Checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: speedProduct.id || speedProduct._id,
          quantity: 1,
          productName: speedProduct.name,
          productPrice: speedProduct.priceData?.price,
          productImage: speedProduct.media?.mainMedia?.image?.url || "/images/services/upgrades.png",
          waiverPdfUrl: waiverPdfUrl,
          waiverCustomerName: waiverData.fullName,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to start checkout. Please call us at 603-777-7831.");
        setCheckoutLoading(false);
        setWaiverSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please call us at 603-777-7831 to complete your upgrade.");
      setCheckoutLoading(false);
      setWaiverSubmitting(false);
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.snhgolfcarts.com/" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://www.snhgolfcarts.com/services" }
    ]
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
        "addressCountry": "US"
      }
    },
    "serviceType": "Golf Cart Repair and Maintenance",
    "areaServed": {
      "@type": "State",
      "name": "New Hampshire"
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
            "description": "Mechanical, electrical, and body repairs. Starting at $50.",
            "url": "https://www.snhgolfcarts.com/service-page/general-repairs"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Battery Replacement",
            "description": "Lithium battery packages: 36V, 51.2V, and 72V. Starting at $1,350.",
            "url": "https://www.snhgolfcarts.com/service-page/battery-replacement"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Golf Cart Rentals",
            "description": "Street-legal LSV rentals for events, campgrounds, and vacations. Starting at $125/day.",
            "url": "https://www.snhgolfcarts.com/service-page/golf-cart-rentals"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Semi-Annual Service Package",
            "description": "Full maintenance including lubrication, inspection, battery check, and safety review.",
            "url": "https://www.snhgolfcarts.com/service-page/semi-annual-service-packages"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Custom Upgrades",
            "description": "Battery upgrades, custom wheels, performance boosts, new paint, and interior customization.",
            "url": "https://www.snhgolfcarts.com/service-page/inquire-within"
          }
        }
      ]
    }
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <section className="relative pt-32 pb-20 bg-foreground text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-foreground/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              WHAT WE DO
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl mb-6">
              Full-Service Golf Cart Care. Year-Round.
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Rentals, repairs, seasonal winterization, and dealer-quality
              upgrades — all from Southern New Hampshire's veteran-owned,
              full-service golf cart shop.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ?
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
            : <div className="space-y-32">
              {services.map((service, i) => {
                const Icon = ICON_MAP[service.icon] || Wrench;
                const isReversed = i % 2 !== 0;
                return (
                  <motion.div
                    key={service.id}
                    id={service.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`grid lg:grid-cols-2 gap-16 items-center scroll-mt-32 ${isReversed ? "lg:direction-rtl" : ""}`}
                  >
                    <div className={isReversed ? "lg:order-2" : ""}>
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                        <Icon className="w-7 h-7 text-accent" />
                      </div>
                      <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
                        {service.name}
                      </h2>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        {service.description}
                      </p>

                      {service.price_info && (
                        <div className="inline-block bg-accent/5 text-accent font-semibold px-4 py-2 rounded-lg mb-6">
                          {service.price_info}
                        </div>
                      )}

                      {service.benefits?.length > 0 && (
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-10">
                          {service.benefits.map((b) => (
                            <div
                              key={b}
                              className="flex items-start gap-3 text-sm text-muted-foreground"
                            >
                              <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col items-start gap-4">
                        {service.slug === "upgrades" && (
                          <Button
                            onClick={() => setShowWaiver(true)}
                            disabled={checkoutLoading}
                         
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
                          >
                            {checkoutLoading &&
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            }
                            Speed Controller & Performance Upgrade
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        )}
                        <Link href={service.cta_link} className={service.slug === "upgrades" ? "w-full sm:w-auto" : ""}>
                          <Button
                            variant={service.slug === "upgrades" ? "outline" : "default"}
                            className={(
                              "rounded-full px-10 py-6 text-lg w-full transition-all duration-300",
                              service.slug === "upgrades"
                                ? "border-accent/30 text-accent hover:bg-accent hover:text-white hover:border-accent"
                                : "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
                            )}
                          >
                            {service.cta_text}
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div
                      className={`relative group ${isReversed ? "lg:order-1" : ""}`}
                    >
                      <div className="absolute -inset-4 bg-accent/5 rounded-[2.5rem] transform rotate-2 transition-transform group-hover:rotate-1" />
                      <div className="relative rounded-3xl aspect-[4/3] overflow-hidden bg-muted shadow-2xl">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          }
        </div>
      </section>

      <CTASection />

      <WaiverModal
        isOpen={showWaiver}
        onClose={() => {
          setShowWaiver(false);
          setCheckoutLoading(false);
        }}
        onSubmit={handleWaiverSubmit}
        vehicleMakeModel=""
        isSubmitting={waiverSubmitting}
        vehicles={vehicles}
      />
    </div>
  );
}
