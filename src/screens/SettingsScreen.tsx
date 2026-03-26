import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { resetProgress } from '../lib/db'
import { CheckCircle2, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react'

const TRANSLATORS = [
  { id: '16', name: 'Swami Prabhupada' },
  { id: '1',  name: 'Swami Sivananda' },
  { id: '2',  name: 'Swami Gambirananda' },
  { id: '3',  name: 'Swami Adidevananda' },
  { id: '17', name: 'Purohit Swami' },
  { id: '14', name: 'Dr. S. Sankaranarayan' },
]

export default function SettingsScreen() {
  const { settings, updateSettings } = useAppStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (patch: Parameters<typeof updateSettings>[0]) => {
    await updateSettings(patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleReset = async () => {
    await resetProgress()
    window.location.reload()
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications not supported in this browser')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      await save({ reminderEnabled: true })
    } else {
      alert('Notification permission denied')
    }
  }

  return (
    <div className="flex flex-col pb-24 px-5 pt-8 max-w-lg mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-primary font-serif font-semibold text-3xl">Settings</h1>
        {saved && (
          <span className="flex items-center gap-1.5 text-accent-green text-sm font-medium bg-accent-green/10 px-3 py-1.5 rounded-full animate-in fade-in duration-300">
            <CheckCircle2 size={16} /> Saved
          </span>
        )}
      </div>

      {/* Appearance */}
      <div className="card space-y-4">
        <p className="section-label">Appearance</p>
        <div className="grid grid-cols-3 gap-2 p-1 bg-elevated rounded-2xl border border-border">
          {(['light', 'dark', 'system'] as const).map(t => {
            const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor
            const isActive = settings.theme === t
            return (
              <button
                key={t}
                onClick={() => save({ theme: t })}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-surface shadow-sm text-primary font-medium' 
                    : 'text-secondary hover:bg-surface/50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-accent-purple' : 'text-muted'} />
                <span className="text-[11px] capitalize tracking-wide">{t}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Translator */}
      <div className="card space-y-3">
        <p className="section-label">Default Translator</p>
        <div className="space-y-2">
          {TRANSLATORS.map(t => {
            const isActive = settings.preferredTranslator === t.id
            return (
              <button
                key={t.id}
                onClick={() => save({ preferredTranslator: t.id })}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-purple/10 border-accent-purple/20 border text-accent-purple'
                    : 'bg-elevated border border-transparent text-primary hover:border-border'
                }`}
              >
                <span className={`text-sm font-medium`}>
                  {t.name}
                </span>
                {isActive && <CheckCircle2 size={18} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Audio & Display */}
      <div className="card space-y-5">
        <p className="section-label">Preferences</p>
        
        <div className="flex items-center justify-between">
          <span className="text-primary font-medium text-sm">Audio speed</span>
          <div className="flex gap-1.5 bg-elevated p-1 rounded-xl border border-border">
            {(['normal', 'slow'] as const).map(s => (
              <button
                key={s}
                onClick={() => save({ defaultSpeed: s })}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  settings.defaultSpeed === s 
                    ? 'bg-surface shadow-sm text-primary' 
                    : 'text-secondary'
                }`}
              >
                {s === 'normal' ? '1×' : '¾×'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-px bg-border -mx-5" />

        <div className="flex items-center justify-between">
          <span className="text-primary font-medium text-sm">Show transliteration</span>
          <button
            onClick={() => save({ showTransliteration: !settings.showTransliteration })}
            className={`w-12 h-6 rounded-full transition-colors duration-300 relative border ${
              settings.showTransliteration 
                ? 'bg-accent-green border-accent-green' 
                : 'bg-elevated border-border'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white transition-transform duration-300 shadow-sm ${
              settings.showTransliteration ? 'translate-x-[24px]' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Reminder */}
      <div className="card space-y-4">
        <p className="section-label">Daily Reminder</p>
        <div className="flex items-center justify-between">
          <span className="text-primary font-medium text-sm">Enable reminder</span>
          <button
            onClick={() => {
              if (!settings.reminderEnabled) {
                requestNotificationPermission()
              } else {
                save({ reminderEnabled: false })
              }
            }}
            className={`w-12 h-6 rounded-full transition-colors duration-300 relative border ${
              settings.reminderEnabled 
                ? 'bg-accent-purple border-accent-purple' 
                : 'bg-elevated border-border'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white transition-transform duration-300 shadow-sm ${
              settings.reminderEnabled ? 'translate-x-[24px]' : 'translate-x-0'
            }`} />
          </button>
        </div>
        {settings.reminderEnabled && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-secondary text-sm font-medium">Reminder time</span>
            <input
              type="time"
              value={settings.reminderTime ?? '07:00'}
              onChange={e => save({ reminderTime: e.target.value })}
              className="bg-elevated text-primary text-sm font-medium rounded-xl px-3 py-2 outline-none border border-border focus:border-accent-purple transition-colors"
            />
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="card space-y-4 border-accent-red/20 bg-accent-red/5">
        <p className="section-label text-accent-red flex items-center gap-1.5"><AlertTriangle size={14} /> Danger Zone</p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full bg-surface hover:bg-accent-red hover:text-white border border-accent-red/30 text-accent-red rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors"
          >
            Reset all progress
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-300">
            <p className="text-secondary text-sm">This will delete all your progress and session history. This action cannot be undone. Are you absolutely sure?</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="flex-1 bg-accent-red text-white rounded-xl py-3 text-sm font-semibold active:scale-95 transition-transform">
                Yes, reset
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 bg-surface border border-border text-primary rounded-xl py-3 text-sm font-medium active:scale-95 transition-transform">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="text-center space-y-1 pb-4">
        <p className="text-primary font-serif font-medium">Gita Sadhana</p>
        <p className="text-muted text-xs">v1.0.0</p>
        <p className="text-muted text-xs leading-relaxed max-w-[250px] mx-auto mt-4">
          Data courtesy of <a href="https://github.com/gita/gita" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline">gita/gita</a>.
          Translations by A.C. Bhaktivedanta Swami Prabhupada and others.
        </p>
      </div>
    </div>
  )
}