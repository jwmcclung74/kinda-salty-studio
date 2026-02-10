import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        salt: {
          50: '#fafafa',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c2c2c2',
          400: '#909090',
          500: '#6e6e6e',
          600: '#555555',
          700: '#3d3d3d',
          800: '#2b2b2b',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        accent: {
          DEFAULT: '#e8721d',
          light: '#f09040',
          dark: '#c45d10',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
