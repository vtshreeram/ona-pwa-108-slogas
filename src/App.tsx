import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react'
import HomeScreen from './screens/HomeScreen'
import SessionScreen from './screens/SessionScreen'
import LibraryScreen from './screens/LibraryScreen'
import ProgressScreen from './screens/ProgressScreen'
import SettingsScreen from './screens/SettingsScreen'

type Tab = 'home' | 'library' | 'progress' | 'settings'

export default function App() {
  const { init, initialized, settings } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [sessionDuration, setSessionDuration] = useState<15 | 30 | 60 | null>(null)

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (!initialized) return
    const root = window.document.documentElement
    
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
      root.classList.remove('light', 'dark')
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }

    applyTheme(settings.theme || 'system')
  }, [settings.theme, initialized])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-accent-purple border-t-transparent animate-spin" />
        <p className="text-muted text-sm">Loading Gita Sadhana…</p>
      </div>
    )
  }

  if (sessionDuration !== null) {
    return (
      <SessionScreen
        duration={sessionDuration}
        onComplete={() => { setSessionDuration(null); setActiveTab('home') }}
        onExit={() => setSessionDuration(null)}
      />
    )
  }

  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'library' as Tab, label: 'Library', icon: BookOpen },
    { id: 'progress' as Tab, label: 'Progress', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {activeTab === 'home' && <HomeScreen onStartSession={(d) => setSessionDuration(d)} />}
        {activeTab === 'library' && <LibraryScreen />}
        {activeTab === 'progress' && <ProgressScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)] dark:shadow-none z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex max-w-lg mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-4 transition-all duration-200 ${isActive ? 'text-accent-purple' : 'text-muted hover:text-secondary'}`}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-accent-purple' : 'text-muted'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}