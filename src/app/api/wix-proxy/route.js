import { NextResponse } from 'next/server';
import { wixClient } from '@/lib/wixClient';

export async function POST(req) {
  try {
    const { module, method, args } = await req.json();
    
    // Safety check: only allow specific modules
    if (!['products', 'posts'].includes(module)) {
      throw new Error("Module not allowed");
    }

    let result;
    if (module === 'products') {
      if (method === 'get') {
        result = await wixClient.products.getProduct(args[0]);
      } else if (method === 'query') {
        let query = wixClient.products.queryProducts();
        if (args[0]?.filters) {
          Object.entries(args[0].filters).forEach(([key, val]) => {
            query = query.eq(key, val);
          });
        }
        result = await query.find();
      }
    } else if (module === 'posts') {
      if (method === 'get') {
        result = await wixClient.posts.getPost(args[0]);
      } else if (method === 'query') {
        result = await wixClient.posts.queryPosts().find();
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Wix proxy error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
