"use client";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Users, Zap, Gauge, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { extractProductDetails } from "@/lib/utils";

export default function ProductCard({ cart: inputCart, index = 0 }) {
  const cart =
    "isAccessory" in inputCart ? inputCart : extractProductDetails(inputCart);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link
        href={`/product/${cart.id}`}
        className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={cart.image}
            alt={cart.name}
            className="w-full h-full object-contain group-hover:scale-100 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {!cart.inStock && (
              <Badge className="bg-red-600 text-white border-0 text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {cart.isAccessory ? "Accessory" : cart.brand}
              </p>
              <h3 className="font-display font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                {cart.name}
              </h3>
            </div>
          </div>

          <div
            className="text-sm text-muted-foreground line-clamp-2 mb-4"
            dangerouslySetInnerHTML={{ __html: cart.description }}
          />

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
            {cart.seats && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {cart.seats} Seats
              </span>
            )}
            {cart.range && (
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {cart.range}
              </span>
            )}
            {cart.topSpeed && (
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                {cart.topSpeed}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <span className="text-2xl font-bold text-foreground">
                {cart.formattedPrice || "Call for Price"}
              </span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all">
              View Details <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
