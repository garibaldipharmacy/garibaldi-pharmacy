// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "path";
import { defineLocalBusiness } from "nuxt-schema-org/schema";

export default defineNuxtConfig({
  compatibilityDate: "2025-08-20",
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      titleTemplate: "%s %separator",
    },
  },
  nitro: {
    // You can leave empty or customize as needed
  },
  site: {
    url: "https://garibaldipharmacy.com",
    name: "Garibaldi Pharmacy",
    description:
      "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
    defaultLocale: "en",
  },
  devtools: { enabled: true },
  alias: {
    assets: "/<rootDir>/assets",
  },
  css: ["~/assets/main.scss"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "nuxt-headlessui",
    "nuxt-site-config",
    "@nuxtjs/seo",
    "@nuxtjs/sitemap",
    "nuxt-schema-org",
  ],

  googleFonts: {
    families: {
      Lexend: "200..700",
    },
  },
  ssr: true,
  schemaOrg: {
    identity: defineLocalBusiness({
      // @ts-expect-error: "Pharmacy" is valid in JSON-LD but not in NuxtSEO types
      "@type": "Pharmacy",
      name: "Garibaldi Pharmacy & Compounding Lab",
      description:
        "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
      openingHours: "Mo-Fr 09:00-18:00",
      paymentAccepted: "Cash, Credit Card",
      currenciesAccepted: "CAD",
      address: {
        streetAddress: "1870 Dowad Drive",
        extendedAddress: "Unit 102",
        addressLocality: "Squamish",
        addressRegion: "BC",
        postalCode: "V8B 1C4",
        addressCountry: "CA",
      },
      faxNumber: "778-605-2939",
      telephone: "604-848-7059",
      email: "pharmacist@garibaldipharmacy.com",
      geo: {
        "@type": "GeoCoordinates",
        latitude: 49.75354791456258,
        longitude: -123.13403029997691,
      },
      image: "https://garibaldipharmacy.com/favicon/android-chrome-512x512.png",
      sameAs: [
        "https://www.facebook.com/garibaldipharmacy",
        "https://www.instagram.com/garibaldipharmacy",
        "https://ca.linkedin.com/company/garibaldi-pharmacy",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "29",
        bestRating: "5",
        worstRating: "1",
      },
      review: [
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Muzzamil K.",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody:
            "If you're in the Squamish area, this is the pharmacy to go to. Dean displayed amazing customer service and went above and beyond to answer any questions and concerns. I encourage anyone in the area to visit this pharmacy due to the amazing service, knowledge, and customer satisfaction that it strives towards.",
          datePublished: "2024-01-15",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Jennie M.",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody:
            "A few weeks ago Dean caught a dosing error on a prescription from an ER resident for my toddler and promptly followed up with the doctor to confirm and correct it. Since then, I've needed the compounding services among other prescriptions, and each time we have been in he has followed up with me or my partner to see how our daughter is doing. He is absolutely lovely.\n\nI never knew I would have a favourite pharmacist, but we're sold and won't be going anywhere else from now on. Highly recommend!",
          datePublished: "2024-03-10",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Michelle S.",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody:
            "I recently switched to Garibaldi Pharmacy, and I couldn't be happier with my decision. After dealing with multiple mistakes, long wait times, and impersonal service at the big chain pharmacies, I was ready for a change. That's when I found Dean at Garibaldi Pharmacy, and it's been a game-changer! Dean is extremely knowledgeable, thorough, and genuinely cares about his patients. He even calls to remind me when my prescriptions are due and has them ready, so there's no more waiting. My prescriptions are always filled within minutes—such a relief compared to my previous experiences with long lines and delays. I've since moved all of my prescriptions to Garibaldi Pharmacy, and I know I'm in great hands. Thank you, Dean, for your outstanding service!",
          datePublished: "2024-01-20",
        },
        {
          "@type": "Review",
          author: {
            "@type": "Person",
            name: "Christina T.",
          },
          reviewRating: {
            "@type": "Rating",
            ratingValue: "5",
            bestRating: "5",
            worstRating: "1",
          },
          reviewBody:
            "Dean is an amazing Pharmacist! His dedication to his patients is amazing, always looking out for them and trying to be as cost effective as possible. He helped my husband with a compound he made and it was honestly the best anti-inflammatory cream he ever had. I highly recommend him!",
          datePublished: "2024-01-25",
        },
      ],
    }),
  },
});
