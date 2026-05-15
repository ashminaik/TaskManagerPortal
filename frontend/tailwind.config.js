/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        'bg-main': '#F7F4EE',
        'sidebar': '#071229',
        'text-primary': '#1F2A44',
        'text-secondary': '#667085',
        'soft-pink': '#E8C7D3',
        'olive': '#9BA86F',
        'soft-yellow': '#E9C75B',
        'soft-blue': '#B7C9EA',
        'soft-red': '#E58D8D',
        'border-color': '#D9D9D9',
        'hover-highlight': '#EEF2FF',
        'success': '#8DBA88',
        'warning': '#E5C663',
        'danger': '#D46A6A',
        'modal-bg': '#F5F0E8',
        'modal-border': '#A8C4E0',
        'btn-primary': '#4A7AB5',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
