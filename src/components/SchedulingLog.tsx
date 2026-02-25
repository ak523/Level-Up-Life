import React, { useState } from 'react'
import { useGameStore } from '../state/useGameStore'
import type { Activity, ScheduledTask } from '../types'
import { NeoCard, NeoButton } from './neo'

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
      <NeoCard>
        <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
          <span>📅</span> Schedule a Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase text-neo-black mb-1">Task Name</label>
            <input
              type="text"
              value={form.questName}
              onChange={(e) => setForm({ ...form, questName: e.target.value })}
              placeholder="What are you planning?"
              className="w-full bg-white border-4 border-neo-black rounded-md px-3 py-2 text-neo-black placeholder-neutral-400 focus:outline-none focus:shadow-neo-md focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-neo-black mb-2">Domain</label>
            <div className="flex gap-2 flex-wrap">
              {DOMAINS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setForm({ ...form, domain: d.value })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border-4 border-neo-black text-sm font-bold uppercase transition-all duration-150 ${
                    form.domain === d.value
                      ? 'bg-neo-xp text-neo-black shadow-neo -translate-x-0.5 -translate-y-0.5'
                      : 'bg-white text-neutral-500 hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5'
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
              <label className="block text-sm font-bold uppercase text-neo-black mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-white border-4 border-neo-black rounded-md px-3 py-2 text-neo-black focus:outline-none focus:shadow-neo-md focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-neo-black mb-1">Expected Completion</label>
              <input
                type="date"
                value={form.expectedCompletionDate}
                onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })}
                min={form.startDate}
                className="w-full bg-white border-4 border-neo-black rounded-md px-3 py-2 text-neo-black focus:outline-none focus:shadow-neo-md focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                required
              />
            </div>
          </div>

          <NeoButton
            type="submit"
            disabled={submitting || !form.questName.trim() || !form.expectedCompletionDate}
            variant="danger"
            size="md"
            className="w-full"
          >
            {submitting ? '⏳ Scheduling...' : '📌 Schedule Task'}
          </NeoButton>
        </form>
      </NeoCard>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <NeoCard>
          <h3 className="text-lg font-bold uppercase mb-3 flex items-center gap-2">
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
        </NeoCard>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <NeoCard>
          <h3 className="text-lg font-bold uppercase mb-3 flex items-center gap-2">
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
        </NeoCard>
      )}

      {activeTasks.length === 0 && upcomingTasks.length === 0 && (
        <NeoCard>
          <div className="text-center text-neutral-500">
            <div className="text-4xl mb-2">📅</div>
            <p className="font-bold uppercase">No scheduled tasks yet. Plan ahead!</p>
          </div>
        </NeoCard>
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
  task: ScheduledTask
  onComplete: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 bg-neo-bg border-2 border-neo-black rounded-md px-3 py-2 text-sm">
      <span className="text-lg">{DOMAIN_ICONS[task.domain] ?? '⭐'}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-neo-black truncate">{task.questName}</div>
        <div className="text-xs font-bold text-neutral-500">
          {task.startDate} → {task.expectedCompletionDate}
          {task.status === 'active' && <span className="ml-1 text-neo-vit">● Active</span>}
          {task.status === 'upcoming' && <span className="ml-1 text-neo-orange">● Upcoming</span>}
        </div>
      </div>
      <button
        onClick={onComplete}
        className="text-neo-vit hover:scale-110 transition-transform p-1 font-bold"
        aria-label="Complete task"
        title="Mark as done"
      >
        ✅
      </button>
      <button
        onClick={onRemove}
        className="text-neo-accent hover:scale-110 transition-transform p-1 font-bold"
        aria-label="Remove task"
        title="Remove"
      >
        🗑️
      </button>
    </div>
  )
}
