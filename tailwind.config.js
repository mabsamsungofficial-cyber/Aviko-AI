export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        guide: {
          dark50: '#0F172A',
          dark30: '#1E293B',
          dark20: '#334155',
          dark10: '#475569',
          basic: '#94A3B8',
          light10: '#F1F5F9',
          light20: '#F8FAFC',
          light50: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
