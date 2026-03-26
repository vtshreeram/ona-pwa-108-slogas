import { useState, useMemo } from 'react'
import type { Shloka } from '../../types'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

interface FillBlankProps {
  shloka: Shloka
  onResult: (correct: boolean) => void
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-zāīūṛṝḷḹṃḥśṣṭḍṇñṅ]/g, '').trim()
}

export default function FillBlank({ shloka, onResult }: FillBlankProps) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)

  const words = useMemo(() => {
    return shloka.transliteration.split(/\s+/).filter(Boolean)
  }, [shloka.id])

  const blankIdx = useMemo(() => {
    const mid = Math.floor(words.length / 3)
    return mid + Math.floor(Math.random() * Math.floor(words.length / 3))
  }, [shloka.id])

  const answer = words[blankIdx] || ''

  const handleSubmit = () => {
    if (submitted) return
    const isCorrect = normalize(input) === normalize(answer)
    setCorrect(isCorrect)
    setSubmitted(true)
    setTimeout(() => onResult(isCorrect), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-secondary text-sm font-medium mb-4">Fill in the missing word</p>
        <div className="bg-surface shadow-sm border border-border/60 rounded-3xl p-6 leading-loose text-lg">
          {words.map((w, i) => {
            if (i === blankIdx) {
              return (
                <span key={i} className="inline-block mx-1.5 min-w-[80px] border-b-2 border-accent-purple border-dashed text-transparent">
                  {w}
                </span>
              )
            }
            return <span key={i} className="text-secondary mx-1">{w}</span>
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && input.trim() && handleSubmit()}
            placeholder="Type the missing word..."
            disabled={submitted}
            className={`w-full bg-surface text-primary rounded-2xl px-5 py-4 text-base outline-none border transition-all shadow-sm ${
              submitted 
                ? correct 
                  ? 'border-accent-green bg-accent-green/5' 
                  : 'border-accent-red bg-accent-red/5'
                : 'border-border focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/20'
            }`}
            autoFocus
          />
          {!submitted && input.trim() && (
            <button 
              onClick={handleSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-purple text-white p-2 rounded-xl hover:bg-accent-purple/90 transition-colors"
            >
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {submitted && (
          <div className={`rounded-2xl p-4 text-center border animate-in slide-in-from-bottom-2 duration-300 ${
            correct 
              ? 'bg-accent-green/10 border-accent-green/30' 
              : 'bg-accent-red/10 border-accent-red/30'
          }`}>
            <p className={`font-semibold flex items-center justify-center gap-2 ${
              correct ? 'text-accent-green' : 'text-accent-red'
            }`}>
              {correct ? <><CheckCircle2 size={18}/> Correct!</> : <><XCircle size={18}/> Not quite</>}
            </p>
            {!correct && (
              <p className="text-secondary text-sm mt-2">
                Answer: <span className="text-primary font-bold">{answer}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}