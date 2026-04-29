"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-foreground">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Ready to Ride?
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-6">
            Find Your Perfect
            <br />
            Golf Cart Today
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
            Call us now, we'll match you to the right cart in minutes. No pressure. Just honest answers from a local, veteran-owned golf cart dealer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 h-14 text-base">
                Shop Golf Carts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:+16035551234">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-white/20 text-white hover:bg-white/10">
                <Phone className="w-5 h-5 mr-2" />
                Call Us
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}