// tailwind.config.ts
import type { Config } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0000A0', // warna utama baru
      },
    },
  },
  plugins: [],
};

export default config;
