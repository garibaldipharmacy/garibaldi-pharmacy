// The picture shown when a page's link is shared in a message or social post,
// as useSeoMeta fields to spread into a page's own. 1200 × 630 is the size
// apps expect for a full-width preview. The files live in public/ so their
// addresses never change between builds. Plain strings throughout, as
// nuxt-og-image rewrites these tags and can't read anything else

const shareImage = (file: string, alt: string) => ({
  ogImage: `/images/${file}`,
  ogImageWidth: "1200",
  ogImageHeight: "630",
  ogImageType: "image/jpeg" as const,
  ogImageAlt: alt,
  twitterImage: `/images/${file}`,
  twitterImageAlt: alt,
  twitterCard: "summary_large_image" as const,
});

export const shareImages = {
  // Every page except Contact
  dog: shareImage(
    "dog-hero-garibaldi-mountain-in-squamish-share.jpg",
    "A toy poodle holding a prescription bag on top of Garibaldi Lake overlooking Garibaldi Mountain in Squamish",
  ),
  // Contact, where finding the pharmacy is the point
  storefront: shareImage(
    "garibaldi-pharmacy-storefront-squamish-share.jpg",
    "The storefront of Garibaldi Pharmacy and Terra Nova Squamish Clinic at 1870 Dowad Drive in Squamish",
  ),
};
