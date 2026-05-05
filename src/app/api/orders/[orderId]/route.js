import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const { wixClient } = await import("@/lib/wixClient");

    const result = await wixClient.orders.getOrder(orderId);
    const order = result.order || result;

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Order fetch error:", err);

    // Fallback: try via REST API
    try {
      const API_KEY = process.env.WIX_API_KEY;
      const SITE_ID = process.env.WIX_SITE_ID;

      if (API_KEY && SITE_ID) {
        const { orderId } = await params;
        const res = await fetch(
          `https://www.wixapis.com/ecom/v1/orders/${orderId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: API_KEY,
              "wix-site-id": SITE_ID,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ order: data.order });
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback order fetch error:", fallbackErr);
    }

    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
