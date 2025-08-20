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
        postalCode: "V8B 0C1",
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
    }),
  },
});
