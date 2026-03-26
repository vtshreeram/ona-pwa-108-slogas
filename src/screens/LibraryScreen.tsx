import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Shloka } from '../types'
import VerseDisplay from '../components/VerseDisplay'
import AudioPlayer from '../components/AudioPlayer'
import { Search, ChevronLeft, Bookmark, Star } from 'lucide-react'

const TAGS = ['All', 'Dharma & Duty', 'Atman & Immortality', 'Karma Yoga', 'Jnana Yoga', 'Dhyana Yoga', 'Bhakti Yoga', 'Vibhuti', 'Kshetra & Kshetrajna', 'Gunas', 'Purushottama', 'Daivi Svabhava', 'Moksha']
const CHAPTERS = ['All', ...Array.from({ length: 18 }, (_, i) => String(i + 1))]
const MASTERY_FILTERS = ['All', 'New', 'Learning', 'Mastered']

export default function LibraryScreen() {
  const { shlokas, progress, updateProgress } = useAppStore()
  const [selectedTag, setSelectedTag] = useState('All')
  const [selectedChapter, setSelectedChapter] = useState('All')
  const [selectedMastery, setSelectedMastery] = useState('All')
  const [search, setSearch] = useState('')
  const [detailShloka, setDetailShloka] = useState<Shloka | null>(null)

  const filtered = shlokas.filter(s => {
    if (selectedTag !== 'All' && s.thematicTag !== selectedTag) return false
    if (selectedChapter !== 'All' && s.chapter !== parseInt(selectedChapter)) return false
    if (selectedMastery !== 'All') {
      const m = progress[s.id]?.masteryLevel ?? 0
      if (selectedMastery === 'New' && m !== 0) return false
      if (selectedMastery === 'Learning' && (m === 0 || m >= 4)) return false
      if (selectedMastery === 'Mastered' && m < 4) return false
    }
    if (search) {
      const q = search.toLowerCase()
      return s.id.includes(q) || s.sanskrit.toLowerCase().includes(q) || s.transliteration.toLowerCase().includes(q)
    }
    return true
  })

  const togglePin = async (shloka: Shloka) => {
    const p = progress[shloka.id]
    if (!p) return
    await updateProgress({ ...p, pinned: !p.pinned })
  }

  if (detailShloka) {
    const p = progress[detailShloka.id]
    const isPinned = p?.pinned
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-safe pt-6 pb-4 bg-surface sticky top-0 z-20 border-b border-border shadow-sm">
          <button 
            onClick={() => setDetailShloka(null)} 
            className="text-secondary hover:text-primary transition-colors p-1 -ml-1"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-primary font-serif font-medium text-lg">BG {detailShloka.verseRange}</span>
          <button
            onClick={() => togglePin(detailShloka)}
            className={`ml-auto p-2 rounded-full transition-colors ${isPinned ? 'text-accent-purple bg-accent-purple/10' : 'text-secondary hover:bg-border/30'}`}
            title={isPinned ? 'Unpin' : 'Pin for review'}
          >
            <Bookmark size={20} fill={isPinned ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 pb-24 max-w-lg mx-auto w-full space-y-6">
          <AudioPlayer src={detailShloka.audioPath} lines={detailShloka.sanskrit.split('\n').filter(Boolean)} />
          <VerseDisplay shloka={detailShloka} showSynonyms showTranslation showTransliteration />
          {p && (
            <div className="card space-y-3">
              <p className="section-label mb-0">Progress Details</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-medium">Mastery</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < p.masteryLevel ? 'text-accent-gold fill-accent-gold' : 'text-border'} 
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-medium">Next review</span>
                <span className="text-primary font-medium">{p.nextReviewDate || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-medium">Reviews done</span>
                <span className="text-primary font-medium">{p.repetitions}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 sticky top-0 bg-background z-10">
        <h1 className="text-primary font-serif font-semibold text-3xl mb-5">Library</h1>
        
        <div className="relative mb-5">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search verses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface text-primary rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none border border-border focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/20 transition-all shadow-sm placeholder:text-muted"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
          {MASTERY_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setSelectedMastery(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedMastery === f 
                  ? 'bg-primary text-background shadow-sm' 
                  : 'bg-surface border border-border text-secondary hover:border-accent-purple/30'
              }`}
            >
              {f}
            </button>
          ))}
          <div className="w-px bg-border shrink-0 mx-1" />
          {CHAPTERS.slice(0, 7).map(c => (
            <button
              key={c}
              onClick={() => setSelectedChapter(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedChapter === c 
                  ? 'bg-primary text-background shadow-sm' 
                  : 'bg-surface border border-border text-secondary hover:border-accent-purple/30'
              }`}
            >
              {c === 'All' ? 'All Ch.' : `Ch. ${c}`}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 -mx-5 px-5">
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedTag === t 
                  ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20' 
                  : 'bg-surface border border-border text-secondary hover:border-accent-purple/30'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="px-5 text-muted font-medium text-xs mb-4">{filtered.length} shlokas found</p>

      {/* Grid */}
      <div className="px-5 grid grid-cols-1 gap-3">
        {filtered.map(shloka => {
          const p = progress[shloka.id]
          const mastery = p?.masteryLevel ?? 0
          const firstLine = shloka.sanskrit.split('\n')[0]
          
          return (
            <button
              key={shloka.id}
              onClick={() => setDetailShloka(shloka)}
              className="bg-surface rounded-3xl p-5 shadow-sm border border-border/60 text-left hover:border-accent-purple/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-accent-purple tracking-wide">BG {shloka.verseRange}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span className="text-secondary text-xs font-medium truncate">{shloka.thematicTag}</span>
                  </div>
                  <p className="font-devanagari text-primary text-lg leading-snug truncate">
                    {firstLine}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < mastery ? 'text-accent-gold fill-accent-gold' : 'text-border'} 
                      />
                    ))}
                  </div>
                  {p?.pinned && <Bookmark size={14} className="text-accent-purple fill-accent-purple" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}