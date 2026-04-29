import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { lineItems, productId, quantity = 1 } = body;

    // Normalize items (support single product or multiple lineItems)
    let normalizedItems = [];

    if (lineItems && Array.isArray(lineItems) && lineItems.length > 0) {
      normalizedItems = lineItems;
    } else if (productId) {
      normalizedItems = [{ productId, quantity }];
    }

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        { error: "No items provided. Please send productId or lineItems array." },
        { status: 400 }
      );
    }

    const API_KEY = process.env.WIX_API_KEY;
    const SITE_ID = process.env.WIX_SITE_ID;

    if (!API_KEY || !SITE_ID) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Wix credentials" },
        { status: 500 }
      );
    }

    const headers = {
      "Authorization": API_KEY,
      "wix-site-id": SITE_ID,
      "Content-Type": "application/json",
    };

    // ✅ Correct payload for Wix eCommerce Checkout (2026)
    const checkoutPayload = {
      lineItems: normalizedItems.map((item) => ({
        quantity: Number(item.quantity) || 1,
        catalogReference: {
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",   // Official Wix Stores App ID
          catalogItemId: item.productId,                   // ← This must be your real Wix Product ID
        },
      })),
      channelType: "WEB",
    };

    const checkoutResponse = await fetch(
      "https://www.wixapis.com/ecom/v1/checkouts",
      {
        method: "POST",
        headers,
        body: JSON.stringify(checkoutPayload),
      }
    );

    const checkoutData = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      console.error("Wix Checkout Error:", checkoutData);
      return NextResponse.json(
        {
          error: checkoutData.message || "Failed to create checkout",
          details: checkoutData,
        },
        { status: checkoutResponse.status }
      );
    }

    const checkoutId = checkoutData.checkout?.id;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Invalid response from Wix" },
        { status: 500 }
      );
    }

    // 2. Create Redirect Session (The Headless way)
    // This generates the actual URL to the Wix-hosted checkout page.
    const redirectPayload = {
      ecomCheckout: {
        checkoutId,
      },
      callbacks: {
        postFlowUrl: `${req.nextUrl.origin}/order-confirmation`,
      },
    };

    const redirectResponse = await fetch(
      "https://www.wixapis.com/_api/redirects-api/v1/redirect-session",
      {
        method: "POST",
        headers,
        body: JSON.stringify(redirectPayload),
      }
    );

    const redirectData = await redirectResponse.json();

    if (!redirectResponse.ok) {
      console.error("Redirect Session Error:", redirectData);
      return NextResponse.json(
        { 
          error: redirectData.message || "Failed to create redirect session",
          details: redirectData
        },
        { status: redirectResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: redirectData.redirectSession?.fullUrl,
      checkoutId,
    });

  } catch (err) {
    console.error("Checkout API Error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}