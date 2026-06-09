import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Article Not Found | SNH Golf Carts LLC",
  robots: { index: false, follow: true },
};

export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4 px-4 text-center">
      <h1 className="font-display font-bold text-3xl sm:text-4xl">
        Article Not Found
      </h1>
      <p className="text-muted-foreground text-base max-w-md">
        The article you&apos;re looking for doesn&apos;t exist or has been
        removed. Browse our latest posts below.
      </p>
      <Link href="/blogs">
        <Button variant="outline" className="rounded-full mt-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Button>
      </Link>
    </div>
  );
}
