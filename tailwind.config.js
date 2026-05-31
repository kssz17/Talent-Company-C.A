/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Linear purple-indigo accent
        brand: {
          DEFAULT: '#5E6AD2',
          hover:   '#6872D6',
          muted:   'rgba(94,106,210,0.18)',
          dim:     'rgba(94,106,210,0.08)',
        },
        // Dark surface scale
        ink: {
          bg:       '#0F0F10',
          surface:  '#161618',
          surface2: '#1C1C1E',
          surface3: '#222226',
          border:   'rgba(255,255,255,0.08)',
          border2:  'rgba(255,255,255,0.05)',
        },
      },
      boxShadow: {
        card:  '0 0 0 1px rgba(255,255,255,0.07), 0 2px 8px rgba(0,0,0,0.35)',
        'card-hover': '0 0 0 1px rgba(255,255,255,0.11), 0 4px 16px rgba(0,0,0,0.4)',
        nav:   '1px 0 0 0 rgba(255,255,255,0.06)',
        glow:  '0 0 24px rgba(94,106,210,0.2)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
