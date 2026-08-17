"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X, Phone, ShoppingCart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import FinancePopover from "./FinancePopover";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  {
    label: "Services",
    path: "/services",
    children: [
      { label: "Repair & Maintenance", path: "/services/repair" },
      { label: "Winterization", path: "/services/winterization" },
    ],
  },
  { label: "Rentals", path: "/rentals" },
  { label: "Blog", path: "/blogs" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const navBg = scrolled || !isHome
    ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-border"
    : "bg-transparent";
  const textColor = scrolled || !isHome ? "text-foreground" : "text-white";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
                <Link href="/" className="flex items-center gap-2 shrink-0">
            <img 
              src={scrolled || !isHome ? "/Logo-png-w.png" : "/Logo-png-b.png"} 
              alt="SNH Golf Carts" 
              className="h-10 w-auto object-contain transition-all duration-300"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.path} className="relative group">
                  <button
                    type="button"
                    className={`flex items-center gap-1 px-2 xl:px-4 py-2 text-[12px] xl:text-sm font-medium tracking-wide uppercase transition-colors rounded-lg whitespace-nowrap
                      ${pathname.startsWith(link.path)
                        ? "text-accent"
                        : `${textColor} group-hover:text-accent`
                      }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-0 top-full pt-3 opacity-0 invisible -translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                    <div className="w-64 bg-white rounded-2xl shadow-xl border border-border overflow-hidden py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          href={child.path}
                          className="block px-5 py-3 text-sm font-medium uppercase tracking-wide text-foreground hover:bg-accent/5 hover:text-accent transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={link.path}
                  href={link.path}
                  className={`px-2 xl:px-4 py-2 text-[12px] xl:text-sm font-medium tracking-wide uppercase transition-colors rounded-lg whitespace-nowrap
                    ${pathname === link.path || (link.path !== "/" && pathname.startsWith(link.path))
                      ? "text-accent"
                      : `${textColor} hover:text-accent`
                    }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <a
              href="tel:6037777831"
              className={`hidden xl:flex items-center gap-2 text-sm font-medium ${textColor} hover:text-accent transition-colors whitespace-nowrap`}
            >
              <Phone className="w-4 h-4" />
              603-777-7831
            </a>
            <Link href="/shop" className="shrink-0">
              <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-4 xl:px-6 h-10 text-sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">Shop Now</span>
              </Button>
            </Link>
            {pathname === "/shop" && (
              <div className="shrink-0">
                <FinancePopover textColor={textColor} />
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 ${textColor}`}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="px-4 py-6 space-y-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.path}>
                    <button
                      type="button"
                      onClick={() => setMobileServicesOpen((v) => !v)}
                      aria-expanded={mobileServicesOpen}
                      className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors
                        ${pathname.startsWith(link.path)
                          ? "text-accent bg-accent/5"
                          : "text-foreground hover:bg-muted"
                        }`}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 py-1 space-y-1">
                            {link.children.map((child) => (
                              <Link
                                key={child.path}
                                href={child.path}
                                className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                                  ${pathname === child.path
                                    ? "text-accent bg-accent/5"
                                    : "text-muted-foreground hover:bg-muted"
                                  }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link key={link.path}
                    href={link.path}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors
                      ${pathname === link.path || (link.path !== "/" && pathname.startsWith(link.path))
                        ? "text-accent bg-accent/5"
                        : "text-foreground hover:bg-muted"
                      }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-4 border-t border-border mt-4 space-y-3">
                <a
                  href="tel:6037777831"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" />
                  603-777-7831
                </a>
                {pathname === "/shop" && (
                  <div className="px-4 py-2">
                    <FinancePopover textColor="text-foreground" />
                  </div>
                )}
                <Link href="/shop" className="block px-4">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white rounded-full">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}