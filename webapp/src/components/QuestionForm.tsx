import type { Question } from '../content/diaries'
import { useI18n } from '../i18n'
import type { Entry } from '../lib/types'
import { MoodPicker } from './MoodPicker'
import { Input, Pills, Textarea, cx } from './ui'

export type Answers = Entry['answers']

export function isComplete(questions: Question[], a: Answers): boolean {
  return questions.every((q) => q.kind === 'text' || (a[q.id] !== undefined && a[q.id] !== null && a[q.id] !== ''))
}

export function QuestionForm({ questions, answers, onChange }: { questions: Question[]; answers: Answers; onChange: (a: Answers) => void }) {
  const { t, tl } = useI18n()
  const set = (id: string, v: Answers[string]) => onChange({ ...answers, [id]: v })

  return (
    <div className="space-y-7">
      {questions.map((q, i) => (
        <div key={q.id}>
          <div className="mb-3 flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-extrabold text-brand-700">{i + 1}</span>
            <span className="pt-0.5 font-bold text-slate-800">
              {tl(q.label)}
              {q.kind === 'text' && <span className="font-normal text-slate-400"> ({t('optional')})</span>}
            </span>
          </div>
          <div className="pl-10">
            {q.kind === 'mood' && (
              <>
                <div className={cx(answers[q.id] === 'na' && 'pointer-events-none opacity-40')}>
                  <MoodPicker value={answers[q.id] as number} onChange={(v) => set(q.id, v)} />
                </div>
                {q.allowNA && (
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-600"
                      checked={answers[q.id] === 'na'}
                      onChange={(e) => set(q.id, e.target.checked ? 'na' : null)}
                    />
                    {tl(q.allowNA)}
                  </label>
                )}
              </>
            )}
            {q.kind === 'choice' && (
              <Pills value={answers[q.id] as string} options={q.options.map((o) => ({ value: o.value, label: tl(o.label) }))} onChange={(v) => set(q.id, v)} />
            )}
            {q.kind === 'time' && <Input type="time" className="max-w-40" value={(answers[q.id] as string) ?? ''} onChange={(e) => set(q.id, e.target.value)} />}
            {q.kind === 'yesno' && (
              <>
                <Pills
                  value={answers[q.id] as boolean | undefined}
                  options={[
                    { value: true, label: t('yes') },
                    { value: false, label: t('no') },
                  ]}
                  onChange={(v) => set(q.id, v)}
                />
                {answers[q.id] === true && (
                  <Input
                    className="mt-3"
                    placeholder={q.detailsLabel ? tl(q.detailsLabel) : t('howMany')}
                    value={(answers[`${q.id}_details`] as string) ?? ''}
                    onChange={(e) => set(`${q.id}_details`, e.target.value)}
                  />
                )}
              </>
            )}
            {q.kind === 'text' && (
              <Textarea placeholder={q.placeholder ? tl(q.placeholder) : ''} value={(answers[q.id] as string) ?? ''} onChange={(e) => set(q.id, e.target.value)} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
