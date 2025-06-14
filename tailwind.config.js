import colors from "tailwindcss/colors";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1ea39a",
        "primary-foreground": "#ffffff",
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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
      },
      fontSize: {
        sm: "var(--text-sm)",
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
    },
  },
  plugins: [],
};
