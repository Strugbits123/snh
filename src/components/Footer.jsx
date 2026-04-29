import Link from "next/link";

import { MapPin, Phone, Mail, Clock, Share2, ExternalLink } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { label: "All Golf Carts", path: "/shop" },
      { label: "New Carts", path: "/shop?category=New" },
      { label: "Street Legal LSVs", path: "/shop?street_legal=true" },
      { label: "Rentals", path: "/rentals" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Repairs", path: "/services" },
      { label: "Battery Replacement", path: "/services" },
      { label: "Upgrades", path: "/services" },
      { label: "Maintenance", path: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Contact", path: "/contact" },
      { label: "Rentals", path: "/rentals" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="font-display font-bold text-2xl mb-4">
              SNH <span className="text-accent">GOLF CARTS</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-6">
              Premium electric golf carts and LSVs for every lifestyle. 
              Veteran-owned and operated, serving Southern New Hampshire with 
              integrity and excellence.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
              >
              <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.path}
                      className="text-white/60 text-sm hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-xs">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Londonderry, NH
              </span>
              <a href="tel:+16035551234" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="w-3.5 h-3.5" />
                (603) 555-1234
              </a>
              <a href="mailto:info@snhgolfcarts.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="w-3.5 h-3.5" />
                info@snhgolfcarts.com
              </a>
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Mon-Sat: 9AM-6PM
              </span>
            </div>
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} SNH Golf Carts LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}