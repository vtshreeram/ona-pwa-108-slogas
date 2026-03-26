import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { today } from '../lib/srs'
import { Play, CheckCircle2, Flame, BookOpen, ArrowRight, PlayCircle, TrendingUp, Award } from 'lucide-react'

const YT_PLAYLIST = 'https://www.youtube.com/watch?v=NcH9Iff4tYY&list=PLX0Ub3o9M5sIwlsm_qirzkwfDv2J7LHsV'
const CHAPTERS = Array.from({ length: 18 }, (_, i) => i + 1)

interface HomeScreenProps {
  onStartSession: (duration: 15 | 30 | 60) => void
}

export default function HomeScreen({ onStartSession }: HomeScreenProps) {
  const { shlokas, progress, settings, sessions } = useAppStore()
  const [showDurationPicker, setShowDurationPicker] = useState(false)

  const todayStr = today()
  const isMaintenance = settings.currentDay > 53
  const dayLabel = isMaintenance ? 'Maintenance' : `Day ${settings.currentDay} of 53`

  const learnedCount = Object.values(progress).filter(p => p.masteryLevel > 0).length
  const dueCount = Object.values(progress).filter(p => p.nextReviewDate <= todayStr && p.masteryLevel > 0).length
  const todayDone = sessions.some(s => s.date === todayStr && s.completed)

  const chapterProgress = CHAPTERS.map(ch => {
    const chShlokas = shlokas.filter(s => s.chapter === ch)
    const learned = chShlokas.filter(s => (progress[s.id]?.masteryLevel ?? 0) > 0).length
    return { ch, total: chShlokas.length, learned }
  })

  const progressPct = shlokas.length > 0 ? Math.round((learnedCount / shlokas.length) * 100) : 0

  return (
    <div className="flex flex-col gap-6 px-5 pt-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-secondary font-medium mb-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-primary font-serif font-semibold text-4xl tracking-tight">Today's vibe</h1>
        </div>
        <a
          href={YT_PLAYLIST}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-surface shadow-soft border border-border px-3 py-2 rounded-2xl text-xs font-medium text-secondary hover:text-accent-red transition-colors"
        >
          <PlayCircle size={16} className="text-accent-red" />
          Listen
        </a>
      </div>

      {/* Simplified & Compact Stats Bar */}
      <div className="bg-surface border border-border rounded-3xl p-2 flex items-center justify-around shadow-sm shadow-black/5">
        <div className="flex flex-col items-center flex-1 py-1 border-r border-border/50 last:border-0">
          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Progress</span>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-accent-blue" />
            <span className="text-primary font-serif font-bold text-lg leading-none">{progressPct}%</span>
          </div>
        </div>
        <div className="flex flex-col items-center flex-1 py-1 border-r border-border/50 last:border-0">
          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Streak</span>
          <div className="flex items-center gap-1">
            <Flame size={12} className="text-accent-gold" />
            <span className="text-primary font-serif font-bold text-lg leading-none">{settings.streakCount}</span>
          </div>
        </div>
        <div className="flex flex-col items-center flex-1 py-1 border-r border-border/50 last:border-0">
          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Learned</span>
          <div className="flex items-center gap-1">
            <Award size={12} className="text-accent-purple" />
            <span className="text-primary font-serif font-bold text-lg leading-none">{learnedCount}</span>
          </div>
        </div>
        <div className="flex flex-col items-center flex-1 py-1 last:border-0">
          <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Due</span>
          <div className="flex items-center gap-1">
            <BookOpen size={12} className="text-accent-purple" />
            <span className="text-primary font-serif font-bold text-lg leading-none">{dueCount}</span>
          </div>
        </div>
      </div>

      {/* Main Action Section */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-serif text-2xl text-primary font-medium">Practice</h2>
          <span className="text-xs font-medium text-muted uppercase tracking-widest">{dayLabel}</span>
        </div>

        <div className="card relative overflow-hidden group">
          {todayDone && (
            <div className="absolute top-4 right-4 text-accent-green bg-accent-green/10 p-2 rounded-full">
              <CheckCircle2 size={24} />
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="font-serif text-xl font-medium text-primary mb-1">
              {isMaintenance ? 'Maintenance Mode' : "Daily Sadhana"}
            </h3>
            <p className="text-secondary text-sm leading-relaxed">
              {isMaintenance
                ? 'Keep the flame alive with spaced repetition reviews.'
                : `Focusing on ${dueCount} reviews today. Consistency brings clarity.`}
            </p>
          </div>

          {!todayDone ? (
            !showDurationPicker ? (
              <button
                onClick={() => setShowDurationPicker(true)}
                className="btn-primary w-full"
              >
                Begin Session <ArrowRight size={18} />
              </button>
            ) : (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs font-medium text-muted uppercase tracking-widest text-center mb-1">Select Duration</p>
                {([15, 30, 60] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => onStartSession(d)}
                    className="flex items-center justify-between w-full bg-surface border border-border hover:border-accent-purple rounded-2xl px-5 py-4 transition-all duration-200"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-primary font-serif font-medium text-lg">{d} minutes</span>
                      <span className="text-secondary text-xs mt-0.5">
                        {d === 15 ? 'Reviews only' : d === 30 ? '1 new + reviews' : '2 new + reviews'}
                      </span>
                    </div>
                    <Play size={18} className="text-accent-purple" />
                  </button>
                ))}
                <button 
                  onClick={() => setShowDurationPicker(false)} 
                  className="w-full text-secondary text-sm font-medium py-3 mt-1 hover:text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            )
          ) : (
             <div className="bg-accent-green/10 text-accent-green rounded-2xl p-4 flex items-center justify-center gap-2 font-medium">
               <CheckCircle2 size={20} />
               Practice complete for today
             </div>
          )}
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="mt-2 mb-8">
        <h2 className="font-serif text-2xl text-primary font-medium mb-4 px-1">Chapters</h2>
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {chapterProgress.map(({ ch, total, learned }) => {
            const pct = total > 0 ? learned / total : 0
            const isComplete = pct === 1
            const inProgress = pct > 0 && pct < 1
            
            return (
              <div 
                key={ch} 
                className={`
                  rounded-2xl p-2.5 flex flex-col items-center justify-center aspect-square border transition-colors
                  ${isComplete ? 'bg-accent-green/10 border-accent-green/20' : 
                    inProgress ? 'bg-accent-gold/10 border-accent-gold/20' : 
                    'bg-surface border-border'}
                `}
              >
                <span className={`font-serif text-lg leading-none mb-1 ${isComplete ? 'text-accent-green' : inProgress ? 'text-accent-gold' : 'text-primary'}`}>
                  {ch}
                </span>
                <span className={`text-[10px] font-medium ${isComplete ? 'text-accent-green' : inProgress ? 'text-accent-gold' : 'text-muted'}`}>
                  {learned}/{total}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}