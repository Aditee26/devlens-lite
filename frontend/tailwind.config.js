/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans:  ["'DM Sans'","ui-sans-serif","system-ui","sans-serif"],
        mono:  ["'JetBrains Mono'","ui-monospace","monospace"],
        display: ["'Cal Sans'","'DM Sans'","sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0f0ff",
          100: "#e0e0ff",
          200: "#c7c6fe",
          300: "#a59fff",
          400: "#8874fe",
          500: "#6d4cf5",
          600: "#5b32ea",
          700: "#4d26cf",
          800: "#4121a8",
          900: "#371e86",
          950: "#210f56",
        },
      },
      animation: {
        "fade-in":   "fadeIn .25s ease-out",
        "slide-up":  "slideUp .3s cubic-bezier(.2,0,0,1)",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow":"pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      backgroundImage: {
        "grid-white":  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40L40 0M-10 10L10-10M30 50L50 30' stroke='%23ffffff08' stroke-width='1'/%3E%3C/svg%3E\")",
        "grid-dark":   "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40L40 0M-10 10L10-10M30 50L50 30' stroke='%2300000010' stroke-width='1'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
