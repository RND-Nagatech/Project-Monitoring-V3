/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dropdownBg: '#ffffff',
        dropdownBorder: '#e5e7eb',
        dropdownHover: '#f3f4f6',
        dropdownFocus: '#10b981',
      },
      boxShadow: {
        dropdown: '0 1px 3px rgba(0, 0, 0, 0.1)',
        dropdownHover: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [typography],
};
