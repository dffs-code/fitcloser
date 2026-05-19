import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#b9cdff",
          300: "#8ba7ff",
          400: "#5f82ff",
          500: "#3c5dff",
          600: "#2f45e6",
          700: "#2539b3",
          800: "#1d2f80",
          900: "#16255c"
        }
      },
      boxShadow: {
        glow: "0 20px 80px rgba(56, 81, 255, 0.12)"
      },
      backgroundImage: {
        "soft-radial": "radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 36%)"
      }
    }
  },
  plugins: []
};

export default config;
