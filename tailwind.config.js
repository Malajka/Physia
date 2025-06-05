import colors from "tailwindcss/colors";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1B9B6B",
        "light-green": "#DFF3EC",
        "dark-green": "#156F53",
        "gray-text": "#7A7A7A",
        "black-text": "#212121",
        "accent-orange": "#F4A261",
        "accent-yellow": "#E9C46A",
        blue: {
          ...colors.blue,
          50: "#73fff729",
          200: "#1ea39a",
          700: "#1ea39a",
        },
      },
      fontSize: {
        sm: "var(--text-sm)",
      },
    },
  },
  plugins: [],
};
