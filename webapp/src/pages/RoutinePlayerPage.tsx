import { ChevronLeft, ChevronRight, Pause, Play, Volume2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner, cx } from '../components/ui'
import { useChild } from '../context/ChildContext'
import { useI18n } from '../i18n'
import { useRoutines } from '../lib/hooks'

/** Full-screen, low-distraction slideshow the child can watch (or tap through) to anticipate what comes next. */
export function RoutinePlayerPage() {
  const { id } = useParams()
  const child = useChild()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const routines = useRoutines(child.id)
  const routine = routines?.find((r) => r.id === id)
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(false)
  const total = (routine?.slides.length ?? 0) + 1 // + final "all done" slide
  const isEnd = i === total - 1
  const slide = routine?.slides[i]

  const speak = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window) || !text) return
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
      u.rate = 0.85
      speechSynthesis.speak(u)
    },
    [lang],
  )

  const next = useCallback(() => setI((x) => Math.min(x + 1, total - 1)), [total])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, navigate])

  useEffect(() => {
    if (!auto || isEnd) return
    const tm = window.setTimeout(next, 5000)
    return () => window.clearTimeout(tm)
  }, [auto, i, isEnd, next])

  useEffect(() => {
    if (auto && routine) speak(isEnd ? t('allDoneSlide') : routine.slides[i]?.caption ?? '')
  }, [auto, i, isEnd, routine, speak, t])

  useEffect(() => () => speechSynthesis?.cancel(), [])

  if (routines === null) return <Spinner />
  if (!routine) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fdfaf4]">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label={t('exit')}>
          <X className="h-6 w-6" />
        </button>
        <div className="text-center">
          <div className="font-extrabold text-slate-700">{routine.title}</div>
          {routine.time && <div className="text-sm font-semibold text-slate-400">{routine.time}</div>}
        </div>
        <button
          onClick={() => setAuto((a) => !a)}
          className={cx('flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-bold', auto ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100')}
        >
          {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="hidden sm:inline">{t('autoplay')}</span>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4" onClick={next}>
        <div key={i} className="flex w-full max-w-2xl animate-[fadeIn_.35s_ease-out] flex-col items-center">
          {isEnd ? (
            <>
              <div className="grid aspect-square w-[min(70vw,55vh)] place-items-center rounded-[2.5rem] bg-emerald-50 text-[min(35vw,25vh)] shadow-sm ring-4 ring-emerald-200">⭐</div>
              <div className="mt-8 text-center text-4xl font-extrabold text-emerald-700 sm:text-5xl">{t('allDoneSlide')}</div>
            </>
          ) : (
            <>
              <div className="grid aspect-square w-[min(70vw,55vh)] place-items-center overflow-hidden rounded-[2.5rem] bg-white text-[min(35vw,25vh)] shadow-sm ring-4 ring-slate-100">
                {slide?.image ? <img src={slide.image} alt={slide.caption} className="h-full w-full object-cover" /> : slide?.emoji}
              </div>
              <div className="mt-8 text-center text-3xl font-extrabold leading-snug text-slate-800 sm:text-5xl">{slide?.caption}</div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <button onClick={prev} disabled={i === 0} className="grid h-16 w-16 place-items-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-200 disabled:opacity-30">
          <ChevronLeft className="h-8 w-8" />
        </button>
        <div className="flex flex-1 flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-1.5">
            {Array.from({ length: total }, (_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                className={cx('h-2.5 rounded-full transition-all', k === i ? 'w-8 bg-brand-600' : k < i ? 'w-2.5 bg-brand-300' : 'w-2.5 bg-slate-300')}
              />
            ))}
          </div>
          {'speechSynthesis' in window && (
            <button
              onClick={() => speak(isEnd ? t('allDoneSlide') : slide?.caption ?? '')}
              className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100"
            >
              <Volume2 className="h-4 w-4" /> {t('speak')}
            </button>
          )}
        </div>
        <button onClick={next} disabled={isEnd} className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-white shadow-lg disabled:opacity-30">
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  )
}
