"use client";
import { Award, ShieldCheck, Heart, Truck } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../SectionHeading";

const SERVICE_IMAGE = "https://media.base44.com/images/public/69d94b2ecf7e326359363f38/b3d04ba40_Homepage_01_Repair_image.png";

const REASONS = [
  {
    icon: Award,
    title: "Veteran-Owned & Operated",
    desc: "Military discipline meets customer service. Straight answers, upfront pricing, no runaround — ever.",
  },
  {
    icon: Truck,
    title: "Delivered to Your Door",
    desc: "Can't make it to Londonderry? We'll bring your cart to you. Call to talk delivery options.",
  },
  {
    icon: Heart,
    title: "Full-Service Shop",
    desc: "Golf cart battery replacement, diagnostics, repairs, and upgrades. We keep your cart running safely — long after purchase.",
  },
  {
    icon: ShieldCheck,
    title: "Warranted Premium Brands",
    desc: "DACH, TEKO, Tomberlin & Evolution Series — manufacturer-backed warranties so you ride protected from day one.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src={SERVICE_IMAGE}
                alt="Professional golf cart service"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-accent text-white rounded-2xl p-6 shadow-2xl hidden md:block">
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm text-white/80">Years Experience</div>
            </div>
          </motion.div>

          <div>
            <SectionHeading
              label="Why Choose SNH"
              title="Local. Honest. Veteran-Built."
              center={false}
            />
            <div className="space-y-6">
              {REASONS.map((reason, i) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <reason.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">{reason.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reason.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}