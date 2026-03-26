import { useState } from 'react'
import AudioPlayer from '../AudioPlayer'
import type { Shloka } from '../../types'
import { Eye, BrainCircuit } from 'lucide-react'

interface SelfRateProps {
  shloka: Shloka
  onResult: (rating: number) => void
}

const RATINGS = [
  { value: 1, label: 'Blank', desc: 'Complete blackout', color: 'bg-accent-red/10 border-accent-red/30 text-accent-red hover:bg-accent-red/20' },
  { value: 2, label: 'Hard', desc: 'Barely recalled', color: 'bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20' },
  { value: 3, label: 'Okay', desc: 'Recalled with effort', color: 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20' },
  { value: 4, label: 'Good', desc: 'Recalled correctly', color: 'bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50] hover:bg-[#4CAF50]/20' },
  { value: 5, label: 'Perfect', desc: 'Instant recall', color: 'bg-accent-green/10 border-accent-green/30 text-accent-green hover:bg-accent-green/20' },
]

export default function SelfRate({ shloka, onResult }: SelfRateProps) {
  const [revealed, setRevealed] = useState(false)

  const lines = shloka.sanskrit.split('\n').filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-accent-purple/10 text-accent-purple rounded-full mb-4">
          <BrainCircuit size={24} />
        </div>
        <p className="text-secondary text-sm font-medium">
          Listen to the first line, then recite the rest from memory
        </p>
      </div>

      {/* Audio cue — first line only hint */}
      <div className="bg-surface border border-border/60 shadow-sm rounded-3xl p-5 space-y-4">
        <p className="font-devanagari text-2xl text-accent-purple text-center leading-loose">
          {lines[0]}
        </p>
        <AudioPlayer src={shloka.audioPath} compact />
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full bg-elevated border border-border text-primary font-medium px-6 py-4 rounded-2xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 hover:border-accent-purple hover:bg-surface"
        >
          <Eye size={18} className="text-accent-purple" /> Show Full Verse
        </button>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Full verse reveal */}
          <div className="bg-surface border border-border shadow-sm rounded-3xl p-6 text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold" />
            {lines.map((line, i) => (
              <p key={i} className={`font-devanagari text-xl leading-[1.8] ${i === 0 ? 'text-accent-purple font-medium' : 'text-primary'}`}>
                {line}
              </p>
            ))}
          </div>

          {/* Rating buttons */}
          <div className="bg-surface border border-border/60 rounded-3xl p-5 shadow-sm">
            <p className="text-primary font-medium text-sm text-center mb-4">How well did you recall it?</p>
            <div className="grid grid-cols-5 gap-2">
              {RATINGS.map(r => (
                <button
                  key={r.value}
                  onClick={() => onResult(r.value)}
                  className={`border rounded-2xl py-3 px-1 text-center transition-all duration-200 active:scale-95 flex flex-col items-center gap-1 ${r.color}`}
                  title={r.desc}
                >
                  <span className="font-serif font-bold text-xl leading-none">{r.value}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}