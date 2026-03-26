import { useState } from 'react'
import type { Shloka } from '../../types'
import { CheckCircle2, XCircle } from 'lucide-react'

interface MCQProps {
  shloka: Shloka
  allShlokas: Shloka[]
  onResult: (correct: boolean) => void
  isRoman?: boolean
}

export default function MCQ({ shloka, allShlokas, onResult, isRoman = false }: MCQProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const lines = isRoman ? shloka.transliteration.split('\n').filter(Boolean) : shloka.sanskrit.split('\n').filter(Boolean)
  const questionLine = lines[0]
  const correctAnswer = lines.slice(1).join('\n') || lines[0]

  const [options] = useState(() => {
    const others = allShlokas
      .filter(s => s.id !== shloka.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(s => {
        const otherLines = isRoman ? s.transliteration.split('\n').filter(Boolean) : s.sanskrit.split('\n').filter(Boolean)
        return otherLines.slice(1).join('\n') || otherLines[0]
      })

    const all = [
      { text: correctAnswer, correct: true },
      ...others.map(t => ({ text: t, correct: false })),
    ].sort(() => Math.random() - 0.5)

    return all
  })

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => onResult(options[idx].correct), 1200)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-secondary text-sm font-medium mb-4">Select the correct continuation</p>
        <div className="bg-surface shadow-sm border border-border/60 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent-purple" />
          <p className={`${isRoman ? 'font-serif text-xl italic' : 'font-devanagari text-2xl'} text-primary leading-loose`}>
            {questionLine}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = opt.correct
          const showResult = selected !== null
          
          let cls = 'bg-surface border-border text-secondary hover:border-accent-purple/40 hover:shadow-sm'
          let Icon = null
          
          if (showResult) {
            if (isCorrect) {
              cls = 'bg-accent-green/10 border-accent-green/40 text-accent-green shadow-sm'
              Icon = CheckCircle2
            } else if (isSelected) {
              cls = 'bg-accent-red/10 border-accent-red/40 text-accent-red'
              Icon = XCircle
            } else {
              cls = 'bg-surface border-border text-muted opacity-50'
            }
          }
          
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              className={`w-full text-left rounded-2xl p-5 ${isRoman ? 'font-serif text-lg italic' : 'font-devanagari text-lg'} leading-relaxed transition-all duration-300 border flex items-start gap-3 ${cls}`}
            >
              <div className="flex-1 mt-1">{opt.text}</div>
              {Icon && <Icon size={20} className="shrink-0 mt-1.5" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}