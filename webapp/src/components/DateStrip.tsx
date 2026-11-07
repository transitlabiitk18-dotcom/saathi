import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../i18n'
import { addDays, parseISODate, today } from '../lib/dates'
import { cx } from './ui'

/** A week of days ending at `end`, with a status dot per day. */
export function DateStrip({ value, onChange, status }: { value: string; onChange: (d: string) => void; status: (d: string) => 'full' | 'partial' | 'none' }) {
  const { lang } = useI18n()
  const t0 = today()
  // Keep the selected date visible; the strip ends on today when possible.
  const end = addDays(value, 3) > t0 ? t0 : addDays(value, 3)
  const days = Array.from({ length: 7 }, (_, i) => addDays(end, i - 6))
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN'

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(addDays(value, -1))} className="rounded-xl p-2 text-slate-500 hover:bg-white" aria-label="Previous day">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="grid flex-1 grid-cols-7 gap-1">
        {days.map((d) => {
          const dt = parseISODate(d)
          const st = status(d)
          const active = d === value
          return (
            <button
              key={d}
              onClick={() => onChange(d)}
              className={cx(
                'flex flex-col items-center rounded-2xl py-2 transition',
                active ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 ring-1 ring-slate-100 hover:ring-brand-200',
              )}
            >
              <span className={cx('text-[11px] font-bold uppercase', active ? 'text-brand-100' : 'text-slate-400')}>
                {dt.toLocaleDateString(locale, { weekday: 'short' })}
              </span>
              <span className="text-lg font-extrabold">{dt.getDate()}</span>
              <span
                className={cx(
                  'mt-0.5 h-1.5 w-1.5 rounded-full',
                  st === 'full' ? (active ? 'bg-white' : 'bg-emerald-500') : st === 'partial' ? 'bg-amber-400' : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>
      <button
        onClick={() => value < t0 && onChange(addDays(value, 1))}
        disabled={value >= t0}
        className="rounded-xl p-2 text-slate-500 hover:bg-white disabled:opacity-30"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
