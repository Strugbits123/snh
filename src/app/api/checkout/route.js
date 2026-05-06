import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      lineItems,
      productId,
      quantity = 1,
      options,
      productName,
      productPrice,
      waiverPdfUrl,
      waiverCustomerName,
    } = body;

    console.log("Body==>", body);

    let normalizedItems = [];

    if (Array.isArray(lineItems) && lineItems.length > 0) {
      normalizedItems = lineItems;
    } else if (productId) {
      normalizedItems = [
        { productId, quantity, options, productName, productPrice },
      ];
    }

    console.log("Normalized Items==>", normalizedItems);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const API_KEY = process.env.WIX_API_KEY;
    const SITE_ID = process.env.WIX_SITE_ID;

    if (!API_KEY || !SITE_ID) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Wix credentials" },
        { status: 500 },
      );
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: API_KEY,
      "wix-site-id": SITE_ID,
    };

    const resolvedLineItems = [];

    for (const item of normalizedItems) {
      const lineItem = {
        quantity: Number(item.quantity) || 1,
        catalogReference: {
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
          catalogItemId: item.productId,
        },
      };

      const itemOptions = item.options || options;

      if (itemOptions && Object.keys(itemOptions).length > 0) {
        let wixProduct = null;
        try {
          const prodRes = await fetch(
            `https://www.wixapis.com/stores/v1/products/${item.productId}`,
            { method: "GET", headers },
          );
          if (prodRes.ok) {
            const prodData = await prodRes.json();
            wixProduct = prodData.product;
            console.log("Wix Product Loaded:", wixProduct?.name);
            console.log("Product manageVariants:", wixProduct?.manageVariants);
            console.log(
              "Product Options:",
              JSON.stringify(wixProduct?.productOptions),
            );
          }
        } catch (err) {
          console.warn("Failed to fetch Wix product:", err.message);
        }

        const choices = {};

        if (wixProduct?.productOptions) {
          for (const [optName, optValue] of Object.entries(itemOptions)) {
            const wixOpt = wixProduct.productOptions.find(
              (o) => o.name?.toLowerCase() === optName.toLowerCase(),
            );

            if (wixOpt && wixOpt.choices) {
              const match = wixOpt.choices.find(
                (c) =>
                  c.description?.toLowerCase() ===
                    String(optValue).toLowerCase() ||
                  c.value?.toLowerCase() === String(optValue).toLowerCase(),
              );

              if (match) {
                choices[wixOpt.name] = match.description;
                console.log(
                  `Resolved option "${optName}": "${optValue}" → "${match.description}"`,
                );
              } else {
                choices[wixOpt.name] = String(optValue);
                console.warn(
                  `No exact match for option "${optName}": "${optValue}", using as-is`,
                );
              }
            } else {
              choices[optName] = String(optValue);
            }
          }
        } else {
          for (const [k, v] of Object.entries(itemOptions)) {
            choices[k] = String(v);
          }
        }

        console.log("Resolved Choices==>", choices);

        if (wixProduct?.manageVariants && Object.keys(choices).length > 0) {
          try {
            const variantRes = await fetch(
              `https://www.wixapis.com/stores/v1/products/${item.productId}/variants/query`,
              {
                method: "POST",
                headers,
                body: JSON.stringify({
                  choices,
                  includeMerchantSpecificData: false,
                }),
              },
            );

            if (variantRes.ok) {
              const variantData = await variantRes.json();
              const variants = variantData.variants || [];
              console.log(
                "Variant query returned:",
                variants.length,
                "variants",
              );

              if (variants.length > 0) {
                const variantId = variants[0].id || variants[0]._id;
                console.log("Using variantId:", variantId);

                lineItem.catalogReference.options = {
                  variantId: variantId,
                };
              } else {
                console.warn("No variant found for choices:", choices);

                lineItem.catalogReference.options = {
                  options: choices,
                };
              }
            } else {
              const variantError = await variantRes.text();
              console.warn(
                "Variant query failed:",
                variantRes.status,
                variantError,
              );

              lineItem.catalogReference.options = {
                options: choices,
              };
            }
          } catch (err) {
            console.warn("Variant query error:", err.message);
            lineItem.catalogReference.options = {
              options: choices,
            };
          }
        } else if (Object.keys(choices).length > 0) {
          lineItem.catalogReference.options = {
            options: choices,
          };
        }
      }

      resolvedLineItems.push(lineItem);
    }
    // === WAIVER PDF HANDLING ===

    let customFields = [];
    console.log("Waiver PDF URL==>", waiverPdfUrl);
    if (waiverPdfUrl) {
      customFields = [
        {
          title: "Waiver PDF",
          value: waiverPdfUrl,
        },
      ];
    }

    const checkoutPayload = {
      lineItems: resolvedLineItems,
      channelType: "WEB",
    };

    // Use env variable for redirects
    const origin = "https://www.snhgolfcarts.com";

    // Add thank you page URL to the checkout itself for better support in some flows
    checkoutPayload.thankyouPageUrl = `${origin}/order-confirmation`;

    console.log(
      "Wix API Request Body==>",
      JSON.stringify(checkoutPayload, null, 2),
    );

    const checkoutResponse = await fetch(
      "https://www.wixapis.com/ecom/v1/checkouts",
      {
        method: "POST",
        headers,
        body: JSON.stringify(checkoutPayload),
      },
    );

    const checkoutData = await checkoutResponse.json();

    console.log("Checkout Response Status==>", checkoutResponse.status);
    console.log("CheckoutResult==>", checkoutData);

    if (!checkoutResponse.ok) {
      console.error(
        "Wix Checkout Error:",
        JSON.stringify(checkoutData, null, 2),
      );
      return NextResponse.json(
        {
          error: checkoutData.message || "Failed to create checkout",
          details: checkoutData,
        },
        { status: checkoutResponse.status },
      );
    }

    const checkoutId = checkoutData.checkout?.id;
    const returnedLineItems = checkoutData.checkout?.lineItems || [];

    console.log("Checkout ID==>", checkoutId);
    console.log("Returned lineItems count==>", returnedLineItems.length);
    console.log(
      "Checkout total==>",
      checkoutData.checkout?.priceSummary?.total?.formattedAmount,
    );

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID not returned by Wix" },
        { status: 500 },
      );
    }

    // === UPDATE CHECKOUT WITH WAIVER DATA ===
    if (waiverPdfUrl) {
      try {
        console.log("Updating checkout with Waiver PDF...");
        const updateRes = await fetch(
          `https://www.wixapis.com/ecom/v1/checkouts/${checkoutId}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              checkout: {
                customFields: customFields,
              },
            }),
          },
        );
        if (!updateRes.ok) {
          const updateData = await updateRes.text();
          console.error("Wix Update Checkout Error:", updateData);
        } else {
          console.log("Successfully updated checkout with custom fields");
        }
      } catch (err) {
        console.error("Failed to update checkout with waiver:", err);
      }
    }

    if (returnedLineItems.length === 0) {
      console.warn(
        "⚠️ WARNING: Wix returned empty lineItems. Possible causes:",
      );
      console.warn("  1. The variant options don't match any valid variant");
      console.warn("  2. The product is out of stock in Wix");
      console.warn("  3. The catalogItemId doesn't match a real product");
      console.warn("  4. The product is hidden or not published");
    }

    const { wixClient } = await import("@/lib/wixClient");

    try {
      const redirectSession = await wixClient.redirects.createRedirectSession({
        ecomCheckout: { checkoutId },
        callbacks: {
          postFlowUrl: `${origin}/order-confirmation`,
          thankYouPageUrl: `${origin}/order-confirmation`,
        },
      });

      const checkoutUrl = redirectSession.redirectSession?.fullUrl;
      console.log("Wix Hosted Checkout URL==>", checkoutUrl);

      if (checkoutUrl) {
        return NextResponse.json({
          success: true,
          checkoutUrl,
          checkoutId,
        });
      }

      console.error(
        "No fullUrl in redirect session:",
        JSON.stringify(redirectSession),
      );
      return NextResponse.json(
        { error: "Failed to get Wix checkout URL" },
        { status: 500 },
      );
    } catch (redirectErr) {
      console.error(
        "Redirect Session SDK Error:",
        redirectErr.message || redirectErr,
      );

      const thankYouUrl = `${origin}/order-confirmation`;

      // Fallback 1: Try REST API redirect session
      try {
        const redirectRes = await fetch(
          "https://www.wixapis.com/redirects-api/v1/redirect-session",
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              ecomCheckout: { checkoutId },
              callbacks: {
                postFlowUrl: thankYouUrl,
                thankYouPageUrl: thankYouUrl,
              },
            }),
          },
        );

        if (redirectRes.ok) {
          const redirectData = await redirectRes.json();
          const fullUrl = redirectData.redirectSession?.fullUrl;
          console.log("Fallback REST redirect URL==>", fullUrl);
          if (fullUrl) {
            return NextResponse.json({
              success: true,
              checkoutUrl: fullUrl,
              checkoutId,
            });
          }
        }
      } catch (restRedirectErr) {
        console.error("REST redirect session failed:", restRedirectErr.message);
      }

      // Fallback 2: Use checkout-url endpoint (Wix's own hosted page)
      const urlResponse = await fetch(
        `https://www.wixapis.com/ecom/v1/checkouts/${checkoutId}/checkout-url`,
        { method: "GET", headers },
      );
      if (urlResponse.ok) {
        const urlData = await urlResponse.json();
        console.log("Fallback checkout URL==>", urlData.checkoutUrl);
        return NextResponse.json({
          success: true,
          checkoutUrl: urlData.checkoutUrl,
          checkoutId,
        });
      }

      return NextResponse.json(
        { error: redirectErr.message || "Failed to create redirect session" },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("Checkout API Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
