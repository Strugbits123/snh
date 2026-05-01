"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { wixClient } from "@/lib/wixClient";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import ShopFilterBar from "@/components/ShopFilterBar";
import { extractProductDetails } from "@/lib/utils";

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [seatFilter, setSeatFilter] = useState("All");
  const [makeFilter, setMakeFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("All");

  // Handle query params on load and change
  useEffect(() => {
    const make = searchParams.get("make");
    if (make) {
      // Find the actual brand name from the brands list to maintain consistent casing
      // But for initial load before brands are fetched, we just set it.
      const actualBrand = brands.find(b => b.toLowerCase() === make.toLowerCase());
      setMakeFilter(actualBrand || make);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setMakeFilter("All");
    }
  }, [searchParams, brands]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => {
        const rawItems = res?._items || res?.items || [];
        // console.log("RawItems==>",rawItems)
        const processed = rawItems.map(item => extractProductDetails(item));
        
        // Sort inStock first
        const sorted = processed.sort((a, b) => {
          if (a.inStock && !b.inStock) return -1;
          if (!a.inStock && b.inStock) return 1;
          return 0;
        });
// console.log('Products==>',sorted)
        setProducts(sorted);
        
        const uniqueBrands = Array.from(
          new Set(sorted.map((p) => p.brand).filter(Boolean))
        );
        setBrands(uniqueBrands);

        // If we have a makeFilter from URL, check if it matches any real brand (case-insensitive)
        const make = searchParams.get("make");
        if (make) {
          const matchedBrand = uniqueBrands.find(b => b.toLowerCase() === make.toLowerCase());
          if (matchedBrand) setMakeFilter(matchedBrand);
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    // Seat filter
    let seatMatch = true;
    if (seatFilter === "2 Seats") seatMatch = p.seats === 2;
    else if (seatFilter === "4 Seats") seatMatch = p.seats === 4;
    else if (seatFilter === "6 Seats") seatMatch = p.seats === 6;
    else if (seatFilter === "8 Seats") seatMatch = p.seats >= 8;

    // Make filter (Case-Insensitive Match)
    const makeMatch = makeFilter === "All" || 
                     (p.brand && p.brand.toLowerCase() === makeFilter.toLowerCase());

    // Color filter
    const colorMatch =
      colorFilter === "All" ||
      (p.colors &&
        p.colors.some((c) => c.toLowerCase().includes(colorFilter.toLowerCase())));

    return seatMatch && makeMatch && colorMatch;
  });

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Our Inventory"
          title="Shop Golf Carts"
          description="Browse our full selection of new electric golf carts and street-legal LSVs from top brands."
        />

        <ShopFilterBar
          brands={brands}
          seatFilter={seatFilter}
          setSeatFilter={setSeatFilter}
          makeFilter={makeFilter}
          setMakeFilter={setMakeFilter}
          colorFilter={colorFilter}
          setColorFilter={setColorFilter}
          count={filtered.length}
        />

        {loading ?
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
          : filtered.length === 0 ?
            <div className="text-center py-32 text-muted-foreground">
              No carts match your filters.
            </div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((cart, i) => (
                <ProductCard key={cart.id} cart={cart} index={i} />
              ))}
            </div>
        }
      </div>
    </div>
  );
}
export default function Shop() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
