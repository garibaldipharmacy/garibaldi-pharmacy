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
      description:
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
  site: {
    url: "https://garibaldipharmacy.com",
  },

  modules: [
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "nuxt-headlessui",
    "@nuxtjs/seo",
    "@nuxtjs/sitemap",
    "@nuxt/image",
    "@vite-pwa/nuxt",
  ],

  pwa: {
    manifest: {
      name: "Garibaldi Pharmacy",
      short_name: "Garibaldi Pharmacy",
      description:
        "Discover personalized medicine and accessible healthcare at its best. Garibaldi Pharmacy, your Squamish compounding pharmacy, is dedicated to improving your health and wellness.",
      icons: [
        {
          src: "pwa/garibaldi-pharmacy-64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "pwa/garibaldi-pharmacy-96.png",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "pwa/garibaldi-pharmacy-144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "pwa/garibaldi-pharmacy-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa/garibaldi-pharmacy-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: "#141E39",
      screenshots: [
        {
          src: "pwa/garibaldi-pharmacy-desktop.png",
          sizes: "2880x1630",
          type: "image/png",
          form_factor: "wide",
          label: "Garibaldi Pharmacy",
        },
        {
          src: "pwa/garibaldi-pharmacy-mobile.png",
          sizes: "762x1550",
          type: "image/png",
          form_factor: "narrow",
          label: "Garibaldi Pharmacy",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },

  image: {
    format: ["webp"],
  },

  googleFonts: {
    families: {
      Lexend: "200..700",
    },
  },
  ssr: true,
});
