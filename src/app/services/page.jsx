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

  useEffect(() => {
    const defaultServices = [
      {
        id: "1",
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
        name: "Winterization",
        icon: "Snowflake",
        description:
          "New England winters are hard on electric carts. Our seasonal winterization service protects your battery, motor, and electronics — so spring starts strong, every year.",
        benefits: [
          "Battery prep & maintenance charging",
          "Full electrical & undercarriage inspection",
          "Tire pressure, fluids & lubrication",
          "Indoor heated storage available",
          "Spring tune-up included",
        ],
        cta_text: "Book Winterization",
        cta_link: "/contact",
        image: "/images/services/winterization.jpg",
      },
      {
        id: "4",
        name: "Upgrades",
        icon: "Sparkles",
        description:
          "Make your cart yours. From lithium conversions and lift kits to premium audio and lighting — we install dealer-quality upgrades, backed by warranty.",
        benefits: [
          "Lithium battery conversions",
          "Lift kits & all-terrain tires",
          "LED light bars, headlights & sound systems",
          "Custom seats, enclosures & wraps",
          "Speed controllers & performance upgrades",
        ],
        cta_text: "Plan Your Upgrade",
        cta_link: "/contact",
        image: "/images/services/upgrades.png",
      },
    ];
    setServices(defaultServices);
    setLoading(false);
  }, []);

  return (
    <div>
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`grid lg:grid-cols-2 gap-16 items-center ${isReversed ? "lg:direction-rtl" : ""}`}
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

                      <Link href={service.cta_link}>
                        <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 py-6 text-lg">
                          {service.cta_text}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
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
    </div>
  );
}
