import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { describe } from '../../components/interventionUi'
import { moodEmoji } from '../../components/MoodPicker'
import { Badge, Button, Card, ErrorText, Field, Input, Modal, Pills, Select, Spinner, Textarea, cx } from '../../components/ui'
import { useProfile } from '../../context/AuthContext'
import { ChildScope, useChild } from '../../context/ChildContext'
import { TRACKERS } from '../../content/diaries'
import { INTERVENTIONS } from '../../content/interventions'
import { instrumentName } from '../../content/instruments'
import { T, useI18n } from '../../i18n'
import { addDays, ageLabel, formatDate, today } from '../../lib/dates'
import { addNote, createIntervention, createTask, deleteIntervention, deleteTask, getChild, getParticipant, getStudy, setInterventionStatus, watchLogs, watchNotes } from '../../lib/db'
import { useAssessments, useEntries, useIncidents, useInterventions, useTasks } from '../../lib/hooks'
import { RELATION_LABEL } from '../../lib/relations'
import type { Child, Intervention, InterventionLog, Participant, ResearchNote, Study } from '../../lib/types'
import { AssessmentResultPage } from '../AssessmentResultPage'
import { CustomForm } from '../InterventionsPage'
import { LogList } from '../InterventionDetailPage'
import { IncidentCard } from '../TrackPage'
import { TrendsPage } from '../TrendsPage'

type Tab = 'progress' | 'records' | 'questionnaires' | 'interventions' | 'tasks' | 'notes'

export function ParticipantPage() {
  const { sid = '', childId = '' } = useParams()
  const [child, setChild] = useState<Child | null | undefined>(undefined)
  const [study, setStudy] = useState<Study | null>(null)
  const [p, setP] = useState<Participant | null>(null)
  useEffect(() => {
    getChild(childId).then(setChild).catch(() => setChild(null))
    getStudy(sid).then(setStudy)
    getParticipant(sid, childId).then(setP)
  }, [sid, childId])

  if (child === undefined || !study || !p) return <Spinner />
  if (child === null || child.studyId !== sid)
    return <Card className="text-slate-500">This participant is no longer linked to the study.</Card>
  return (
    <ChildScope child={child}>
      <Routes>
        <Route path="a/:id" element={<AssessmentResultPage readOnly backTo={`/studies/${sid}/p/${childId}?tab=questionnaires`} />} />
        <Route path="*" element={<ParticipantHome study={study} p={p} />} />
      </Routes>
    </ChildScope>
  )
}

function ParticipantHome({ study, p }: { study: Study; p: Participant }) {
  const child = useChild()
  const { tl, lang } = useI18n()
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) ?? 'progress')
  const tabs: { id: Tab; label: string }[] = [
    { id: 'progress', label: tl(T('Progress', 'प्रगति')) },
    { id: 'records', label: tl(T('Contributions', 'योगदान')) },
    { id: 'questionnaires', label: tl(T('Questionnaires', 'प्रश्नावली')) },
    { id: 'interventions', label: tl(T('Interventions', 'हस्तक्षेप')) },
    { id: 'tasks', label: tl(T('Tasks', 'कार्य')) },
    { id: 'notes', label: tl(T('Notes', 'नोट्स')) },
  ]
  const members = Object.entries(child.members).filter(([uid]) => child.memberUids.includes(uid))

  return (
    <>
      <button onClick={() => navigate(`/studies/${study.id}`)} className="mb-5 flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> {study.title}
      </button>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-mono text-3xl font-extrabold text-slate-800">{child.publicId}</h1>
          <p className="text-slate-500">
            {ageLabel(child.dob, lang)} · {formatDate(p.startDate, lang)} → {formatDate(p.endDate, lang)}
            {p.status === 'withdrawalRequested' && <Badge className="ml-2 bg-amber-50 text-amber-700 ring-amber-200">{tl(T('Withdrawal requested', 'वापसी का अनुरोध'))}</Badge>}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {members.map(([uid, m]) => (
              <Badge key={uid} className="bg-white text-slate-600 ring-slate-200">
                {tl(RELATION_LABEL[m.relation])}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-soft ring-1 ring-slate-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx('shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition', tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50')}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'progress' && <TrendsPage embedded />}
      {tab === 'records' && <Records since={p.startDate} />}
      {tab === 'questionnaires' && <Questionnaires studyId={study.id} />}
      {tab === 'interventions' && <AssignedInterventions study={study} p={p} />}
      {tab === 'tasks' && <Tasks study={study} />}
      {tab === 'notes' && <Notes studyId={study.id} />}
    </>
  )
}

/** Everything contributed since enrolment, filterable by contributor (e.g. S001 → Parent). */
function Records({ since }: { since: string }) {
  const child = useChild()
  const { tl, lang } = useI18n()
  const entries = useEntries(child.id, since)
  const incidents = useIncidents(child.id, since)
  const [who, setWho] = useState('all')
  if (entries === null || incidents === null) return <Spinner />
  const members = Object.entries(child.members)
  const es = entries.filter((e) => who === 'all' || e.authorUid === who).sort((a, b) => b.date.localeCompare(a.date))
  const is = incidents.filter((i) => who === 'all' || i.authorUid === who)

  const summary = (type: keyof typeof TRACKERS, a: Record<string, unknown>) => {
    if (type === 'mood') return `${moodEmoji(a.overallMood)}${a.outburst ? ` · ${tl(T('outburst', 'दौरा'))}` : ''}${a.trigger ? ` · ${tl(T('trigger', 'ट्रिगर'))}` : ''}${a.unusual ? ` · ${a.unusual}` : ''}`
    if (type === 'sleep') return `${a.sleepTime ?? '?'}–${a.wakeTime ?? '?'} · ${a.quality ?? ''}${a.nightWaking ? ` · ${tl(T('woke at night', 'रात में जागा'))}` : ''}`
    return `${a.appetite ?? ''}${a.refusal ? ` · ${tl(T('refused food', 'खाना मना'))}` : ''}${a.notes ? ` · ${a.notes}` : ''}`
  }

  return (
    <>
      <select value={who} onChange={(e) => setWho(e.target.value)} className="mb-4 rounded-xl border-0 bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200">
        <option value="all">{tl(T('All contributors', 'सभी योगदानकर्ता'))}</option>
        {members.map(([uid, m]) => (
          <option key={uid} value={uid}>
            {child.publicId} → {tl(RELATION_LABEL[m.relation])} ({m.name})
          </option>
        ))}
      </select>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-x-auto p-0">
          <h3 className="p-4 pb-2 font-extrabold text-slate-800">{tl(T('Daily tracking', 'दैनिक ट्रैकिंग'))}</h3>
          {es.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-slate-500">—</p>
          ) : (
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {es.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-4 py-2 font-semibold text-slate-600">{formatDate(e.date, lang, { day: 'numeric', month: 'short' })}</td>
                    <td className="px-2 py-2">{TRACKERS[e.type].emoji}</td>
                    <td className="px-2 py-2 text-slate-700">
                      <details>
                        <summary className="cursor-pointer">{summary(e.type, e.answers)}</summary>
                        <EntryAnswers type={e.type} answers={e.answers} />
                      </details>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-400">{tl(RELATION_LABEL[e.authorRelation])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <div>
          <h3 className="mb-2 font-extrabold text-slate-800">{tl(T('Incidents', 'घटनाएँ'))}</h3>
          {is.length === 0 ? <Card className="text-sm text-slate-500">—</Card> : <div className="space-y-2">{is.map((i) => <IncidentCard key={i.id} incident={i} />)}</div>}
        </div>
      </div>
    </>
  )
}

function Questionnaires({ studyId }: { studyId: string }) {
  const child = useChild()
  const { t, tl, lang } = useI18n()
  const items = useAssessments(child.id)
  if (items === null) return <Spinner />
  if (items.length === 0) return <Card className="text-slate-500">{t('noHistory')}</Card>
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <Link key={a.id} to={`/studies/${studyId}/p/${child.id}/a/${a.id}`}>
          <Card className="flex flex-wrap items-center gap-3 p-4 transition hover:ring-brand-200">
            <span className="font-bold text-slate-800">{instrumentName(a.instrument, tl)}</span>
            <Badge className="bg-slate-50 text-slate-600 ring-slate-200">{t(`phase_${a.phase}`)}</Badge>
            {a.studyId === studyId && <Badge className="bg-violet-50 text-violet-700 ring-violet-200">{tl(T('This study', 'यह अध्ययन'))}</Badge>}
            <span className="flex-1 text-sm text-slate-500">
              {formatDate(a.date, lang)} · {tl(RELATION_LABEL[a.authorRelation])}
            </span>
            {a.totalScore !== undefined && <span className="font-extrabold">{a.totalScore}</span>}
          </Card>
        </Link>
      ))}
    </div>
  )
}

function AssignedInterventions({ study, p }: { study: Study; p: Participant }) {
  const profile = useProfile()
  const child = useChild()
  const { tl } = useI18n()
  const items = useInterventions(child.id)
  const [assigning, setAssigning] = useState<'library' | 'custom' | null>(null)
  const [templateId, setTemplateId] = useState(INTERVENTIONS[0].id)
  const [busy, setBusy] = useState(false)
  if (items === null) return <Spinner />

  const base = { status: 'active' as const, source: 'researcher' as const, startDate: today() > p.startDate ? today() : p.startDate, endDate: p.endDate, studyId: study.id, createdBy: profile.uid, createdByName: profile.name }
  const assignLibrary = async () => {
    setBusy(true)
    await createIntervention(child.id, { ...base, templateId, custom: null, domainId: null }).finally(() => setBusy(false))
    setAssigning(null)
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={() => setAssigning('library')}>
          <Plus className="h-4 w-4" /> {tl(T('Assign from library', 'लाइब्रेरी से दें'))}
        </Button>
        <Button variant="secondary" onClick={() => setAssigning('custom')}>
          <Plus className="h-4 w-4" /> {tl(T('Write a custom intervention', 'अपना हस्तक्षेप लिखें'))}
        </Button>
      </div>
      <div className="space-y-3">
        {items.filter((i) => i.status !== 'rejected').map((i) => (
          <InterventionRow key={i.id} i={i} />
        ))}
        {items.length === 0 && <Card className="text-slate-500">—</Card>}
      </div>
      <Modal open={assigning === 'library'} onClose={() => setAssigning(null)} title={tl(T('Assign intervention', 'हस्तक्षेप दें'))}>
        <Field label={tl(T('Intervention', 'हस्तक्षेप'))}>
          <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {INTERVENTIONS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.emoji} {tl(i.title)}
              </option>
            ))}
          </Select>
        </Field>
        <p className="mt-3 text-sm text-slate-500">
          {tl(T('Runs until the end of the study period', 'अध्ययन अवधि के अंत तक'))}: {p.endDate}
        </p>
        <div className="mt-5 flex justify-end">
          <Button onClick={assignLibrary} loading={busy}>
            {tl(T('Assign', 'दें'))}
          </Button>
        </div>
      </Modal>
      <Modal open={assigning === 'custom'} onClose={() => setAssigning(null)} title={tl(T('Custom intervention', 'अपना हस्तक्षेप'))} wide>
        <CustomForm
          onDone={() => setAssigning(null)}
          onSubmit={async (v) => {
            await createIntervention(child.id, { ...base, templateId: null, custom: { title: v.title, description: v.description, steps: v.steps }, domainId: v.domainId, endDate: addDays(base.startDate, v.weeks * 7) })
          }}
        />
      </Modal>
    </>
  )
}

function InterventionRow({ i }: { i: Intervention }) {
  const child = useChild()
  const { tl, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<InterventionLog[] | null>(null)
  useEffect(() => (open ? watchLogs(child.id, i.id, setLogs) : undefined), [open, child.id, i.id])
  const d = describe(i, tl)
  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="text-2xl">{d.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-800">{d.title}</div>
          <div className="text-xs text-slate-500">
            {formatDate(i.startDate, lang)} → {formatDate(i.endDate, lang)} · {i.source === 'researcher' ? tl(T('assigned by you', 'आपके द्वारा दिया गया')) : tl(T('chosen by family', 'परिवार द्वारा चुना गया'))}
          </div>
        </div>
        <Badge className={i.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-50 text-slate-500 ring-slate-200'}>{i.status}</Badge>
        {i.source === 'researcher' && (
          <>
            {i.status === 'active' && (
              <Button size="sm" variant="secondary" onClick={() => setInterventionStatus(child.id, i.id, 'completed')}>
                {tl(T('End', 'समाप्त'))}
              </Button>
            )}
            <button
              onClick={() => window.confirm(tl(T('Delete this intervention and its records?', 'यह हस्तक्षेप और इसके रिकॉर्ड हटाएँ?'))) && deleteIntervention(child.id, i.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1 border-t border-slate-100 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-slate-50">
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} {tl(T('Records', 'रिकॉर्ड'))}
      </button>
      {open && <div className="border-t border-slate-100 bg-sand-50/50 p-4">{logs === null ? <Spinner /> : logs.length === 0 ? <p className="text-sm text-slate-500">—</p> : <LogList logs={logs} fields={d.record} />}</div>}
    </Card>
  )
}

function Tasks({ study }: { study: Study }) {
  const profile = useProfile()
  const child = useChild()
  const { t, tl, lang } = useI18n()
  const tasks = useTasks(child.id)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [kind, setKind] = useState<'text' | 'checkbox'>('text')
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (tasks === null) return <Spinner />
  const members = Object.entries(child.members)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const m = assignee ? child.members[assignee] : null
      await createTask(child.id, {
        studyId: study.id,
        title: title.trim(),
        instructions: instructions.trim(),
        kind,
        dueDate,
        assignedTo: m ? assignee : null,
        assignedToName: m?.name ?? null,
        assignedToRelation: m?.relation ?? null,
        createdBy: profile.uid,
      })
      setOpen(false)
      setTitle('')
      setInstructions('')
      setAssignee('')
    } catch (err) {
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button className="mb-4" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {tl(T('New task', 'नया कार्य'))}
      </Button>
      <div className="space-y-2">
        {tasks.filter((x) => x.studyId === study.id).map((x) => (
          <Card key={x.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-800">{x.title}</span>
                  <Badge className={x.status === 'done' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}>
                    {x.status === 'done' ? tl(T('Done', 'पूरा')) : tl(T('Open', 'खुला'))}
                  </Badge>
                  <Badge className="bg-violet-50 text-violet-700 ring-violet-200">
                    {tl(T('For', 'किसके लिए'))}:{' '}
                    {x.assignedTo && x.assignedToRelation ? `${tl(RELATION_LABEL[x.assignedToRelation])} (${x.assignedToName})` : tl(T('Anyone in the care team', 'देखभाल टीम में कोई भी'))}
                  </Badge>
                </div>
                {x.instructions && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{x.instructions}</p>}
                {x.dueDate && <p className="mt-1 text-xs text-slate-500">{tl(T('Due', 'अंतिम तिथि'))}: {formatDate(x.dueDate, lang)}</p>}
                {x.status === 'done' && (
                  <p className="mt-2 rounded-xl bg-sand-50 p-2 text-sm text-slate-700">
                    {x.response || '✓'} <span className="text-xs text-slate-400">— {x.completedByName}</span>
                  </p>
                )}
              </div>
              <button onClick={() => window.confirm(tl(T('Delete this task?', 'यह कार्य हटाएँ?'))) && deleteTask(child.id, x.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={tl(T('New task', 'नया कार्य'))}>
        <form onSubmit={submit} className="space-y-4">
          <Field label={tl(T('Title', 'शीर्षक'))}>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label={tl(T('Instructions', 'निर्देश'))}>
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </Field>
          <Field label={tl(T('Assign to', 'किसे दें'))}>
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">{tl(T('Anyone in the care team', 'देखभाल टीम में कोई भी'))}</option>
              {members.map(([uid, m]) => (
                <option key={uid} value={uid}>
                  {child.publicId} → {tl(RELATION_LABEL[m.relation])} ({m.name})
                </option>
              ))}
            </Select>
          </Field>
          <Field label={tl(T('Response type', 'उत्तर का प्रकार'))}>
            <Pills
              value={kind}
              onChange={setKind}
              options={[
                { value: 'text' as const, label: tl(T('Written answer', 'लिखित उत्तर')) },
                { value: 'checkbox' as const, label: tl(T('Mark as done', 'पूरा चिह्नित करें')) },
              ]}
            />
          </Field>
          <Field label={`${tl(T('Due date', 'अंतिम तिथि'))} (${t('optional')})`}>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
          <ErrorText>{error}</ErrorText>
          <div className="flex justify-end">
            <Button type="submit" loading={busy}>
              {tl(T('Assign task', 'कार्य दें'))}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function Notes({ studyId }: { studyId: string }) {
  const profile = useProfile()
  const child = useChild()
  const { tl, lang } = useI18n()
  const [notes, setNotes] = useState<ResearchNote[] | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => watchNotes(studyId, child.id, setNotes), [studyId, child.id])
  const add = async () => {
    if (!text.trim()) return
    setBusy(true)
    await addNote(studyId, child.id, text.trim(), profile.name).finally(() => setBusy(false))
    setText('')
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-2">
        {notes === null ? (
          <Spinner />
        ) : notes.length === 0 ? (
          <Card className="text-slate-500">{tl(T('No notes yet. Only you can see these.', 'अभी कोई नोट नहीं। इन्हें केवल आप देख सकते हैं।'))}</Card>
        ) : (
          notes.map((n) => (
            <Card key={n.id} className="p-4">
              <p className="whitespace-pre-wrap text-slate-700">{n.text}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(n.createdAt).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN')} · {n.authorName}
              </p>
            </Card>
          ))
        )}
      </div>
      <Card>
        <Field label={tl(T('Progress note (private to researcher)', 'प्रगति नोट (केवल शोधकर्ता के लिए)'))}>
          <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Button className="mt-3 w-full" onClick={add} loading={busy}>
          {tl(T('Add note', 'नोट जोड़ें'))}
        </Button>
      </Card>
    </div>
  )
}

/** Every answer in a diary entry, labelled with its question, for the researcher's full view. */
function EntryAnswers({ type, answers }: { type: keyof typeof TRACKERS; answers: Record<string, unknown> }) {
  const { tl } = useI18n()
  const fmt = (q: (typeof TRACKERS)[typeof type]['questions'][number]): string | null => {
    const v = answers[q.id]
    if (v === undefined || v === null || v === '') return null
    if (v === 'na') return tl(T('Not applicable', 'लागू नहीं'))
    if (q.kind === 'mood') return moodEmoji(v)
    if (q.kind === 'choice') return tl(q.options.find((o) => o.value === v)?.label ?? { en: String(v), hi: String(v) })
    if (q.kind === 'yesno') {
      const d = answers[`${q.id}_details`]
      return `${v ? tl(T('Yes', 'हाँ')) : tl(T('No', 'नहीं'))}${d ? ` — ${d}` : ''}`
    }
    return String(v)
  }
  return (
    <dl className="mt-2 space-y-1 rounded-xl bg-sand-50 p-3 text-xs">
      {TRACKERS[type].questions.map((q) => {
        const v = fmt(q)
        return v === null ? null : (
          <div key={q.id}>
            <dt className="inline text-slate-500">{tl(q.label)}: </dt>
            <dd className="inline font-semibold text-slate-700">{v}</dd>
          </div>
        )
      })}
    </dl>
  )
}
