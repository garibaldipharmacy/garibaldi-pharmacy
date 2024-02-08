/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    fontFamily: {
      sans: ["Lexend", "sans-serif"],
    },
    extend: {
      colors: {
        primary: {
          50: "#F1F2F4",
          100: "#E4E6EC",
          200: "#C4CAD9",
          300: "#A5AFCA",
          400: "#8190BB",
          500: "#5E74B0",
          600: "#445A97",
          700: "#33467A",
          800: "#24335C",
          900: "#141E39",
          930: "#10182F",
          950: "#0B101D",
        },
        secondary: {
          50: "#F4F7F3",
          100: "#E8F0E6",
          200: "#D2E4CD",
          300: "#B9D9B0",
          400: "#A2D095",
          500: "#87C775",
          600: "#6BC053",
          700: "#56B33D",
          800: "#46982F",
          900: "#377E23",
          950: "#1D3E13",
        },
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
