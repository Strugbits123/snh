import { cache } from "react";
import { wixClient } from "@/lib/wixClient";
import { extractBlogDetails } from "@/lib/utils";

const getPost = cache(async (slug) => {
  try {
    const res = await wixClient.posts.queryPosts().limit(50).find();
    const rawPosts = res._items || res.items || [];
    const rawPost = rawPosts.find((p) => p.slug === slug);
    if (rawPost) {
      return extractBlogDetails(rawPost);
    }
  } catch (err) {
    console.error("Error fetching blog post:", err);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getPost(slug);
  if (blog) {
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
  return {
    title: "Blog Article | SNH Golf Carts LLC",
    alternates: {
      canonical: `/blogs/${slug}`,
    },
  };
}

export default async function BlogLayout({ children, params }) {
  const { slug } = await params;
  const blog = await getPost(slug);

  if (!blog) {
    return <>{children}</>;
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.snhgolfcarts.com/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.snhgolfcarts.com/blogs",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": `https://www.snhgolfcarts.com/blogs/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
