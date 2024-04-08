import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layout/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/*.{js,ts,jsx,tsx,mdx}",
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {
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
  daisyui: {
    themes: [
      {
        mytheme: {

          "primary": "#0d9488",

          "secondary": "#009dbe",

          "accent": "#007c00",

          "neutral": "#e5e7eb",

          "base-100": "#e5e7eb",

          "info": "#00c9ff",

          "success": "#577f00",

          "warning": "#ff9700",

          "error": "#fb4c66",
        },
      },
    ],
  },
  transpilePackages: ['react-daisyui'],
  plugins: [require('@tailwindcss/forms'), require('daisyui')],
};
export default config;
