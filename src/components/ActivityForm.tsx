import React, { useState, useMemo } from 'react'
import { useGameStore } from '../state/useGameStore'
import { useUIStore } from '../state/useUIStore'
import { calculateFinalXP } from '../lib/rpg-math'
import { playClick, playXPGain } from '../lib/soundEngine'
import { vibrateShort } from '../lib/haptics'
import type { Activity } from '../types'

const DOMAINS: Array<{ value: Activity['domain']; label: string; icon: string; color: string }> = [
  { value: 'learning', label: 'Learning', icon: '📚', color: 'from-blue-600 to-blue-800' },
  { value: 'wellbeing', label: 'Wellbeing', icon: '💪', color: 'from-green-600 to-green-800' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'from-yellow-600 to-yellow-800' },
  { value: 'social', label: 'Social', icon: '🤝', color: 'from-purple-600 to-purple-800' },
  { value: 'misc', label: 'Misc', icon: '⭐', color: 'from-slate-600 to-slate-800' },
]

const OUTCOMES: Array<{ value: Activity['outcome']; label: string; color: string }> = [
  { value: 'completed', label: '✅ Completed', color: 'bg-green-700 hover:bg-green-600 border-green-500' },
  { value: 'partial', label: '⚡ Partial', color: 'bg-yellow-700 hover:bg-yellow-600 border-yellow-500' },
  { value: 'failed', label: '❌ Failed', color: 'bg-red-900 hover:bg-red-800 border-red-700' },
]

const RECENT_QUESTS = [
  'Morning workout', 'Read a book chapter', 'Meditate', 'Budget review',
  'Language practice', 'Code project', 'Cook healthy meal', 'Walk 10k steps',
]

export function ActivityForm() {
  const { meta, submitActivity } = useGameStore()
  const { openFeedbackModal, soundEnabled, reducedMotion } = useUIStore()
  const [submitting, setSubmitting] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [form, setForm] = useState({
    questName: '',
    domain: 'learning' as Activity['domain'],
    difficulty: 2 as Activity['difficulty'],
    durationMinutes: 30,
    outcome: 'completed' as Activity['outcome'],
    isBoss: false,
  })

  const previewXP = useMemo(() => {
    if (!meta) return 0
    return calculateFinalXP(form, meta)
  }, [form, meta])

  const bgTint = form.outcome === 'completed'
    ? 'from-green-950/30 to-transparent'
    : form.outcome === 'partial'
    ? 'from-yellow-950/30 to-transparent'
    : 'from-red-950/30 to-transparent'

  const filteredSuggestions = RECENT_QUESTS.filter(
    (q) => form.questName && q.toLowerCase().includes(form.questName.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.questName.trim() || !meta) return
    setSubmitting(true)
    try {
      if (soundEnabled) playClick()
      vibrateShort()
      const result = await submitActivity(form)
      if (soundEnabled) playXPGain()
      openFeedbackModal(result)
      setForm({
        questName: '',
        domain: 'learning',
        difficulty: 2,
        durationMinutes: 30,
        outcome: 'completed',
        isBoss: false,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-b ${bgTint} bg-brand-surface border border-brand-card p-6 transition-all duration-500`}>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>⚔️</span> Log Quest
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quest Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-1">Quest Name</label>
          <input
            type="text"
            value={form.questName}
            onChange={(e) => {
              setForm({ ...form, questName: e.target.value })
              setShowSuggestions(true)
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="What did you do?"
            className="w-full bg-brand-bg border border-brand-card rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors"
            required
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-brand-surface border border-brand-card rounded-lg shadow-xl">
              {filteredSuggestions.map((s) => (
                <li
                  key={s}
                  className="px-3 py-2 hover:bg-brand-card cursor-pointer text-sm transition-colors"
                  onMouseDown={() => {
                    setForm({ ...form, questName: s })
                    setShowSuggestions(false)
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Domain */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Domain</label>
          <div className="flex gap-2 flex-wrap">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setForm({ ...form, domain: d.value })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  form.domain === d.value
                    ? `bg-gradient-to-br ${d.color} border-transparent text-white scale-105 shadow-lg`
                    : 'bg-brand-bg border-brand-card text-slate-400 hover:border-slate-500 hover:scale-105'
                }`}
              >
                <span>{d.icon}</span>
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Difficulty: <span className="text-brand-accent font-bold">{form.difficulty}/5</span>
            {meta && (
              <span className="ml-2 text-xs text-slate-500">
                (suggested: {meta.expectedDifficulty.toFixed(1)})
              </span>
            )}
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) as Activity['difficulty'] })}
            className="w-full accent-brand-accent cursor-pointer h-2"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={form.difficulty === n ? 'text-brand-accent font-bold' : ''}>
                {n === 1 ? 'Easy' : n === 3 ? 'Medium' : n === 5 ? 'Hard' : n}
              </span>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Duration: <span className="text-brand-xp font-bold">{form.durationMinutes} min</span>
          </label>
          <input
            type="range"
            min={5}
            max={240}
            step={5}
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            className="w-full accent-brand-xp cursor-pointer h-2"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>5m</span><span>1h</span><span>2h</span><span>3h</span><span>4h</span>
          </div>
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Outcome</label>
          <div className="flex gap-2">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setForm({ ...form, outcome: o.value })}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${o.color} ${
                  form.outcome === o.value ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-80'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Boss Toggle */}
        <div className="flex items-center justify-between bg-brand-bg rounded-xl px-4 py-3 border border-brand-card">
          <div>
            <div className="font-medium flex items-center gap-2">
              <span>👹</span> Boss Quest
            </div>
            <div className="text-xs text-slate-500">3× XP multiplier</div>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, isBoss: !form.isBoss })}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              form.isBoss ? 'bg-brand-accent' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                form.isBoss ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* XP Preview */}
        <div className="bg-brand-bg rounded-xl px-4 py-3 border border-brand-xp/30 flex items-center justify-between">
          <span className="text-sm text-slate-400">Estimated XP</span>
          <span className={`text-2xl font-bold text-brand-xp ${!reducedMotion ? 'animate-xp-pop' : ''}`} key={previewXP}>
            +{previewXP}
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !form.questName.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-accent to-red-600 text-white font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {submitting ? '⏳ Logging...' : '🗡️ Complete Quest'}
        </button>
      </form>
    </div>
  )
}
