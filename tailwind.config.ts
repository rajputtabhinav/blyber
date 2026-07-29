import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F1117",
        surface: "#161B22",
        elev: "#1F2937",
        accent: "#6D5EF7",
        "accent-2": "#8B7EFF",
        text: "#E6EDF3",
        "text-2": "#9CA3AF",
        "text-3": "#6B7280",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
        teal: "#14B8A6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["10.5px", { lineHeight: "1.3" }],
        xs: ["11.5px", { lineHeight: "1.4" }],
        sm: ["12px", { lineHeight: "1.45" }],
        base: ["13px", { lineHeight: "1.45" }],
      },
      borderRadius: {
        card: "6px",
        chip: "3px",
        ctl: "5px",
      },
    },
  },
  plugins: [],
};

export default config;
