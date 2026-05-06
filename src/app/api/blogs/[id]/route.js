import { NextResponse } from "next/server";

const API_KEY = process.env.WIX_API_KEY;
const SITE_ID = process.env.WIX_SITE_ID;

export async function GET(request, { params }) {
  try {
    const { id: slugParam } = await params;
    const slug = decodeURIComponent(slugParam || "");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (!API_KEY || !SITE_ID) {
      return NextResponse.json(
        { error: "Wix API credentials missing" },
        { status: 500 },
      );
    }

    const headers = {
      Authorization: API_KEY,
      "wix-site-id": SITE_ID,
      "Content-Type": "application/json",
    };

    const fieldsets = ["RICH_CONTENT", "URL", "METRICS", "CONTENT_TEXT", "SEO"];
    const queryParams = new URLSearchParams();
    fieldsets.forEach((f) => queryParams.append("fieldsets", f));

    const apiUrl = `https://www.wixapis.com/blog/v3/posts/slugs/${encodeURIComponent(slug)}?${queryParams.toString()}`;

    const res = await fetch(apiUrl, { headers });

    const data = await res.json();

    if (!res.ok || !data.post) {
      console.error("Wix API error:", data);
      return NextResponse.json(
        { error: data.message || "Post not found" },
        { status: res.status || 404 },
      );
    }

    const p = data.post;

    let richContent = p.richContent;
    if (!richContent) {
      try {
        const richRes = await fetch(
          `https://www.wixapis.com/blog/v3/draft-posts/${p.id}?fieldsets=RICH_CONTENT`,
          { headers },
        );
        if (richRes.ok) {
          const richData = await richRes.json();
          richContent = richData.draftPost?.richContent;
        }
      } catch (e) {
        console.warn("Failed to fetch rich content from draft:", e);
      }
    }

    const post = {
      id: p.id,
      slug: p.slug,
      title: p.title || "Untitled",
      excerpt:
        p.customExcerpt ||
        p.excerpt ||
        (p.contentText ? p.contentText.slice(0, 200).trim() + "..." : ""),
      contentText: p.contentText || "",
      richContent: richContent || p.richContent,
      coverImage: p.media?.wixMedia?.image?.url || p.cover?.url || null,
      publishDate: p.firstPublishedDate || p.lastPublishedDate || null,
      minutesToRead: p.minutesToRead || null,
      featured: p.featured || false,
      url: p.url?.path || null,
      seoTitle:
        p.seoData?.tags?.find((t) => t.type === "title")?.children || p.title,
      seoDescription:
        p.seoData?.tags?.find(
          (t) => t.type === "meta" && t.props?.name === "description",
        )?.props?.content ||
        p.excerpt ||
        "",
      metrics: p.metrics || {},
    };

    return NextResponse.json({ post });
  } catch (err) {
    console.error("Blog API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
