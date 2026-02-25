/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FFFDF7',
          black: '#1a1a1a',
          int: '#3B82F6',
          wis: '#A855F7',
          cha: '#EC4899',
          vit: '#22C55E',
          gold: '#FACC15',
          xp: '#38BDF8',
          accent: '#EF4444',
          orange: '#FB923C',
        },
        brand: {
          bg: '#FFFDF7',
          surface: '#FFFFFF',
          card: '#1a1a1a',
          accent: '#EF4444',
          gold: '#FACC15',
          xp: '#38BDF8',
          success: '#22C55E',
          warning: '#FB923C',
          danger: '#EF4444',
        }
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
        'neo-md': '6px 6px 0px 0px rgba(0,0,0,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'neo-hover': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
      keyframes: {
        'xp-pop': {
          '0%': { transform: 'scale(1)', color: '#38BDF8' },
          '50%': { transform: 'scale(1.3)', color: '#1a1a1a' },
          '100%': { transform: 'scale(1)', color: '#38BDF8' }
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' },
          '50%': { boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }
        },
        'flame-flicker': {
          '0%, 100%': { transform: 'scaleY(1) rotate(-2deg)' },
          '25%': { transform: 'scaleY(1.1) rotate(2deg)' },
          '75%': { transform: 'scaleY(0.9) rotate(-1deg)' }
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'xp-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--xp-width)' }
        },
        'number-tick': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'critical-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1', boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' },
          '100%': { transform: 'scale(1.5)', opacity: '0', boxShadow: '0px 0px 0px 0px rgba(0,0,0,0)' }
        },
        'nudge-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.01)' }
        }
      },
      animation: {
        'xp-pop': 'xp-pop 0.4s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'flame-flicker': 'flame-flicker 0.8s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s linear forwards',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'xp-fill': 'xp-fill 1s ease-out forwards',
        'number-tick': 'number-tick 0.3s ease-out',
        'critical-ring': 'critical-ring 0.8s ease-out forwards',
        'nudge-pulse': 'nudge-pulse 2s ease-in-out infinite',
      }
    }
  },
  plugins: []
}
