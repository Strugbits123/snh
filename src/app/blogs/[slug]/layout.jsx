import { wixClient } from "@/lib/wixClient";
import { extractBlogDetails } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await wixClient.posts.queryPosts().limit(50).find();
    const rawPosts = res._items || res.items || [];
    const rawPost = rawPosts.find((p) => p.slug === slug);
    if (rawPost) {
      const blog = extractBlogDetails(rawPost);
      const title = `${blog.title} | SNH Golf Carts LLC`;
      const description = blog.excerpt || "SNH Golf Carts Blog";
      return {
        title,
        description,
        alternates: {
          canonical: `/blogs/${slug}`,
        },
      };
    }
  } catch (err) {
    console.error("Error generating blog metadata:", err);
  }
  return {
    title: "Blog Article | SNH Golf Carts LLC",
    alternates: {
      canonical: `/blogs/${slug}`,
    },
  };
}

export default function BlogLayout({ children }) {
  return <>{children}</>;
}
