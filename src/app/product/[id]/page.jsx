"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { wixProxy } from "@/lib/wixProxy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Users,
  Zap,
  Gauge,
  Battery,
  ShieldCheck,
  Check,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { extractProductDetails, cn } from "@/lib/utils";
import FinancingBadge from "@/components/FinancingBadge";

export default function ProductDetail() {
  const { id } = useParams();
  const [cart, setCart] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);

    // Fetch products and collections from our combined API
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => {
        const rawProducts = res.products || [];
        const collections = res.collections || [];
        
        const rawProduct = rawProducts.find(p => (p._id || p.id) === id);
        
        if (rawProduct) {
          const product = extractProductDetails(rawProduct, collections);
          setCart(product);
          if (product.colors?.length > 0) {
            setSelectedOptions({ [product.colorOptionName]: product.colors[0] });
          }
          
          const processed = rawProducts.map(item => extractProductDetails(item, collections));
          
          // Related logic: 
          // If accessory, show other accessories. 
          // If golf cart, show other carts from same brand.
          let relatedItems = [];
          if (product.isAccessory) {
            relatedItems = processed.filter(p => p.isAccessory && p.id !== id);
          } else {
            relatedItems = processed.filter(p => !p.isAccessory && p.brand === product.brand && p.id !== id);
          }
          
          setRelated(relatedItems.slice(0, 3));
        }
      })
      .catch((err) => console.error("Error fetching product details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCardCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // console.log("Cart==>",cart)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: cart.id,
          quantity: 1,
          productName: `${cart.brand?.toUpperCase() || ""} ${cart.name}`,
          productPrice: cart.price,
          productImage: cart.image,
          options: selectedOptions,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        // Save order details to sessionStorage for the confirmation page
        try {
          sessionStorage.setItem("snh_pending_order", JSON.stringify({
            productName: `${cart.brand?.toUpperCase() || ""} ${cart.name}`,
            productImage: cart.image,
            productPrice: cart.formattedPrice || cart.price,
            quantity: 1,
            options: selectedOptions,
            checkoutId: data.checkoutId,
            timestamp: Date.now(),
          }));
        } catch (e) { /* ignore storage errors */ }
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to start checkout. Please call us or try again.");
        setCheckoutLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to start checkout. Please call us or try again.");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <p className="text-muted-foreground text-lg">Cart not found.</p>
        <Link href="/shop">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const images = [cart.image, ...cart.gallery].filter(Boolean);

  const specs = [
    { icon: Users, label: "Seats", value: cart.seats ? `${cart.seats} Passengers` : null },
    { icon: Zap, label: "Range", value: cart.range },
    { icon: Gauge, label: "Top Speed", value: cart.topSpeed },
    { icon: Battery, label: "Battery", value: cart.battery },
  ].filter((s) => s.value);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-3xl overflow-hidden bg-muted aspect-[4/3]">
              {images[activeImage] && (
                <img
                  src={images[activeImage]}
                  alt={cart.name}
                  className="w-full h-full object-cover"
                />
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {!cart.inStock && (
                  <Badge className="bg-red-600 text-white border-0">Out of Stock</Badge>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors shrink-0",
                      i === activeImage ? "border-accent" : "border-transparent"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-xs text-accent uppercase tracking-[0.2em] font-semibold mb-2">
              {cart.brand}
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3">{cart.name}</h1>
            <div className="text-3xl font-bold text-foreground mb-4">
              {cart.formattedPrice || "Call for Price"}
            </div>

            {/* Financing Badge */}
            {(() => {
              let partner = "Sheffield Financial"; // Default
              const brandLower = cart.brand?.toLowerCase() || "";
              
              if (brandLower.includes("dach") || brandLower.includes("conquest")) {
                partner = "Dealer Direct";
              } else if (brandLower.includes("evolution") || brandLower.includes("teko") || brandLower.includes("tomberlin")) {
                partner = "Sheffield Financial";
              }
              
              return <FinancingBadge partner={partner} />;
            })()}

            {specs.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 my-6">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-muted rounded-xl p-3 sm:p-4">
                    <spec.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent mb-2" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{spec.label}</p>
                    <p className="font-semibold text-xs sm:text-sm">{spec.value}</p>
                  </div>
                ))}
              </div>
            )}
            
            {cart.colors?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3">Select Color</p>
                <div className="flex flex-wrap gap-2">
                  {cart.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedOptions({ [cart.colorOptionName]: color })}
                      className={cn(
                        "px-4 py-2 rounded-full border text-xs font-medium transition-all",
                        selectedOptions[cart.colorOptionName] === color
                          ? "bg-accent border-accent text-white shadow-md"
                          : "bg-background border-border text-muted-foreground hover:border-accent/50"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-white rounded-full h-14 text-base"
                onClick={handleCardCheckout}
                disabled={checkoutLoading || !cart.inStock}
              >
                {checkoutLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {checkoutLoading ? "Preparing Checkout..." : "Pay via Card"}
              </Button>
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <a
                href="tel:6037777831"
                className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Want to pay cash?{" "}
                <span className="font-semibold text-foreground underline underline-offset-2">
                  Call us: 603-777-7831
                </span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Full Description */}
        {cart.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 bg-muted/40 rounded-3xl p-8"
          >
            <h2 className="font-display font-bold text-2xl mb-6">
              About This {cart.isAccessory ? "Accessory" : "Cart"}
            </h2>
            <div
              className="prose prose-sm max-w-none text-muted-foreground [&_strong]:text-foreground [&_ul]:list-none [&_ul]:p-0 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: cart.description }}
            />
          </motion.div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display font-bold text-2xl mb-8">
              {cart.isAccessory ? "More Accessories" : `More from ${cart.brand}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((c, i) => (
                <ProductCard key={c.id} cart={c} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
