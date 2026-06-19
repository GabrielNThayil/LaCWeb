import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        crown: {
          espresso: "#61481C",
          caramel: "#A47E3B",
          gold: "#BF9742",
          honey: "#E6B325",
          cream: "#F7F0E4",
          paper: "#FFF8EC",
          ink: "#20180F"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(97, 72, 28, 0.20)",
        gold: "0 18px 55px rgba(191, 151, 66, 0.28)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(97,72,28,.13) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
