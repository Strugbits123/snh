"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import LeadForm from "./LeadForm";

export default function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/4320244/4320244-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">
        <div className="max-w-2xl flex-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-6 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              New Hampshire's Premier Electric Golf Cart Dealer
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6"
          >
            Premium Golf Carts for{" "}
            <span className="text-accent">Every Lifestyle</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-lg"
          >
            Shop new and used electric golf carts, street-legal LSVs, and flexible rentals. Sold, serviced, and delivered across Southern NH.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 h-14 text-base w-full sm:w-auto"
              >
                Shop Carts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:6037777831">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 text-base border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Call 603-777-7831
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex items-center gap-8 mt-16 pt-8 border-t border-white/10"
          >
            {[
              { value: "3+", label: "Premium Brands" },
              { value: "$8K", label: "Starting Price" },
              { value: "LSV", label: "Street-Legal Options" },
              { value: "5★", label: "Customer Rated" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

          {/* Lead Form */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 flex justify-center lg:justify-end">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}