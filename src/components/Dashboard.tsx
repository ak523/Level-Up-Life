import { useGameStore } from '../state/useGameStore'
import { useUIStore } from '../state/useUIStore'
import { XPBar } from './XPBar'
import { AttributeBar } from './AttributeBar'
import { StreakBadge } from './StreakBadge'
import { DailyNudge } from './DailyNudge'

const ATTR_CONFIG = [
  { key: 'INT', label: 'Intelligence', icon: '🧠', color: '#3b82f6' },
  { key: 'WIS', label: 'Wisdom', icon: '📖', color: '#8b5cf6' },
  { key: 'CHA', label: 'Charisma', icon: '💬', color: '#ec4899' },
  { key: 'VIT', label: 'Vitality', icon: '❤️', color: '#22c55e' },
  { key: 'GOLD', label: 'Gold', icon: '💰', color: '#f5a623' },
] as const

const DOMAIN_ICONS: Record<string, string> = {
  learning: '📚',
  wellbeing: '💪',
  finance: '💰',
  social: '🤝',
  misc: '⭐',
}

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

      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              🧙 Hero
            </h2>
            <p className="text-slate-400 text-sm">Total XP: {meta.totalXP.toLocaleString()}</p>
          </div>
          <StreakBadge streakDays={meta.streakDays} reducedMotion={reducedMotion} />
        </div>
        <XPBar totalXP={meta.totalXP} level={meta.currentLevel} />
      </div>

      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Streak Freezes"
          value={meta.streakFreezeCount}
          icon="🧊"
          color="text-cyan-400"
        />
        <StatCard
          label="Critical Hits"
          value={meta.criticalSuccessCount}
          icon="✨"
          color="text-yellow-400"
        />
        <StatCard
          label="Difficulty"
          value={meta.expectedDifficulty.toFixed(1)}
          icon="⚖️"
          color="text-purple-400"
        />
      </div>

      {recentActivities.length > 0 && (
        <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📜</span> Recent Quests
          </h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 10).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 bg-brand-bg rounded-lg px-3 py-2 text-sm hover:bg-brand-card transition-colors"
              >
                <span className="text-lg">{DOMAIN_ICONS[a.domain]}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200 truncate">{a.questName}</div>
                  <div className="text-xs text-slate-500">{a.date} · {a.durationMinutes}m</div>
                </div>
                <div className="text-right">
                  <div className="text-brand-xp font-bold">+{a.finalXP}</div>
                  <div className="text-xs text-slate-500">{a.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-brand-surface border border-brand-card rounded-xl p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}
