import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Shopify-inspired color palette
        shopify: {
          green: '#008060',
          'green-dark': '#004c3f',
          'green-light': '#5bb98c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cabinet Grotesk', 'Inter', 'sans-serif'],
      },
      keyframes: {
        'cursor-move': {
          '0%, 100%': { transform: 'translate(50px, 50px)' },
          '33%': { transform: 'translate(450px, 80px)' },
          '66%': { transform: 'translate(250px, 320px)' },
        },
        'pulse-cyan': {
          '0%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(6, 182, 212, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'cursor-move': 'cursor-move 6s infinite ease-in-out',
        'pulse-cyan': 'pulse-cyan 2s infinite',
        'slide-up': 'slide-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
