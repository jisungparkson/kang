/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FA",
        foreground: "#333333",
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          light: "#DBEAFE",
        },
        border: "#E9ECEF",
      },
    },
  },
  plugins: [],
};
