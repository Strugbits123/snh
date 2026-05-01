import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { wixClient } from "@/lib/wixClient";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Fetch products to give context to the AI
    const productRes = await wixClient.products
      .queryProducts()
      .limit(50)
      .find();
    const products = (productRes._items || []).map((p) => ({
      id: p._id,
      name: p.name,
      price:
        p.priceData?.formatted?.price || p.priceData?.price || "Call for price",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${p._id}`,
      description: p.description?.replace(/<[^>]*>?/gm, "").substring(0, 100),
    }));

    const systemPrompt = `You are the SNH Golf Carts LLC AI assistant. 
Your goal is to help customers find the perfect golf cart.
Be friendly, professional, and concise.

Available Products:
${JSON.stringify(products, null, 2)}

If the user is looking for a specific cart, recommend one from the list above.
ALWAYS include a JSON array of recommended products at the end of your message in this format:
PRODUCTS_JSON:[{"id": "...", "name": "...", "price": "...", "url": "..."}]

If no products are relevant, still explain why but keep the conversation helpful.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === "bot" ? "assistant" : m.role,
        content: m.content || m.text,
      })),
    });

    return NextResponse.json({
      reply: response.content[0].text,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
