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
                    50: "#f0f0ff",
                    100: "#e0e0ff",
                    200: "#c7c7ff",
                    300: "#a3a3ff",
                    400: "#8080ff",
                    500: "#6c63ff",
                    600: "#5a50f0",
                    700: "#4a40d0",
                    800: "#3d35a8",
                    900: "#332d85",
                },
                dark: {
                    50: "#f8f8f8",
                    100: "#e8e8e8",
                    200: "#d0d0d0",
                    300: "#a8a8a8",
                    400: "#808080",
                    500: "#585858",
                    600: "#383838",
                    700: "#282828",
                    800: "#1a1a1a",
                    900: "#121212",
                    950: "#0a0a0a",
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
                    "0%, 100%": { boxShadow: "0 0 20px rgba(108, 99, 255, 0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(108, 99, 255, 0.6)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
