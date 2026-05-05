"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Package,
  Loader2,
  MapPin,
  CreditCard,
  Hash,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function OrderDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [fallbackOrder, setFallbackOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Try loading from sessionStorage first (as fallback)
    try {
      const saved = sessionStorage.getItem("snh_pending_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only use if less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          setFallbackOrder(parsed);
        }
        sessionStorage.removeItem("snh_pending_order");
      }
    } catch (e) {
      /* ignore */
    }

    // If we have an orderId from Wix, fetch the full order
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order);
          } else {
            setError(true);
          }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Decide what to display
  const hasOrderData = order || fallbackOrder;

  // Extract line items from Wix order
  const lineItems = order?.lineItems || [];
  const priceSummary = order?.priceSummary;
  const shippingAddress = order?.shippingInfo?.logistics?.shippingDestination?.address;
  const billingAddress = order?.billingInfo?.address;
  const displayAddress = shippingAddress || billingAddress;
  const buyerEmail = order?.buyerInfo?.email;
  const orderNumber = order?.number;
  const orderDate = order?.createdDate || order?._createdDate;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-24 pb-16 px-4">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-card border border-border rounded-3xl p-8 text-center shadow-xl"
      >
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>

        <h1 className="font-display font-bold text-3xl mb-2 text-foreground">
          Order Confirmed!
        </h1>
        {orderNumber && (
          <p className="text-accent font-semibold text-sm mb-2">
            Order #{orderNumber}
          </p>
        )}
        <p className="text-muted-foreground mb-2">
          Thank you for choosing SNH Golf Carts LLC. Your order has been placed
          successfully and we&apos;re getting it ready for you.
        </p>
        {buyerEmail && (
          <p className="text-xs text-muted-foreground">
            A confirmation email has been sent to{" "}
            <span className="font-semibold text-foreground">{buyerEmail}</span>
          </p>
        )}
      </motion.div>

      {/* Order Details */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-2 text-muted-foreground"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading order details...</span>
        </motion.div>
      ) : hasOrderData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl w-full mt-6 space-y-4"
        >
          {/* Order Meta Info */}
          {(orderDate || orderId) && (
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-wrap gap-4">
              {orderNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">Order :</span>
                  <span className="font-mono text-xs text-foreground break-all">
                    {orderNumber}
                  </span>
                </div>
              )}
              {orderDate && (
                <div className="flex items-center gap-2 text-sm ml-auto">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">
                    {formatDate(orderDate)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Line Items from Wix */}
          {lineItems.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                <h2 className="font-semibold text-sm">Items Ordered</h2>
              </div>
              <div className="divide-y divide-border">
                {lineItems.map((item, index) => {
                  const imgUrl =
                    item.image?.url ||
                    item.mediaItem?.url ||
                    item.productName?.image;
                  const name =
                    item.productName?.translated ||
                    item.productName?.original ||
                    item.productName ||
                    "Product";
                  const qty = item.quantity || 1;
                  const price =
                    item.price?.formattedAmount ||
                    item.priceBeforeDiscounts?.formattedAmount ||
                    item.price?.amount;
                  const totalPrice =
                    item.totalPriceAfterTax?.formattedAmount ||
                    item.totalPriceBeforeTax?.formattedAmount;
                  const options = item.descriptionLines || [];

                  return (
                    <div
                      key={item._id || index}
                      className="flex items-start gap-4 p-5"
                    >
                      {imgUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                          <img
                            src={imgUrl}
                            alt={typeof name === "string" ? name : "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {typeof name === "string" ? name : "Product"}
                        </p>
                        {options.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {options.map((opt, i) => (
                              <p
                                key={i}
                                className="text-xs text-muted-foreground"
                              >
                                {opt.name?.translated || opt.name?.original || opt.name}:{" "}
                                <span className="text-foreground">
                                  {opt.plainText?.translated ||
                                    opt.plainText?.original ||
                                    opt.colorInfo?.translated ||
                                    opt.colorInfo?.original ||
                                    ""}
                                </span>
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {qty}
                          {price && <span className="ml-2">@ {price}</span>}
                        </p>
                      </div>
                      {totalPrice && (
                        <p className="font-semibold text-sm text-foreground shrink-0">
                          {totalPrice}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback: Show from sessionStorage if no Wix order items */}
          {lineItems.length === 0 && fallbackOrder && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                <h2 className="font-semibold text-sm">Items Ordered</h2>
              </div>
              <div className="flex items-start gap-4 p-5">
                {fallbackOrder.productImage && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img
                      src={fallbackOrder.productImage}
                      alt={fallbackOrder.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {fallbackOrder.productName}
                  </p>
                  {fallbackOrder.options &&
                    Object.keys(fallbackOrder.options).length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {Object.entries(fallbackOrder.options).map(
                          ([key, val]) => (
                            <p
                              key={key}
                              className="text-xs text-muted-foreground"
                            >
                              {key}:{" "}
                              <span className="text-foreground">{val}</span>
                            </p>
                          )
                        )}
                      </div>
                    )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Qty: {fallbackOrder.quantity || 1}
                  </p>
                </div>
                {fallbackOrder.productPrice && (
                  <p className="font-semibold text-sm text-foreground shrink-0">
                    {typeof fallbackOrder.productPrice === "string"
                      ? fallbackOrder.productPrice
                      : `$${Number(fallbackOrder.productPrice).toLocaleString()}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Price Summary */}
          {priceSummary && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-accent" />
                <h2 className="font-semibold text-sm">Payment Summary</h2>
              </div>
              <div className="space-y-2">
                {priceSummary.subtotal?.formattedAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{priceSummary.subtotal.formattedAmount}</span>
                  </div>
                )}
                {priceSummary.shipping?.formattedAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{priceSummary.shipping.formattedAmount}</span>
                  </div>
                )}
                {priceSummary.tax?.formattedAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{priceSummary.tax.formattedAmount}</span>
                  </div>
                )}
                {priceSummary.discount?.formattedAmount &&
                  priceSummary.discount.amount !== "0" && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Discount</span>
                      <span>-{priceSummary.discount.formattedAmount}</span>
                    </div>
                  )}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-lg">
                      {priceSummary.total?.formattedAmount || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {displayAddress && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-accent" />
                <h2 className="font-semibold text-sm">
                  {shippingAddress ? "Shipping Address" : "Billing Address"}
                </h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                {(displayAddress.fullName?.firstName ||
                  displayAddress.fullName?.lastName) && (
                  <p className="text-foreground font-medium">
                    {displayAddress.fullName.firstName}{" "}
                    {displayAddress.fullName.lastName}
                  </p>
                )}
                {displayAddress.addressLine1 && (
                  <p>{displayAddress.addressLine1}</p>
                )}
                {displayAddress.addressLine2 && (
                  <p>{displayAddress.addressLine2}</p>
                )}
                {(displayAddress.city ||
                  displayAddress.subdivision ||
                  displayAddress.postalCode) && (
                  <p>
                    {displayAddress.city}
                    {displayAddress.subdivision &&
                      `, ${displayAddress.subdivision}`}
                    {displayAddress.postalCode &&
                      ` ${displayAddress.postalCode}`}
                  </p>
                )}
                {displayAddress.country && <p>{displayAddress.country}</p>}
              </div>
            </div>
          )}
        </motion.div>
      ) : null}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: hasOrderData ? 0.4 : 0.2 }}
        className="max-w-2xl w-full mt-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/shop" className="flex-1">
            <Button className="w-full bg-accent hover:bg-accent/90 text-white rounded-full h-12">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-white rounded-full h-12"
            >
              Back to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <p className="mt-12 text-sm text-muted-foreground">
        Need help?{" "}
        <a href="tel:6037777831" className="text-accent font-semibold">
          603-777-7831
        </a>
      </p>
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <OrderDetails />
    </Suspense>
  );
}
