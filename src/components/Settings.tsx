import React, { useRef } from 'react'
import { useUIStore } from '../state/useUIStore'
import { exportData, importData } from '../data/repositories/exportImport'

export function Settings() {
  const { soundEnabled, reducedMotion, toggleSound, toggleReducedMotion } = useUIStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = React.useState('')

  const handleExport = async () => {
    try {
      const json = await exportData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `level-up-life-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatusMessage('✅ Data exported successfully!')
    } catch {
      setStatusMessage('❌ Export failed.')
    }
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importData(text)
      setStatusMessage('✅ Data imported! Refresh to see changes.')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setStatusMessage(`❌ Import failed: ${err instanceof Error ? err.message : 'Invalid file'}`)
    }
    setTimeout(() => setStatusMessage(''), 5000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>⚙️</span> Settings
        </h2>

        <div className="space-y-4">
          <ToggleRow
            label="Sound Effects"
            description="Button clicks, XP chimes, critical hits"
            icon="🔊"
            enabled={soundEnabled}
            onToggle={toggleSound}
          />
          <ToggleRow
            label="Reduced Motion"
            description="Disable animations for accessibility"
            icon="🎭"
            enabled={reducedMotion}
            onToggle={toggleReducedMotion}
          />
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><span>🔒</span> Privacy</h3>
        <p className="text-sm text-slate-400">
          <strong className="text-white">All data stays on this device.</strong> No analytics, no tracking,
          no backend. Your quests and progress are stored locally using IndexedDB.
        </p>
      </div>

      <div className="bg-brand-surface border border-brand-card rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><span>📦</span> Data Management</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-medium transition-all duration-200 hover:scale-[1.02]"
          >
            📤 Export JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-medium transition-all duration-200 hover:scale-[1.02]"
          >
            📥 Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {statusMessage && (
          <div className="mt-3 text-sm text-center text-slate-300 animate-slide-up">{statusMessage}</div>
        )}
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  icon,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  icon: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between bg-brand-bg rounded-xl px-4 py-3 border border-brand-card">
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-medium text-white">{label}</div>
          <div className="text-xs text-slate-400">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-brand-accent' : 'bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}
