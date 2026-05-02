// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#080c18', 2: '#0e1425', 3: '#141c32' },
        'app-text':  '#f0f4ff',
        'app-muted': '#8b9cc8',
        'app-dim':   '#4a5a80',
      },
      fontFamily: {
        barlow:             ['var(--font-barlow)', 'sans-serif'],
        'barlow-condensed': ['var(--font-barlow-condensed)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
