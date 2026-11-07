import { MOODS } from '../content/diaries'
import { useI18n } from '../i18n'
import { cx } from './ui'

export function MoodPicker({ value, onChange }: { value: number | null | undefined; onChange: (v: number) => void }) {
  const { tl } = useI18n()
  return (
    <div className="grid grid-cols-5 gap-2" role="radiogroup">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          role="radio"
          aria-checked={value === m.value}
          aria-label={tl(m.label)}
          onClick={() => onChange(m.value)}
          className={cx(
            'flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 ring-1 transition',
            value === m.value ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-slate-200 hover:bg-slate-50',
          )}
        >
          <span className={cx('text-3xl transition', value != null && value !== m.value && 'opacity-40 grayscale')}>{m.emoji}</span>
          <span className="text-center text-[11px] font-semibold leading-tight text-slate-600">{tl(m.label)}</span>
        </button>
      ))}
    </div>
  )
}

export function moodEmoji(v: unknown): string {
  return MOODS.find((m) => m.value === v)?.emoji ?? '—'
}
