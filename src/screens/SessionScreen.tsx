import { useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { buildSessionQueue, phasesForShloka, computeStreak } from '../lib/session'
import { calculateNextReview, recallQuality, recallModeForMastery, today } from '../lib/srs'
import type { SessionShloka, SessionPhase } from '../types'
import AudioPlayer from '../components/AudioPlayer'
import VerseDisplay from '../components/VerseDisplay'
import MCQ from '../components/recall/MCQ'
import FillBlank from '../components/recall/FillBlank'
import SelfRate from '../components/recall/SelfRate'
import { v4 as uuidv4 } from 'uuid'
import { X, ArrowRight, CheckCircle2 } from 'lucide-react'

interface SessionScreenProps {
  duration: 15 | 30 | 60
  onComplete: () => void
  onExit: () => void
}

interface PhaseResult {
  shlokaId: string
  quality: number
  mode: 'mcq' | 'fill' | 'self'
}

export default function SessionScreen({ duration, onComplete, onExit }: SessionScreenProps) {
  const { shlokas, progress, settings, sessions, updateProgress, updateSettings, addSession } = useAppStore()

  const [queue] = useState<SessionShloka[]>(() =>
    buildSessionQueue(shlokas, progress, settings, duration)
  )
  const [queueIdx, setQueueIdx] = useState(0)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [results, setResults] = useState<PhaseResult[]>([])
  const [sessionId] = useState(() => uuidv4())
  const [sessionStarted] = useState(() => new Date().toISOString())
  const [showSummary, setShowSummary] = useState(false)

  const currentItem = queue[queueIdx]
  const phases = currentItem ? phasesForShloka(currentItem.isNew) : []
  const currentPhase: SessionPhase = phases[phaseIdx] ?? 'listen'

  const totalPhases = queue.reduce((acc, item) => acc + phasesForShloka(item.isNew).length, 0)
  const completedPhases = queue.slice(0, queueIdx).reduce((acc, item) => acc + phasesForShloka(item.isNew).length, 0) + phaseIdx
  const progressPct = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0


  const handleRecallResult = useCallback(async (correct: boolean, selfRating?: number) => {
    if (!currentItem) return
    const mode = recallModeForMastery(currentItem.progress.masteryLevel)
    const quality = recallQuality(mode, correct, selfRating)
    const todayStr = today()

    const updated = calculateNextReview(quality, currentItem.progress, todayStr)
    updated.recallHistory = [
      ...updated.recallHistory,
      { date: todayStr, quality, mode },
    ]
    await updateProgress(updated)

    setResults(r => [...r, { shlokaId: currentItem.shloka.id, quality, mode }])
    setTimeout(advancePhase, 800)
  }, [currentItem, updateProgress, advancePhase])

  const finishSession = useCallback(async () => {
    const todayStr = today()
    const session = {
      id: sessionId,
      date: todayStr,
      duration,
      shlokasCovered: queue.map(q => q.shloka.id),
      completed: true,
      startedAt: sessionStarted,
      completedAt: new Date().toISOString(),
    }
    await addSession(session)

    const allSessions = [...sessions, session]
    const { current, longest } = computeStreak(allSessions)
    const newDay = settings.currentDay <= 54 ? settings.currentDay + 1 : settings.currentDay
    await updateSettings({
      streakCount: current,
      longestStreak: Math.max(longest, settings.longestStreak),
      lastSessionDate: todayStr,
      currentDay: newDay,
    })

    setShowSummary(true)
  }, [queue, sessions, settings, sessionId, sessionStarted, duration, addSession, updateSettings])

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-5xl text-accent-green mb-4"><CheckCircle2 size={64} strokeWidth={1.5} /></div>
        <h2 className="text-primary font-serif font-medium text-3xl text-center">Nothing due today</h2>
        <p className="text-secondary text-center text-sm max-w-[250px]">All shlokas are up to date. Come back tomorrow for your next practice!</p>
        <button onClick={onExit} className="btn-primary mt-4 w-full max-w-[200px]">Back to Home</button>
      </div>
    )
  }

  if (showSummary) {
    const avgQuality = results.length > 0
      ? (results.reduce((a, b) => a + b.quality, 0) / results.length).toFixed(1)
      : '—'
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 px-6 max-w-lg mx-auto">
        <div className="text-accent-purple bg-accent-purple/10 p-6 rounded-full">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-primary font-serif font-medium text-3xl text-center">Session Complete</h2>
        <div className="w-full card space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-secondary font-medium">Shlokas covered</span>
            <span className="text-primary font-serif font-medium text-xl">{queue.length}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-secondary font-medium">Recall score</span>
            <span className="text-primary font-serif font-medium text-xl">{avgQuality} / 5</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-secondary font-medium">Streak</span>
            <span className="text-accent-gold font-serif font-medium text-xl">{settings.streakCount + 1} days</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-secondary font-medium">Duration</span>
            <span className="text-primary font-serif font-medium text-xl">{duration} min</span>
          </div>
        </div>
        <button onClick={onComplete} className="btn-primary w-full mt-4">Return Home</button>
      </div>
    )
  }

  if (!currentItem) return null

  const { shloka } = currentItem
  const lines = shloka.sanskrit.split('\n').filter(Boolean)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-5 pt-safe pt-6 pb-4 bg-surface sticky top-0 z-20 border-b border-border shadow-sm">
        <button onClick={onExit} className="text-secondary hover:text-primary transition-colors p-1 -ml-1">
          <X size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-primary font-serif font-medium text-lg tracking-tight">
              BG {shloka.verseRange}
            </p>
            <span className="text-muted text-xs font-semibold">{queueIdx + 1} / {queue.length}</span>
          </div>
          <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-purple rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-1.5 px-5 py-3">
        {phases.map((ph, i) => {
          const isPast = i < phaseIdx
          const isCurrent = i === phaseIdx
          return (
            <div
              key={ph}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                isPast ? 'bg-accent-purple' : isCurrent ? 'bg-accent-purple/50' : 'bg-border'
              }`}
            />
          )
        })}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-purple">
            Step {phaseIdx + 1} • {currentPhase}
          </span>
        </div>

        {/* Listen phase */}
        {currentPhase === 'listen' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <VerseDisplay shloka={shloka} />
            <AudioPlayer src={shloka.audioPath} lines={lines} />
          </div>
        )}

        {/* Repeat phase */}
        {currentPhase === 'repeat' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <VerseDisplay shloka={shloka} showTransliteration />
            <AudioPlayer src={shloka.audioPath} lines={lines} />
            <p className="text-secondary text-sm text-center font-medium bg-surface p-4 rounded-2xl border border-border shadow-sm">
              Enable Line mode and repeat each line aloud during the pause
            </p>
          </div>
        )}

        {/* Understand phase */}
        {currentPhase === 'understand' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <VerseDisplay shloka={shloka} showSynonyms showTranslation />
            <AudioPlayer src={shloka.audioPath} compact />
          </div>
        )}

        {/* Recall phase */}
        {currentPhase === 'recall' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {(() => {
              const mode = recallModeForMastery(currentItem.progress.masteryLevel)
              if (mode === 'mcq') {
                return (
                  <MCQ
                    shloka={shloka}
                    allShlokas={shlokas}
                    onResult={correct => handleRecallResult(correct)}
                  />
                )
              }
              if (mode === 'fill') {
                return (
                  <FillBlank
                    shloka={shloka}
                    onResult={correct => handleRecallResult(correct)}
                  />
                )
              }
              return (
                <SelfRate
                  shloka={shloka}
                  onResult={rating => handleRecallResult(rating >= 3, rating)}
                />
              )
            })()}
          </div>
        )}
      </div>

      {/* Bottom action — shown for non-recall phases */}
      {currentPhase !== 'recall' && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-safe pb-6 pt-6 bg-gradient-to-t from-base via-base to-transparent z-10">
          <button onClick={advancePhase} className="btn-primary w-full max-w-lg mx-auto">
            {currentPhase === 'listen' && 'Next step'}
            {currentPhase === 'repeat' && 'Done repeating'}
            {currentPhase === 'understand' && 'I understand'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}