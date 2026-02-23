import React, { useState } from 'react'
import { useGameStore } from '../state/useGameStore'
import type { Activity } from '../types'

const DOMAINS: Array<{ value: Activity['domain']; label: string; icon: string }> = [
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'wellbeing', label: 'Wellbeing', icon: '💪' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'social', label: 'Social', icon: '🤝' },
  { value: 'misc', label: 'Misc', icon: '⭐' },
]

export function SchedulingLog() {
  const { scheduledTasks, addScheduledTask, completeScheduledTask, removeScheduledTask } = useGameStore()
  const [form, setForm] = useState({
    questName: '',
    domain: 'learning' as Activity['domain'],
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.questName.trim() || !form.expectedCompletionDate) return
    setSubmitting(true)
    try {
      await addScheduledTask(form)
      setForm({
        questName: '',
        domain: 'learning',
        startDate: new Date().toISOString().split('T')[0],
        expectedCompletionDate: '',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const activeTasks = scheduledTasks.filter((t) => t.status === 'active')
  const upcomingTasks = scheduledTasks.filter((t) => t.status === 'upcoming')

  return (
    <div className="space-y-4">
      {/* Add Task Form */}
      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📅</span> Schedule a Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Task Name</label>
            <input
              type="text"
              value={form.questName}
              onChange={(e) => setForm({ ...form, questName: e.target.value })}
              placeholder="What are you planning?"
              className="w-full bg-brand-bg border border-brand-card rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Domain</label>
            <div className="flex gap-2 flex-wrap">
              {DOMAINS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setForm({ ...form, domain: d.value })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    form.domain === d.value
                      ? 'bg-brand-accent/20 border-brand-accent text-white'
                      : 'bg-brand-bg border-brand-card text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span>{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-brand-bg border border-brand-card rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-accent transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Expected Completion</label>
              <input
                type="date"
                value={form.expectedCompletionDate}
                onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })}
                min={form.startDate}
                className="w-full bg-brand-bg border border-brand-card rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-accent transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.questName.trim() || !form.expectedCompletionDate}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-accent to-red-600 text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all duration-200"
          >
            {submitting ? '⏳ Scheduling...' : '📌 Schedule Task'}
          </button>
        </form>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span>🔥</span> Active Tasks
          </h3>
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={() => completeScheduledTask(task.id!)}
                onRemove={() => removeScheduledTask(task.id!)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span>📋</span> Upcoming Tasks
          </h3>
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onComplete={() => completeScheduledTask(task.id!)}
                onRemove={() => removeScheduledTask(task.id!)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTasks.length === 0 && upcomingTasks.length === 0 && (
        <div className="bg-brand-surface border border-brand-card rounded-2xl p-6 text-center text-slate-400">
          <div className="text-4xl mb-2">📅</div>
          <p>No scheduled tasks yet. Plan ahead!</p>
        </div>
      )}
    </div>
  )
}

const DOMAIN_ICONS: Record<string, string> = {
  learning: '📚',
  wellbeing: '💪',
  finance: '💰',
  social: '🤝',
  misc: '⭐',
  bad_habit: '💀',
}

function TaskRow({
  task,
  onComplete,
  onRemove,
}: {
  task: { id?: number; questName: string; domain: string; startDate: string; expectedCompletionDate: string; status: string }
  onComplete: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 bg-brand-bg rounded-lg px-3 py-2 text-sm">
      <span className="text-lg">{DOMAIN_ICONS[task.domain] ?? '⭐'}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 truncate">{task.questName}</div>
        <div className="text-xs text-slate-500">
          {task.startDate} → {task.expectedCompletionDate}
          {task.status === 'active' && <span className="ml-1 text-green-400">● Active</span>}
          {task.status === 'upcoming' && <span className="ml-1 text-yellow-400">● Upcoming</span>}
        </div>
      </div>
      <button
        onClick={onComplete}
        className="text-green-400 hover:text-green-300 transition-colors p-1"
        aria-label="Complete task"
        title="Mark as done"
      >
        ✅
      </button>
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-300 transition-colors p-1"
        aria-label="Remove task"
        title="Remove"
      >
        🗑️
      </button>
    </div>
  )
}
