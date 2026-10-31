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
          DEFAULT: "#E9E8E3", // Exact specified background
          card: "#FFFFFF",    // Exact specified white card
          light: "#F5F5F2",
        },
        sage: {
          primary: "#809387", // Exact specified primary sage green
          dark: "#64786D",    // Exact specified dark sage green
          light: "#F2F3F0",   // Exact specified light sage
          muted: "#A0B1A7",
          deep: "#4D5E54",
        },
        ink: {
          DEFAULT: "#2D2E35", // Exact specified text color
          muted: "#6B6E77",
          subtle: "#8E919B",
        },
        line: {
          DEFAULT: "#E5E5E0", // Exact specified border
          dark: "#D5D5CF",
        },
        status: {
          successBg: "#EBF3EE",
          successText: "#4A7C59",
          alertBg: "#FCEAEA",
          alertText: "#B84A4A",
          warningBg: "#FDF4E7",
          warningText: "#A36B26",
        }
      },
      borderRadius: {
        'card': '18px',
        '2xl': '16px',
        '3xl': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(45, 46, 53, 0.05)',
        'elevated': '0 8px 24px -4px rgba(45, 46, 53, 0.08)',
      }
    },
  },
  plugins: [],
}
