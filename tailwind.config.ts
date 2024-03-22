import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layout/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/*.{js,ts,jsx,tsx,mdx}",
  ],
    theme: {
    extend: {
      colors: {
        primary: {
          100: '#ebf8ff', // Azul claro
          500: '#3490dc', // Azul original
          900: '#1c3d5a', // Azul oscuro
        },
        secondary: {
          100: '#d6f5d6', // Verde claro
          500: '#38a169', // Verde original
          900: '#1d4733', // Verde oscuro
        },
      },
      animation: {
        'spin': 'spin 3s linear infinite',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
