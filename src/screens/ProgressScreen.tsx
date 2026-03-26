import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { today } from '../lib/srs'
import { exportData, importData } from '../lib/db'
import { Download, Upload, TrendingUp, Award, Flame } from 'lucide-react'

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function ProgressScreen() {
  const { shlokas, progress, settings, sessions } = useAppStore()

  const todayStr = today()

  // Build 53-day calendar
  const calendarDays = useMemo(() => {
    const startDate = addDays(todayStr, -(settings.currentDay - 1))
    return Array.from({ length: 53 }, (_, i) => {
      const date = addDays(startDate, i)
      const dayNum = i + 1
      const session = sessions.find(s => s.date === date && s.completed)
      const isFuture = date > todayStr
      const isToday = date === todayStr
      return { date, dayNum, done: !!session, isFuture, isToday }
    })
  }, [sessions, settings.currentDay, todayStr])

  // Mastery distribution
  const masteryDist = [0, 1, 2, 3, 4, 5].map(level => ({
    level,
    count: Object.values(progress).filter(p => p.masteryLevel === level).length,
  }))

  const handleExport = async () => {
    const json = await exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gita-sadhana-backup-${todayStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        await importData(text)
        window.location.reload()
      } catch {
        alert('Invalid backup file')
      }
    }
    input.click()
  }

  const learnedCount = Object.values(progress).filter(p => p.masteryLevel > 0).length
  const masteredCount = Object.values(progress).filter(p => p.masteryLevel >= 4).length

  return (
    <div className="flex flex-col pb-24 px-5 pt-8 max-w-lg mx-auto space-y-8">
      <h1 className="text-primary font-serif font-semibold text-3xl">Insights</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-border">
          <Flame size={20} className="text-accent-gold mb-1.5" />
          <p className="text-primary font-serif font-bold text-2xl leading-none">{settings.streakCount}</p>
          <p className="text-muted text-[10px] uppercase tracking-wider font-semibold mt-1">Streak</p>
        </div>
        <div className="bg-surface rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-border">
          <TrendingUp size={20} className="text-accent-blue mb-1.5" />
          <p className="text-primary font-serif font-bold text-2xl leading-none">{learnedCount}</p>
          <p className="text-muted text-[10px] uppercase tracking-wider font-semibold mt-1">Learned</p>
        </div>
        <div className="bg-surface rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-border">
          <Award size={20} className="text-accent-purple mb-1.5" />
          <p className="text-primary font-serif font-bold text-2xl leading-none">{masteredCount}</p>
          <p className="text-muted text-[10px] uppercase tracking-wider font-semibold mt-1">Mastered</p>
        </div>
      </div>

      {/* 53-day heatmap */}
      <div>
        <h2 className="font-serif text-2xl text-primary font-medium mb-4 px-1">53-Day Journey</h2>
        <div className="card">
          <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
            {calendarDays.map(({ dayNum, done, isFuture, isToday }) => (
              <div
                key={dayNum}
                title={`Day ${dayNum}`}
                className={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                  isFuture
                    ? 'bg-elevated/50 text-muted border border-transparent'
                    : done
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                    : isToday
                    ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold shadow-[0_0_10px_rgba(244,185,66,0.3)]'
                    : 'bg-accent-red/10 text-accent-red border border-transparent'
                }`}
              >
                {dayNum}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-5 mt-5 text-xs text-secondary font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-green/40 border border-accent-green/50"/>Done</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-red/30 border border-accent-red/20"/>Missed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-elevated border border-border"/>Future</span>
          </div>
        </div>
      </div>

      {/* Mastery distribution */}
      <div>
        <h2 className="font-serif text-2xl text-primary font-medium mb-4 px-1">Mastery Distribution</h2>
        <div className="card space-y-3.5">
          {masteryDist.map(({ level, count }) => {
            const pct = shlokas.length > 0 ? (count / shlokas.length) * 100 : 0
            const labels = ['New', 'Introduced', 'Familiar', 'Learning', 'Proficient', 'Mastered']
            const colors = ['bg-border', 'bg-accent-red', 'bg-accent-gold', 'bg-[#D4A373]', 'bg-accent-blue', 'bg-accent-green']
            return (
              <div key={level} className="flex items-center gap-3">
                <span className="text-secondary text-xs font-medium w-20 shrink-0">{labels[level]}</span>
                <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${colors[level]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-primary font-semibold text-xs w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chapter breakdown */}
      <div>
        <h2 className="font-serif text-2xl text-primary font-medium mb-4 px-1">By Chapter</h2>
        <div className="card space-y-3.5">
          {Array.from({ length: 18 }, (_, i) => i + 1).map(ch => {
            const chShlokas = shlokas.filter(s => s.chapter === ch)
            const learned = chShlokas.filter(s => (progress[s.id]?.masteryLevel ?? 0) > 0).length
            const pct = chShlokas.length > 0 ? (learned / chShlokas.length) * 100 : 0
            return (
              <div key={ch} className="flex items-center gap-3">
                <span className="text-secondary text-xs font-medium w-14 shrink-0">Ch. {ch}</span>
                <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-purple rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-primary font-semibold text-xs w-10 text-right">{learned}/{chShlokas.length}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Export / Import */}
      <div className="pt-4">
        <h2 className="font-serif text-2xl text-primary font-medium mb-4 px-1">Data</h2>
        <div className="card space-y-2 flex flex-col">
          <button 
            onClick={handleExport} 
            className="w-full bg-elevated hover:bg-border/30 text-primary rounded-2xl px-5 py-3.5 text-sm font-medium text-left flex items-center gap-3 transition-colors border border-border/50"
          >
            <Download size={18} className="text-accent-purple" />
            Export backup (JSON)
          </button>
          <button 
            onClick={handleImport} 
            className="w-full bg-elevated hover:bg-border/30 text-primary rounded-2xl px-5 py-3.5 text-sm font-medium text-left flex items-center gap-3 transition-colors border border-border/50"
          >
            <Upload size={18} className="text-accent-purple" />
            Import backup (JSON)
          </button>
        </div>
      </div>
    </div>
  )
}