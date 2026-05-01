"use client";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../SectionHeading";

const REVIEWS = [
  {
    name: "Brian Wesley",
    avatar: "BW",
    rating: 5,
    time: "7 months ago",
    text: "We recently purchased a back seat kit for our golf cart. Not only was the pricing better than their competitors the service that Matt provided was outstanding. He is knowledgeable, professional and a gentleman. I highly recommend doing business at this Veteran owned company!",
  },
  {
    name: "Cassandra Lloyd",
    avatar: "CL",
    rating: 5,
    time: "11 months ago",
    text: "We had such an amazing experience purchasing our Maverick this past weekend. Any questions we had were answered immediately - if there was something that we needed they were quick to offer to help in any and every way. Highly recommend to start here if you're looking into golf carts.",
  },
  {
    name: "Scott Armstrong",
    avatar: "SA",
    rating: 5,
    time: "a week ago",
    text: "Great place to buy a golf cart, Bill and his team were amazing to deal with and I got exactly the cart I wanted at a really nice value. Thank you SNH Golf Carts LLC!",
  },
  {
    name: "Judy L",
    avatar: "JL",
    rating: 5,
    time: "a week ago",
    text: "Bill and Matt are awesome to work with. Our battery on our Evolution was dead and the team were able to restore it so we could charge our golf cart. Very happy with both of them and the service. Bill came in on Sunday to help us out. Highly recommend them.",
  },
];

export default function GoogleReviews() {
  return (
    <section className="py-24 md:py-32 bg-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <SectionHeading
            label="Happy Customers"
            title={
              <span className="text-white">
                What Our <span className="text-accent">Customers Say</span>
              </span>
            }
            description="Real reviews from real people in the Londonderry area and beyond."
            center={false}
            light
          />
          <a
            href="https://www.google.com/maps/search/SNH+Golf+Carts"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-5 py-4 transition-colors group"
          >
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white font-bold text-sm">4.8 / 5</p>
              <p className="text-white/40 text-xs">Based on 22 Google reviews</p>
            </div>
            <div className="ml-2 text-white/30 group-hover:text-accent transition-colors text-xs font-medium">
              View All →
            </div>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col"
            >
              <Quote className="w-6 h-6 text-accent/60 mb-4" />
              <p className="text-white/70 text-sm leading-relaxed flex-1 mb-6">
                "{review.text}"
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs shrink-0">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{review.name}</p>
                    <p className="text-white/30 text-xs">{review.time}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}