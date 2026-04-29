"use client";
import { useState, useEffect, useCallback } from "react";
import { wixClient } from "@/lib/wixClient";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import BlogCard from "@/components/blog/BlogCard";
import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const fetchPosts = useCallback((q = "") => {
    setLoading(true);
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((res) => {
        let all = res._items || res.items || res.data?.posts || [];
        if (q) {
          const lowerQ = q.toLowerCase();
          all = all.filter((post) =>
            post.title?.toLowerCase().includes(lowerQ),
          );
        }
        setPosts(all);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPosts(debouncedSearch);
  }, [debouncedSearch, fetchPosts]);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Knowledge & Insights"
          title="Our Blog"
          description="Tips, guides, and news about electric golf carts, street-legal LSVs, and everything in between."
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative max-w-md mx-auto mb-12"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-11 pr-10 h-12 rounded-full border-border bg-card"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {loading ?
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        : posts.length === 0 ?
          <div className="text-center py-32 text-muted-foreground">
            {search ?
              `No articles found for "${search}".`
            : "No blog posts yet."}
          </div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <BlogCard key={post._id} post={post} index={i} />
            ))}
          </div>
        }
      </div>
    </div>
  );
}
