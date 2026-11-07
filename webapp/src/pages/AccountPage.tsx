import { Bell, BellOff, Download, ExternalLink, FlaskConical, LogOut, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { LangToggle } from '../components/Layout'
import { useRemindersEnabled } from '../components/reminders'
import { Badge, Button, Card, ErrorText, Field, Input, Modal, PageHeader, Select } from '../components/ui'
import { useAuth, useProfile, useSaveLang } from '../context/AuthContext'
import { useChildren } from '../context/ChildContext'
import { RESOURCES } from '../content/resources'
import { T, useI18n } from '../i18n'
import { deleteMyAccount, exportChildrenData } from '../lib/account'
import { formatDate, toISODate } from '../lib/dates'
import { enrolChild, findStudyByCode, getParticipant, getStudy, requestWithdrawal } from '../lib/db'
import type { Child, Participant, Study } from '../lib/types'
import { ConsentBody } from './ConsentPage'

export function AccountPage() {
  const profile = useProfile()
  const { signOut } = useAuth()
  const { t, tl, lang } = useI18n()
  const setLang = useSaveLang()
  const general = profile.consent?.general
  const research = profile.consent?.research
  const isIndividual = profile.mode === 'individual'

  return (
    <>
      <PageHeader emoji="⚙️" title={tl(T('Settings', 'सेटिंग्स'))} />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{t('profile')}</h2>
          <dl className="space-y-3 text-sm">
            <Row k={t('fullName')} v={profile.name} />
            <Row k={t('email')} v={profile.email} />
            <Row k={tl(T('Mode', 'मोड'))} v={isIndividual ? tl(T('Individual', 'व्यक्तिगत')) : tl(T('Researcher', 'शोधकर्ता'))} />
          </dl>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-semibold text-slate-700">{t('language')}</span>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <Button variant="secondary" className="mt-5 w-full" onClick={signOut}>
            <LogOut className="h-4 w-4" /> {t('signOut')}
          </Button>
        </Card>

        {isIndividual ? <NotificationsCard /> : <ResourcesCard />}
        {isIndividual && <ResearchCard />}
        {isIndividual && <ResourcesCard />}

        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-800">{tl(T('Privacy & consent', 'गोपनीयता और सहमति'))}</h2>
            {general && <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">{t('consentGiven', { date: formatDate(toISODate(new Date(general.at)), lang) })}</Badge>}
            {research && <Badge className="bg-slate-50 text-slate-600 ring-slate-200">{research.accepted ? t('consentResearchYes') : t('consentResearchNo')}</Badge>}
          </div>
          <ConsentBody />
        </Card>

        <DataCard />
      </div>
    </>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-semibold text-slate-800">{v}</dd>
    </div>
  )
}

function NotificationsCard() {
  const { tl } = useI18n()
  const [on, enable, disable] = useRemindersEnabled()
  const supported = 'Notification' in window
  return (
    <Card>
      <h2 className="mb-2 text-lg font-extrabold text-slate-800">🔔 {tl(T('Notifications', 'सूचनाएँ'))}</h2>
      <p className="mb-4 text-sm text-slate-500">
        {tl(
          T(
            'Daily tracking reminders after 6 pm while the app is open in a browser tab. Follow-up and study reminders always show on the Home page.',
            'ऐप ब्राउज़र टैब में खुला होने पर शाम 6 बजे के बाद दैनिक ट्रैकिंग रिमाइंडर। फ़ॉलो-अप और अध्ययन रिमाइंडर हमेशा होम पेज पर दिखते हैं।',
          ),
        )}
      </p>
      {!supported ? (
        <p className="text-sm text-slate-400">{tl(T('This browser does not support notifications.', 'यह ब्राउज़र सूचनाएँ समर्थित नहीं करता।'))}</p>
      ) : on ? (
        <Button variant="secondary" onClick={disable}>
          <BellOff className="h-4 w-4" /> {tl(T('Turn off reminders', 'रिमाइंडर बंद करें'))}
        </Button>
      ) : (
        <Button onClick={enable}>
          <Bell className="h-4 w-4" /> {tl(T('Turn on reminders', 'रिमाइंडर चालू करें'))}
        </Button>
      )}
    </Card>
  )
}

function ResourcesCard() {
  const { t, tl } = useI18n()
  return (
    <Card>
      <h2 className="text-lg font-extrabold text-slate-800">📚 {t('resources')}</h2>
      <p className="mb-4 text-sm text-slate-500">{t('resourcesHint')}</p>
      <div className="space-y-2">
        {RESOURCES.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-sand-50 p-3 ring-1 ring-sand-200 transition hover:ring-brand-300">
            <span className="text-2xl">📄</span>
            <span className="flex-1">
              <span className="block font-bold text-slate-700">{tl(r.title)}</span>
              <span className="block text-xs text-slate-500">{r.source}</span>
            </span>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
        ))}
      </div>
    </Card>
  )
}

// ---------------- Research participation (individual users) ----------------

function ResearchCard() {
  const { children } = useChildren()
  const { tl } = useI18n()
  const [joining, setJoining] = useState(false)
  const enrolled = children.filter((c) => c.studyId)
  return (
    <Card>
      <h2 className="mb-2 text-lg font-extrabold text-slate-800">🔬 {tl(T('Research studies', 'शोध अध्ययन'))}</h2>
      <p className="mb-4 text-sm text-slate-500">{tl(T('Join a study with the invitation code a researcher gave you.', 'शोधकर्ता द्वारा दिए गए आमंत्रण कोड से अध्ययन में जुड़ें।'))}</p>
      <div className="space-y-3">
        {enrolled.map((c) => (
          <EnrolledRow key={c.id} child={c} />
        ))}
      </div>
      <Button className="mt-4" onClick={() => setJoining(true)} disabled={children.length === 0}>
        <FlaskConical className="h-4 w-4" /> {tl(T('Join research study', 'शोध अध्ययन में जुड़ें'))}
      </Button>
      <Modal open={joining} onClose={() => setJoining(false)} title={tl(T('Join research study', 'शोध अध्ययन में जुड़ें'))} wide>
        <JoinStudy onDone={() => setJoining(false)} />
      </Modal>
    </Card>
  )
}

function EnrolledRow({ child }: { child: Child }) {
  const { tl, lang } = useI18n()
  const [study, setStudy] = useState<Study | null>(null)
  const [p, setP] = useState<Participant | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [deleteData, setDeleteData] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!child.studyId) return
    getStudy(child.studyId).then(setStudy)
    getParticipant(child.studyId, child.id).then(setP)
  }, [child.studyId, child.id])
  if (!study || !p) return null

  const submit = async () => {
    setBusy(true)
    await requestWithdrawal(study.id, child.id, deleteData)
    setP({ ...p, status: 'withdrawalRequested', deleteDataRequested: deleteData })
    setBusy(false)
    setWithdrawing(false)
  }

  return (
    <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
      <div className="font-bold text-violet-900">{study.title}</div>
      <div className="text-sm text-violet-800">
        {child.name} · {formatDate(p.startDate, lang)} → {formatDate(p.endDate, lang)} · {study.ownerName}
      </div>
      {p.status === 'withdrawalRequested' ? (
        <Badge className="mt-2 bg-amber-50 text-amber-700 ring-amber-200">{tl(T('Withdrawal requested — waiting for researcher', 'वापसी का अनुरोध — शोधकर्ता की प्रतीक्षा'))}</Badge>
      ) : (
        <Button variant="danger" size="sm" className="mt-3" onClick={() => setWithdrawing(true)}>
          <LogOut className="h-4 w-4" /> {tl(T('Withdraw from study', 'अध्ययन से हटें'))}
        </Button>
      )}
      <Modal open={withdrawing} onClose={() => setWithdrawing(false)} title={tl(T('Withdraw from study', 'अध्ययन से हटें'))}>
        <p className="text-slate-600">{tl(T('Your request will be sent to the researcher. Your own diary data stays in your account.', 'आपका अनुरोध शोधकर्ता को भेजा जाएगा। आपका अपना डायरी डेटा आपके खाते में रहेगा।'))}</p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-600" checked={deleteData} onChange={(e) => setDeleteData(e.target.checked)} />
          <span className="text-slate-700">{tl(T('Also delete my research data (tasks, assigned interventions, researcher notes)', 'मेरा शोध डेटा भी हटाएँ (कार्य, दिए गए हस्तक्षेप, शोधकर्ता नोट्स)'))}</span>
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setWithdrawing(false)}>
            {tl(T('Cancel', 'रद्द करें'))}
          </Button>
          <Button variant="danger" onClick={submit} loading={busy}>
            {tl(T('Send request', 'अनुरोध भेजें'))}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function JoinStudy({ onDone }: { onDone: () => void }) {
  const profile = useProfile()
  const { children } = useChildren()
  const { tl } = useI18n()
  const [code, setCode] = useState('')
  const [study, setStudy] = useState<Study | null>(null)
  const available = children.filter((c) => !c.studyId)
  const [childId, setChildId] = useState(available[0]?.id ?? '')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const lookup = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const s = await findStudyByCode(code).catch(() => null)
    setBusy(false)
    if (!s || !s.active) return setError(tl(T('No active study found for this code.', 'इस कोड के लिए कोई सक्रिय अध्ययन नहीं मिला।')))
    setStudy(s)
  }
  const join = async () => {
    const child = children.find((c) => c.id === childId)
    if (!study || !child) return
    setBusy(true)
    try {
      await enrolChild(profile, child, study)
      onDone()
    } catch (e) {
      setError(String(e))
      setBusy(false)
    }
  }

  if (!study)
    return (
      <form onSubmit={lookup} className="space-y-4">
        <Field label={tl(T('Study invitation code', 'अध्ययन आमंत्रण कोड'))}>
          <Input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="text-center font-mono text-2xl font-bold tracking-[0.3em]" maxLength={9} autoFocus />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" loading={busy}>
          {tl(T('Find study', 'अध्ययन खोजें'))}
        </Button>
      </form>
    )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-extrabold text-slate-800">{study.title}</h3>
        <p className="text-sm text-slate-500">
          {tl(T('Researcher', 'शोधकर्ता'))}: {study.ownerName} · {study.durationWeeks} {tl(T('weeks', 'सप्ताह'))}
        </p>
        {study.description && <p className="mt-2 text-slate-600">{study.description}</p>}
      </div>
      <div>
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">{tl(T('Study consent', 'अध्ययन सहमति'))}</div>
        <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-sand-50 p-4 text-sm text-slate-700 ring-1 ring-sand-200">{study.consentText}</div>
      </div>
      {available.length === 0 ? (
        <ErrorText>{tl(T('All your children are already in a study.', 'आपके सभी बच्चे पहले से किसी अध्ययन में हैं।'))}</ErrorText>
      ) : (
        <Field label={tl(T('Which child is taking part?', 'कौन-सा बच्चा भाग ले रहा है?'))}>
          <Select value={childId} onChange={(e) => setChildId(e.target.value)}>
            {available.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.publicId})
              </option>
            ))}
          </Select>
        </Field>
      )}
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-600" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span className="font-semibold text-slate-700">{tl(T('I have read the study information and consent to take part.', 'मैंने अध्ययन की जानकारी पढ़ ली है और भाग लेने के लिए सहमत हूँ।'))}</span>
      </label>
      <ErrorText>{error}</ErrorText>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setStudy(null)}>
          {tl(T('Back', 'वापस'))}
        </Button>
        <Button onClick={join} disabled={!agree || !childId} loading={busy}>
          {tl(T('Join study', 'अध्ययन में जुड़ें'))}
        </Button>
      </div>
    </div>
  )
}

// ---------------- Data & account deletion ----------------

function DataCard() {
  const profile = useProfile()
  const { tl } = useI18n()
  const isIndividual = profile.mode === 'individual'
  const [open, setOpen] = useState(false)
  return (
    <Card className="xl:col-span-2">
      <h2 className="mb-4 text-lg font-extrabold text-slate-800">{tl(T('Data & account', 'डेटा और खाता'))}</h2>
      <div className="flex flex-wrap gap-3">
        {isIndividual && <ExportButton />}
        <Button variant="danger" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" /> {tl(T('Delete my account', 'मेरा खाता हटाएँ'))}
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={tl(T('Delete account', 'खाता हटाएँ'))}>
        {isIndividual ? <DeleteIndividual onCancel={() => setOpen(false)} /> : <DeleteAccountForm items={[]} onCancel={() => setOpen(false)} />}
      </Modal>
    </Card>
  )
}

function ExportButton() {
  const { children } = useChildren()
  const { tl } = useI18n()
  const [busy, setBusy] = useState(false)
  return (
    <Button variant="secondary" loading={busy} onClick={async () => (setBusy(true), await exportChildrenData(children).finally(() => setBusy(false)))}>
      <Download className="h-4 w-4" /> {tl(T('Download my data (JSON)', 'मेरा डेटा डाउनलोड करें (JSON)'))}
    </Button>
  )
}

function DeleteIndividual({ onCancel }: { onCancel: () => void }) {
  const { children } = useChildren()
  return <DeleteAccountForm items={children} onCancel={onCancel} />
}

function DeleteAccountForm({ items, onCancel }: { items: Child[]; onCancel: () => void }) {
  const profile = useProfile()
  const { tl } = useI18n()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const owned = items.filter((c) => c.ownerUid === profile.uid)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await deleteMyAccount(profile, items, password)
    } catch (err) {
      const code = (err as { code?: string }).code ?? ''
      setError(code.includes('password') || code.includes('credential') ? tl(T('Wrong password.', 'गलत पासवर्ड।')) : String(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-slate-600">{tl(T('This cannot be undone.', 'इसे वापस नहीं किया जा सकता।'))}</p>
      {owned.length > 0 && (
        <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-800">
          {tl(T('These child profiles you created will be deleted for everyone, with all their data:', 'आपके बनाए ये बाल प्रोफ़ाइल सभी के लिए, पूरे डेटा सहित, हटा दिए जाएँगे:'))} {owned.map((c) => c.name).join(', ')}
        </p>
      )}
      {profile.mode === 'researcher' && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          {tl(T('Your studies stay in the database but nobody will be able to manage them.', 'आपके अध्ययन डेटाबेस में रहेंगे पर उन्हें कोई प्रबंधित नहीं कर पाएगा।'))}
        </p>
      )}
      <Field label={tl(T('Confirm with your password', 'पासवर्ड से पुष्टि करें'))}>
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </Field>
      <ErrorText>{error}</ErrorText>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {tl(T('Cancel', 'रद्द करें'))}
        </Button>
        <Button type="submit" variant="danger" loading={busy}>
          {tl(T('Delete permanently', 'स्थायी रूप से हटाएँ'))}
        </Button>
      </div>
    </form>
  )
}
