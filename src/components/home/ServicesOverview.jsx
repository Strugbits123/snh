"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Wrench, CalendarDays, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../SectionHeading";

const ICON_MAP = { ShoppingCart, Wrench, CalendarDays };

const SERVICES = [
  { name: "New & Used Sales", icon: "ShoppingCart", desc: "Browse electric golf carts for sale from DACH, TEKO, Tomberlin, and Evolution Series. Affordable golf carts starting at $8K — used inventory available too." },
  { name: "Repair & Maintenance", icon: "Wrench", desc: "Golf cart battery replacement, diagnostics, electrical repair, and general maintenance. Whatever the issue, your cart leaves running right." },
  { name: "Rentals", icon: "CalendarDays", desc: "Rent a golf cart for a weekend, an event, or the full summer. Street-legal LSV rentals available — perfect for weddings, campgrounds, and lakeside cruising. Starting at $125/day." },
];

export default function ServicesOverview() {
  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="What We Do"
          title="One Shop. Every Cart Need"
          description="Sales, rentals, repairs, and battery replacement — SNH is Southern NH's one-stop golf cart shop."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon] || Wrench;
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-card rounded-2xl p-8 border border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg mb-3">{service.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {service.desc}
                </p>
                <Link href="/services"
                  className="flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/services">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-8">
              <Wrench className="w-4 h-4 mr-2" />
              Book a Service
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}