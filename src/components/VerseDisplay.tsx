import { useState } from 'react'
import type { Shloka } from '../types'
import { useAppStore } from '../store/useAppStore'

interface VerseDisplayProps {
  shloka: Shloka
  showSynonyms?: boolean
  showTranslation?: boolean
}

export default function VerseDisplay({
  shloka,
  showSynonyms = false,
  showTranslation = false,
}: VerseDisplayProps) {
  const { settings } = useAppStore()
  const scriptPreference = settings.scriptPreference || 'both'
  const showDeva = scriptPreference === 'devanagari' || scriptPreference === 'both'
  const showRoman = scriptPreference === 'roman' || scriptPreference === 'both'

  const [activeWord, setActiveWord] = useState<number | null>(null)
  const [selectedTranslator, setSelectedTranslator] = useState(settings.preferredTranslator)

  const lines = shloka.sanskrit.split('\n').filter(Boolean)
  const translitLines = shloka.transliteration.split('\n').filter(Boolean)

  const englishTranslations = shloka.translations.filter(t => t.language === 'en')
  const currentTranslation = englishTranslations.find(t => t.authorId === selectedTranslator)
    ?? englishTranslations[0]

  return (
    <div className="space-y-6">
      {/* Chapter / Verse badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-accent-purple tracking-wide">BG {shloka.verseRange}</span>
        <span className="w-1 h-1 rounded-full bg-border"></span>
        <span className="text-secondary text-xs font-medium">{shloka.thematicTag}</span>
      </div>

      <div className="text-center space-y-4">
        {/* Sanskrit text */}
        {showDeva && (
          <div className="space-y-1">
            {lines.map((line, i) => (
              <p
                key={`deva-${i}`}
                className="font-devanagari text-3xl leading-[1.8] text-primary"
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Transliteration */}
        {showRoman && (
          <div className={`space-y-1 ${showDeva ? 'pt-2' : ''}`}>
            {translitLines.map((line, i) => (
              <p key={`roman-${i}`} className={`leading-relaxed ${showDeva ? 'text-secondary text-[15px] italic' : 'text-primary text-xl font-serif font-medium'}`}>
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Synonyms */}
      {showSynonyms && shloka.wordMeanings.length > 0 && (
        <div className="border-t border-border pt-5 space-y-3">
          <p className="section-label mb-0">Word Meanings</p>
          <div className="flex flex-wrap gap-1.5 text-sm leading-relaxed">
            {shloka.wordMeanings.map((wm, i) => {
              const isActive = activeWord === i;
              return (
                <span key={i} className="inline-flex">
                  <button
                    onClick={() => setActiveWord(isActive ? null : i)}
                    className={`font-medium transition-all px-2 py-1 rounded-lg ${
                      isActive 
                        ? 'bg-accent-purple text-white shadow-sm' 
                        : 'bg-elevated text-primary hover:bg-border/50 border border-border/50'
                    }`}
                  >
                    {wm.word}
                  </button>
                  {isActive && (
                    <span className="text-secondary flex items-center px-2 py-1 bg-surface border border-border rounded-lg ml-1 shadow-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                      {wm.meaning}
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Translation */}
      {showTranslation && currentTranslation && (
        <div className="border-t border-border pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-label mb-0">Translation</p>
            {/* Translator selector */}
            {englishTranslations.length > 1 && (
              <select
                value={selectedTranslator}
                onChange={e => setSelectedTranslator(e.target.value)}
                className="bg-elevated text-secondary text-[10px] font-semibold uppercase tracking-wider rounded-lg px-2 py-1 border border-border outline-none focus:border-accent-purple transition-colors"
              >
                {englishTranslations.map(t => (
                  <option key={t.authorId} value={t.authorId}>
                    {t.authorName.replace('Swami ', '')}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="bg-surface border border-border p-5 rounded-3xl shadow-sm">
            <p className="text-primary font-serif font-medium text-lg leading-relaxed">
              {currentTranslation.text}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}