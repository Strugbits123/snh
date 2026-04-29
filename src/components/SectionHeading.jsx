"use client";
import { motion } from "framer-motion";

export default function SectionHeading({ label, title, description, center = true, light = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`max-w-2xl ${center ? "mx-auto text-center" : ""} mb-12 md:mb-16`}
    >
      {label && (
        <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          {label}
        </span>
      )}
      <h2 className={`font-display font-bold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 ${light ? "text-white" : "text-foreground"}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-base md:text-lg leading-relaxed ${light ? "text-white/70" : "text-muted-foreground"}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}