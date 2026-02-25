import { useState } from 'react'
import { useGameStore } from '../state/useGameStore'
import { useUIStore } from '../state/useUIStore'
import { playPurchase, playStreakSaved } from '../lib/soundEngine'
import { NeoCard, NeoButton } from './neo'

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
      <NeoCard>
        <h2 className="text-xl font-bold uppercase mb-2 flex items-center gap-2">
          <span>🏪</span> Shop
        </h2>
        <p className="text-sm text-neutral-500 font-bold mb-6">Spend your Gold on helpful items.</p>

        <div className="bg-neo-gold border-4 border-neo-black rounded-md px-4 py-3 flex items-center gap-3 mb-6 shadow-neo">
          <span className="text-2xl">💰</span>
          <div>
            <div className="text-2xl font-bold text-neo-black">{meta?.attributes.GOLD ?? 0}</div>
            <div className="text-xs font-bold uppercase text-neo-black/70">Gold available</div>
          </div>
        </div>

        <div className="bg-neo-bg border-4 border-neo-black rounded-md p-4 shadow-neo">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">❄️</span>
              <div>
                <h3 className="font-bold uppercase text-neo-black">Streak Freeze</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Protect your streak for one day even if you miss it.
                  You have <span className="text-neo-xp font-bold">{meta?.streakFreezeCount ?? 0}</span> freezes.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-neo-black font-bold">50 💰</div>
            </div>
          </div>
          <NeoButton
            onClick={handleBuyFreeze}
            disabled={purchasing || (meta?.attributes.GOLD ?? 0) < 50}
            variant="primary"
            size="md"
            className="mt-3 w-full"
          >
            {purchasing ? '⏳ Buying...' : 'Buy Streak Freeze'}
          </NeoButton>
          {message && (
            <div className="mt-2 text-sm text-center font-bold text-neo-black animate-slide-up">{message}</div>
          )}
        </div>
      </NeoCard>
    </div>
  )
}
