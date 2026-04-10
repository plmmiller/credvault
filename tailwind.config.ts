import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Institutes brand palette
        navy: {
          50: "#e6eef5",
          100: "#c4d5e5",
          200: "#8aaccb",
          300: "#4f82b1",
          400: "#1a5a8e",
          500: "#00456a",
          600: "#003a5a",
          700: "#002b5c",
          800: "#001f42",
          900: "#001530",
        },
        teal: {
          300: "#5acfe2",
          400: "#12b2dd",
          500: "#0e9ac2",
          600: "#0a7a9b",
        },
        gold: {
          400: "#faa634",
          500: "#ca802e",
          600: "#a25f10",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
