import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './content/**/*.mdx',
    './public/**/*.svg',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1f2925',
        paper: '#f5f2e9',
        forest: '#24473f',
        'forest-light': '#315b51',
        sun: '#f6c75b',
        'sun-dark': '#bf8620',
        mint: '#dceee7',
        'mint-strong': '#79baa8',
        coral: '#ee806d',
        'coral-dark': '#b94e40',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        app: '0 0 45px rgba(31, 41, 37, 0.08)',
        book: '0 10px 20px rgba(31, 41, 37, 0.18)',
        button: '0 10px 22px rgba(36, 71, 63, 0.2)',
        card: '0 8px 25px rgba(31, 41, 37, 0.055)',
        'card-hover': '0 14px 30px rgba(31, 41, 37, 0.1)',
        feature: '0 18px 38px rgba(36, 71, 63, 0.22)',
        sheet: '0 -18px 50px rgba(31, 41, 37, 0.18)',
        tab: '0 -8px 25px rgba(31, 41, 37, 0.06)',
        'word-card': '0 22px 50px rgba(31, 41, 37, 0.08)',
      },
      keyframes: {
        'sheet-in': {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'sheet-in': 'sheet-in 220ms ease-out both',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
} satisfies Config;
