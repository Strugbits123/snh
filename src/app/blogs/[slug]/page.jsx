import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { getPost } from "@/lib/wixBlog";
import RichContentRenderer from "@/components/blog/RichContentRenderer";

// Revalidate every hour so edited posts pick up; ISR keeps the HTML cached
// at the edge so Googlebot gets fully-rendered content on first byte.
export const revalidate = 3600;

export default async function BlogDetail({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  // Trigger a real 404 (not a soft 404). Next.js renders the closest
  // not-found boundary AND sends an HTTP 404 status — which is what
  // Search Console wants to see for missing posts.
  if (!post) {
    notFound();
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

        <article>
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
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl leading-tight text-foreground mb-6">
            {post.title}
          </h1>

          {post.coverImage && (
            <div className="relative rounded-3xl overflow-hidden bg-muted mb-10 flex justify-center">
              <img
                src={post.coverImage}
                alt={post.title}
                className="max-w-full h-auto max-h-[500px] object-contain"
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
        </article>

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
