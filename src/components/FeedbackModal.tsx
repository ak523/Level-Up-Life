import { useEffect } from 'react'
import { useUIStore } from '../state/useUIStore'
import { Confetti } from './Confetti'
import { playCriticalSuccess, playLevelUp } from '../lib/soundEngine'
import { vibrateCritical } from '../lib/haptics'
import type { GameMeta } from '../types'

const ATTR_META: Record<keyof GameMeta['attributes'], { label: string; icon: string; color: string }> = {
  INT: { label: 'Intelligence', icon: '🧠', color: '#3b82f6' },
  WIS: { label: 'Wisdom', icon: '📖', color: '#8b5cf6' },
  CHA: { label: 'Charisma', icon: '💬', color: '#ec4899' },
  VIT: { label: 'Vitality', icon: '❤️', color: '#22c55e' },
  GOLD: { label: 'Gold', icon: '💰', color: '#f5a623' },
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
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeFeedbackModal}
      >
        <div
          className={`relative bg-brand-surface border rounded-2xl p-6 max-w-md w-full mx-4 animate-bounce-in shadow-2xl ${
            isCritical ? 'border-brand-gold animate-glow-pulse' : 'border-brand-card'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {isCritical && !reducedMotion && (
            <div className="absolute inset-0 rounded-2xl border-2 border-brand-gold animate-critical-ring pointer-events-none" />
          )}

          <div className="text-center mb-4">
            {leveledUp ? (
              <>
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold text-yellow-400">Level Up!</h2>
                <p className="text-slate-400">You reached <span className="text-white font-bold">Level {newLevel}</span></p>
              </>
            ) : isCritical ? (
              <>
                <div className="text-5xl mb-2">✨</div>
                <h2 className="text-2xl font-bold text-brand-gold">Critical Success!</h2>
                <p className="text-slate-400">Double XP + 15 Gold bonus!</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2">⚔️</div>
                <h2 className="text-2xl font-bold text-white">Quest Complete!</h2>
              </>
            )}
          </div>

          <div className="bg-brand-bg rounded-xl p-4 mb-4 border border-brand-card">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Base XP</span>
              <span>{baseXP}</span>
            </div>
            {isCritical && (
              <div className="flex justify-between text-sm text-brand-gold mb-1">
                <span>Critical ×2</span>
                <span>+{finalXP - Math.round(finalXP / 2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-brand-card pt-2 mt-2">
              <span className="text-brand-xp">Total XP</span>
              <span className="text-brand-xp">+{finalXP}</span>
            </div>
          </div>

          {Object.keys(attributeDeltas).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Stat Gains</h3>
              <div className="space-y-2">
                {(Object.entries(attributeDeltas) as [keyof GameMeta['attributes'], number][])
                  .filter(([, v]) => v > 0)
                  .map(([key, val]) => {
                    const meta = ATTR_META[key]
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span>{meta.icon}</span>
                        <span className="text-sm text-slate-300 flex-1">{meta.label}</span>
                        <div
                          className="h-2 rounded-full transition-all duration-700 animate-slide-up"
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

          <div className="text-xs text-slate-500 bg-brand-bg rounded-lg px-3 py-2 mb-4">
            💡 Suggested difficulty: <span className="text-slate-300 font-medium">{goldilocksAdjustment.toFixed(1)}</span>
          </div>

          <button
            onClick={closeFeedbackModal}
            className="w-full py-2 rounded-xl bg-brand-accent text-white font-bold hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  )
}
