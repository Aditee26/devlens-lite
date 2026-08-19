/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["'Source Serif 4'", "ui-serif", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        // Warm, restrained neutrals — the primary surface/text system.
        paper: {
          DEFAULT: "#faf9f6",
          surface: "#ffffff",
        },
        ink: {
          50:  "#f6f6f5",
          100: "#e9e8e5",
          200: "#d8d6d1",
          300: "#b7b4ad",
          400: "#8c887f",
          500: "#6b675e",
          600: "#514d45",
          700: "#3a3733",
          800: "#252320",
          900: "#171613",
          950: "#0f0e0c",
        },
        // Single restrained accent — muted slate blue. Communicates
        // state and hierarchy; the UI should hold up without it.
        accent: {
          50:  "#eef1fa",
          100: "#dde3f3",
          200: "#b9c5e6",
          300: "#8fa1d2",
          400: "#647cba",
          500: "#4a5fa0",
          600: "#3c4d85",
          700: "#333f6c",
          800: "#2a3358",
          900: "#232a49",
        },
        line: {
          DEFAULT: "#e5e3de",
          dark: "#2a2823",
        },
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      animation: {
        "fade-in": "fadeIn .18s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
