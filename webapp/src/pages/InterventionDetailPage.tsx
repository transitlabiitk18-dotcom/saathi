import { ArrowLeft, CalendarCheck2, CheckCircle2, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { InterventionDetails, RecordForm, describe } from '../components/interventionUi'
import { moodEmoji } from '../components/MoodPicker'
import { Badge, Button, Card, ErrorText, Field, Input, Spinner, Textarea } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { T, useI18n } from '../i18n'
import { addDays, daysBetween, formatDate, today } from '../lib/dates'
import { addLog, deleteIntervention, deleteLog, setInterventionStatus, watchLogs } from '../lib/db'
import { useInterventions } from '../lib/hooks'
import { RELATION_LABEL, myRelation } from '../lib/relations'
import type { AnswerValue, Intervention, InterventionLog, RecordField } from '../lib/types'

export function InterventionDetailPage() {
  const { id } = useParams()
  const child = useChild()
  const profile = useProfile()
  const { tl, lang } = useI18n()
  const navigate = useNavigate()
  const interventions = useInterventions(child.id)
  const [logs, setLogs] = useState<InterventionLog[] | null>(null)
  useEffect(() => (id ? watchLogs(child.id, id, setLogs) : undefined), [child.id, id])

  if (interventions === null) return <Spinner />
  const i = interventions.find((x) => x.id === id)
  if (!i) return <p className="text-slate-500">—</p>
  const d = describe(i, tl)
  const finished = i.endDate < today()
  const canDelete = i.source !== 'researcher' && (i.createdBy === profile.uid || child.ownerUid === profile.uid)

  return (
    <>
      <button onClick={() => navigate('/interventions')} className="mb-5 flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> {tl(T('Interventions', 'हस्तक्षेप'))}
      </button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{d.emoji}</span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">{d.title}</h1>
            <p className="text-sm text-slate-500">
              {formatDate(i.startDate, lang)} → {formatDate(i.endDate, lang)} · {tl(SOURCE[i.source])}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {i.status === 'active' && i.source !== 'researcher' && (
            <Button variant="secondary" onClick={() => setInterventionStatus(child.id, i.id, 'completed')}>
              <CheckCircle2 className="h-4 w-4" /> {tl(T('Mark completed', 'पूर्ण चिह्नित करें'))}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm(tl(T('Delete this intervention and all its records?', 'यह हस्तक्षेप और इसके सभी रिकॉर्ड हटाएँ?')))) return
                await deleteIntervention(child.id, i.id)
                navigate('/interventions', { replace: true })
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {finished && i.status === 'active' && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <CalendarCheck2 className="h-7 w-7 text-amber-600" />
          <div className="flex-1 font-semibold text-amber-900">
            {tl(T('The intervention period has ended. Please take the follow-up questionnaire to see progress.', 'हस्तक्षेप अवधि पूरी हो गई है। प्रगति देखने के लिए फ़ॉलो-अप प्रश्नावली भरें।'))}
          </div>
          <Link to="/assess/new">
            <Button>{tl(T('Take follow-up', 'फ़ॉलो-अप भरें'))}</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <InterventionDetails what={d.what} how={d.how} steps={d.steps} record={d.record} tool={d.tool} />
          </Card>
          <Card>
            <h2 className="mb-4 text-lg font-extrabold text-slate-800">{tl(T('Progress', 'प्रगति'))}</h2>
            <LogsChart i={i} logs={logs ?? []} />
          </Card>
          <div>
            <h2 className="mb-3 text-lg font-extrabold text-slate-800">{tl(T('Records', 'रिकॉर्ड'))}</h2>
            {logs === null ? <Spinner /> : logs.length === 0 ? <Card className="text-slate-500">{tl(T('No records yet.', 'अभी कोई रिकॉर्ड नहीं।'))}</Card> : <LogList logs={logs} fields={d.record} interventionId={i.id} />}
          </div>
        </div>
        {i.status === 'active' && (
          <div className="xl:sticky xl:top-6 xl:self-start">
            <LogForm i={i} fields={d.record} />
          </div>
        )}
      </div>
    </>
  )
}

const SOURCE: Record<Intervention['source'], { en: string; hi: string }> = {
  recommendation: T('Recommended', 'सुझाया गया'),
  library: T('From library', 'लाइब्रेरी से'),
  custom: T('Your own', 'आपका अपना'),
  researcher: T('Assigned by researcher', 'शोधकर्ता द्वारा दिया गया'),
}

function LogForm({ i, fields }: { i: Intervention; fields: RecordField[] }) {
  const profile = useProfile()
  const child = useChild()
  const { t, tl } = useI18n()
  const [date, setDate] = useState(today())
  const [values, setValues] = useState<Record<string, AnswerValue>>({})
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const save = async () => {
    if (Object.keys(values).length === 0 && !notes.trim()) return setError(tl(T('Fill in at least one field.', 'कम से कम एक फ़ील्ड भरें।')))
    setBusy(true)
    setError('')
    try {
      await addLog(child.id, i.id, { date, values, notes: notes.trim(), authorUid: profile.uid, authorName: profile.name, authorRelation: myRelation(child, profile.uid) })
      setValues({})
      setNotes('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-extrabold text-slate-800">📝 {tl(T('Record a session', 'सत्र दर्ज करें'))}</h2>
      <Field label={t('date')} className="mb-5">
        <Input type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <RecordForm fields={fields.filter((f) => f.id !== 'observations')} values={values} onChange={setValues} />
      <Field label={tl(T('Additional observations', 'अतिरिक्त अवलोकन'))} className="mt-5">
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div className="mt-5 space-y-2">
        <ErrorText>{error}</ErrorText>
        <Button className="w-full" size="lg" onClick={save} loading={busy}>
          {t('save')}
        </Button>
        {saved && <p className="text-center text-sm font-semibold text-emerald-600">✓ {t('saved')}</p>}
      </div>
    </Card>
  )
}

export function formatValue(f: RecordField | undefined, v: AnswerValue, tl: (l: { en: string; hi: string }) => string): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? tl(T('Yes', 'हाँ')) : tl(T('No', 'नहीं'))
  if (f?.kind === 'mood') return moodEmoji(v)
  if (f?.kind === 'choice') {
    const o = f.options?.find((x) => x.value === v)
    return o ? tl(o.label) : String(v)
  }
  return String(v)
}

export function LogList({ logs, fields, interventionId }: { logs: InterventionLog[]; fields: RecordField[]; interventionId?: string }) {
  const profile = useProfile()
  const child = useChild()
  const { tl, lang } = useI18n()
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]))
  return (
    <div className="space-y-2">
      {logs.map((l) => (
        <Card key={l.id} className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm font-bold text-slate-700">
              {formatDate(l.date, lang)} · <span className="font-semibold text-slate-500">{l.authorName} ({tl(RELATION_LABEL[l.authorRelation])})</span>
            </div>
            {interventionId && l.authorUid === profile.uid && (
              <button
                onClick={() => window.confirm(tl(T('Delete this record?', 'यह रिकॉर्ड हटाएँ?'))) && deleteLog(child.id, interventionId, l.id)}
                className="rounded-lg p-1 text-slate-300 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            {Object.entries(l.values).map(([k, v]) => (
              <div key={k}>
                <dt className="inline text-slate-500">{byId[k] ? tl(byId[k].label) : k}: </dt>
                <dd className="inline font-semibold text-slate-700">{formatValue(byId[k], v, tl)}</dd>
              </div>
            ))}
          </dl>
          {l.notes && <p className="mt-2 rounded-xl bg-sand-50 p-2 text-sm text-slate-600">{l.notes}</p>}
        </Card>
      ))}
    </div>
  )
}

function LogsChart({ i, logs }: { i: Intervention; logs: InterventionLog[] }) {
  const { tl, lang } = useI18n()
  const data = useMemo(() => {
    const weeks = Math.max(1, Math.ceil(daysBetween(i.startDate, i.endDate) / 7))
    return Array.from({ length: weeks }, (_, w) => {
      const from = addDays(i.startDate, w * 7)
      const to = addDays(from, 7)
      return {
        week: `${tl(T('Wk', 'सप्ता'))} ${w + 1}`,
        from: formatDate(from, lang, { day: 'numeric', month: 'short' }),
        sessions: logs.filter((l) => l.date >= from && l.date < to).length,
      }
    })
  }, [i.startDate, i.endDate, logs, lang, tl])
  const total = logs.length
  const days = new Set(logs.map((l) => l.date)).size
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge className="bg-brand-50 text-brand-700 ring-brand-200">
          {total} {tl(T('sessions', 'सत्र'))}
        </Badge>
        <Badge className="bg-slate-50 text-slate-600 ring-slate-200">
          {days} {tl(T('days practised', 'दिन अभ्यास'))}
        </Badge>
      </div>
      <div className="h-48">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -25, right: 5, top: 5 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip labelFormatter={(_, p) => p?.[0]?.payload?.from ?? ''} />
            <Bar dataKey="sessions" name={tl(T('Sessions', 'सत्र'))} fill="#35847b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
