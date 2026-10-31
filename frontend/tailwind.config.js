/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          warm: "#EDECE7", // Base canvas warm grey / soft sand from screenshot
          light: "#F5F4EF",
          card: "#FFFFFF"
        },
        sage: {
          deep: "#3D5647", // Dark forest sage for featured card & primary CTAs
          primary: "#486351",
          mid: "#5C7C66",
          accent: "#6E8B77",
          light: "#E8F0EB", // Soft sage tint for positive +2.45% pills
          border: "#D6E0D9"
        },
        charcoal: {
          dark: "#1A201C",
          DEFAULT: "#232825",
          light: "#4E5450"
        },
        slate: {
          muted: "#79807A",
          subtle: "#9BA39D"
        },
        alert: {
          rose: "#FCEAEA",
          roseText: "#B84A4A",
          gold: "#F6EEDA",
          goldText: "#947833"
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px'
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
