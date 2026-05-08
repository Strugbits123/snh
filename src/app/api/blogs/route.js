import { NextResponse } from 'next/server';
import { wixClient } from '@/lib/wixClient';

export async function GET() {
  try {
    const res = await wixClient.posts.queryPosts().limit(50).find();
    const rawPosts = res._items || res.items || [];

    // Collect unique member IDs from various possible fields
    const memberIds = [...new Set(rawPosts.map(p => p.memberId || p.ownerId || p.mostRecentContributorId).filter(Boolean))];
    console.log("Found member IDs:", memberIds);

    // Fetch member details
    let memberMap = {};
    if (memberIds.length > 0) {
      try {
        const memberRes = await fetch("https://www.wixapis.com/members/v1/members/query", {
          method: "POST",
          headers: {
            "Authorization": process.env.WIX_API_KEY,
            "wix-site-id": process.env.WIX_SITE_ID,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: {
              filter: { "id": { "$in": memberIds } }
            }
          })
        });

        if (memberRes.ok) {
          const memberData = await memberRes.json();
          console.log(`Fetched ${memberData.members?.length || 0} members`);
          (memberData.members || []).forEach(m => {
            const name = m.profile?.nickname || m.profile?.name || m.contactId;
            if (name) memberMap[m.id] = name;
          });
        } else {
          const errorText = await memberRes.text();
          console.error("Member query failed:", errorText);
        }
      } catch (e) {
        console.error("Error fetching members:", e);
      }
    }

    // Attach author names
    const postsWithAuthors = rawPosts.map(p => {
      const id = p.memberId || p.ownerId || p.mostRecentContributorId;
      const authorName = memberMap[id] || "SNH Admin";
      return { ...p, authorName };
    });

    return NextResponse.json({ 
      items: postsWithAuthors,
      _items: postsWithAuthors,
      length: postsWithAuthors.length,
      totalCount: res.totalCount,
      hasNext: res.hasNext?.(),
      hasPrev: res.hasPrev?.()
    });
  } catch (err) {
    console.error("Wix blogs error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
