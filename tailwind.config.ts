import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f3fbff",
                    100: "#e6f7ff",
                    200: "#cceeff",
                    300: "#99ddff",
                    400: "#66ccff",
                    500: "#33b8ff",
                    600: "#2aa0e6",
                    700: "#207fbf",
                    800: "#185f99",
                    900: "#103d66",
                },
                dark: {
                    50: "#f7f9fb",
                    100: "#eef3f8",
                    200: "#dfe9ef",
                    300: "#c6d6df",
                    400: "#9fb0bd",
                    500: "#6f7f8b",
                    600: "#495662",
                    700: "#31404a",
                    800: "#1b252b",
                    900: "#0f1619",
                    950: "#071014",
                }
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(51, 184, 255, 0.18)" },
                    "50%": { boxShadow: "0 0 40px rgba(51, 184, 255, 0.36)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
