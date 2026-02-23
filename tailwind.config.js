/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#1a1a2e',
          surface: '#16213e',
          card: '#0f3460',
          accent: '#e94560',
          gold: '#f5a623',
          xp: '#00d4ff',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      keyframes: {
        'xp-pop': {
          '0%': { transform: 'scale(1)', color: '#00d4ff' },
          '50%': { transform: 'scale(1.3)', color: '#ffffff' },
          '100%': { transform: 'scale(1)', color: '#00d4ff' }
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px #e94560, 0 0 10px #e94560' },
          '50%': { boxShadow: '0 0 20px #e94560, 0 0 40px #e94560, 0 0 60px #e94560' }
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
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' }
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
