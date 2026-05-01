"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { wixProxy } from "@/lib/wixProxy";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { extractBlogDetails, cn } from "@/lib/utils";
import RichContentRenderer from "@/components/blog/RichContentRenderer";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    // Use the dedicated detail endpoint which handles full content fetching
    fetch(`/api/blogs/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        // The API returns the post object directly or inside a post wrapper
        const fullPost = res.post || res.data?.post || res;

        if (fullPost && (fullPost.title || fullPost._id)) {
          setPost(extractBlogDetails(fullPost));
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Blog fetch error:", err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Update document title for SEO
  useEffect(() => {
    if (post) {
      document.title = post.seoTitle || post.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc)
        metaDesc.setAttribute("content", post.seoDescription || post.excerpt);
    }
    return () => {
      document.title = "SNH Golf Carts LLC";
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <p className="text-muted-foreground text-lg">Article not found.</p>
        <Link href="/blogs">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate =
    post.publishDate ?
      format(new Date(post.publishDate), "MMMM d, yyyy")
    : null;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            )}
            {post.minutesToRead && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.minutesToRead} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl leading-tight text-foreground mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-accent/40 pl-5 italic">
              {post.excerpt}
            </p>
          )}

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative rounded-3xl overflow-hidden aspect-[16/7] bg-muted mb-10">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content — rich content preferred, plain text as fallback */}
          {post.richContent ?
            <RichContentRenderer richContent={post.richContent} />
          : <div className="space-y-5">
              {(post.contentText || "")
                .split(/\n{2,}/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p
                    key={i}
                    className="text-base md:text-lg text-muted-foreground leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
            </div>
          }
        </motion.article>

        {/* Footer CTA */}
        <div className="mt-16 pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">Enjoyed this article?</p>
          <div className="flex gap-3">
            <Link href="/blogs">
              <Button variant="outline" className="rounded-full">
                More Articles
              </Button>
            </Link>
            <Link href="/shop">
              <Button className="rounded-full bg-accent hover:bg-accent/90 text-white">
                Shop Golf Carts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
