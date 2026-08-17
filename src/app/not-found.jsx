import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Wrench, Phone, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page Not Found | SNH Golf Carts LLC",
  description:
    "The page you're looking for doesn't exist. Browse our golf carts, services, or get in touch with the SNH Golf Carts team.",
  robots: { index: false, follow: true },
};

// There is no /services overview page by design — the three service pages are
// the only real destinations, so they're linked individually here.
const serviceLinks = [
  { href: "/services/repair", label: "Repair & Maintenance" },
  { href: "/services/winterization", label: "Winterization" },
];

const cardClass =
  "flex flex-col items-center gap-2 rounded-xl border border-input p-6 text-center shadow-sm transition-colors";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 sm:py-32 text-center">
      <p className="font-display text-6xl sm:text-7xl font-bold text-muted-foreground/40">
        404
      </p>

      <h1 className="font-display font-bold text-3xl sm:text-4xl mt-4">
        Page Not Found
      </h1>

      <p className="text-muted-foreground text-base max-w-md mt-3">
        This page doesn&apos;t exist or has moved. Here&apos;s where most people
        are headed:
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mt-10 w-full max-w-3xl">
        <Link
          href="/shop"
          className={`${cardClass} group hover:border-accent hover:bg-accent/5`}
        >
          <ShoppingCart className="w-6 h-6 text-accent" />
          <span className="font-semibold group-hover:text-accent transition-colors">
            Shop Golf Carts
          </span>
          <span className="text-sm text-muted-foreground">
            Browse our current DACH, TEKO, and Tomberlin inventory.
          </span>
        </Link>

        {/* Not a single link — each service goes to its own page. */}
        <div className={cardClass}>
          <Wrench className="w-6 h-6 text-accent" />
          <span className="font-semibold">Services</span>
          <ul className="flex flex-col gap-1.5 text-sm">
            {serviceLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/contact"
          className={`${cardClass} group hover:border-accent hover:bg-accent/5`}
        >
          <Phone className="w-6 h-6 text-accent" />
          <span className="font-semibold group-hover:text-accent transition-colors">
            Contact Us
          </span>
          <span className="text-sm text-muted-foreground">
            Talk to our team about a cart, a rental, or a service.
          </span>
        </Link>
      </div>

      <Link href="/" className="mt-10">
        <Button variant="outline" className="rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
