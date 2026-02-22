/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        surface: {
          page:   '#FAFAF8',
          card:   '#FFFFFF',
          hover:  '#F5F5F4',
          active: '#EDEDE9',
          border: '#E5E4E1',
        },
        ink: {
          primary:   '#0F0F0F',
          secondary: '#37352F',
          muted:     '#787774',
          disabled:  '#ABABAB',
        },
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
        modal:  '0 20px 60px -8px rgb(0 0 0 / 0.18), 0 8px 24px -4px rgb(0 0 0 / 0.10)',
        dropdown: '0 4px 16px 0 rgb(0 0 0 / 0.10), 0 1px 4px 0 rgb(0 0 0 / 0.06)',
        'btn-brand': '0 1px 3px 0 rgb(249 115 22 / 0.30)',
      },
      borderRadius: {
        sm:  '6px',
        md:  '8px',
        lg:  '10px',
        xl:  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
