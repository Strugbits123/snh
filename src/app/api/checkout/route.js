// import { NextResponse } from 'next/server';
// import { wixClient } from '@/lib/wixClient';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     console.log("Body==>",body)
//     const { lineItems, productId, quantity = 1, options } = body;

//     // Normalize items (support single product or multiple lineItems)
//     let normalizedItems = [];

//     if (lineItems && Array.isArray(lineItems) && lineItems.length > 0) {
//       normalizedItems = lineItems;
//     } else if (productId) {
//       normalizedItems = [{ productId, quantity, options }];
//     }

//     if (normalizedItems.length === 0) {
//       return NextResponse.json(
//         { error: "No items provided. Please send productId or lineItems array." },
//         { status: 400 }
//       );
//     }
// console.log("Normalized Items==>",normalizedItems)
    
//     // Debug: Fetch product to see its actual options and availability
//     let wixProduct = null;
//     try {
//       if (productId) {
//         wixProduct = await wixClient.products.getProduct(productId);
//         console.log("Wix Product Details==>", JSON.stringify(wixProduct, null, 2));
//       }
//     } catch (e) {
//       console.warn("Could not fetch product from Wix for debug:", e.message);
//     }

//     // 1. Create Checkout using direct Wix API call

//     const isManaged = wixProduct?.product?.manageVariants;
//     console.log("Is Managed Variants?==>", isManaged);

//     const finalBody = {
//       lineItems: normalizedItems.map((item) => ({
//         quantity: Number(item.quantity) || 1,
//         catalogReference: {
//           appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
//           catalogItemId: item.productId,
//           // ONLY send options in catalogReference if Wix manages them as variants
//           ...(isManaged && item.options && {
//             options: { choices: item.options?.choices || item.options }
//           }),
//         },
//         // Always send overrides for safety and to show the selection (like Color)
//         catalogOverrideFields: {
//           productName: { original: item.productName || wixProduct?.product?.name },
//           price: item.productPrice?.toString() || wixProduct?.product?.priceData?.price?.toString(),
//           descriptionLines: (item.options?.choices || item.options) ? Object.entries(item.options?.choices || item.options).map(([name, value]) => ({
//             name: { original: name },
//             plainText: { original: String(value) }
//           })) : []
//         }
//       })),
//       channelType: "WEB",
//     };
//     console.log("Wix API Request Body==>", JSON.stringify(finalBody, null, 2));

//     // 1. Create Checkout using direct Wix API call
//     const checkoutResponse = await fetch("https://www.wixapis.com/ecom/v1/checkouts", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": process.env.WIX_API_KEY,
//         "wix-site-id": process.env.WIX_SITE_ID,
//       },
//       body: JSON.stringify(finalBody),
//     });
// console.log("Checkout Response==>",checkoutResponse)
//     if (!checkoutResponse.ok) {
//       const errorData = await checkoutResponse.json();
//       console.error("Wix API Error:", errorData);
//       throw new Error(errorData.message || `Wix API returned ${checkoutResponse.status}`);
//     }

//     const checkoutResult = await checkoutResponse.json();
//     const checkoutId = checkoutResult.checkout?.id;

//     if (!checkoutId) {
//       return NextResponse.json(
//         { error: "Failed to create checkout ID from Wix result." },
//         { status: 500 }
//       );
//     }
//     console.log("CheckoutResult==>",checkoutResult)
// // const checkoutUrl = checkoutResult.checkout?.checkoutUrl;
//    const urlResponse = await fetch(
//   `https://www.wixapis.com/ecom/v1/checkouts/${checkoutId}/checkout-url`,
//   {
//     method: "GET",
//     headers: {
//       "Authorization": process.env.WIX_API_KEY,
//       "wix-site-id": process.env.WIX_SITE_ID,
//     },
//   }
// );

// if (!urlResponse.ok) {
//   const errData = await urlResponse.json().catch(() => ({}));
//   console.error("Failed to get checkout URL:", errData);
//   throw new Error("Could not retrieve checkout URL");
// }

// const urlData = await urlResponse.json();
// console.log("Url==>",urlData)
// const checkoutUrl = urlData.checkoutUrl;   // ← this should now have the value

// console.log("Checkout URL ==>", checkoutUrl);

//     return NextResponse.json({
//       success: true,
//       checkoutUrl: checkoutUrl,
//       checkoutId,
//     });

//   } catch (err) {
//     console.error("Wix Checkout Error:", err);
    
//     // Check for common OAuth errors
//     if (err.message?.includes("client Id")) {
//       return NextResponse.json(
//         { 
//           error: "Invalid WIX_CLIENT_ID. Please ensure you have a valid Headless OAuth Client ID from Wix.",
//           details: err.message
//         },
//         { status: 401 }
//       );
//     }

//     return NextResponse.json(
//       { error: err.message || "Internal server error. Please try again." },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { wixClient } from "@/lib/wixClient";

export async function POST(req) {
  try {
    const body = await req.json();
    // console.log("Body==>", body);

    const { lineItems, productId, quantity = 1, options, productName, productPrice } = body;

    let normalizedItems = [];

    if (Array.isArray(lineItems) && lineItems.length > 0) {
      normalizedItems = lineItems;
    } else if (productId) {
      normalizedItems = [{ productId, quantity, options, productName, productPrice }];
    }

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    // console.log("Normalized Items==>", normalizedItems);

    // Fetch product (for option mapping)
    let wixProduct = null;

    if (productId) {
      try {
        wixProduct = await wixClient.products.getProduct(productId);
        // console.log("Wix Product Loaded");
      } catch (err) {
        console.warn("Failed to fetch Wix product:", err.message);
      }
    }

    // -------------------------------
    // 🔥 FIX: Convert option label → Wix value (white → #ffffff)
    // -------------------------------
    let resolvedOptions = {};

    if (wixProduct?.product?.productOptions && options) {
      const colorOption = wixProduct.product.productOptions.find(
        (opt) => opt.name === "Color"
      );

      if (colorOption && options.Color) {
        const match = colorOption.choices.find(
          (c) =>
            c.description?.toLowerCase() === options.Color.toLowerCase()
        );

        if (match) {
          resolvedOptions.Color = match.value; // ✅ HEX value
        }
      }
    }

    // console.log("Resolved Options==>", resolvedOptions);

    // -------------------------------
    // Build Wix Checkout Payload
    // -------------------------------
    const finalBody = {
      lineItems: normalizedItems.map((item) => ({
        quantity: Number(item.quantity) || 1,

        catalogReference: {
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
          catalogItemId: item.productId,

     
          ...(resolvedOptions &&
            Object.keys(resolvedOptions).length > 0 && {
              options: {
                choices: {"Color":"white"},
              },
            }),
        },

        // UI only overrides (safe)
        catalogOverrideFields: {
          productName: {
            original: item.productName || wixProduct?.product?.name,
          },
          price:
            item.productPrice?.toString() ||
            wixProduct?.product?.priceData?.price?.toString(),

          descriptionLines:
            resolvedOptions && Object.keys(resolvedOptions).length > 0
              ? Object.entries(resolvedOptions).map(([name, value]) => ({
                  name: { original: name },
                  plainText: { original: String(value) },
                }))
              : [],
        },
      })),

      channelType: "WEB",
    };

    // console.log("Wix API Request Body==>", JSON.stringify(finalBody, null, 2));

    // -------------------------------
    // Create Checkout
    // -------------------------------
    const checkoutResponse = await fetch(
      "https://www.wixapis.com/ecom/v1/checkouts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.WIX_API_KEY,
          "wix-site-id": process.env.WIX_SITE_ID,
        },
        body: JSON.stringify(finalBody),
      }
    );

    console.log("Checkout Response Status==>", checkoutResponse.status);

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error("Wix API Error:", errorData);
      throw new Error(errorData.message || "Wix checkout failed");
    }

    const checkoutResult = await checkoutResponse.json();
    // console.log("CheckoutResult==>", checkoutResult);

    const checkoutId = checkoutResult.checkout?.id;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID not returned by Wix" },
        { status: 500 }
      );
    }

    // -------------------------------
    // Get Checkout URL
    // -------------------------------
    const urlResponse = await fetch(
      `https://www.wixapis.com/ecom/v1/checkouts/${checkoutId}/checkout-url`,
      {
        method: "GET",
        headers: {
          Authorization: process.env.WIX_API_KEY,
          "wix-site-id": process.env.WIX_SITE_ID,
        },
      }
    );

    if (!urlResponse.ok) {
      const errData = await urlResponse.json().catch(() => ({}));
      console.error("URL Error:", errData);
      throw new Error("Failed to get checkout URL");
    }

    const urlData = await urlResponse.json();

    // console.log("Checkout URL==>", urlData.checkoutUrl);

    return NextResponse.json({
      success: true,
      checkoutUrl: urlData.checkoutUrl,
      checkoutId,
    });

  } catch (err) {
    console.error("Checkout Error:", err);

    return NextResponse.json(
      {
        error: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}