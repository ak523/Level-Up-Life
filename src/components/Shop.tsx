import { useState } from 'react'
import { useGameStore } from '../state/useGameStore'
import { useUIStore } from '../state/useUIStore'
import { playPurchase, playStreakSaved } from '../lib/soundEngine'

export function Shop() {
  const { meta, buyStreakFreeze } = useGameStore()
  const { soundEnabled } = useUIStore()
  const [purchasing, setPurchasing] = useState(false)
  const [message, setMessage] = useState('')

  const handleBuyFreeze = async () => {
    if (!meta || meta.attributes.GOLD < 50) return
    setPurchasing(true)
    const success = await buyStreakFreeze()
    if (success) {
      if (soundEnabled) { playPurchase(); setTimeout(() => playStreakSaved(), 200) }
      setMessage('❄️ Streak Freeze purchased! Your streak is protected.')
    } else {
      setMessage('❌ Not enough Gold.')
    }
    setPurchasing(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span>🏪</span> Shop
        </h2>
        <p className="text-sm text-slate-400 mb-6">Spend your Gold on helpful items.</p>

        <div className="bg-brand-bg rounded-xl px-4 py-3 flex items-center gap-3 mb-6 border border-yellow-500/20">
          <span className="text-2xl">💰</span>
          <div>
            <div className="text-2xl font-bold text-brand-gold">{meta?.attributes.GOLD ?? 0}</div>
            <div className="text-xs text-slate-400">Gold available</div>
          </div>
        </div>

        <div className="bg-brand-bg rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">❄️</span>
              <div>
                <h3 className="font-bold text-white">Streak Freeze</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Protect your streak for one day even if you miss it.
                  You have <span className="text-cyan-400 font-bold">{meta?.streakFreezeCount ?? 0}</span> freezes.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-brand-gold font-bold">50 💰</div>
            </div>
          </div>
          <button
            onClick={handleBuyFreeze}
            disabled={purchasing || (meta?.attributes.GOLD ?? 0) < 50}
            className="mt-3 w-full py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {purchasing ? '⏳ Buying...' : 'Buy Streak Freeze'}
          </button>
          {message && (
            <div className="mt-2 text-sm text-center text-slate-300 animate-slide-up">{message}</div>
          )}
        </div>
      </div>
    </div>
  )
}
