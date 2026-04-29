"use client";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../SectionHeading";

const TESTIMONIALS = [
  {
    name: "David M.",
    role: "Homeowner",
    text: "The DACH Apollo is incredible — the ride quality, tech features, and build quality are on another level. Best purchase I've made for our community.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    role: "Resort Manager",
    text: "We outfitted our entire resort with SNH carts. The team made the whole process seamless, and our guests absolutely love the premium models.",
    rating: 5,
  },
  {
    name: "Mike T.",
    role: "Golf Course Owner",
    text: "Their service department is top-notch. Quick turnaround, honest pricing, and they really know golf carts inside and out. Highly recommend.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Happy Customers"
          title="What Our Customers Say"
          description="Real reviews from real people in the Londonderry area and beyond."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div className="pt-4 border-t border-border">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}