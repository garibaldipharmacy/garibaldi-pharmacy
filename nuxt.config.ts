// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from "path";

export default defineNuxtConfig({
  app: {
    // pageTransition: { name: "page", mode: "out-in" },
    //   head: {
    //     title: "Garibaldi Pharmacy",
    //     meta: [
    //       {
    //         name: "description",
    //         content:
    //           "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
    //       },
    //     ],
    //   },
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
  modules: ["nuxt-icon", "@nuxtjs/google-fonts", "nuxt-headlessui"],

  googleFonts: {
    families: {
      Lexend: "200..700",
    },
  },

  // TODO: add ssr/static rules for each page
  routeRules: {},
});
