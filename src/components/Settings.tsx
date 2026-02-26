import React, { useRef } from 'react'
import { useUIStore } from '../state/useUIStore'
import { useGameStore } from '../state/useGameStore'
import { exportData, importData } from '../data/repositories/exportImport'
import { updateGameMeta } from '../data/repositories/gameMetaRepo'
import { NeoCard, NeoButton, NeoInput } from './neo'
import type { TreasurySettings } from '../types'

const CURRENCY_OPTIONS = ['$', '€', '£', '¥', '₹', '₩', '₽', 'R$']

export function Settings() {
  const { soundEnabled, reducedMotion, toggleSound, toggleReducedMotion } = useUIStore()
  const { meta, loadData } = useGameStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = React.useState('')

  const treasurySettings: TreasurySettings = meta?.treasurySettings ?? {
    currencySymbol: '$',
    privacyMode: false,
    exchangeRate: 10,
  }

  const updateTreasurySetting = async (updates: Partial<TreasurySettings>) => {
    if (!meta) return
    const newSettings = { ...treasurySettings, ...updates }
    await updateGameMeta({ treasurySettings: newSettings })
    await loadData()
  }

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
      <NeoCard>
        <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
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
      </NeoCard>

      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-4 flex items-center gap-2"><span>💰</span> Treasury Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-neo-bg border-4 border-neo-black rounded-md px-4 py-3">
            <div>
              <div className="font-bold uppercase text-neo-black">Currency Symbol</div>
              <div className="text-xs font-bold text-neutral-500">Display currency for treasury</div>
            </div>
            <select
              value={treasurySettings.currencySymbol}
              onChange={(e) => updateTreasurySetting({ currencySymbol: e.target.value })}
              aria-label="Currency symbol"
              className="bg-white border-4 border-neo-black rounded-md px-3 py-1.5 font-bold text-neo-black"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <ToggleRow
            label="Privacy Mode"
            description="Blur financial numbers, show only percentages"
            icon="🔒"
            enabled={treasurySettings.privacyMode}
            onToggle={() => updateTreasurySetting({ privacyMode: !treasurySettings.privacyMode })}
          />

          <div className="bg-neo-bg border-4 border-neo-black rounded-md px-4 py-3">
            <div className="font-bold uppercase text-neo-black mb-1">Exchange Rate</div>
            <div className="text-xs font-bold text-neutral-500 mb-2">
              {treasurySettings.currencySymbol}{treasurySettings.exchangeRate} real = 1 In-Game GOLD
            </div>
            <NeoInput
              type="number"
              min="1"
              step="1"
              value={String(treasurySettings.exchangeRate)}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (!isNaN(val) && val > 0) updateTreasurySetting({ exchangeRate: val })
              }}
            />
          </div>
        </div>
      </NeoCard>

      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-2 flex items-center gap-2"><span>🔒</span> Privacy</h3>
        <p className="text-sm text-neutral-500">
          <strong className="text-neo-black">All data stays on this device.</strong> No analytics, no tracking,
          no backend. Your quests and progress are stored locally using IndexedDB.
        </p>
      </NeoCard>

      <NeoCard>
        <h3 className="font-bold uppercase text-lg mb-4 flex items-center gap-2"><span>📦</span> Data Management</h3>
        <div className="flex gap-3">
          <NeoButton
            onClick={handleExport}
            variant="primary"
            size="md"
            className="flex-1"
          >
            📤 Export JSON
          </NeoButton>
          <NeoButton
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            📥 Import JSON
          </NeoButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        {statusMessage && (
          <div className="mt-3 text-sm text-center font-bold text-neo-black animate-slide-up">{statusMessage}</div>
        )}
      </NeoCard>
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
    <div className="flex items-center justify-between bg-neo-bg border-4 border-neo-black rounded-md px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-bold uppercase text-neo-black">{label}</div>
          <div className="text-xs font-bold text-neutral-500">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-md border-4 border-neo-black transition-all duration-300 ${enabled ? 'bg-neo-vit' : 'bg-neutral-200'}`}
      >
        <span
          className={`absolute top-0 w-5 h-5 bg-white border-2 border-neo-black rounded-sm transition-transform duration-300 ${enabled ? 'translate-x-7' : 'translate-x-0.5'}`}
          style={{ top: '1px' }}
        />
      </button>
    </div>
  )
}
