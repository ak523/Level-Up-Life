import React, { useState, useMemo } from 'react'
import { useGameStore } from '../state/useGameStore'
import { useUIStore } from '../state/useUIStore'
import { calculateFinalXP } from '../lib/rpg-math'
import { playClick, playXPGain, playSadSound } from '../lib/soundEngine'
import { vibrateShort } from '../lib/haptics'
import type { Activity } from '../types'
import { NeoCard, NeoButton } from './neo'

const DOMAINS: Array<{ value: Activity['domain']; label: string; icon: string; color: string }> = [
  { value: 'learning', label: 'Learning', icon: '📚', color: 'bg-neo-int' },
  { value: 'wellbeing', label: 'Wellbeing', icon: '💪', color: 'bg-neo-vit' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'bg-neo-gold' },
  { value: 'social', label: 'Social', icon: '🤝', color: 'bg-neo-cha' },
  { value: 'misc', label: 'Misc', icon: '⭐', color: 'bg-neutral-300' },
  { value: 'bad_habit', label: 'Bad Habit', icon: '💀', color: 'bg-neo-accent' },
]

const OUTCOMES: Array<{ value: Activity['outcome']; label: string; color: string }> = [
  { value: 'completed', label: '✅ Completed', color: 'bg-neo-vit' },
  { value: 'partial', label: '⚡ Partial', color: 'bg-neo-gold' },
  { value: 'failed', label: '❌ Failed', color: 'bg-neo-accent' },
]

const RECENT_QUESTS = [
  'Morning workout', 'Read a book chapter', 'Meditate', 'Budget review',
  'Language practice', 'Code project', 'Cook healthy meal', 'Walk 10k steps',
]

const MOOD_LABELS = ['😞', '😕', '😐', '🙂', '😄']
const ENERGY_LABELS = ['🪫', '😴', '⚡', '🔥', '🚀']
const ANXIETY_LABELS = ['😌', '😊', '😐', '😰', '😱']

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
    mood: 3 as NonNullable<Activity['mood']>,
    energyLevel: 3 as NonNullable<Activity['energyLevel']>,
    anxietyLevel: 3 as NonNullable<Activity['anxietyLevel']>,
  })

  const previewXP = useMemo(() => {
    if (!meta) return 0
    return calculateFinalXP(form, meta)
  }, [form, meta])

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
      if (soundEnabled) {
        if (result.finalXP <= 0 || form.outcome === 'failed') {
          playSadSound()
        } else {
          playXPGain()
        }
      }
      openFeedbackModal(result)
      setForm({
        questName: '',
        domain: 'learning',
        difficulty: 2,
        durationMinutes: 30,
        outcome: 'completed',
        isBoss: false,
        mood: 3,
        energyLevel: 3,
        anxietyLevel: 3,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <NeoCard>
      <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
        <span>⚔️</span> Log Quest
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quest Name */}
        <div className="relative">
          <label className="block text-sm font-bold uppercase text-neo-black mb-1">Quest Name</label>
          <input
            type="text"
            value={form.questName}
            onChange={(e) => {
              setForm({ ...form, questName: e.target.value })
              setShowSuggestions(true)
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="What did you do?"
            className="w-full bg-white border-4 border-neo-black rounded-md px-3 py-2 text-neo-black placeholder-neutral-400 focus:outline-none focus:shadow-neo-md focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
            required
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border-4 border-neo-black rounded-md shadow-neo-md">
              {filteredSuggestions.map((s) => (
                <li
                  key={s}
                  className="px-3 py-2 hover:bg-neo-gold cursor-pointer text-sm font-bold transition-colors"
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
          <label className="block text-sm font-bold uppercase text-neo-black mb-2">Domain</label>
          <div className="flex gap-2 flex-wrap">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setForm({ ...form, domain: d.value })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md border-4 border-neo-black text-sm font-bold uppercase transition-all duration-150 ${
                  form.domain === d.value
                    ? `${d.color} text-neo-black shadow-neo -translate-x-0.5 -translate-y-0.5`
                    : 'bg-white text-neutral-500 hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5'
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
          <label className="block text-sm font-bold uppercase text-neo-black mb-2">
            Difficulty: <span className="text-neo-accent">{form.difficulty}/5</span>
            {meta && (
              <span className="ml-2 text-xs text-neutral-500 normal-case">
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
            className="w-full accent-neo-accent cursor-pointer h-3"
          />
          <div className="flex justify-between text-xs font-bold text-neutral-500 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={form.difficulty === n ? 'text-neo-accent' : ''}>
                {n === 1 ? 'Easy' : n === 3 ? 'Medium' : n === 5 ? 'Hard' : n}
              </span>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-bold uppercase text-neo-black mb-2">
            Duration: <span className="text-neo-xp">{form.durationMinutes} min</span>
          </label>
          <input
            type="range"
            min={5}
            max={240}
            step={5}
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            className="w-full accent-neo-xp cursor-pointer h-3"
          />
          <div className="flex justify-between text-xs font-bold text-neutral-500 mt-1">
            <span>5m</span><span>1h</span><span>2h</span><span>3h</span><span>4h</span>
          </div>
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-bold uppercase text-neo-black mb-2">Outcome</label>
          <div className="flex gap-2">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setForm({ ...form, outcome: o.value })}
                className={`flex-1 py-2 rounded-md border-4 border-neo-black text-sm font-bold uppercase transition-all duration-150 ${o.color} ${
                  form.outcome === o.value
                    ? 'shadow-neo -translate-x-0.5 -translate-y-0.5 text-neo-black'
                    : 'opacity-50 hover:opacity-80 text-neo-black'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Boss Toggle */}
        <div className="flex items-center justify-between bg-neo-bg border-4 border-neo-black rounded-md px-4 py-3">
          <div>
            <div className="font-bold uppercase flex items-center gap-2">
              <span>👹</span> Boss Quest
            </div>
            <div className="text-xs font-bold text-neutral-500">3× XP multiplier</div>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, isBoss: !form.isBoss })}
            className={`relative w-14 h-7 rounded-md border-4 border-neo-black transition-all duration-300 ${
              form.isBoss ? 'bg-neo-accent' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`absolute top-0 w-5 h-5 bg-white border-2 border-neo-black rounded-sm transition-transform duration-300 ${
                form.isBoss ? 'translate-x-7' : 'translate-x-0.5'
              }`}
              style={{ top: '1px' }}
            />
          </button>
        </div>

        {/* Mood, Energy & Anxiety */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold uppercase text-neo-black mb-2">
              Mood: <span className="text-neo-cha">{MOOD_LABELS[form.mood - 1]}</span>
            </label>
            <div className="flex gap-1">
              {MOOD_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ ...form, mood: (i + 1) as NonNullable<Activity['mood']> })}
                  className={`flex-1 py-1.5 rounded-md text-center text-lg transition-all duration-150 border-2 border-neo-black ${
                    form.mood === i + 1 ? 'bg-neo-cha shadow-neo -translate-y-0.5' : 'bg-white opacity-60 hover:opacity-80'
                  }`}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase text-neo-black mb-2">
              Energy: <span className="text-neo-xp">{ENERGY_LABELS[form.energyLevel - 1]}</span>
            </label>
            <div className="flex gap-1">
              {ENERGY_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ ...form, energyLevel: (i + 1) as NonNullable<Activity['energyLevel']> })}
                  className={`flex-1 py-1.5 rounded-md text-center text-lg transition-all duration-150 border-2 border-neo-black ${
                    form.energyLevel === i + 1 ? 'bg-neo-xp shadow-neo -translate-y-0.5' : 'bg-white opacity-60 hover:opacity-80'
                  }`}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase text-neo-black mb-2">
              Anxiety: <span className="text-neo-wis">{ANXIETY_LABELS[form.anxietyLevel - 1]}</span>
            </label>
            <div className="flex gap-1">
              {ANXIETY_LABELS.map((label, i) => (
                <button
                  key={`anxiety-${i}`}
                  type="button"
                  onClick={() => setForm({ ...form, anxietyLevel: (i + 1) as NonNullable<Activity['anxietyLevel']> })}
                  className={`flex-1 py-1.5 rounded-md text-center text-lg transition-all duration-150 border-2 border-neo-black ${
                    form.anxietyLevel === i + 1 ? 'bg-neo-wis shadow-neo -translate-y-0.5' : 'bg-white opacity-60 hover:opacity-80'
                  }`}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* XP Preview */}
        <div className={`bg-neo-bg rounded-md px-4 py-3 border-4 ${previewXP < 0 ? 'border-neo-accent' : 'border-neo-black'} flex items-center justify-between`}>
          <span className="text-sm font-bold uppercase text-neutral-500">Estimated XP</span>
          <span className={`text-2xl font-bold ${previewXP < 0 ? 'text-neo-accent' : 'text-neo-xp'} ${!reducedMotion ? 'animate-xp-pop' : ''}`} key={previewXP}>
            {previewXP < 0 ? '' : '+'}{previewXP}
          </span>
        </div>

        {/* Submit */}
        <NeoButton
          type="submit"
          disabled={submitting || !form.questName.trim()}
          variant="danger"
          size="lg"
          className="w-full"
        >
          {submitting ? '⏳ Logging...' : '🗡️ Complete Quest'}
        </NeoButton>
      </form>
    </NeoCard>
  )
}
