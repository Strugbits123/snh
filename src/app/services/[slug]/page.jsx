"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import CTASection from "@/components/CTASection";
import WaiverModal from "@/components/WaiverModal";
import { wixProxy } from "@/lib/wixProxy";
import { extractProductDetails } from "@/lib/utils";

const HERO_IMAGE = "/images/services/golf-card-services.webp";

const CHECKLIST_COLUMNS = [
  ["Tune-ups", "Battery testing and replacement"],
  ["Accessory installation", "Oil and filter change"],
  ["Winterization", "Steering alignment"],
  ["Annual Inspections", "Tire repair, and more"],
];

const ZIGZAG_IMAGE_POOL = [
  "/images/services/repair.jpg",
  "/images/services/winterization.jpg",
  "/images/services/upgrades.png",
];

const HERO_CONTENT = {
  repair: {
    heading: "Repair & Maintenance",
    paragraph:
      "Every golf cart that leaves our facility gets assessed, serviced, and verified against a defined technical standard and gets restored to the performance specification it was built to meet.",
    ctaLabel: "Schedule a Repair or Maintenance Service",
  },
  winterization: {
    heading: "Winterization",
    paragraph:
      "A New Hampshire winter puts measurable stress on every system in an electric golf cart. Our winterization service prepares each vehicle for the off-season with a protocol built specifically for this climate; protecting battery capacity, electrical integrity, and mechanical condition so the cart comes out of storage performing to the same standard it went in.",
    ctaLabel: "Book Your Winterization Service",
  },
  upgrades: {
    heading: "Upgrades and Customization",
    paragraph:
      "Every upgrade we install starts with a platform assessment and ends with a documented standard. From lithium conversions to full custom builds, no exceptions.",
    ctaLabel: "Schedule a Service",
  },
};

const INTRO_CONTENT = {
  repair: {
    heading: "Golf Cart Repair and Maintenance in Southern New Hampshire",
    paragraphs: [
      "When your golf cart isn't performing to its potential, you need a service team that can diagnose the problem accurately, fix it properly, and get you back on the road without unnecessary delays. At SNH Golf Carts in Londonderry, NH, we provide hands-on repair and maintenance services for electric golf carts across New Hampshire, including Manchester, Nashua, and surrounding communities.",
      "We work on all major makes and models, and we treat every cart that comes through our doors with the same level of attention, whether it's a single privately owned vehicle or part of a managed fleet.",
    ],
  },
  winterization: {
    heading:
      "Golf Cart Winterization in New Hampshire: Protect Your Investment Before the Cold Sets In",
    paragraphs: [
      "New Hampshire winters are not gentle on vehicles, and golf carts are no exception. Freezing temperatures, moisture, and months of inactivity create conditions that can significantly shorten battery life, damage electrical components, and leave you with a cart that needs expensive repairs come spring. Proper winterization protects against all of that, and it's one of the most cost-effective services a golf cart owner in this region can invest in.",
      "SNH Golf Carts provides professional golf cart winterization services from our Londonderry facility, serving owners across Southern New Hampshire including Manchester, Nashua, and the Lakes Region.",
    ],
  },
  upgrades: {
    heading: "Golf Cart Upgrades and Customization in Southern New Hampshire",
    paragraphs: [
      "With the right upgrades, a golf cart can be more capable, comfortable and practical and considerably more enjoyable to own. Whether you're looking to improve performance, personalize the appearance, or add features, SNH Golf Carts offers professional installation of a wide range of upgrades and modifications at our facility.",
      "We work with customers across Southern New Hampshire who want more from their cart than it delivered from the factory, and we approach every project with the same standard: quality parts, clean installation, and honest guidance on what's worth doing and what isn't.",
    ],
  },
};

const ZIGZAG_CONTENT = {
  repair: {
    items: [
      {
        title: "What Our Golf Cart Repair Service Covers",
        paragraphs: [
          "Electrical issues are among the most frequently misdiagnosed problems in golf cart repair. A symptom that appears mechanical is often electrical in origin, and guessing costs time and money. Our technicians use proper diagnostic equipment to trace every issue to its root cause before any work begins. We document findings, explain scope, and execute repairs against a defined service standard on every job, regardless of cart age, make, or fleet size.",
        ],
        bullets: [
          "Diagnostics and electrical troubleshooting",
          "Battery testing and replacement",
          "Motor and controller repair",
          "Brake adjustment and replacement",
          "Tire inspection and swap",
          "Suspension and steering evaluation",
          "Routine preventative maintenance",
          "Semi-annual service packages",
        ],
      },
      {
        title: "Mobile Service and Local Availability",
        paragraphs: [
          "For customers who cannot transport their cart to our facility, we provide mobile golf cart service across Southern New Hampshire. Our technicians come to your location, assess the cart on-site, and handle repairs that don't require shop equipment at your property without pulling the vehicle from service or adding transport logistics to an already unplanned situation.",
          "Mobile service is particularly practical for fleet operators, campground owners, facility managers, and anyone managing multiple vehicles across a large property. We confirm service area coverage at the time of scheduling.",
        ],
      },
      {
        title: "The SNH Service Standard",
        paragraphs: [
          "Every service recommendation we make is backed by diagnostic data, not assumption. We document what we find, explain the full scope before work begins, and return every vehicle with a complete service record.",
          "Our technicians understand the specific mechanical and electrical demands that New Hampshire terrain and climate place on electric vehicles. The same technical protocol applies to every cart that comes through our facility, regardless of age, model, application, or fleet size. No shortcuts. No guesswork.",
        ],
      },
    ],
  },
  winterization: {
    items: [
      {
        title: "What Our Winterization Service Includes",
        paragraphs: [
          "Our winterization protocol covers every system that New Hampshire's off-season puts at risk. Each cart is assessed before storage, prepared to a chemistry-specific standard, and documented so the spring recommission starts from a verified baseline rather than an unknown one.",
        ],
        bullets: [
          "Battery preparation and protection",
          "Cell-level battery testing",
          "Electrical system inspection",
          "Wiring and connector vulnerability assessment",
          "Brake component inspection",
          "Tire condition and pressure check",
          "Full lubrication of moving parts",
          "Storage environment guidance",
        ],
      },
      {
        title: "Importance of Winterization",
        paragraphs: [
          "An electric golf cart stored improperly through a New Hampshire winter faces measurable, preventable damage. Lead acid batteries left discharged in freezing temperatures can freeze internally, causing permanent cell failure. Lithium systems, while more tolerant of cold, still require a correct shutdown procedure and defined storage charge level.",
          "Beyond the battery, electrical connections corrode in damp storage environments, brake components seize under extended inactivity, and tires develop flat spots under sustained cold load. Proper winterization addresses all of it before the season ends.",
        ],
      },
      {
        title: "Spring Recommission",
        paragraphs: [
          "Our winterization service includes a spring recommission check when you're ready to bring the cart back into operation. We verify battery performance after the storage period, test all major systems against pre-storage baselines, and address anything that shifted over the winter before the cart returns to service.",
          "Every recommission is documented. If a system requires attention, we identify it at this stage rather than leaving it to surface during the first ride of the season.",
        ],
      },
    ],
  },
  upgrades: {
    items: [
      {
        title: "What We Offer in Performance Upgrades",
        paragraphs: [
          "Every performance upgrade we install begins with a compatibility assessment. We confirm what the cart's platform supports, specify the right components for the application, and execute the installation against a documented standard. The result is measurable improvement in the specific performance dimension the upgrade is designed to address.",
        ],
        bullets: [
          "Lithium battery conversion",
          "Speed Controller",
          "Charger upgrade and system matching",
          "Lift kit installation",
          "All-terrain tire fitting",
          "Ground clearance configuration",
        ],
      },
      {
        title: "Comfort and Appearance Upgrades",
        paragraphs: [
          "Appearance and comfort upgrades are installed to the same workmanship standard as performance work. Component selection accounts for New Hampshire's outdoor conditions, including UV exposure, moisture, and temperature variation, so what goes on the cart holds up across seasons rather than requiring replacement within one.",
        ],
        bullets: [
          "Custom seats and upholstery",
          "Weather-resistant material options",
          "LED headlight and brake light upgrades",
          "Underbody and accent lighting",
          "Front and full enclosure kits",
          "Weather-resistant audio system integration",
        ],
      },
      {
        title: "Custom Golf Cart Builds",
        paragraphs: [
          "For clients with specific performance or configuration requirements, we manage the full build process from initial consultation through final commissioning. This includes base platform selection matched to the intended application, performance component specification, appearance and comfort configuration, and full system testing before delivery.",
          "Every decision is made against a defined technical brief rather than available inventory. The result is a vehicle built precisely to the client's operational requirements which gets documented, verified, and ready to perform from day one.",
        ],
      },
    ],
  },
};

const CLOSING_CONTENT = {
  repair: {
    heading: "Schedule Your Service",
    paragraphs: [
      "If your cart needs repair or is due for maintenance, reach out to schedule service. We respond to all inquiries promptly and can usually advise on urgency and estimated scope before you bring the cart in.",
    ],
    ctaLabel: "Schedule a Repair or Maintenance Service",
  },
  winterization: {
    heading: "Schedule Before the First Freeze",
    paragraphs: [
      "The best window for golf cart winterization in New Hampshire is October through mid-November, before temperatures regularly drop below freezing. Waiting too long limits your options and increases the risk of cold weather causing damage before the cart is properly prepared.",
    ],
    ctaLabel: "Book Your Winterization Service",
  },
  upgrades: {
    heading: "Professional Installation on Every Project",
    paragraphs: [
      "Every upgrade we install is done properly. Clean wiring, correct component fitment, and thorough testing after installation. We don't cut corners on execution, and we stand behind the work we do.",
      "If you have an upgrade in mind or want guidance on where to start, reach out to the team at SNH Golf Carts. We're happy to walk through your options and give you an honest read on what makes sense for your cart and your budget.",
    ],
    ctaLabel: "Talk to Our Upgrade Team",
  },
};

export default function ServiceDetail() {
  const { slug } = useParams();
  const hero = HERO_CONTENT[slug] || HERO_CONTENT.repair;
  const intro = INTRO_CONTENT[slug] || INTRO_CONTENT.repair;
  const zigzag = ZIGZAG_CONTENT[slug] || ZIGZAG_CONTENT.repair;
  const closing = CLOSING_CONTENT[slug] || CLOSING_CONTENT.repair;
  const [showWaiver, setShowWaiver] = useState(false);
  const [waiverSubmitting, setWaiverSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.scrollIntoView({ behavior: "smooth" });
            });
          });
        }
      }
    };

    handleScroll();
    window.addEventListener("hashchange", handleScroll);
    return () => window.removeEventListener("hashchange", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((res) => {
        if (res.products) {
          console.log("Products==>", res.products)
           const vehicleData = res.products
             .map((p) => extractProductDetails(p, res.collections || []))
             .filter(
               (p) =>
                 !p.isAccessory &&
                 p.fullName?.toLowerCase() !== "speed upgrade service",
             )
             .map((p) => ({ name: p.fullName, isLSV: p.isLSV }))
             .filter((p) => p.name);

           // Deduplicate by name
           const uniqueVehicles = [];
           const seen = new Set();
           vehicleData.forEach(v => {
             if (!seen.has(v.name)) {
               seen.add(v.name);
               uniqueVehicles.push(v);
             }
           });

           setVehicles(uniqueVehicles.sort((a, b) => a.name.localeCompare(b.name)));
           console.log(uniqueVehicles)
        }
      })
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);

  const handleWaiverSubmit = async (waiverData) => {
    setWaiverSubmitting(true);
    setCheckoutLoading(true);
    try {
      // 1. Upload Waiver
      const waiverRes = await fetch("/api/waiver-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waiverData),
      });
      const waiverResult = await waiverRes.json();
      const waiverPdfUrl =
        waiverResult.pdfUrl || waiverResult.pdfBase64 || "Waiver submitted";

      // 2. Fetch "Speed Upgrade" product
      let speedProduct = null;
      try {
        // Use a filtered query for exact name match (case-sensitive in Wix)
        const productsData = await wixProxy("products", "query", {
          filters: { name: "Speed Upgrade Service" }
        });

        // Handle both 'items' and '_items' to be safe
        speedProduct = (productsData.items || productsData._items)?.[0];

        // Fallback: If exact match fails, try a broader search with a higher limit
        if (!speedProduct) {
          const allProducts = await wixProxy("products", "query", { limit: 100 });
          speedProduct = (allProducts.items || allProducts._items)?.find(
            (p) => p.name?.toLowerCase().includes("speed upgrade service")
          );
        }
      } catch (err) {
        console.warn("Failed to fetch speed product from Wix:", err);
      }

      if (!speedProduct) {
        alert("The 'Speed Upgrade Service' product was not found in Wix. Please ensure it is created as described in the instructions.");
        setCheckoutLoading(false);
        setWaiverSubmitting(false);
        return;
      }

      // 3. Initiate Checkout
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: speedProduct.id || speedProduct._id,
          quantity: 1,
          productName: speedProduct.name,
          productPrice: speedProduct.priceData?.price,
          productImage: speedProduct.media?.mainMedia?.image?.url || "/images/services/upgrades.png",
          waiverPdfUrl: waiverPdfUrl,
          waiverCustomerName: waiverData.fullName,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to start checkout. Please call us at 603-777-7831.");
        setCheckoutLoading(false);
        setWaiverSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please call us at 603-777-7831 to complete your upgrade.");
      setCheckoutLoading(false);
      setWaiverSubmitting(false);
    }
  };

  return (
    <div data-service-slug={slug}>
      <section className="relative flex items-center h-auto min-h-[640px] sm:min-h-[600px] lg:h-[600px] bg-foreground text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.22]">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover object-[center_30%]" />
        </div>
        <div className="relative w-full max-w-[1440px] mx-auto px-[30px] py-16 lg:py-0 lg:pt-[10px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mt-12"
          >
            <h1 className="font-montserrat font-extrabold uppercase text-4xl leading-tight tracking-wide sm:text-5xl lg:text-[60px] lg:leading-[72px] lg:tracking-[1.2px] mb-6">
              {hero.heading}
            </h1>
            <p className="font-montserrat font-normal text-white/80 text-base leading-relaxed lg:text-[20px] lg:leading-[29px] lg:tracking-normal mb-8">
              {hero.paragraph}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto px-6 py-2 rounded-lg bg-[#0DA2E7] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733] hover:bg-[#0DA2E7]/90 transition-colors text-center"
            >
              {hero.ctaLabel}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-[25px]">
          <h2 className="font-montserrat font-bold text-3xl leading-tight lg:text-[36px] lg:leading-[40px] mb-4">
            {intro.heading}
          </h2>
          <div className="pt-[18.75px] space-y-4">
            {intro.paragraphs.map((p) => (
              <p key={p} className="text-muted-foreground text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {false && (
        <section className="bg-[#F5F5F5] py-[60px]">
          <div className="max-w-[1400px] mx-auto px-[25px]">
            <h3 className="font-montserrat font-bold text-2xl sm:text-3xl text-[#0E1110] mb-8">
              Lorem Ipsum is simply:
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
              {CHECKLIST_COLUMNS.map((column, i) => (
                <ul key={i} className="space-y-3">
                  {column.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm sm:text-base text-[#6D7875]">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#6D7875] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-[25px]">
          <div className="space-y-20 sm:space-y-28 lg:space-y-36">
            {zigzag.items.map((item, i) => {
              const isReversed = i % 2 === 0;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-start ${isReversed ? "lg:direction-rtl" : ""}`}
                >
                  <div className={isReversed ? "lg:order-2" : ""}>
                    <h3 className="font-montserrat font-bold text-3xl sm:text-4xl mb-4">
                      {item.title}
                    </h3>
                    {item.paragraphs.map((p) => (
                      <p key={p} className="text-muted-foreground text-lg leading-relaxed mb-4">
                        {p}
                      </p>
                    ))}
                    {item.bullets && (
                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-6">
                        {item.bullets.map((b) => (
                          <div key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col items-start gap-4">
                      {slug === "upgrades" && (
                        <Button
                          onClick={() => setShowWaiver(true)}
                          disabled={checkoutLoading}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-12 w-full sm:w-auto px-4 py-2 bg-[#0DA2E7] hover:bg-[#0DA2E7]/90 text-white shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733]"
                        >
                          {checkoutLoading &&
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          }
                          Speed Controller & Performance Upgrade
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      )}
                      {slug === "upgrades" ? (
                        <Link href="/contact" className="w-full sm:w-auto">
                          <Button
                            variant="outline"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors h-12 w-full sm:w-auto px-4 py-2 border-[#0DA2E7]/30 text-[#0DA2E7] hover:bg-[#0DA2E7] hover:text-white hover:border-[#0DA2E7]"
                          >
                            Plan Your Upgrade
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Link
                          href="/contact"
                          className="inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0DA2E7] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733] hover:bg-[#0DA2E7]/90 transition-colors"
                        >
                          Schedule a Service
                        </Link>
                      )}
                    </div>
                  </div>

                  <div
                    className={`relative group ${isReversed ? "lg:order-1" : ""}`}
                  >
                    <div className="absolute -inset-4 bg-accent/5 rounded-[2.5rem] transform rotate-2 transition-transform group-hover:rotate-1" />
                    <div className="relative rounded-3xl aspect-[4/3] overflow-hidden bg-muted shadow-2xl">
                      <img
                        src={ZIGZAG_IMAGE_POOL[i % ZIGZAG_IMAGE_POOL.length]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-[25px]">
          <div className="grid lg:grid-cols-12 gap-6 items-start ">
            <div className="col-span-5">
              <h2 className="font-montserrat font-bold uppercase text-2xl sm:text-4xl mb-6">
                Our Service Center
              </h2>
              <p className="font-montserrat font-bold text-xl mb-3">SNH Golf Carts LLC</p>
              <p className="text-muted-foreground text-[18px]">574 Mammoth Rd Bldg B-2,</p>
              <p className="text-muted-foreground text-[18px] mb-6">Londonderry, NH 03053</p>

              <p className="font-montserrat font-bold mb-1 text-lg">Business Hours</p>
              <p className="text-muted-foreground text-[18px]">Mon : 9:00AM – 5:00PM</p>
              <p className="text-muted-foreground text-[18px]">Tue : Closed</p>
              <p className="text-muted-foreground text-[18px]">Wed - Fri : 9:00AM – 5:00PM</p>
              <p className="text-muted-foreground text-[18px]">Sat : 10:00AM – 5:00PM</p>
              <p className="text-muted-foreground text-[18px] mb-6">Sun : 10:00AM – 3:00PM</p>

              <p className="font-montserrat font-bold mb-1 text-lg">Contact US</p>
              <p className="text-muted-foreground text-[18px]">Email : info@snhgolfcarts.com</p>
              <p className="text-muted-foreground text-[18px] mb-6">Phone : (603) 777-7831</p>
            </div>

            <div className="col-span-7" >
              <div className="rounded-2xl overflow-hidden border border-border w-full h-[484px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2921.433744715386!2d-71.407091!3d42.926982!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e24d005fae9693%3A0x3acb317d61226cca!2sSNH%20Golf%20Carts%20LLC!5e0!3m2!1sen!2sus!4v1777472561810!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SNH Golf Carts service center location map"
                />
              </div>
            </div>
          </div>
            <div className="mt-10 sm:mt-16">
            <h2 className="font-montserrat font-bold text-2xl sm:text-3xl mb-4">
              {closing.heading}
            </h2>
            <div className="space-y-4 mb-6">
              {closing.paragraphs.map((p) => (
                <p key={p} className="text-muted-foreground text-base leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 h-12 w-full sm:w-auto px-6 py-2 rounded-lg bg-[#0DA2E7] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_4px_6px_-4px_#0DA2E733,0_10px_15px_-3px_#0DA2E733] hover:bg-[#0DA2E7]/90 transition-colors"
            >
              {closing.ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      <CTASection />

      <WaiverModal
        isOpen={showWaiver}
        onClose={() => {
          setShowWaiver(false);
          setCheckoutLoading(false);
        }}
        onSubmit={handleWaiverSubmit}
        vehicleMakeModel=""
        isSubmitting={waiverSubmitting}
        vehicles={vehicles}
      />
    </div>
  );
}
