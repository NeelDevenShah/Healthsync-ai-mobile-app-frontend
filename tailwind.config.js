/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0fd',
          100: '#cce0fb',
          200: '#99c2f7',
          300: '#66a3f3',
          400: '#3385ef',
          500: '#1766da', // Primary brand color
          600: '#0f52ae',
          700: '#0a3d83',
          800: '#072957',
          900: '#03142c',
        },
        secondary: {
          50: '#e7f5f3',
          100: '#d0ebe8',
          200: '#a1d7d1',
          300: '#71c3ba',
          400: '#42afa3',
          500: '#2d9d91', // Secondary color
          600: '#247d74',
          700: '#1b5e57',
          800: '#123e3a',
          900: '#091f1d',
        },
        accent: {
          50: '#fff2e6',
          100: '#ffe5cc',
          200: '#ffca99',
          300: '#ffb066',
          400: '#ff9633',
          500: '#ff7d00', // Accent color
          600: '#cc6300',
          700: '#994a00',
          800: '#663200',
          900: '#331900',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
  },
  plugins: [],
}

