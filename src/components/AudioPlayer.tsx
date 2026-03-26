import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, RotateCcw, MonitorPlay, Waves } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  lines?: string[]          // for line-by-line repeat mode
  isRoman?: boolean         // apply serif font instead of devanagari
  compact?: boolean
  youtubeUrl?: string
  onEnded?: () => void
}

const YT_PLAYLIST = 'https://www.youtube.com/watch?v=NcH9Iff4tYY&list=PLX0Ub3o9M5sIwlsm_qirzkwfDv2J7LHsV'

export default function AudioPlayer({ src, lines, isRoman = false, compact = false, youtubeUrl, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<1 | 0.75>(1)
  const [lineMode, setLineMode] = useState(false)
  const [activeLine, setActiveLine] = useState(-1)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = speed
  }, [speed])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false)
    setActiveLine(-1)
    setLoaded(false)
  }, [src])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false)
    } else {
      audio.playbackRate = speed
      await audio.play().catch(() => {})
      setPlaying(true)
    }
  }, [playing, speed])

  const replay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.playbackRate = speed
    audio.play().catch(() => {})
    setPlaying(true)
  }, [speed])

  const toggleSpeed = () => setSpeed(s => s === 1 ? 0.75 : 1)

  const handleEnded = () => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false)
    setActiveLine(-1)
    onEnded?.()
  }

  useEffect(() => {
    if (!lineMode || !lines?.length || !playing) return
    const audio = audioRef.current
    if (!audio) return

    const duration = audio.duration || 10
    const segDuration = duration / lines.length

    const interval = setInterval(() => {
      const idx = Math.floor(audio.currentTime / segDuration)
      setActiveLine(Math.min(idx, lines.length - 1))
    }, 200)

    return () => clearInterval(interval)
  }, [lineMode, lines, playing])

  return (
    <div className={`flex flex-col gap-3 ${compact ? '' : 'bg-surface rounded-3xl p-5 shadow-sm border border-border/60'}`}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        onCanPlay={() => setLoaded(true)}
        preload="auto"
      />

      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={!loaded}
          className="w-12 h-12 rounded-full bg-primary text-base flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shadow-md"
          style={{ color: 'var(--bg-base)' }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
        </button>

        {/* Replay */}
        <button
          onClick={replay}
          className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center active:scale-95 transition-all text-secondary hover:text-primary hover:border-border/80"
          aria-label="Replay"
        >
          <RotateCcw size={18} />
        </button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Speed toggle */}
        <button
          onClick={toggleSpeed}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            speed === 0.75 
              ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30' 
              : 'bg-elevated text-secondary border-transparent hover:border-border/80'
          }`}
        >
          {speed === 1 ? '1×' : '¾×'}
        </button>

        {/* Line mode toggle */}
        {lines && lines.length > 1 && (
          <button
            onClick={() => setLineMode(m => !m)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all border ${
              lineMode 
                ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30' 
                : 'bg-elevated text-secondary border-transparent hover:border-border/80'
            }`}
          >
            <Waves size={14} /> Line
          </button>
        )}

        {/* YouTube link */}
        <a
          href={youtubeUrl || YT_PLAYLIST}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center text-accent-red hover:bg-accent-red/5 transition-colors"
          aria-label="Listen on YouTube"
        >
          <MonitorPlay size={20} />
        </a>
      </div>

      {/* Line-by-line display */}
      {lineMode && lines && lines.length > 0 && (
        <div className="mt-3 space-y-1.5 bg-elevated p-3 rounded-2xl border border-border/50">
          {lines.map((line, i) => {
            const isActive = activeLine === i;
            return (
              <p
                key={i}
                className={`${isRoman ? 'font-serif' : 'font-devanagari'} text-lg leading-relaxed transition-all cursor-pointer px-3 py-2 rounded-xl ${
                  isActive 
                    ? 'text-accent-blue bg-surface shadow-sm font-medium' 
                    : 'text-secondary hover:text-primary hover:bg-surface/50'
                }`}
                onClick={() => {
                  const audio = audioRef.current
                  if (!audio || !audio.duration) return
                  const segDuration = audio.duration / lines.length
                  audio.currentTime = i * segDuration
                  audio.play().catch(() => {})
                  setPlaying(true)
                  setActiveLine(i)
                }}
              >
                {line}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}