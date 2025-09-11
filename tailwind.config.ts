import type { Config } from 'tailwindcss';
const config: Config = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: { DEFAULT: '#f59e0b', 600: '#d97706', 700: '#b45309' } }, boxShadow: { soft: '0 10px 25px -10px rgba(17,24,39,0.15)' } } }, plugins: [] };
export default config;
