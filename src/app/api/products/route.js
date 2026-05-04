import { NextResponse } from 'next/server';
import { wixClient } from '@/lib/wixClient';

export async function GET() {
  try {
    const [productsRes, collectionsRes] = await Promise.all([
      wixClient.products.queryProducts().limit(100).find(),
      wixClient.collections.queryCollections().limit(100).find()
    ]);

    return NextResponse.json({
      products: productsRes.items,
      collections: collectionsRes.items
    });
  } catch (err) {
    console.error("Wix products error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
