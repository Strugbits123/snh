import { getPost } from "@/lib/wixBlog";
import { metaDescription, metaTitle } from "@/lib/utils";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getPost(slug);
  if (blog) {
    // Wix-managed SEO (set per-post in the Wix CMS) wins; fall back to
    // safely-truncated derivations only when the editor hasn't filled them in.
    const title =
      blog.seoTitle || metaTitle(blog.title);
    const description =
      blog.seoDescription ||
      metaDescription(blog.excerpt) ||
      metaDescription(blog.content) ||
      "Read the latest from SNH Golf Carts LLC — guides, news, and maintenance tips for electric golf carts and LSVs in Southern NH.";
    const ogImage = blog.seoOgImage || blog.coverImage || null;
    const canonical = blog.seoCanonical || `/blogs/${slug}`;
    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        type: "article",
        url: `https://www.snhgolfcarts.com/blogs/${slug}`,
        images: ogImage ? [{ url: ogImage }] : undefined,
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://www.snhgolfcarts.com/blogs/${slug}#article`,
    "headline": blog.title,
    "description":
      blog.seoDescription ||
      metaDescription(blog.excerpt) ||
      metaDescription(blog.content) ||
      "",
    "image": blog.seoOgImage || blog.coverImage || undefined,
    "datePublished": blog.publishDate || undefined,
    "dateModified": blog.publishDate || undefined,
    "author": {
      "@type": "Person",
      "name": blog.author || "SNH Admin",
    },
    "publisher": {
      "@type": "Organization",
      "name": "SNH Golf Carts LLC",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.snhgolfcarts.com/Logo-png-b.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.snhgolfcarts.com/blogs/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
