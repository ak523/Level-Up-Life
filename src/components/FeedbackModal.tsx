import { useEffect } from 'react'
import { useUIStore } from '../state/useUIStore'
import { Confetti } from './Confetti'
import { playCriticalSuccess, playLevelUp } from '../lib/soundEngine'
import { vibrateCritical } from '../lib/haptics'
import type { GameMeta } from '../types'
import { NeoButton } from './neo'

const ATTR_META: Record<keyof GameMeta['attributes'], { label: string; icon: string; color: string }> = {
  INT: { label: 'Intelligence', icon: '🧠', color: '#3B82F6' },
  WIS: { label: 'Wisdom', icon: '📖', color: '#A855F7' },
  CHA: { label: 'Charisma', icon: '💬', color: '#EC4899' },
  VIT: { label: 'Vitality', icon: '❤️', color: '#22C55E' },
  GOLD: { label: 'Gold', icon: '💰', color: '#FACC15' },
}

export function FeedbackModal() {
  const { showFeedbackModal, feedbackResult, closeFeedbackModal, soundEnabled, reducedMotion } = useUIStore()

  useEffect(() => {
    if (!showFeedbackModal || !feedbackResult) return
    if (feedbackResult.leveledUp && soundEnabled) playLevelUp()
    else if (feedbackResult.isCritical && soundEnabled) playCriticalSuccess()
    if (feedbackResult.isCritical) vibrateCritical()
  }, [showFeedbackModal, feedbackResult, soundEnabled])

  if (!showFeedbackModal || !feedbackResult) return null

  const { finalXP, baseXP, attributeDeltas, isCritical, leveledUp, newLevel, goldilocksAdjustment } = feedbackResult

  return (
    <>
      <Confetti active={isCritical || leveledUp} />
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 animate-fade-in"
        onClick={closeFeedbackModal}
      >
        <div
          className={`relative bg-white border-4 rounded-md p-6 max-w-md w-full mx-4 animate-bounce-in shadow-neo-lg ${
            isCritical ? 'border-neo-gold animate-glow-pulse' : 'border-neo-black'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {isCritical && !reducedMotion && (
            <div className="absolute inset-0 rounded-md border-4 border-neo-gold animate-critical-ring pointer-events-none" />
          )}

          <div className="text-center mb-4">
            {leveledUp ? (
              <>
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold uppercase text-neo-gold">Level Up!</h2>
                <p className="text-neutral-500 font-bold">You reached <span className="text-neo-black font-bold">Level {newLevel}</span></p>
              </>
            ) : isCritical ? (
              <>
                <div className="text-5xl mb-2">✨</div>
                <h2 className="text-2xl font-bold uppercase text-neo-gold">Critical Success!</h2>
                <p className="text-neutral-500 font-bold">Double XP + 15 Gold bonus!</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2">⚔️</div>
                <h2 className="text-2xl font-bold uppercase text-neo-black">Quest Complete!</h2>
              </>
            )}
          </div>

          <div className="bg-neo-bg border-4 border-neo-black rounded-md p-4 mb-4">
            <div className="flex justify-between text-sm text-neutral-500 font-bold mb-1">
              <span>Base XP</span>
              <span>{baseXP}</span>
            </div>
            {isCritical && (
              <div className="flex justify-between text-sm text-neo-gold font-bold mb-1">
                <span>Critical ×2</span>
                <span>+{finalXP - Math.round(finalXP / 2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t-4 border-neo-black pt-2 mt-2">
              <span className="text-neo-xp">Total XP</span>
              <span className="text-neo-xp">+{finalXP}</span>
            </div>
          </div>

          {Object.keys(attributeDeltas).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold uppercase text-neutral-500 mb-2">Stat Gains</h3>
              <div className="space-y-2">
                {(Object.entries(attributeDeltas) as [keyof GameMeta['attributes'], number][])
                  .filter(([, v]) => v > 0)
                  .map(([key, val]) => {
                    const meta = ATTR_META[key]
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span>{meta.icon}</span>
                        <span className="text-sm font-bold text-neo-black flex-1">{meta.label}</span>
                        <div
                          className="h-3 rounded-none border-2 border-neo-black transition-all duration-700 animate-slide-up"
                          style={{
                            width: `${Math.min(100, val * 5)}%`,
                            maxWidth: '100px',
                            backgroundColor: meta.color,
                          }}
                        />
                        <span className="text-sm font-bold" style={{ color: meta.color }}>+{val}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          <div className="text-xs font-bold text-neutral-500 bg-neo-bg border-2 border-neo-black rounded-md px-3 py-2 mb-4">
            💡 Suggested difficulty: <span className="text-neo-black">{goldilocksAdjustment.toFixed(1)}</span>
          </div>

          <NeoButton
            onClick={closeFeedbackModal}
            variant="danger"
            size="md"
            className="w-full"
          >
            Continue
          </NeoButton>
        </div>
      </div>
    </>
  )
}
