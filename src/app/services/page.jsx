"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Wrench, ShoppingCart, CalendarDays, Check, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";

const ICON_MAP = { Wrench, ShoppingCart, CalendarDays };
const SERVICE_IMAGE = "https://media.base44.com/images/public/69d94b2ecf7e326359363f38/d664d13bc_generated_a8a9485b.png";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defaultServices = [{
      id: "1", name: "Maintenance & Tune-Ups", icon: "Wrench",
      description: "Keep your cart running at its best with a comprehensive check-up.",
      price_from: 99, benefits: ["Battery load test", "Tire pressure check", "Suspension lube"]
    }, {
      id: "2", name: "Customization", icon: "ShoppingCart",
      description: "Make it yours with custom paint, lift kits, and premium seating.",
      price_from: 250, benefits: ["Lift Kits", "Lithium Battery Upgrades", "Bluetooth Audio"]
    }, {
      id: "3", name: "Fleet Rentals", icon: "CalendarDays",
      description: "Need carts for an event? We offer daily, weekly, and special event rentals.",
      price_from: 150, benefits: ["Flexible terms", "Delivery and pickup", "Reliable carts"]
    }];
    setServices(defaultServices);
    setLoading(false);
  }, []);

  return (
    <div>
      <section className="relative pt-32 pb-20 bg-foreground text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={SERVICE_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-foreground/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              What We Do
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl mb-6">
              Everything Golf Cart. One Location.
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Sales, rentals, repairs, and battery replacement — SNH is Southern NH's one-stop golf cart shop.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-20">
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
                    className={`grid lg:grid-cols-2 gap-12 items-center ${isReversed ? "lg:direction-rtl" : ""}`}
                  >
                    <div className={isReversed ? "lg:order-2" : ""}>
                      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                        <Icon className="w-7 h-7 text-accent" />
                      </div>
                      <h2 className="font-display font-bold text-2xl sm:text-3xl mb-4">{service.name}</h2>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {service.short_description || service.description}
                      </p>
                      {service.price_from && (
                        <p className="text-sm text-muted-foreground mb-4">
                          Starting from <span className="font-semibold text-foreground">${service.price_from}</span>
                        </p>
                      )}
                      {service.benefits?.length > 0 && (
                        <div className="space-y-2 mb-8">
                          {service.benefits.map((b) => (
                            <div key={b} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-accent shrink-0" />
                              {b}
                            </div>
                          ))}
                        </div>
                      )}
                      <Link href="/contact">
                        <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-8">
                          Book Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                    <div className={`rounded-3xl aspect-video overflow-hidden bg-muted ${isReversed ? "lg:order-1" : ""}`}>
                      {service.image ? (
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-20 h-20 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </div>
  );
}