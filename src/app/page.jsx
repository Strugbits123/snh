import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesOverview from "@/components/home/ServicesOverview";
import WhyChooseUs from "@/components/home/WhyChooseUs";

import GoogleReviews from "@/components/home/GoogleReviews";

import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <ServicesOverview />
      <WhyChooseUs />

      <GoogleReviews />
      <CTASection />
    </div>
  );
}