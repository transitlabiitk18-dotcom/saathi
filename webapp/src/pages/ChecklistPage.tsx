import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, ErrorText, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { DOMAINS, RATING_OPTIONS, scoreChecklist } from '../content/domains'
import { CHECKLIST_NAME } from '../content/instruments'
import { useI18n } from '../i18n'
import { addDays, today } from '../lib/dates'
import { saveAssessment } from '../lib/db'
import { myRelation } from '../lib/relations'
import type { Phase } from '../lib/types'

const PROMPT = { en: 'In the last 2 weeks, how often does the child…', hi: 'पिछले 2 सप्ताह में, बच्चा कितनी बार…' }

export function ChecklistPage() {
  const profile = useProfile()
  const child = useChild()
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const phase: Phase = params.get('phase') === 'post' ? 'post' : 'pre'
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const domain = DOMAINS[step]
  const stepDone = domain.indicators.every((_, i) => answers[`${domain.id}.${i}`] !== undefined)
  const answered = Object.keys(answers).length
  const total = DOMAINS.reduce((n, d) => n + d.indicators.length, 0)
  const last = step === DOMAINS.length - 1

  const next = async () => {
    if (!stepDone) return setError(t('required'))
    setError('')
    if (!last) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setBusy(true)
    try {
      const date = today()
      const id = await saveAssessment(child.id, {
        instrument: 'checklist',
        phase,
        date,
        authorUid: profile.uid,
        authorName: profile.name,
        authorRelation: myRelation(child, profile.uid),
        answers,
        domainScores: scoreChecklist(answers),
        retestDue: addDays(date, 42),
        studyId: child.studyId,
        createdAt: Date.now(),
      })
      navigate(`/assess/${id}`, { replace: true })
    } catch (e) {
      setError(String(e))
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))} className="flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> {t('back')}
        </button>
        <span className="text-sm font-semibold text-slate-500">
          {tl(CHECKLIST_NAME)} · {t(`phase_${phase}`)}
        </span>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm font-bold text-slate-500">
          <span>{t('domainOf', { i: step + 1, n: DOMAINS.length })}</span>
          <span>
            {answered}/{total}
          </span>
        </div>
        <div className="flex gap-1">
          {DOMAINS.map((d, i) => (
            <div key={d.id} className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className={cx('h-full rounded-full transition-all', i < step ? 'w-full bg-brand-500' : i === step ? 'w-1/2 bg-brand-300' : 'w-0')} />
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${domain.color}18` }}>
            {domain.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{tl(domain.name)}</h1>
            <p className="mt-1 text-slate-500">{tl(domain.definition)}</p>
          </div>
        </div>

        <p className="mt-6 text-sm font-semibold text-slate-400">{tl(PROMPT)}</p>
        <div className="mt-3 divide-y divide-slate-100">
          {domain.indicators.map((ind, i) => {
            const key = `${domain.id}.${i}`
            return (
              <div key={key} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-slate-700">{tl(ind)}</span>
                <div className="grid shrink-0 grid-cols-3 gap-1.5 sm:w-80">
                  {RATING_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setAnswers((a) => ({ ...a, [key]: o.value }))}
                      className={cx(
                        'rounded-xl px-2 py-2 text-xs font-bold ring-1 transition sm:text-sm',
                        answers[key] === o.value
                          ? o.value === 2
                            ? 'bg-rose-500 text-white ring-rose-500'
                            : o.value === 1
                              ? 'bg-amber-400 text-white ring-amber-400'
                              : 'bg-emerald-500 text-white ring-emerald-500'
                          : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
                      )}
                    >
                      {tl(o.label)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 space-y-3">
          <ErrorText>{error}</ErrorText>
          <div className="flex justify-end">
            <Button size="lg" onClick={next} loading={busy}>
              {last ? t('finish') : t('next')} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
