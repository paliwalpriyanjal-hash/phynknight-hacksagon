/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a3a8f',
        'primary-dark': '#0f2460',
        'primary-light': '#2952cc',
        accent: '#f97316',
        'accent-dark': '#ea580c',
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#ca8a04',
        medical: {
          blue: '#1a3a8f',
          navy: '#0f2460',
          orange: '#f97316',
          green: '#16a34a',
          red: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'ambulance': 'ambulanceMove 8s linear infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'wave': 'wave 4s ease-in-out infinite',
        'theme-in': 'themeIn 0.5s ease-out',
      },
      keyframes: {
        themeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ambulanceMove: {
          '0%': { transform: 'translateX(-120px)' },
          '100%': { transform: 'translateX(calc(100vw + 120px))' }
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.5)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
