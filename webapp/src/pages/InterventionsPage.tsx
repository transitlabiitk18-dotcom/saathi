import { ChevronRight, FlaskConical, Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { INDIVIDUAL_WEEKS, InterventionDetails, Recommendations, describe } from '../components/interventionUi'
import { Badge, Button, Card, ErrorText, Field, Input, Modal, PageHeader, Select, Spinner, Textarea, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { DOMAINS, DOMAIN_BY_ID } from '../content/domains'
import { INTERVENTIONS, type InterventionTemplate } from '../content/interventions'
import { T, useI18n } from '../i18n'
import { addDays, daysBetween, formatDate, today } from '../lib/dates'
import { createIntervention } from '../lib/db'
import { latestChecklist, useAssessments, useInterventions } from '../lib/hooks'
import type { Intervention } from '../lib/types'

export function InterventionsPage() {
  const child = useChild()
  const { tl, lang } = useI18n()
  const interventions = useInterventions(child.id)
  const assessments = useAssessments(child.id)
  const [library, setLibrary] = useState<InterventionTemplate | null>(null)
  const [custom, setCustom] = useState(false)
  const [domainFilter, setDomainFilter] = useState('all')

  if (interventions === null || assessments === null) return <Spinner />
  const active = interventions.filter((i) => i.status === 'active')
  const past = interventions.filter((i) => i.status === 'completed')
  const latest = latestChecklist(assessments)
  const lib = INTERVENTIONS.filter((i) => domainFilter === 'all' || i.domains.includes(domainFilter))

  return (
    <>
      <PageHeader
        emoji="🧩"
        title={tl(T('Interventions', 'हस्तक्षेप'))}
        subtitle={tl(T('Recommended strategies, the ones you are doing, and your own.', 'सुझाई गई रणनीतियाँ, जो आप कर रहे हैं, और आपकी अपनी।'))}
        action={
          <Button onClick={() => setCustom(true)}>
            <Plus className="h-4 w-4" /> {tl(T('Add intervention', 'हस्तक्षेप जोड़ें'))}
          </Button>
        }
      />

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{tl(T('Active', 'सक्रिय'))}</h2>
      {active.length === 0 ? (
        <Card className="mb-8 text-slate-500">{tl(T('No active interventions. Accept a recommendation or start one from the library below.', 'कोई सक्रिय हस्तक्षेप नहीं। नीचे से कोई सुझाव स्वीकार करें या लाइब्रेरी से शुरू करें।'))}</Card>
      ) : (
        <div className="mb-8 grid gap-3 md:grid-cols-2">
          {active.map((i) => (
            <ActiveCard key={i.id} i={i} />
          ))}
        </div>
      )}

      {latest?.domainScores && (
        <>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-400">{tl(T('Recommended for you', 'आपके लिए सुझाव'))}</h2>
          <p className="mb-3 text-sm text-slate-500">
            {tl(T('Based on the questionnaire of', 'प्रश्नावली के आधार पर'))} {formatDate(latest.date, lang)}
          </p>
          <div className="mb-8">
            <Recommendations scores={latest.domainScores} interventions={interventions} />
          </div>
        </>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{tl(T('Intervention strategies', 'हस्तक्षेप रणनीतियाँ'))}</h2>
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="rounded-xl border-0 bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200">
          <option value="all">{tl(T('All domains', 'सभी क्षेत्र'))}</option>
          {DOMAINS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.emoji} {tl(d.name)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {lib.map((tpl) => (
          <button key={tpl.id} onClick={() => setLibrary(tpl)} className="text-left">
            <Card className="h-full p-4 transition hover:ring-brand-200">
              <div className="text-3xl">{tpl.emoji}</div>
              <div className="mt-2 font-extrabold text-slate-800">{tl(tpl.title)}</div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{tl(tpl.what)}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {tpl.domains.map((d) => (
                  <span key={d} className="rounded-lg bg-sand-50 px-1.5 py-0.5 text-xs" title={tl(DOMAIN_BY_ID[d].name)}>
                    {DOMAIN_BY_ID[d].emoji}
                  </span>
                ))}
              </div>
            </Card>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">{tl(T('Starter library — will be replaced by the team’s AEPS-3-inspired interventions.', 'प्रारंभिक लाइब्रेरी — टीम के AEPS-3 आधारित हस्तक्षेपों से बदली जाएगी।'))}</p>

      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-slate-400">{tl(T('Completed', 'पूर्ण'))}</h2>
          <div className="grid gap-3 opacity-70 md:grid-cols-2">
            {past.map((i) => (
              <ActiveCard key={i.id} i={i} />
            ))}
          </div>
        </>
      )}

      <Modal open={library !== null} onClose={() => setLibrary(null)} title={library ? `${library.emoji} ${tl(library.title)}` : ''} wide>
        {library && <LibraryDetail tpl={library} existing={interventions.find((i) => i.templateId === library.id && i.status === 'active')} onDone={() => setLibrary(null)} />}
      </Modal>
      <Modal open={custom} onClose={() => setCustom(false)} title={tl(T('Add your own intervention', 'अपना हस्तक्षेप जोड़ें'))} wide>
        <CustomForm onDone={() => setCustom(false)} />
      </Modal>
    </>
  )
}

function ActiveCard({ i }: { i: Intervention }) {
  const { tl, lang } = useI18n()
  const d = describe(i, tl)
  const total = Math.max(1, daysBetween(i.startDate, i.endDate))
  const done = Math.min(total, Math.max(0, daysBetween(i.startDate, today())))
  const finished = i.endDate < today()
  return (
    <Link to={`/interventions/${i.id}`}>
      <Card className="flex items-center gap-4 p-4 transition hover:ring-brand-200">
        <span className="text-3xl">{d.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-slate-800">{d.title}</span>
            {i.studyId && (
              <Badge className="bg-violet-50 text-violet-700 ring-violet-200">
                <FlaskConical className="h-3 w-3" /> {tl(T('Study', 'अध्ययन'))}
              </Badge>
            )}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">
            {formatDate(i.startDate, lang)} → {formatDate(i.endDate, lang)}
            {finished && i.status === 'active' && <span className="text-amber-600"> · {tl(T('period ended', 'अवधि पूरी'))}</span>}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className={cx('h-full rounded-full', finished ? 'bg-amber-400' : 'bg-brand-500')} style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300" />
      </Card>
    </Link>
  )
}

function LibraryDetail({ tpl, existing, onDone }: { tpl: InterventionTemplate; existing?: Intervention; onDone: () => void }) {
  const profile = useProfile()
  const child = useChild()
  const { tl } = useI18n()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const start = async () => {
    setBusy(true)
    const s = today()
    const id = await createIntervention(child.id, {
      templateId: tpl.id,
      custom: null,
      domainId: tpl.domains[0] ?? null,
      status: 'active',
      source: 'library',
      startDate: s,
      endDate: addDays(s, INDIVIDUAL_WEEKS * 7),
      studyId: null,
      createdBy: profile.uid,
      createdByName: profile.name,
    })
    onDone()
    navigate(`/interventions/${id}`)
  }
  return (
    <>
      <InterventionDetails what={tl(tpl.what)} how={tl(tpl.how)} steps={tpl.steps.map(tl)} record={tpl.record} tool={tpl.tool} />
      <div className="mt-6 flex justify-end gap-2">
        {existing ? (
          <Button onClick={() => (onDone(), navigate(`/interventions/${existing.id}`))}>{tl(T('Open active intervention', 'सक्रिय हस्तक्षेप खोलें'))}</Button>
        ) : (
          <Button onClick={start} loading={busy}>
            {tl(T(`Start (${INDIVIDUAL_WEEKS} weeks)`, `शुरू करें (${INDIVIDUAL_WEEKS} सप्ताह)`))}
          </Button>
        )}
      </div>
    </>
  )
}

export function CustomForm({ onDone, onSubmit }: { onDone: () => void; onSubmit?: (v: { title: string; description: string; steps: string[]; weeks: number; domainId: string | null }) => Promise<void> }) {
  const profile = useProfile()
  const child = useChild()
  const { t, tl } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<string[]>([''])
  const [weeks, setWeeks] = useState(INDIVIDUAL_WEEKS)
  const [domainId, setDomainId] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const clean = steps.map((s) => s.trim()).filter(Boolean)
      if (onSubmit) await onSubmit({ title: title.trim(), description: description.trim(), steps: clean, weeks, domainId: domainId || null })
      else {
        const s = today()
        await createIntervention(child.id, {
          templateId: null,
          custom: { title: title.trim(), description: description.trim(), steps: clean },
          domainId: domainId || null,
          status: 'active',
          source: 'custom',
          startDate: s,
          endDate: addDays(s, weeks * 7),
          studyId: null,
          createdBy: profile.uid,
          createdByName: profile.name,
        })
      }
      onDone()
    } catch (err) {
      setError(String(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label={tl(T('Title', 'शीर्षक'))}>
        <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label={tl(T('What it involves', 'इसमें क्या है'))}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tl(T('Domain', 'क्षेत्र'))}>
          <Select value={domainId} onChange={(e) => setDomainId(e.target.value)}>
            <option value="">—</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {tl(d.name)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={tl(T('Duration (weeks)', 'अवधि (सप्ताह)'))}>
          <Select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
            {[2, 4, 6, 8, 12].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div>
        <div className="mb-1.5 text-sm font-semibold text-slate-700">{tl(T('Steps', 'चरण'))}</div>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-2">
              <span className="grid h-10 w-8 shrink-0 place-items-center font-bold text-slate-400">{i + 1}</span>
              <Input value={s} onChange={(e) => setSteps((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" onClick={() => setSteps((l) => l.filter((_, j) => j !== i))} className="rounded-lg p-2 text-slate-400 hover:text-rose-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => setSteps((l) => [...l, ''])}>
          <Plus className="h-4 w-4" /> {tl(T('Add step', 'चरण जोड़ें'))}
        </Button>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="flex justify-end gap-2">
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
