import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, ErrorText, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { ATEC, ATEC_INFO, scoreAtec } from '../content/instruments'
import { T, useI18n } from '../i18n'
import { addDays, today } from '../lib/dates'
import { saveAssessment } from '../lib/db'
import { myRelation } from '../lib/relations'
import type { Phase } from '../lib/types'

export function AtecPage() {
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
  const sub = ATEC[step]
  const last = step === ATEC.length - 1
  const stepDone = sub.items.every((_, i) => answers[`${sub.id}.${i}`] !== undefined)

  const next = async () => {
    if (!stepDone) {
      setError(t('required'))
      const first = sub.items.findIndex((_, i) => answers[`${sub.id}.${i}`] === undefined)
      document.getElementById(`atec-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setError('')
    if (!last) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setBusy(true)
    try {
      const date = today()
      const { subscales, total } = scoreAtec(answers)
      const id = await saveAssessment(child.id, {
        instrument: 'atec',
        phase,
        date,
        authorUid: profile.uid,
        authorName: profile.name,
        authorRelation: myRelation(child, profile.uid),
        answers,
        subscales,
        totalScore: total,
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
          ATEC · {t(`phase_${phase}`)}
        </span>
      </div>
      <div className="mb-6 flex gap-1">
        {ATEC.map((s, i) => (
          <div key={s.id} className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div className={cx('h-full rounded-full transition-all', i < step ? 'w-full bg-brand-500' : i === step ? 'w-1/2 bg-brand-300' : 'w-0')} />
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-extrabold text-slate-800">{tl(sub.title)}</h1>
      <p className="mb-4 mt-1 text-slate-500">{tl(T('Choose the answer that best describes the child right now.', 'वह उत्तर चुनें जो अभी बच्चे का सबसे अच्छा वर्णन करता है।'))}</p>

      <div className="space-y-2">
        {sub.items.map((item, i) => {
          const key = `${sub.id}.${i}`
          return (
            <Card key={key} id={`atec-${i}`} className={cx('p-4', answers[key] === undefined && error && 'ring-2 ring-rose-300')}>
              <p className="font-semibold text-slate-800">
                <span className="mr-2 text-slate-400">{i + 1}.</span>
                {tl(item)}
              </p>
              <div className={cx('mt-3 grid gap-1.5', sub.options.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}>
                {sub.options.map((o, oi) => (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [key]: oi }))}
                    className={cx(
                      'rounded-xl px-2 py-2 text-xs font-bold ring-1 transition sm:text-sm',
                      answers[key] === oi ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    {tl(o.label)}
                  </button>
                ))}
              </div>
            </Card>
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
        <p className="text-xs text-slate-400">{ATEC_INFO.copyright}</p>
      </div>
    </div>
  )
}
