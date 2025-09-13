import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // This gives you brand-50 ... brand-950 (orange scale)
        brand: colors.orange,
      },
      boxShadow: {
        soft: '0 10px 20px -10px rgba(0,0,0,.08)',
      },
    },
  },
  plugins: [],
} satisfies Config

