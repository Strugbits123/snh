import { NextResponse } from 'next/server';
import { wixClient } from '@/lib/wixClient';

export async function GET() {
  try {
    const res = await wixClient.posts.queryPosts().limit(50).find();
    return NextResponse.json(res);
  } catch (err) {
    console.error("Wix blogs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
