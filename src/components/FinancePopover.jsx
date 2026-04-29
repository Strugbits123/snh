"use client";
import { useState, useRef, useEffect } from "react";

const LENDERS = [
  {
    icon: "🏦",
    name: "Sheffield Financial",
    desc: "New cart financing — quick pre-qual online",
    url: "https://prequalify.sheffieldFinancial.com/Apply/Dealer/59453",
  },
  {
    icon: "🤝",
    name: "Dealer Direct",
    desc: "New cart financing — quick pre-qual online",
    url: "https://dealerdirect.apptraker.com/my/guest?dealer=11116",
  },
];

export default function FinancePopover({ textColor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        id="finance-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors
          ${open
            ? "bg-accent text-white border-accent"
            : "border-current hover:bg-accent hover:text-white hover:border-accent"
          } ${!open ? textColor : ""}`}
      >
        💰 Finance
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Financing options"
          className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-border z-50 overflow-hidden"
        >
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-display font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Choose Your Lender
            </p>
            <div className="space-y-2">
              {LENDERS.map((l) => (
                <a
                  key={l.name}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                >
                  <div className="text-2xl shrink-0">{l.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-display font-bold text-foreground">{l.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{l.desc}</div>
                  </div>
                  <span className="text-xs font-semibold text-accent shrink-0 group-hover:translate-x-0.5 transition-transform">
                    Apply Now →
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border mt-3 bg-muted/40">
            <p className="text-xs text-muted-foreground text-center">
              Questions? Call Bill at{" "}
              <a href="tel:6037777831" className="text-accent font-semibold hover:underline">
                603-777-7831
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}