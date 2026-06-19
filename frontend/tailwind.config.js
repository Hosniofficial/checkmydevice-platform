/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B4F9B', 50:'#EBF5FB', 100:'#B5D4F4', 500:'#2E86C1', 700:'#1B4F9B', 900:'#042C53' },
        accent:  { DEFAULT: '#E67E22', 100:'#FAEEDA', 500:'#E67E22' },
      },
      fontFamily: { arabic: ['Cairo','Tajawal','sans-serif'] },
    },
  },
  plugins: [],
};
