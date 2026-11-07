import { ArrowLeft, Check, ChevronRight, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Button, Card, Modal, PageHeader, Spinner, cx } from '../../components/ui'
import { INTERVENTION_BY_ID } from '../../content/interventions'
import { instrumentName } from '../../content/instruments'
import { T, useI18n } from '../../i18n'
import { ageLabel, daysBetween, formatDate, toISODate, today } from '../../lib/dates'
import { completeWithdrawal, updateStudy, watchParticipants, watchStudy } from '../../lib/db'
import { loadParticipantSummary, type ParticipantSummary } from '../../lib/research'
import type { Participant, Study } from '../../lib/types'

export function StudyPage() {
  const { sid = '' } = useParams()
  const { tl, lang } = useI18n()
  const navigate = useNavigate()
  const [study, setStudy] = useState<Study | null | undefined>(undefined)
  const [ps, setPs] = useState<Participant[] | null>(null)
  const [summaries, setSummaries] = useState<Record<string, ParticipantSummary>>({})
  const [copied, setCopied] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)

  useEffect(() => watchStudy(sid, setStudy), [sid])
  useEffect(() => watchParticipants(sid, setPs), [sid])
  useEffect(() => {
    if (!ps) return
    let cancelled = false
    ;(async () => {
      for (const p of ps.filter((x) => x.status !== 'withdrawn')) {
        const s = await loadParticipantSummary(sid, p).catch(() => null)
        if (!cancelled && s) setSummaries((m) => ({ ...m, [p.childId]: s }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ps, sid])

  if (study === undefined || ps === null) return <Spinner />
  if (study === null) return <p className="text-slate-500">—</p>

  const active = ps.filter((p) => p.status === 'active')
  const requests = ps.filter((p) => p.status === 'withdrawalRequested')
  const sums = Object.values(summaries)
  const avg = (xs: (number | null)[]) => {
    const v = xs.filter((x): x is number => x !== null)
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null
  }
  const adherence = avg(sums.map((s) => (s.expectedDays ? (s.trackingDays / s.expectedDays) * 100 : null)))
  const prePost = ps
    .filter((p) => summaries[p.childId])
    .map((p) => ({ name: p.childPublicId, pre: summaries[p.childId].pre, post: summaries[p.childId].post }))
    .filter((r) => r.pre !== null || r.post !== null)

  const copy = async () => {
    await navigator.clipboard.writeText(study.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <button onClick={() => navigate('/')} className="mb-5 flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> {tl(T('Studies', 'अध्ययन'))}
      </button>
      <PageHeader
        title={study.title}
        subtitle={`${study.durationWeeks} ${tl(T('weeks', 'सप्ताह'))} · ${study.instruments.map((i) => instrumentName(i, tl)).join(', ')}`}
        action={
          <Button variant="secondary" onClick={() => updateStudy(study.id, { active: !study.active })}>
            {study.active ? tl(T('Close enrolment', 'नामांकन बंद करें')) : tl(T('Reopen enrolment', 'नामांकन फिर खोलें'))}
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="bg-violet-50 ring-violet-100">
          <div className="text-xs font-bold uppercase tracking-wide text-violet-700">{tl(T('Study invitation code', 'अध्ययन आमंत्रण कोड'))}</div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-mono text-2xl font-bold tracking-[0.2em] text-violet-900">{study.code}</span>
            <Button size="sm" variant="secondary" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-xs text-violet-800">
            {study.active
              ? tl(T('Participants enter this in Settings → Research studies.', 'प्रतिभागी इसे सेटिंग्स → शोध अध्ययन में दर्ज करते हैं।'))
              : tl(T('Enrolment is closed.', 'नामांकन बंद है।'))}
          </p>
          <button onClick={() => setConsentOpen(true)} className="mt-2 text-xs font-bold text-violet-700 hover:underline">
            {tl(T('View study consent', 'अध्ययन सहमति देखें'))}
          </button>
        </Card>
        <Stat label={tl(T('Active participants', 'सक्रिय प्रतिभागी'))} value={`${active.length}`} sub={`${ps.length} ${tl(T('enrolled in total', 'कुल नामांकित'))}`} />
        <Stat
          label={tl(T('Average tracking adherence', 'औसत ट्रैकिंग पालन'))}
          value={adherence === null ? '—' : `${adherence}%`}
          sub={study.interventionTemplateIds.length ? study.interventionTemplateIds.map((id) => INTERVENTION_BY_ID[id]?.emoji).join(' ') : undefined}
        />
      </div>

      {requests.length > 0 && (
        <Card className="mt-5 ring-amber-200">
          <h2 className="mb-3 text-lg font-extrabold text-amber-900">{tl(T('Withdrawal requests', 'वापसी अनुरोध'))}</h2>
          <div className="space-y-2">
            {requests.map((p) => (
              <WithdrawalRow key={p.childId} studyId={study.id} p={p} />
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-5 overflow-x-auto p-0">
        <div className="p-5 pb-3">
          <h2 className="text-lg font-extrabold text-slate-800">{tl(T('Participants', 'प्रतिभागी'))}</h2>
        </div>
        {ps.length === 0 ? (
          <p className="px-5 pb-5 text-slate-500">{tl(T('No participants yet. Share the invitation code.', 'अभी कोई प्रतिभागी नहीं। आमंत्रण कोड साझा करें।'))}</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-y border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-2">{tl(T('Child ID', 'बाल ID'))}</th>
                <th className="px-3 py-2">{tl(T('Week', 'सप्ताह'))}</th>
                <th className="px-3 py-2">{tl(T('Tracking', 'ट्रैकिंग'))}</th>
                <th className="px-3 py-2">{tl(T('Sessions', 'सत्र'))}</th>
                <th className="px-3 py-2">{tl(T('Tasks', 'कार्य'))}</th>
                <th className="px-3 py-2">{tl(T('Incidents', 'घटनाएँ'))}</th>
                <th className="px-3 py-2">{tl(T('Last activity', 'अंतिम गतिविधि'))}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ps.map((p) => {
                const s = summaries[p.childId]
                const week = Math.min(study.durationWeeks, Math.floor(Math.max(0, daysBetween(p.startDate, today())) / 7) + 1)
                const pct = s ? Math.round((s.trackingDays / s.expectedDays) * 100) : null
                const row = (
                  <>
                    <td className="px-5 py-3">
                      <div className="font-mono font-bold text-slate-800">{p.childPublicId}</div>
                      <div className="text-xs text-slate-500">
                        {ageLabel(p.childDob, lang)} · {formatDate(toISODate(new Date(p.enrolledAt)), lang)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {p.status === 'withdrawn' ? (
                        <Badge className="bg-slate-50 text-slate-500 ring-slate-200">{tl(T('Withdrawn', 'हट गए'))}</Badge>
                      ) : (
                        <span className="font-semibold">
                          {week}/{study.durationWeeks}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">{pct === null ? '…' : <span className={cx('font-bold', pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-rose-600')}>{pct}%</span>}</td>
                    <td className="px-3 py-3">{s?.sessions ?? '…'}</td>
                    <td className="px-3 py-3">{s ? `${s.tasksDone}/${s.tasksTotal}` : '…'}</td>
                    <td className="px-3 py-3">{s?.incidents ?? '…'}</td>
                    <td className="px-3 py-3 text-slate-500">{s?.lastActivity ? formatDate(s.lastActivity, lang) : '—'}</td>
                    <td className="px-3 py-3">{p.status !== 'withdrawn' && <ChevronRight className="h-4 w-4 text-slate-300" />}</td>
                  </>
                )
                return p.status === 'withdrawn' ? (
                  <tr key={p.childId} className="opacity-50">
                    {row}
                  </tr>
                ) : (
                  <tr key={p.childId} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/studies/${study.id}/p/${p.childId}`)}>
                    {row}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="mt-5">
        <h2 className="text-lg font-extrabold text-slate-800">{tl(T('Pre vs post — mean domain need score', 'पहले बनाम बाद — औसत क्षेत्र आवश्यकता अंक'))}</h2>
        <p className="mb-4 text-sm text-slate-500">{tl(T('Domain screening questionnaire, averaged over domains. Lower after the intervention = improvement.', 'क्षेत्रवार प्रश्नावली, सभी क्षेत्रों का औसत। हस्तक्षेप के बाद कम = सुधार।'))}</p>
        {prePost.length === 0 ? (
          <div className="grid h-40 place-items-center rounded-2xl bg-sand-50 text-slate-400">{tl(T('Not enough data yet.', 'अभी पर्याप्त डेटा नहीं।'))}</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={prePost} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(v: number) => Math.round(v)} />
                <Legend />
                <Bar dataKey="pre" name={tl(T('Baseline', 'आधार-रेखा'))} fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="post" name={tl(T('Post-intervention', 'हस्तक्षेप के बाद'))} fill="#35847b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Modal open={consentOpen} onClose={() => setConsentOpen(false)} title={tl(T('Study consent', 'अध्ययन सहमति'))} wide>
        <div className="whitespace-pre-wrap text-sm text-slate-700">{study.consentText}</div>
        {study.description && (
          <>
            <div className="mb-1 mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">{tl(T('Description', 'विवरण'))}</div>
            <p className="text-sm text-slate-700">{study.description}</p>
          </>
        )}
      </Modal>
      <p className="mt-6 text-center text-xs text-slate-400">
        <Link to="/" className="hover:underline">
          ← {tl(T('All studies', 'सभी अध्ययन'))}
        </Link>
      </p>
    </>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-slate-800">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </Card>
  )
}

function WithdrawalRow({ studyId, p }: { studyId: string; p: Participant }) {
  const { tl, lang } = useI18n()
  const [busy, setBusy] = useState(false)
  const approve = async () => {
    const msg = p.deleteDataRequested
      ? tl(T('Approve withdrawal and delete this participant’s research data (tasks, assigned interventions, notes)? This cannot be undone.', 'वापसी स्वीकार करें और इस प्रतिभागी का शोध डेटा (कार्य, दिए गए हस्तक्षेप, नोट्स) हटाएँ? इसे वापस नहीं किया जा सकता।'))
      : tl(T('Approve withdrawal? You will lose access to this child’s data.', 'वापसी स्वीकार करें? आप इस बच्चे के डेटा तक पहुँच खो देंगे।'))
    if (!window.confirm(msg)) return
    setBusy(true)
    await completeWithdrawal(studyId, p.childId, p.deleteDataRequested).finally(() => setBusy(false))
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 p-3">
      <span className="font-mono font-bold">{p.childPublicId}</span>
      <span className="flex-1 text-sm text-amber-900">
        {p.withdrawalRequestedAt ? formatDate(toISODate(new Date(p.withdrawalRequestedAt)), lang) : ''} ·{' '}
        {p.deleteDataRequested ? tl(T('asks to delete research data', 'शोध डेटा हटाने का अनुरोध')) : tl(T('keep research data', 'शोध डेटा रखें'))}
      </span>
      <Button size="sm" onClick={approve} loading={busy}>
        {tl(T('Approve', 'स्वीकार करें'))}
      </Button>
    </div>
  )
}
