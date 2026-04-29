"use client";
import Link from "next/link";

import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { extractBlogDetails } from "@/lib/utils";

export default function BlogCard({ post: rawPost, index = 0 }) {
  const post = extractBlogDetails(rawPost);
  
  const formattedDate = post.publishDate
    ? format(new Date(post.publishDate), "MMM d, yyyy")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link href={`/blogs/${post.slug}`}
        className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5 h-full flex flex-col"
      >
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted shrink-0">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="text-4xl opacity-20">📝</span>
            </div>
          )}
          {post.featured && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-accent text-white border-0 text-xs">Featured</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}
            {post.minutesToRead && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.minutesToRead} min read
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-3">
            {post.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-5">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all mt-auto pt-4 border-t border-border">
            Read More <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}