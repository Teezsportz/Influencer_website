import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0B0E14",
          panel: "#12161F",
          panel2: "#171C27",
          border: "#232A38",
          muted: "#8A93A6",
          text: "#E7EAF0",
        },
        brand: {
          DEFAULT: "#00C48C",
          soft: "#0FE3A6",
          amber: "#F5A623",
          rose: "#F0466B",
          blue: "#3D8BFF",
          violet: "#8B6BFF",
        },
        tier: {
          nano: "#3D8BFF",
          micro: "#0FE3A6",
          mid: "#F5A623",
          macro: "#F0466B",
          mega: "#8B6BFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(0,196,140,0.25), 0 0 24px rgba(0,196,140,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
