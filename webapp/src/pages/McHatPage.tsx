import { ArrowLeft, Info } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, ErrorText, Pills, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { MCHAT, MCHAT_ITEMS, scoreMchat } from '../content/instruments'
import { useI18n } from '../i18n'
import { addDays, parseISODate, today } from '../lib/dates'
import { saveAssessment } from '../lib/db'
import { myRelation } from '../lib/relations'
import type { Phase } from '../lib/types'

function ageMonths(dob: string): number {
  const b = parseISODate(dob)
  const n = new Date()
  return (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth() - (n.getDate() < b.getDate() ? 1 : 0)
}

export function McHatPage() {
  const profile = useProfile()
  const child = useChild()
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const phase: Phase = params.get('phase') === 'post' ? 'post' : 'pre'
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const months = ageMonths(child.dob)
  const answered = Object.keys(answers).length

  const submit = async () => {
    if (answered < MCHAT_ITEMS.length) {
      setError(t('required'))
      const first = MCHAT_ITEMS.findIndex((_, i) => answers[i] === undefined)
      document.getElementById(`mchat-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setBusy(true)
    setError('')
    try {
      const date = today()
      const score = scoreMchat(answers)
      const id = await saveAssessment(child.id, {
        instrument: 'mchat',
        phase,
        date,
        authorUid: profile.uid,
        authorName: profile.name,
        authorRelation: myRelation(child, profile.uid),
        answers,
        totalScore: score,
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
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> {t('back')}
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">{MCHAT.name}</h1>
        <p className="mt-1 text-slate-500">
          {tl(MCHAT.full)} · {t(`phase_${phase}`)}
        </p>
        <p className="mt-3 text-slate-600">{t('mchatIntro')}</p>
        {months > 30 && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" /> {t('mchatAgeNote', { months })}
          </div>
        )}
      </div>

      <div className="sticky top-[57px] z-20 -mx-4 mb-4 bg-sand-50/95 px-4 py-2 backdrop-blur xl:top-0">
        <div className="mb-1 flex justify-between text-sm font-bold text-slate-500">
          <span>{t('mchatProgress')}</span>
          <span>
            {answered}/{MCHAT_ITEMS.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(answered / MCHAT_ITEMS.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {MCHAT_ITEMS.map((item, i) => (
          <Card key={i} id={`mchat-${i}`} className={cx('p-4 sm:p-5', answers[i] === undefined && error && 'ring-2 ring-rose-300')}>
            <div className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-extrabold text-brand-700">{i + 1}</span>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{tl(item.q)}</p>
                <Pills
                  className="mt-3"
                  value={answers[i]}
                  onChange={(v) => setAnswers((a) => ({ ...a, [i]: v }))}
                  options={[
                    { value: 1, label: t('yes') },
                    { value: 0, label: t('no') },
                  ]}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <ErrorText>{error}</ErrorText>
        <Button size="lg" className="w-full sm:w-auto" onClick={submit} loading={busy}>
          {t('finish')}
        </Button>
        <p className="text-xs text-slate-400">{tl(MCHAT.licence)}</p>
      </div>
    </div>
  )
}
