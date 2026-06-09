import { cache } from "react";
import { extractBlogDetails } from "@/lib/utils";

// Fetch a single blog post by slug using the Wix REST API with the full
// set of fieldsets — RICH_CONTENT is critical, the SDK's queryPosts()
// list query does NOT return it.
//
// React's `cache` dedupes within one render pass — both the layout's
// `generateMetadata` and the page's body call hit Wix only once.
// `next: { revalidate }` adds Next.js data-cache so repeat renders across
// requests reuse the same response for an hour.
export const getPost = cache(async (slug) => {
  const apiKey = process.env.WIX_API_KEY;
  const siteId = process.env.WIX_SITE_ID;
  if (!apiKey || !siteId || !slug) return null;

  const headers = {
    Authorization: apiKey,
    "wix-site-id": siteId,
    "Content-Type": "application/json",
  };

  const fieldsets = ["RICH_CONTENT", "URL", "METRICS", "CONTENT_TEXT", "SEO"];
  const qp = new URLSearchParams();
  fieldsets.forEach((f) => qp.append("fieldsets", f));
  const apiUrl = `https://www.wixapis.com/blog/v3/posts/slugs/${encodeURIComponent(slug)}?${qp.toString()}`;

  try {
    const res = await fetch(apiUrl, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      if (res.status !== 404) {
        const errText = await res.text().catch(() => "");
        console.error("getPost: Wix API non-OK response:", res.status, errText);
      }
      return null;
    }
    const data = await res.json();
    if (!data?.post) return null;

    const p = data.post;

    // If RICH_CONTENT fieldset didn't include richContent on the published
    // post, fall back to the draft post — same recovery the original
    // /api/blogs/[id] route uses.
    let richContent = p.richContent;
    if (!richContent && p.id) {
      try {
        const draftRes = await fetch(
          `https://www.wixapis.com/blog/v3/draft-posts/${p.id}?fieldsets=RICH_CONTENT`,
          { headers, next: { revalidate: 3600 } },
        );
        if (draftRes.ok) {
          const draftData = await draftRes.json();
          richContent = draftData?.draftPost?.richContent;
        }
      } catch (e) {
        console.warn("getPost: failed to fetch draft rich content:", e);
      }
    }

    // Resolve author display name via Wix Members API.
    let authorName = "SNH Admin";
    const authorId =
      p.memberId || p.ownerId || p.mostRecentContributorId || null;
    if (authorId) {
      try {
        const memberRes = await fetch(
          `https://www.wixapis.com/members/v1/members/${authorId}`,
          {
            headers: { Authorization: apiKey, "wix-site-id": siteId },
            next: { revalidate: 3600 },
          },
        );
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          const name =
            memberData?.member?.profile?.nickname ||
            memberData?.member?.profile?.name;
          if (name) authorName = name;
        }
      } catch (e) {
        console.error("getPost: error resolving author:", e);
      }
    }

    // Pull Wix-managed SEO overrides (set per-post in the Wix CMS under
    // SEO Basics). These are the values the user *intends* Google to show
    // and they take precedence over anything we'd build from title/excerpt.
    const seoTags = Array.isArray(p.seoData?.tags) ? p.seoData.tags : [];
    const seoTitle =
      seoTags.find((t) => t?.type === "title")?.children?.trim() || "";
    const seoDescription =
      seoTags
        .find(
          (t) =>
            t?.type === "meta" &&
            (t?.props?.name === "description" ||
              t?.props?.name === "og:description"),
        )
        ?.props?.content?.trim() || "";
    const seoOgImage =
      seoTags.find(
        (t) => t?.type === "meta" && t?.props?.name === "og:image",
      )?.props?.content || "";
    const seoCanonical =
      seoTags.find((t) => t?.type === "link" && t?.props?.rel === "canonical")
        ?.props?.href || "";

    // Shape the raw post so extractBlogDetails can normalize it — same
    // contract the original page used when it received this data from the
    // /api/blogs/[slug] endpoint.
    const raw = {
      _id: p.id,
      id: p.id,
      slug: p.slug,
      title: p.title || "Untitled",
      excerpt:
        p.customExcerpt ||
        p.excerpt ||
        (p.contentText
          ? p.contentText.slice(0, 200).trim() + "..."
          : ""),
      content: p.contentText || "",
      contentText: p.contentText || "",
      richContent: richContent || p.richContent || null,
      coverImage:
        p.media?.wixMedia?.image?.url || p.cover?.url || null,
      firstPublishedDate: p.firstPublishedDate,
      lastPublishedDate: p.lastPublishedDate,
      lastUpdatedDate: p.lastPublishedDate || p.firstPublishedDate,
      _createdDate: p.firstPublishedDate,
      minutesToRead: p.minutesToRead || 5,
      featured: p.featured || false,
      authorName,
    };

    const blog = extractBlogDetails(raw);
    return {
      ...blog,
      seoTitle,
      seoDescription,
      seoOgImage,
      seoCanonical,
    };
  } catch (err) {
    console.error("getPost: error fetching blog post:", err);
    return null;
  }
});
