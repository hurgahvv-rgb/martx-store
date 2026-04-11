import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#F5E6D3",
        ember: "#9A3412",
        pine: "#1F3A33",
        ink: "#111827"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 45px -25px rgba(17, 24, 39, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
