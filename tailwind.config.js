/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ADD8E6",
        primaryDark: "#7EC8E3",
        darkBg: "#0d0d0d",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      boxShadow: {
        glow: "0 0 40px rgba(173, 216, 230, 0.3)",
        glowStrong: "0 0 60px rgba(173, 216, 230, 0.5)",
      },

      container: {
        center: true,
        padding: "2rem",
      },
    },
  },
  plugins: [],
};
