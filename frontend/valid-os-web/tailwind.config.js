/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#3B82F6',
          500: '#2563EB',
          600: '#1E4D8C',
          700: '#143965',
          800: '#0F2D52',
          900: '#0A2540',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          500: '#64748B',
          700: '#334155',
          900: '#0F172A',
        },
        'accent-teal': '#0EA5A4',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#0284C7',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
