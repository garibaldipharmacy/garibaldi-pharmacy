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
      // 404.html / 200.html are empty SPA shells, so without a default here
      // they ship no <title> at all for crawlers to fall back on.
      title: "Garibaldi Pharmacy",
    },
  },
  nitro: {
    // You can leave empty or customize as needed
  },
  routeRules: {
    // Thank-you pages have no search value. A route rule keeps them out of
    // both the robots meta tag and the sitemap.
    "/success/**": { robots: "noindex, nofollow" },
  },
  site: {
    url: "https://garibaldipharmacy.com",
    name: "Garibaldi Pharmacy",
    description:
      "Garibaldi Pharmacy is your trusted pharmacy in Squamish, offering personalized medicine, compounding services, and accessible healthcare to improve your health and wellness.",
    defaultLocale: "en",
    // Netlify serves prerendered routes at /path/ and 301s /path to it, so
    // canonicals and the sitemap must use the trailing-slash form.
    trailingSlash: true,
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
  seo: {
    // This plugin titles error states "<statusCode> - <raw error message>",
    // which Google indexed once a chunk failed to load. Every page and
    // error.vue set their own title, so the fallback is not needed.
    fallbackTitle: false,
  },
  experimental: {
    // Old hashed /_nuxt/*.js files are gone after each atomic deploy, so a
    // client holding pre-deploy HTML fails to import them. Reload the route
    // right away rather than letting it surface as Nuxt's 500 error page.
    emitRouteChunkError: "automatic-immediate",
  },
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
    }),
  },
});
