"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import WaiverModal from "@/components/WaiverModal";
import { wixProxy } from "@/lib/wixProxy";
import { extractProductDetails } from "@/lib/utils";
import { trackBeginCheckout } from "@/lib/ecommerce";

// The "Speed Controller & Performance Upgrade" checkout entry point used on
// every zig-zag item of the /services/upgrades page. Self-contained (state +
// vehicle lookup + waiver/checkout flow) so the server-rendered page above it
// stays a plain server component.
export default function UpgradeCheckoutCta() {
  const [showWaiver, setShowWaiver] = useState(false);
  const [waiverSubmitting, setWaiverSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => {
        if (res.products) {
          const vehicleData = res.products
            .map((p) => extractProductDetails(p, res.collections || []))
            .filter(
              (p) =>
                !p.isAccessory &&
                p.fullName?.toLowerCase() !== "speed upgrade service",
            )
            .map((p) => ({ name: p.fullName, isLSV: p.isLSV }))
            .filter((p) => p.name);

          // Deduplicate by name
          const uniqueVehicles = [];
          const seen = new Set();
          vehicleData.forEach((v) => {
            if (!seen.has(v.name)) {
              seen.add(v.name);
              uniqueVehicles.push(v);
            }
          });

          setVehicles(uniqueVehicles.sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);

  const handleWaiverSubmit = async (waiverData) => {
    setWaiverSubmitting(true);
    setCheckoutLoading(true);
    try {
      // 1. Upload Waiver
      const waiverRes = await fetch("/api/waiver-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waiverData),
      });
      const waiverResult = await waiverRes.json();
      const waiverPdfUrl =
        waiverResult.pdfUrl || waiverResult.pdfBase64 || "Waiver submitted";

      // 2. Fetch "Speed Upgrade" product
      let speedProduct = null;
      try {
        // Use a filtered query for exact name match (case-sensitive in Wix)
        const productsData = await wixProxy("products", "query", {
          filters: { name: "Speed Upgrade Service" }
        });

        // Handle both 'items' and '_items' to be safe
        speedProduct = (productsData.items || productsData._items)?.[0];

        // Fallback: If exact match fails, try a broader search with a higher limit
        if (!speedProduct) {
          const allProducts = await wixProxy("products", "query", { limit: 100 });
          speedProduct = (allProducts.items || allProducts._items)?.find(
            (p) => p.name?.toLowerCase().includes("speed upgrade service")
          );
        }
      } catch (err) {
        console.warn("Failed to fetch speed product from Wix:", err);
      }

      if (!speedProduct) {
        alert("The 'Speed Upgrade Service' product was not found in Wix. Please ensure it is created as described in the instructions.");
        setCheckoutLoading(false);
        setWaiverSubmitting(false);
        return;
      }

      // 3. Initiate Checkout
      // Last point we control before Wix hosted checkout takes over.
      trackBeginCheckout(
        {
          id: speedProduct.id || speedProduct._id,
          fullName: speedProduct.name,
          category: "Service",
          price: speedProduct.priceData?.price,
        },
        { quantity: 1 },
      );
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: speedProduct.id || speedProduct._id,
          quantity: 1,
          productName: speedProduct.name,
          productPrice: speedProduct.priceData?.price,
          productImage: speedProduct.media?.mainMedia?.image?.url || "/images/services/upgrades.png",
          waiverPdfUrl: waiverPdfUrl,
          waiverCustomerName: waiverData.fullName,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to start checkout. Please call us at 603-777-7831.");
        setCheckoutLoading(false);
        setWaiverSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please call us at 603-777-7831 to complete your upgrade.");
      setCheckoutLoading(false);
      setWaiverSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowWaiver(true)}
        disabled={checkoutLoading}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-12 w-full sm:w-auto px-4 py-2 bg-[#0DA2E7] hover:bg-[#0DA2E7]/90 text-white shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733]"
      >
        {checkoutLoading &&
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        }
        Speed Controller & Performance Upgrade
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <WaiverModal
        isOpen={showWaiver}
        onClose={() => {
          setShowWaiver(false);
          setCheckoutLoading(false);
        }}
        onSubmit={handleWaiverSubmit}
        vehicleMakeModel=""
        isSubmitting={waiverSubmitting}
        vehicles={vehicles}
      />
    </>
  );
}
