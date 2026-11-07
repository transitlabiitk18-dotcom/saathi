import { AlertTriangle, CheckCircle2, ChevronRight, Circle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DateStrip } from '../components/DateStrip'
import { isComplete, QuestionForm, type Answers } from '../components/QuestionForm'
import { Badge, Button, Card, ErrorText, Field, Input, Modal, PageHeader, Pills, Spinner, Textarea, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { SEVERITY, TRACKERS, TRACKER_TYPES } from '../content/diaries'
import { T, useI18n } from '../i18n'
import { addDays, formatDate, today } from '../lib/dates'
import { deleteIncident, entryId, getEntry, saveEntry, saveIncident } from '../lib/db'
import { useEntries, useIncidents } from '../lib/hooks'
import { RELATION_LABEL, myRelation } from '../lib/relations'
import type { Entry, EntryType, Incident } from '../lib/types'

type Tab = EntryType | 'incidents'

export function TrackPage() {
  const profile = useProfile()
  const child = useChild()
  const { t, tl, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const date = params.get('date') ?? today()
  const tab = (params.get('type') as Tab | null) ?? null
  const from = addDays(date, -10)
  const entries = useEntries(child.id, from)
  const incidents = useIncidents(child.id, from)

  const mine = useMemo(() => new Set((entries ?? []).filter((e) => e.authorUid === profile.uid).map((e) => `${e.type}_${e.date}`)), [entries, profile.uid])
  const status = (d: string) => {
    const n = TRACKER_TYPES.filter((ty) => mine.has(`${ty}_${d}`)).length
    return n === TRACKER_TYPES.length ? 'full' : n > 0 ? 'partial' : 'none'
  }
  const go = (next: { date?: string; type?: Tab | null }) => {
    const p = new URLSearchParams()
    p.set('date', next.date ?? date)
    const ty = next.type === undefined ? tab : next.type
    if (ty) p.set('type', ty)
    setParams(p, { replace: true })
  }
  const dayIncidents = (incidents ?? []).filter((i) => i.date === date)

  return (
    <>
      <PageHeader
        emoji="📔"
        title={tl(T('Daily tracking', 'दैनिक ट्रैकिंग'))}
        subtitle={formatDate(date, lang, { weekday: 'long', day: 'numeric', month: 'long' })}
      />
      <DateStrip value={date} onChange={(d) => go({ date: d })} status={status} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-1 xl:content-start">
          {TRACKER_TYPES.map((ty) => {
            const d = TRACKERS[ty]
            const done = mine.has(`${ty}_${date}`)
            return (
              <TabButton key={ty} active={tab === ty} onClick={() => go({ type: ty })} emoji={d.emoji} title={tl(d.title)} subtitle={tl(d.subtitle)}>
                {done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
              </TabButton>
            )
          })}
          <TabButton
            active={tab === 'incidents'}
            onClick={() => go({ type: 'incidents' })}
            emoji="⚠️"
            title={tl(T('Incidents', 'घटनाएँ'))}
            subtitle={tl(T('Unusual or significant events', 'असामान्य या महत्वपूर्ण घटनाएँ'))}
          >
            {dayIncidents.length > 0 && <Badge className="bg-amber-50 text-amber-700 ring-amber-200">{dayIncidents.length}</Badge>}
          </TabButton>
        </div>

        <div>
          {tab === 'incidents' ? (
            incidents === null ? <Spinner /> : <IncidentsPanel date={date} items={dayIncidents} />
          ) : tab ? (
            <TrackerForm
              key={`${tab}_${date}`}
              type={tab}
              date={date}
              onSaved={() => go({ type: TRACKER_TYPES.find((ty) => ty !== tab && !mine.has(`${ty}_${date}`)) ?? null })}
            />
          ) : (
            <Card className="flex flex-col items-center py-12 text-center">
              <span className="text-5xl">{status(date) === 'full' ? '🎉' : '📝'}</span>
              <p className="mt-3 max-w-xs font-semibold text-slate-600">{status(date) === 'full' ? t('allDone') : tl(T('Record today’s sleep, mood and appetite.', 'आज की नींद, मूड और भूख दर्ज करें।'))}</p>
              {status(date) !== 'full' && (
                <Button className="mt-4" onClick={() => go({ type: TRACKER_TYPES.find((ty) => !mine.has(`${ty}_${date}`)) })}>
                  {tl(T('Start', 'शुरू करें'))} <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <OthersToday entries={(entries ?? []).filter((e) => e.date === date && e.authorUid !== profile.uid)} />
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function TabButton({ active, onClick, emoji, title, subtitle, children }: { active: boolean; onClick: () => void; emoji: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'flex items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-soft ring-1 transition sm:p-4',
        active ? 'ring-2 ring-brand-500' : 'ring-slate-100 hover:ring-brand-200',
      )}
    >
      <span className="text-2xl sm:text-3xl">{emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-800">{title}</span>
        <span className="hidden text-xs text-slate-500 sm:block">{subtitle}</span>
      </span>
      {children}
    </button>
  )
}

/** Shows that other contributors already recorded today, so families see the shared picture. */
function OthersToday({ entries }: { entries: Entry[] }) {
  const { tl } = useI18n()
  if (entries.length === 0) return null
  const people = [...new Map(entries.map((e) => [e.authorUid, e])).values()]
  return (
    <p className="mt-6 text-sm text-slate-500">
      {tl(T('Also recorded today by', 'आज इन्होंने भी दर्ज किया'))}: {people.map((e) => `${e.authorName} (${tl(RELATION_LABEL[e.authorRelation])})`).join(', ')}
    </p>
  )
}

function TrackerForm({ type, date, onSaved }: { type: EntryType; date: string; onSaved: () => void }) {
  const profile = useProfile()
  const child = useChild()
  const { t, tl, lang } = useI18n()
  const tracker = TRACKERS[type]
  const [answers, setAnswers] = useState<Answers>({})
  const [existing, setExisting] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getEntry(child.id, entryId(type, date, profile.uid))
      .then((e) => {
        setExisting(e)
        if (e) setAnswers(e.answers)
      })
      .finally(() => setLoading(false))
  }, [child.id, type, date, profile.uid])

  const save = async () => {
    if (!isComplete(tracker.questions, answers)) return setError(t('required'))
    setError('')
    setBusy(true)
    try {
      await saveEntry(child.id, { type, date, authorUid: profile.uid, authorName: profile.name, authorRelation: myRelation(child, profile.uid), answers })
      onSaved()
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="text-4xl">{tracker.emoji}</span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">{tl(tracker.title)}</h2>
          <p className="text-sm text-slate-500">
            {formatDate(date, lang)}
            {existing && ` · ${t('lastSavedBy', { time: new Date(existing.updatedAt).toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }) })}`}
          </p>
        </div>
      </div>
      <QuestionForm questions={tracker.questions} answers={answers} onChange={setAnswers} />
      <div className="mt-8 space-y-3">
        <ErrorText>{error}</ErrorText>
        <Button size="lg" className="w-full sm:w-auto" loading={busy} onClick={save}>
          {t('save')}
        </Button>
      </div>
    </Card>
  )
}

function IncidentsPanel({ date, items }: { date: string; items: Incident[] }) {
  const profile = useProfile()
  const child = useChild()
  const { tl } = useI18n()
  const [editing, setEditing] = useState<Incident | 'new' | null>(null)
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">⚠️ {tl(T('Incidents & observations', 'घटनाएँ और अवलोकन'))}</h2>
          <p className="text-sm text-slate-500">{tl(T('What happened, what came before and after, and what helped.', 'क्या हुआ, पहले और बाद में क्या हुआ, और किससे मदद मिली।'))}</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> {tl(T('Log incident', 'घटना दर्ज करें'))}
        </Button>
      </div>
      {items.length === 0 ? (
        <Card className="py-10 text-center text-slate-500">{tl(T('No incidents recorded for this day.', 'इस दिन कोई घटना दर्ज नहीं।'))}</Card>
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <IncidentCard key={i.id} incident={i} onEdit={i.authorUid === profile.uid ? () => setEditing(i) : undefined} onDelete={i.authorUid === profile.uid ? () => deleteIncident(child.id, i.id) : undefined} />
          ))}
        </div>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={tl(T('Incident', 'घटना'))} wide>
        {editing !== null && <IncidentForm date={date} initial={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  )
}

export function IncidentCard({ incident: i, onEdit, onDelete }: { incident: Incident; onEdit?: () => void; onDelete?: () => void }) {
  const { tl, lang } = useI18n()
  const sev = SEVERITY.find((s) => s.value === i.severity)!
  const rows: [string, string][] = [
    [tl(T('Before', 'पहले')), i.before],
    [tl(T('After', 'बाद में')), i.after],
    [tl(T('Child’s response', 'बच्चे की प्रतिक्रिया')), i.response],
    [tl(T('What helped', 'किससे मदद मिली')), i.helped],
    [tl(T('Notes', 'टिप्पणी')), i.notes],
  ]
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">{i.what}</span>
            <Badge className={sev.cls}>{tl(sev.label)}</Badge>
          </div>
          <div className="text-xs text-slate-500">
            {formatDate(i.date, lang)} {i.time} · {i.authorName} ({tl(RELATION_LABEL[i.authorRelation])})
          </div>
          <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="inline font-semibold text-slate-500">{k}: </dt>
                  <dd className="inline text-slate-700">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button onClick={() => window.confirm(tl(T('Delete this incident?', 'यह घटना हटाएँ?'))) && onDelete()} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  )
}

function IncidentForm({ date, initial, onDone }: { date: string; initial: Incident | null; onDone: () => void }) {
  const profile = useProfile()
  const child = useChild()
  const { t, tl } = useI18n()
  const now = new Date()
  const [f, setF] = useState({
    date: initial?.date ?? date,
    time: initial?.time ?? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    severity: initial?.severity ?? ('mild' as Incident['severity']),
    what: initial?.what ?? '',
    before: initial?.before ?? '',
    after: initial?.after ?? '',
    response: initial?.response ?? '',
    helped: initial?.helped ?? '',
    notes: initial?.notes ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await saveIncident(child.id, { ...f, authorUid: profile.uid, authorName: profile.name, authorRelation: myRelation(child, profile.uid) }, initial?.id)
      onDone()
    } catch (err) {
      setError(String(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label={t('date')}>
        <Input type="date" required max={today()} value={f.date} onChange={(e) => set('date', e.target.value)} />
      </Field>
      <Field label={t('time')}>
        <Input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} />
      </Field>
      <Field label={tl(T('What happened?', 'क्या हुआ?'))} className="sm:col-span-2">
        <Input required value={f.what} onChange={(e) => set('what', e.target.value)} />
      </Field>
      <Field label={tl(T('How serious?', 'कितना गंभीर?'))} className="sm:col-span-2">
        <Pills value={f.severity} onChange={(v) => set('severity', v)} options={SEVERITY.map((s) => ({ value: s.value, label: tl(s.label) }))} />
      </Field>
      <Field label={tl(T('What happened before it?', 'उससे पहले क्या हुआ?'))}>
        <Textarea rows={2} value={f.before} onChange={(e) => set('before', e.target.value)} />
      </Field>
      <Field label={tl(T('What happened after it?', 'उसके बाद क्या हुआ?'))}>
        <Textarea rows={2} value={f.after} onChange={(e) => set('after', e.target.value)} />
      </Field>
      <Field label={tl(T('How did the child respond?', 'बच्चे ने कैसी प्रतिक्रिया दी?'))}>
        <Textarea rows={2} value={f.response} onChange={(e) => set('response', e.target.value)} />
      </Field>
      <Field label={tl(T('What helped?', 'किससे मदद मिली?'))}>
        <Textarea rows={2} value={f.helped} onChange={(e) => set('helped', e.target.value)} />
      </Field>
      <Field label={`${tl(T('Anything else', 'और कुछ'))} (${t('optional')})`} className="sm:col-span-2">
        <Textarea rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <ErrorText>{error}</ErrorText>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          {t('cancel')}
        </Button>
        <Button type="submit" loading={busy}>
          {t('save')}
        </Button>
      </div>
    </form>
  )
}
