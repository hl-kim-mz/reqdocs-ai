import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#ffffff", dark: "#0b0d10" },
        surface: { DEFAULT: "#f7f8fa", dark: "#15181d" },
        border: { DEFAULT: "#e6e8ec", dark: "#262a31" },
        text: {
          primary: { DEFAULT: "#111418", dark: "#e8eaee" },
          muted: { DEFAULT: "#6a7280", dark: "#8b94a3" },
        },
        accent: { DEFAULT: "#3b66ff", dark: "#5a7dff" },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Pretendard",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: { prose: "72ch" },
    },
  },
  plugins: [],
};

export default config;
