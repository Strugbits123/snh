"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import SectionHeading from "../SectionHeading";
import ProductCard from "../ProductCard";

export default function FeaturedProducts() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => {
        const all = res._items || [];
        setCarts(all.slice(0, 3));
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Our Collection"
          title={
            <>
              Top-Selling Electric
              <br />
              Golf Carts
            </>
          }
          description="Explore our top-selling electric golf carts and street-legal LSVs, handpicked for performance, style, and value."
        />

        {loading ?
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {carts.map((cart, i) => (
              <ProductCard key={cart._id} cart={cart} index={i} />
            ))}
          </div>
        }

        <div className="text-center mt-12">
          <Link href="/shop">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              View All Carts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
