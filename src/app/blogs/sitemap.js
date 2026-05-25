import { wixClient } from "@/lib/wixClient";

// Revalidate every hour so new/edited blog posts show up in the sitemap promptly.
export const revalidate = 3600;

export default async function sitemap() {
  const baseUrl = "https://www.snhgolfcarts.com";

  let posts = [];
  try {
    const res = await wixClient.posts.queryPosts().limit(100).find();
    posts = res._items || res.items || [];
  } catch (err) {
    console.error("Blogs sitemap: error fetching posts from Wix:", err);
  }

  return posts
    .filter((b) => b.slug)
    .map((b) => ({
      url: `${baseUrl}/blogs/${b.slug}`,
      lastModified: b.lastUpdatedDate ? new Date(b.lastUpdatedDate) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
}
