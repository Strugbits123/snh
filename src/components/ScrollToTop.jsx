"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
      });
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);
  return null;
}
