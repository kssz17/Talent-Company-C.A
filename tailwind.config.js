/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Paleta corporativa neutra — ni brillante ni plana
        // Equivale a un slate/navy oscuro como el que usan Bizneo, Greenhouse, Lever
        primary: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',   // botón principal: slate-600
          700: '#334155',   // hover
          800: '#1e293b',   // texto de énfasis
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,.06), 0 1px 3px 0 rgba(0,0,0,.04)',
        nav:  '0 1px 3px 0 rgba(0,0,0,.05)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
