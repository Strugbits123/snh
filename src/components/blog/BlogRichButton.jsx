"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

// A BUTTON node from a Wix blog post's rich content. The href/target/rel have
// already been resolved on the server by RichContentRenderer; this wrapper
// exists so the click can be tracked and so internal links can navigate
// client-side instead of reloading the page.
export default function BlogRichButton({
  text,
  href,
  internal,
  target,
  rel,
  postSlug,
}) {
  // tel: and mailto: already have dedicated events from the delegated listener
  // in <Analytics />; firing cta_click too would double-count the same action.
  const isContactLink =
    !!href && (href.startsWith("tel:") || href.startsWith("mailto:"));

  const handleClick = () => {
    if (isContactLink) return;
    trackEvent("cta_click", {
      cta_location: "blog_body",
      cta_label: text,
      cta_destination: href,
      post_slug: postSlug,
    });
  };

  const className =
    "rounded-full bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base";

  // No URL set in Wix yet: render the button so the author can see it in the
  // article, but there's nowhere to send anyone, so it isn't a link and nothing
  // is tracked.
  if (!href) {
    return (
      <Button type="button" className={className}>
        {text}
      </Button>
    );
  }

  // next/link only helps for in-app routes; anything else stays a plain anchor.
  if (internal) {
    return (
      <Button asChild className={className}>
        <Link href={href} onClick={handleClick}>
          {text}
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <a href={href} target={target} rel={rel} onClick={handleClick}>
        {text}
      </a>
    </Button>
  );
}
