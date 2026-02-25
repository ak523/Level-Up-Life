import { useGameStore } from '../state/useGameStore'
import { useUIStore } from '../state/useUIStore'
import { XPBar } from './XPBar'
import { AttributeBar } from './AttributeBar'
import { StreakBadge } from './StreakBadge'
import { DailyNudge } from './DailyNudge'
import { NeoCard } from './neo'

const ATTR_CONFIG = [
  { key: 'INT', label: 'Intelligence', icon: '🧠', color: '#3B82F6' },
  { key: 'WIS', label: 'Wisdom', icon: '📖', color: '#A855F7' },
  { key: 'CHA', label: 'Charisma', icon: '💬', color: '#EC4899' },
  { key: 'VIT', label: 'Vitality', icon: '❤️', color: '#22C55E' },
  { key: 'GOLD', label: 'Gold', icon: '💰', color: '#FACC15' },
] as const

const DOMAIN_ICONS: Record<string, string> = {
  learning: '📚',
  wellbeing: '💪',
  finance: '💰',
  social: '🤝',
  misc: '⭐',
  bad_habit: '💀',
}

const MOOD_ICONS = ['😞', '😕', '😐', '🙂', '😄']
const ENERGY_ICONS = ['🪫', '😴', '⚡', '🔥', '🚀']
const ANXIETY_ICONS = ['😌', '😊', '😐', '😰', '😱']

export function Dashboard() {
  const { meta, recentActivities } = useGameStore()
  const { reducedMotion } = useUIStore()

  if (!meta) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DailyNudge />

      <NeoCard>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase text-neo-black">
              🧙 Hero
            </h2>
            <p className="text-neutral-500 text-sm font-bold">Total XP: {meta.totalXP.toLocaleString()}</p>
          </div>
          <StreakBadge streakDays={meta.streakDays} reducedMotion={reducedMotion} />
        </div>
        <XPBar totalXP={meta.totalXP} level={meta.currentLevel} />
      </NeoCard>

      <NeoCard>
        <h3 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
          <span>📊</span> Attributes
        </h3>
        <div className="space-y-3">
          {ATTR_CONFIG.map((attr) => (
            <AttributeBar
              key={attr.key}
              name={attr.label}
              value={meta.attributes[attr.key]}
              color={attr.color}
              icon={attr.icon}
            />
          ))}
        </div>
      </NeoCard>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Streak Freezes"
          value={meta.streakFreezeCount}
          icon="🧊"
          color="text-neo-xp"
        />
        <StatCard
          label="Critical Hits"
          value={meta.criticalSuccessCount}
          icon="✨"
          color="text-neo-gold"
        />
        <StatCard
          label="Difficulty"
          value={meta.expectedDifficulty.toFixed(1)}
          icon="⚖️"
          color="text-neo-wis"
        />
      </div>

      {recentActivities.length > 0 && (
        <NeoCard>
          <h3 className="text-lg font-bold uppercase mb-4 flex items-center gap-2">
            <span>📜</span> Recent Quests
          </h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 10).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 bg-neo-bg border-2 border-neo-black rounded-md px-3 py-2 text-sm"
              >
                <span className="text-lg">{DOMAIN_ICONS[a.domain]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-neo-black truncate">{a.questName}</div>
                  <div className="text-xs text-neutral-500">
                    {a.date} · {a.durationMinutes}m
                    {a.mood != null && <span title={`Mood: ${a.mood}/5`}> · {MOOD_ICONS[a.mood - 1]}</span>}
                    {a.energyLevel != null && <span title={`Energy: ${a.energyLevel}/5`}> · {ENERGY_ICONS[a.energyLevel - 1]}</span>}
                    {a.anxietyLevel != null && <span title={`Anxiety: ${a.anxietyLevel}/5`}> · {ANXIETY_ICONS[a.anxietyLevel - 1]}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${a.finalXP < 0 ? 'text-neo-accent' : 'text-neo-xp'}`}>
                    {a.finalXP < 0 ? '' : '+'}{a.finalXP}
                  </div>
                  <div className="text-xs text-neutral-500">{a.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </NeoCard>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white border-4 border-neo-black rounded-md p-3 text-center shadow-neo">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs font-bold uppercase text-neutral-500">{label}</div>
    </div>
  )
}
