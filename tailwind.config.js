/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f8fb',
          100: '#eef1f6',
          200: '#dde3ec',
          300: '#c3cddc',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1120',
        },
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#bcd2ff',
          300: '#8eb4ff',
          400: '#598dff',
          500: '#3267f6',
          600: '#1f4edb',
          700: '#1b3eb0',
          800: '#1b368b',
          900: '#1c316f',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.05)',
        panel: '0 12px 35px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem' },
    },
  },
  plugins: [],
}
