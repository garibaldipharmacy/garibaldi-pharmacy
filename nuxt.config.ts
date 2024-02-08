// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "path";

export default defineNuxtConfig({
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      titleTemplate: "%s %separator",
    },
    site: {
      url: "https://garibaldipharmacy.com",
      name: "Garibaldi Pharmacy",
      desrcription:
        "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
      defaultLocale: "en",
    },
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
    "@nuxtjs/seo",
    "@nuxtjs/sitemap",
  ],

  googleFonts: {
    families: {
      Lexend: "200..700",
    },
  },

  // TODO: add ssr/static rules for each page
  // routeRules: {},
});
