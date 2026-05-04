import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const isIframe = typeof window !== 'undefined' && window.self !== window.top;

/**
 * Extracts specifications like Seats, Range, Top Speed, and Battery from Wix product data.
 */
export function extractProductDetails(product, collections = []) {
  if (!product) return {};

  // Extract colors from productOptions
  const colors = [];
  let colorOption = null;
  if (product.productOptions) {
    colorOption = product.productOptions.find(
      (opt) => opt.optionType === "color" || opt.name?.toLowerCase() === "color"
    );
    if (colorOption && colorOption.choices) {
      colorOption.choices.forEach((choice) => {
        if (choice.description) colors.push(choice.description);
        else if (choice.value) colors.push(choice.value);
      });
    }
  }

  const name = product.name || "";
  
  // New Brand Discovery Logic: Use Wix Collections (Categories)
  // We look for collections that match known brands or the "Accessories" category
  const productCollectionIds = product.collectionIds || [];
  const productCollections = collections.filter(c => productCollectionIds.includes(c._id || c.id));
  const collectionNames = productCollections.map(c => c.name?.toLowerCase() || "");
  
  const brandsList = ["evolution", "teko", "dach", "tomberlin", "ezgo", "club car", "yamaha", "bintelli", "vivid", "icon"];
  let brand = "Evolution"; // Default fallback
  let isAccessory = false;

  // 1. Check if it's an accessory
  if (collectionNames.some(cn => cn.includes("accessor"))) {
    isAccessory = true;
  }

  // 2. Extract Brand from collections
  for (const b of brandsList) {
    if (collectionNames.some(cn => cn === b || cn.includes(b))) {
      brand = b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  // Clean up name if it starts with brand (only for display, preserving original for filters if needed)
  let displayName = name;
  if (displayName.toLowerCase().startsWith(brand.toLowerCase())) {
    displayName = displayName.slice(brand.length).trim();
  }

  const details = {
    name: displayName,
    fullName: name,
    seats: null,
    range: null,
    topSpeed: null,
    battery: null,
    brand: brand,
    isAccessory: isAccessory,
    price: product.priceData?.price || product.price?.price,
    formattedPrice: product.priceData?.formatted?.price || product.price?.formatted?.price,
    image: product.media?.mainMedia?.image?.url || product.image,
    gallery: product.media?.items?.map(item => item.image?.url).filter(Boolean) || [],
    description: product.description || "",
    inStock: product.stock?.inventoryStatus !== "OUT_OF_STOCK",
    slug: product.slug,
    id: product._id || product.id,
    colors: colors,
    colorOptionName: colorOption?.name || "Color",
    ribbon: product.ribbon || (product.ribbons && product.ribbons[0]?.text) || ""
  };

  const fullText = (
    (product.name || "") + " " +
    (product.description || "") + " " +
    (product.additionalInfoSections || []).map(s => s.title + " " + s.description).join(" ")
  ).toLowerCase();

  // Extract Seats - Prioritize additionalInfoSections
  const seatingSection = (product.additionalInfoSections || []).find(
    (s) => s.title?.toLowerCase() === "seating"
  );

  if (seatingSection) {
    // Extract number from description (e.g., "<p>4</p>")
    const sMatch = seatingSection.description.match(/(\d+)/);
    if (sMatch) {
      details.seats = parseInt(sMatch[1]);
    }
  }

  // Fallback to regex if not found in additionalInfoSections
  if (!details.seats) {
    const seatMatch =
      fullText.match(/(\d+)\s*(-|plus|passengers?|seats?|seater)/i) ||
      fullText.match(/seating arrangement for (\w+)/i);
    if (seatMatch) {
      const val = seatMatch[1];
      const wordToNum = { two: 2, four: 4, six: 6, eight: 8 };
      details.seats = wordToNum[val.toLowerCase()] || parseInt(val) || val;
    } else if (product.name?.includes("4")) {
      details.seats = 4;
    } else if (product.name?.includes("6")) {
      details.seats = 6;
    }
  }

  // Extract Range
  const rangeMatch = fullText.match(/(\d+[-–]\d+\+?\s*mile\s*range)/i) || 
                    fullText.match(/(\d+\+?\s*miles?)/i);
  if (rangeMatch) details.range = rangeMatch[1];

  // Extract Top Speed
  const speedMatch = fullText.match(/(\d+)\s*mph/i) || 
                    fullText.match(/max\s*speed\s*(\d+)/i);
  if (speedMatch) details.topSpeed = `${speedMatch[1]} mph`;

  // Extract Battery
  const batteryMatch = fullText.match(/(\d+v?\s*\w+\s*battery)/i) || 
                       fullText.match(/(\d+v?\s*lithium-ion)/i) ||
                       fullText.match(/lithium-ion/i);
  if (batteryMatch) details.battery = batteryMatch[0];

  return details;
}

/**
 * Normalizes Wix Blog Post data.
 */
export function extractBlogDetails(post) {
  if (!post) return {};
  
  let coverImage = post.coverImage;
  
  // Handle Wix Blog specific media structure
  const wixMediaUrl = post.media?.wixMedia?.image || post.media?.image || post.media?.mainMedia?.image?.url;
  
  if (wixMediaUrl) {
    if (typeof wixMediaUrl === 'string' && wixMediaUrl.startsWith('wix:image://v1/')) {
      const mediaId = wixMediaUrl.replace('wix:image://v1/', '').split('/')[0];
      coverImage = `https://static.wixstatic.com/media/${mediaId}`;
    } else {
      coverImage = wixMediaUrl;
    }
  }

  return {
    id: post._id || post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    richContent: post.richContent || post.content,
    coverImage: coverImage,
    publishDate: post.firstPublishedDate || post.lastUpdatedDate || post._createdDate,
    minutesToRead: post.minutesToRead || 5,
    featured: post.featured || false
  };
}
