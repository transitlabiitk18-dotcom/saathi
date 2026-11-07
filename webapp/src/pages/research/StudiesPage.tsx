import { ChevronRight, FlaskConical, Plus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Empty, ErrorText, Field, Input, PageHeader, Select, Spinner, Textarea, cx } from '../../components/ui'
import { useProfile } from '../../context/AuthContext'
import { INTERVENTIONS } from '../../content/interventions'
import { instrumentName } from '../../content/instruments'
import { DEFAULT_STUDY_CONSENT } from '../../content/studyConsent'
import { T, useI18n } from '../../i18n'
import { formatDate, toISODate } from '../../lib/dates'
import { createStudy, watchMyStudies, watchParticipants } from '../../lib/db'
import type { InstrumentId, Participant, Study } from '../../lib/types'

export function StudiesPage() {
  const profile = useProfile()
  const { tl } = useI18n()
  const navigate = useNavigate()
  const [studies, setStudies] = useState<Study[] | null>(null)
  useEffect(() => watchMyStudies(profile.uid, setStudies), [profile.uid])

  const action = (
    <Button onClick={() => navigate('/studies/new')}>
      <Plus className="h-4 w-4" /> {tl(T('Create research study', 'शोध अध्ययन बनाएँ'))}
    </Button>
  )
  if (studies === null) return <Spinner />
  return (
    <>
      <PageHeader emoji="🔬" title={tl(T('Research studies', 'शोध अध्ययन'))} subtitle={tl(T('Create studies, share the invitation code, and monitor participants.', 'अध्ययन बनाएँ, आमंत्रण कोड साझा करें और प्रतिभागियों की निगरानी करें।'))} action={studies.length > 0 ? action : undefined} />
      {studies.length === 0 ? (
        <Empty emoji="🔬" title={tl(T('No studies yet', 'अभी कोई अध्ययन नहीं'))} hint={tl(T('Create a study to get an invitation code for participants.', 'प्रतिभागियों के लिए आमंत्रण कोड पाने हेतु अध्ययन बनाएँ।'))} action={action} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {studies.map((s) => (
            <StudyCard key={s.id} study={s} />
          ))}
        </div>
      )}
    </>
  )
}

function StudyCard({ study }: { study: Study }) {
  const { tl, lang } = useI18n()
  const [ps, setPs] = useState<Participant[]>([])
  useEffect(() => watchParticipants(study.id, setPs), [study.id])
  const active = ps.filter((p) => p.status === 'active').length
  const requests = ps.filter((p) => p.status === 'withdrawalRequested').length
  return (
    <Link to={`/studies/${study.id}`}>
      <Card className="transition hover:ring-brand-200">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-600">
            <FlaskConical className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-extrabold text-slate-800">{study.title}</span>
              {!study.active && <Badge className="bg-slate-50 text-slate-500 ring-slate-200">{tl(T('Closed', 'बंद'))}</Badge>}
            </div>
            <div className="text-sm text-slate-500">
              {study.durationWeeks} {tl(T('weeks', 'सप्ताह'))} · {formatDate(toISODate(new Date(study.createdAt)), lang)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-brand-50 text-brand-700 ring-brand-200">
                {active} {tl(T('active', 'सक्रिय'))}
              </Badge>
              <Badge className="bg-slate-50 text-slate-600 ring-slate-200">
                {ps.length} {tl(T('enrolled', 'नामांकित'))}
              </Badge>
              {requests > 0 && (
                <Badge className="bg-amber-50 text-amber-700 ring-amber-200">
                  {requests} {tl(T('withdrawal requests', 'वापसी अनुरोध'))}
                </Badge>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </div>
      </Card>
    </Link>
  )
}

const ALL_INSTRUMENTS: InstrumentId[] = ['checklist', 'atec', 'mchat']

export function NewStudyPage() {
  const profile = useProfile()
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [weeks, setWeeks] = useState(6)
  const [instruments, setInstruments] = useState<InstrumentId[]>(['checklist'])
  const [templates, setTemplates] = useState<string[]>([])
  const [consentText, setConsentText] = useState(DEFAULT_STUDY_CONSENT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const toggle = <X,>(list: X[], v: X) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (instruments.length === 0) return setError(tl(T('Choose at least one questionnaire.', 'कम से कम एक प्रश्नावली चुनें।')))
    setBusy(true)
    try {
      const id = await createStudy(profile, { title: title.trim(), description: description.trim(), durationWeeks: weeks, instruments, interventionTemplateIds: templates, consentText })
      navigate(`/studies/${id}`, { replace: true })
    } catch (err) {
      setError(String(err))
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader emoji="🧪" title={tl(T('Create research study', 'शोध अध्ययन बनाएँ'))} />
      <form onSubmit={submit}>
        <Card className="space-y-5">
          <Field label={tl(T('Study title', 'अध्ययन का शीर्षक'))}>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label={tl(T('Description shown to participants', 'प्रतिभागियों को दिखने वाला विवरण'))}>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label={tl(T('Intervention duration', 'हस्तक्षेप अवधि'))} hint={tl(T('The follow-up questionnaire is scheduled automatically at the end.', 'अंत में फ़ॉलो-अप प्रश्नावली अपने-आप निर्धारित होती है।'))}>
            <Select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="max-w-48">
              {[4, 6, 8, 10, 12].map((w) => (
                <option key={w} value={w}>
                  {w} {tl(T('weeks', 'सप्ताह'))}
                </option>
              ))}
            </Select>
          </Field>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">{tl(T('Assessment schedule — questionnaires at baseline and follow-up', 'आकलन कार्यक्रम — शुरुआत और फ़ॉलो-अप पर प्रश्नावली'))}</div>
            <div className="flex flex-wrap gap-2">
              {ALL_INSTRUMENTS.map((i) => (
                <Chip key={i} on={instruments.includes(i)} onClick={() => setInstruments((l) => toggle(l, i))}>
                  {instrumentName(i, tl)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-700">{tl(T('Interventions every participant starts with (optional)', 'हर प्रतिभागी के लिए हस्तक्षेप (वैकल्पिक)'))}</div>
            <div className="flex flex-wrap gap-2">
              {INTERVENTIONS.map((i) => (
                <Chip key={i.id} on={templates.includes(i.id)} onClick={() => setTemplates((l) => toggle(l, i.id))}>
                  {i.emoji} {tl(i.title)}
                </Chip>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">{tl(T('You can also assign interventions and tasks to individual participants later.', 'बाद में आप अलग-अलग प्रतिभागियों को हस्तक्षेप और कार्य भी दे सकते हैं।'))}</p>
          </div>
          <Field label={tl(T('Study consent (shown before joining)', 'अध्ययन सहमति (जुड़ने से पहले दिखाई जाती है)'))} hint={tl(T('A basic template — edit it for your study.', 'एक सरल नमूना — अपने अध्ययन के अनुसार बदलें।'))}>
            <Textarea rows={10} required value={consentText} onChange={(e) => setConsentText(e.target.value)} />
          </Field>
          <ErrorText>{error}</ErrorText>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              {t('cancel')}
            </Button>
            <Button type="submit" loading={busy}>
              {tl(T('Create study', 'अध्ययन बनाएँ'))}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition', on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50')}
    >
      {children}
    </button>
  )
}
