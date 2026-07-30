import { trackEvent } from "@/lib/analytics";

// Order IDs we've already reported, so a refresh, back-button or bookmarked
// visit to /order-confirmation can't double-count revenue. localStorage rather
// than sessionStorage: the confirmation URL survives a closed tab, and GA4
// would happily accept the same transaction_id twice.
const STORAGE_KEY = "snh_tracked_purchases";
const MAX_REMEMBERED = 25;

function readTracked() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private mode or disabled storage — treat as "nothing tracked yet".
    return [];
  }
}

function rememberTracked(orderId) {
  try {
    const next = [orderId, ...readTracked().filter((id) => id !== orderId)];
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next.slice(0, MAX_REMEMBERED)),
    );
  } catch {
    /* nothing we can do, and not worth breaking the page over */
  }
}

// Wix returns money as strings ("175.00"). GA4 wants numbers.
function toNumber(amount) {
  if (amount === undefined || amount === null || amount === "") return undefined;
  const n = Number(amount);
  return Number.isFinite(n) ? n : undefined;
}

// Map a Wix eCom order onto the GA4 `purchase` payload.
export function buildPurchasePayload(order) {
  if (!order) return null;

  const priceSummary = order.priceSummary || {};
  const value = toNumber(
    priceSummary.total?.amount ?? priceSummary.totalPrice?.amount,
  );
  if (value === undefined) return null;

  const items = (order.lineItems || []).map((item, index) => {
    const entry = {
      item_id:
        item.catalogReference?.catalogItemId || item.id || `item_${index + 1}`,
      item_name:
        item.productName?.original ||
        item.productName?.translated ||
        "Unknown item",
      quantity: Number(item.quantity) || 1,
    };

    // `price` is the unit price; omit rather than send a null.
    const unitPrice = toNumber(item.price?.amount);
    if (unitPrice !== undefined) entry.price = unitPrice;

    return entry;
  });

  const payload = {
    // The order number is what the customer and the Wix dashboard both show,
    // so revenue in GA4 can be reconciled against Wix by eye.
    transaction_id: String(order.number || order.id || order._id || ""),
    value,
    currency: order.currency || "USD",
    items,
  };

  const tax = toNumber(priceSummary.tax?.amount);
  if (tax !== undefined) payload.tax = tax;

  const shipping = toNumber(priceSummary.shipping?.amount);
  if (shipping !== undefined) payload.shipping = shipping;

  const coupon = (order.appliedDiscounts || [])
    .map((discount) => discount.coupon?.code)
    .find(Boolean);
  if (coupon) payload.coupon = coupon;

  return payload.transaction_id ? payload : null;
}

// Only completed, still-valid orders count as a purchase. A shopper who
// abandons the Wix checkout can still land back here with an order that was
// never paid, and a canceled order is not revenue.
function isPurchaseEligible(order) {
  if (!order) return false;
  if (order.status === "CANCELED") return false;
  return order.paymentStatus === "PAID";
}

// Fires GA4 `purchase` at most once per order. Returns what it decided, which
// makes the "why didn't it fire" question answerable from the console.
export function trackPurchaseOnce(order) {
  if (typeof window === "undefined") return { sent: false, reason: "no-window" };

  const dedupeId = order?.id || order?._id || order?.number;
  if (!dedupeId) return { sent: false, reason: "no-order-id" };

  if (!isPurchaseEligible(order)) {
    return {
      sent: false,
      reason: `not-eligible (status=${order.status}, payment=${order.paymentStatus})`,
    };
  }

  const key = String(dedupeId);
  if (readTracked().includes(key)) {
    return { sent: false, reason: "already-tracked" };
  }

  const payload = buildPurchasePayload(order);
  if (!payload) return { sent: false, reason: "incomplete-order-data" };

  trackEvent("purchase", payload);
  rememberTracked(key);

  return { sent: true, payload };
}

const CURRENCY = "USD";

// Map a product from `extractProductDetails` onto a GA4 item. Used by
// view_item, view_item_list and begin_checkout so an item looks identical
// however it enters the funnel — GA4 joins them on item_id.
export function toGaItem(product, extra = {}) {
  if (!product) return null;

  const item = {
    item_id: product.id || product.slug,
    item_name: product.fullName || product.name,
    ...extra,
  };

  if (product.brand) item.item_brand = product.brand;

  // An explicit category wins; otherwise derive it from the collection-based
  // isAccessory flag that extractProductDetails sets.
  if (product.category) {
    item.item_category = product.category;
  } else if (product.isAccessory !== undefined) {
    item.item_category = product.isAccessory ? "Accessory" : "Golf Cart";
  }

  const price = toNumber(product.price);
  if (price !== undefined) item.price = price;

  return item.item_id ? item : null;
}

export function trackViewItem(product) {
  const item = toGaItem(product);
  if (!item) return;

  trackEvent("view_item", {
    currency: CURRENCY,
    value: item.price ?? 0,
    items: [item],
  });
}

export function trackViewItemList(products, listName) {
  const items = (products || [])
    .map((product, index) => toGaItem(product, { index }))
    .filter(Boolean);

  if (items.length === 0) return;

  trackEvent("view_item_list", {
    item_list_name: listName,
    // GA4 caps items per event; the shop grid can exceed that on a wide filter.
    items: items.slice(0, 50),
  });
}

// Fired on the click that hands the visitor off to Wix's hosted checkout —
// the last moment our code is in control. Paired with `purchase` on the way
// back, this is what makes checkout drop-off measurable without any events
// from inside Wix.
export function trackBeginCheckout(product, { quantity = 1, price } = {}) {
  const item = toGaItem(product, { quantity });
  if (!item) return;

  const unitPrice = toNumber(price) ?? item.price;
  if (unitPrice !== undefined) item.price = unitPrice;

  trackEvent("begin_checkout", {
    currency: CURRENCY,
    value: (item.price ?? 0) * quantity,
    items: [item],
  });
}
