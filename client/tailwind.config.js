/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names.
  // It will only include the CSS for classes you actually use (tree-shaking).
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      // ── Brand Colour Palette ────────────────────────────────────────
      // AuraBella: luxury beauty — deep violet, rose gold, champagne
      colors: {
        primary: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f3d0fe",
          300: "#e9a8fd",
          400: "#d976f9",
          500: "#c44def",   // Brand violet
          600: "#a82dd5",
          700: "#8c22b0",
          800: "#741e90",
          900: "#5e1a73",
          950: "#3e0a50",
        },
        rose: {
          50:  "#fff1f3",
          100: "#ffe4e8",
          200: "#fecdd6",
          300: "#fda4b5",
          400: "#fb7191",
          500: "#f43f6b",
          600: "#e11d50",
          700: "#be1240",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        champagne: {
          50:  "#fdf8ed",
          100: "#f9edcf",
          200: "#f2d99b",
          300: "#eac061",
          400: "#e5a93c",
          500: "#dc8c23",   // Gold accent
          600: "#c26b18",
          700: "#a14d17",
          800: "#843d19",
          900: "#6d3319",
          950: "#3d190a",
        },
        dark: {
          900: "#0d0a12",
          800: "#16111f",
          700: "#1e1830",
          600: "#2a2145",
        },
      },

      // ── Typography ──────────────────────────────────────────────────
      fontFamily: {
        serif:  ["Cormorant Garamond", "Georgia", "serif"],
        sans:   ["Poppins", "Inter", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },

      // ── Gradients (as background-image shortcuts) ───────────────────
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #c44def 0%, #e11d50 50%, #dc8c23 100%)",
        "dark-gradient":
          "linear-gradient(180deg, #0d0a12 0%, #16111f 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
      },

      // ── Box Shadows ─────────────────────────────────────────────────
      boxShadow: {
        "glow-violet": "0 0 20px rgba(196, 77, 239, 0.4)",
        "glow-rose":   "0 0 20px rgba(225, 29, 80, 0.35)",
        "glow-gold":   "0 0 20px rgba(220, 140, 35, 0.35)",
        "card":        "0 4px 24px rgba(0,0,0,0.3)",
        "card-hover":  "0 12px 40px rgba(0,0,0,0.5)",
      },

      // ── Animations ──────────────────────────────────────────────────
      animation: {
        "fade-in":       "fadeIn 0.6s ease forwards",
        "slide-up":      "slideUp 0.6s ease forwards",
        "pulse-glow":    "pulseGlow 2s ease-in-out infinite",
        "gradient-shift":"gradientShift 6s ease infinite",
        "float":         "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(196,77,239,0.3)" },
          "50%":       { boxShadow: "0 0 40px rgba(196,77,239,0.7)" },
        },
        gradientShift: {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
      },
    },
  },

  plugins: [],
}
