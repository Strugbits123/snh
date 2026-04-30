import { NextResponse } from 'next/server';
import { wixClient } from '@/lib/wixClient';

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

    // 1. Create Checkout using Wix SDK
    const checkoutResult = await wixClient.checkout.createCheckout({
      lineItems: normalizedItems.map((item) => ({
        quantity: Number(item.quantity) || 1,
        catalogReference: {
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",   // Official Wix Stores App ID
          catalogItemId: item.productId,
        },
      })),
      channelType: "WEB",
    });

    const checkoutId = checkoutResult.checkout?.id;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Failed to create checkout ID from Wix result." },
        { status: 500 }
      );
    }

    // 2. Create Redirect Session using Wix SDK
    const redirectSession = await wixClient.redirects.createRedirectSession({
      ecomCheckout: { checkoutId },
      callbacks: {
        postFlowUrl: `${req.nextUrl.origin}/order-confirmation`,
        baseUrl: req.nextUrl.origin,
      },
    });

    if (!redirectSession?.fullUrl) {
      return NextResponse.json(
        { error: "Failed to generate checkout URL. Check your WIX_CLIENT_ID configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: redirectSession.fullUrl,
      checkoutId,
    });

  } catch (err) {
    console.error("Wix Checkout Error:", err);
    
    // Check for common OAuth errors
    if (err.message?.includes("client Id")) {
      return NextResponse.json(
        { 
          error: "Invalid WIX_CLIENT_ID. Please ensure you have a valid Headless OAuth Client ID from Wix.",
          details: err.message
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}