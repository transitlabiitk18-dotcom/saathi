import { Check, Copy, FlaskConical, Link2, LogOut, Pencil, Plus, RefreshCw, UserMinus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Avatar } from '../components/Layout'
import { Badge, Button, Card, Empty, ErrorText, Field, Input, Modal, PageHeader, Select, Textarea, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChildren } from '../context/ChildContext'
import { T, useI18n } from '../i18n'
import { ageLabel, formatDate, today, toISODate } from '../lib/dates'
import { linkChildByCode, regenerateCode, registerChild, removeMember, updateChild, type ChildInput } from '../lib/db'
import { RELATION_LABEL } from '../lib/relations'
import { RELATIONS, type Child, type Relation } from '../lib/types'

export function ChildrenPage() {
  const { children, child: selected, selectChild } = useChildren()
  const { t, tl } = useI18n()
  const [modal, setModal] = useState<'register' | 'link' | null>(null)
  const [editing, setEditing] = useState<Child | null>(null)

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => setModal('link')}>
        <Link2 className="h-4 w-4" /> {tl(T('Join with a code', 'कोड से जुड़ें'))}
      </Button>
      <Button onClick={() => setModal('register')}>
        <Plus className="h-4 w-4" /> {tl(T('Add a child', 'बच्चा जोड़ें'))}
      </Button>
    </div>
  )

  return (
    <>
      <PageHeader emoji="👧" title={t('nav_children')} action={children.length > 0 ? actions : undefined} />
      {children.length === 0 ? (
        <Empty
          emoji="🌱"
          title={tl(T('Add a child to get started', 'शुरू करने के लिए बच्चा जोड़ें'))}
          hint={tl(
            T(
              'Create a child profile, or join one that a family member already created using their join code.',
              'बच्चे की प्रोफ़ाइल बनाएँ, या परिवार के सदस्य द्वारा बनाई गई प्रोफ़ाइल से उनके कोड द्वारा जुड़ें।',
            ),
          )}
          action={actions}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((c) => (
            <ChildCard key={c.id} child={c} selected={selected?.id === c.id} onSelect={() => selectChild(c.id)} onEdit={() => setEditing(c)} />
          ))}
        </div>
      )}

      <Modal open={modal === 'register' || editing !== null} onClose={() => (setModal(null), setEditing(null))} title={editing ? t('editChild') : tl(T('Add a child', 'बच्चा जोड़ें'))} wide>
        <ChildForm
          initial={editing}
          onDone={(id) => {
            if (id) selectChild(id)
            setModal(null)
            setEditing(null)
          }}
        />
      </Modal>
      <Modal open={modal === 'link'} onClose={() => setModal(null)} title={tl(T('Join a child’s profile', 'बच्चे की प्रोफ़ाइल से जुड़ें'))}>
        <LinkForm
          onDone={(id) => {
            selectChild(id)
            setModal(null)
          }}
        />
      </Modal>
    </>
  )
}

function RelationSelect({ value, onChange }: { value: Relation; onChange: (r: Relation) => void }) {
  const { tl } = useI18n()
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as Relation)}>
      {RELATIONS.map((r) => (
        <option key={r} value={r}>
          {tl(RELATION_LABEL[r])}
        </option>
      ))}
    </Select>
  )
}

function ChildCard({ child, selected, onSelect, onEdit }: { child: Child; selected: boolean; onSelect: () => void; onEdit: () => void }) {
  const profile = useProfile()
  const { t, tl, lang } = useI18n()
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const isOwner = child.ownerUid === profile.uid
  const members = Object.entries(child.members ?? {})
    .filter(([uid]) => child.memberUids.includes(uid))
    .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)

  const copy = async () => {
    await navigator.clipboard.writeText(child.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const regen = async () => {
    if (!window.confirm(tl(T('Create a new join code? The old code will stop working.', 'नया कोड बनाएँ? पुराना कोड काम करना बंद कर देगा।')))) return
    setBusy(true)
    await regenerateCode(child).finally(() => setBusy(false))
  }
  const leave = async () => {
    if (!window.confirm(tl(T(`Leave ${child.name}'s profile? You will no longer see their data.`, `${child.name} की प्रोफ़ाइल छोड़ें? आप उनका डेटा नहीं देख पाएँगे।`)))) return
    await removeMember(child.id, profile.uid)
  }

  return (
    <Card className={cx('transition', selected && 'ring-2 ring-brand-400')}>
      <div className="flex items-start gap-4">
        <button onClick={onSelect} className="flex flex-1 items-center gap-3 text-left">
          <Avatar name={child.name} />
          <div>
            <div className="text-lg font-extrabold text-slate-800">{child.name}</div>
            <div className="text-sm text-slate-500">
              {ageLabel(child.dob, lang)} · {t(`gender_${child.gender}`)} · {t(`diag_${child.diagnosis as 'confirmed'}`)}
            </div>
          </div>
        </button>
        {isOwner && (
          <button onClick={onEdit} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title={t('editChild')}>
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className="bg-slate-50 font-mono text-slate-600 ring-slate-200">
          {tl(T('Child ID', 'बाल ID'))}: {child.publicId}
        </Badge>
        {child.studyId && (
          <Badge className="bg-violet-50 text-violet-700 ring-violet-200">
            <FlaskConical className="h-3 w-3" /> {tl(T('In a research study', 'शोध अध्ययन में'))}
          </Badge>
        )}
      </div>

      {isOwner && (
        <div className="mt-4 rounded-2xl bg-brand-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-brand-700">{tl(T('Join code (keep private)', 'जुड़ने का कोड (निजी रखें)'))}</div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-2xl font-bold tracking-[0.2em] text-brand-900">{child.code}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t('copied') : t('copy')}
              </Button>
              <Button size="sm" variant="ghost" onClick={regen} loading={busy} title={tl(T('New code', 'नया कोड'))}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-brand-700/80">
            {tl(T('Share with family members, caregivers or teachers so they can add observations.', 'परिवार, देखभालकर्ता या शिक्षक के साथ साझा करें ताकि वे अवलोकन जोड़ सकें।'))}
          </p>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{tl(T('Contributors', 'योगदानकर्ता'))}</div>
        <ul className="space-y-2">
          {members.map(([uid, m]) => (
            <li key={uid} className="flex items-center gap-3">
              <Avatar name={m.name} small />
              <span className="flex-1 text-sm">
                <span className="font-semibold text-slate-700">{m.name}</span>
                {uid === profile.uid && <span className="text-slate-400"> ({t('you')})</span>}
                <span className="block text-xs text-slate-500">
                  {tl(RELATION_LABEL[m.relation] ?? RELATION_LABEL.caregiver)} · {formatDate(toISODate(new Date(m.joinedAt)), lang)}
                </span>
              </span>
              {isOwner && uid !== profile.uid && (
                <button
                  onClick={() => window.confirm(t('removeConfirm', { name: m.name })) && removeMember(child.id, uid)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title={t('remove')}
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {!isOwner && (
          <Button variant="ghost" size="sm" className="mt-3" onClick={leave}>
            <LogOut className="h-4 w-4" /> {tl(T('Leave this profile', 'यह प्रोफ़ाइल छोड़ें'))}
          </Button>
        )}
      </div>
    </Card>
  )
}

function ChildForm({ initial, onDone }: { initial: Child | null; onDone: (id?: string) => void }) {
  const profile = useProfile()
  const { t, tl } = useI18n()
  const [f, setF] = useState<ChildInput>(
    initial
      ? {
          name: initial.name,
          dob: initial.dob,
          gender: initial.gender,
          primaryLanguage: initial.primaryLanguage,
          diagnosis: initial.diagnosis,
          diagnosisAge: initial.diagnosisAge ?? '',
          centre: initial.centre ?? '',
          school: initial.school ?? '',
          notes: initial.notes ?? '',
        }
      : { name: '', dob: '', gender: 'male', primaryLanguage: 'Hindi', diagnosis: 'confirmed', diagnosisAge: '', centre: '', school: '', notes: '' },
  )
  const [relation, setRelation] = useState<Relation>('parent')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = <K extends keyof ChildInput>(k: K, v: ChildInput[K]) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (initial) {
        await updateChild(initial.id, f)
        onDone()
      } else {
        const c = await registerChild(profile, f, relation)
        onDone(c.id)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label={t('childName')} className="sm:col-span-2">
        <Input required value={f.name} onChange={(e) => set('name', e.target.value)} />
      </Field>
      {!initial && (
        <Field label={tl(T('Your relation to the child', 'बच्चे से आपका संबंध'))} className="sm:col-span-2">
          <RelationSelect value={relation} onChange={setRelation} />
        </Field>
      )}
      <Field label={t('dob')}>
        <Input required type="date" max={today()} value={f.dob} onChange={(e) => set('dob', e.target.value)} />
      </Field>
      <Field label={t('gender')}>
        <Select value={f.gender} onChange={(e) => set('gender', e.target.value as ChildInput['gender'])}>
          <option value="male">{t('gender_male')}</option>
          <option value="female">{t('gender_female')}</option>
          <option value="other">{t('gender_other')}</option>
        </Select>
      </Field>
      <Field label={t('diagnosis')}>
        <Select value={f.diagnosis} onChange={(e) => set('diagnosis', e.target.value)}>
          <option value="confirmed">{t('diag_confirmed')}</option>
          <option value="suspected">{t('diag_suspected')}</option>
          <option value="none">{t('diag_none')}</option>
        </Select>
      </Field>
      <Field label={`${t('diagnosisAge')} (${t('optional')})`}>
        <Input value={f.diagnosisAge} onChange={(e) => set('diagnosisAge', e.target.value)} />
      </Field>
      <Field label={t('primaryLanguage')}>
        <Input value={f.primaryLanguage} onChange={(e) => set('primaryLanguage', e.target.value)} />
      </Field>
      <Field label={`${t('centre')} (${t('optional')})`}>
        <Input value={f.centre} onChange={(e) => set('centre', e.target.value)} />
      </Field>
      <Field label={`${t('school')} (${t('optional')})`} className="sm:col-span-2">
        <Input value={f.school} onChange={(e) => set('school', e.target.value)} />
      </Field>
      <Field label={`${t('childNotes')} (${t('optional')})`} className="sm:col-span-2">
        <Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <ErrorText>{error}</ErrorText>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={() => onDone()}>
          {t('cancel')}
        </Button>
        <Button type="submit" loading={busy}>
          {t('save')}
        </Button>
      </div>
    </form>
  )
}

function LinkForm({ onDone }: { onDone: (id: string) => void }) {
  const profile = useProfile()
  const { t, tl } = useI18n()
  const [code, setCode] = useState('')
  const [relation, setRelation] = useState<Relation>('caregiver')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onDone(await linkChildByCode(profile, code, relation))
    } catch {
      setError(t('invalidCode'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-slate-500">{tl(T('Ask the person who created the profile for the 8-character join code.', 'प्रोफ़ाइल बनाने वाले से 8 अक्षरों का कोड माँगें।'))}</p>
      <Field label={t('enterCode')}>
        <Input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={9}
          className="text-center font-mono text-2xl font-bold tracking-[0.3em]"
          placeholder="ABCD2345"
          autoFocus
        />
      </Field>
      <Field label={tl(T('Your relation to the child', 'बच्चे से आपका संबंध'))}>
        <RelationSelect value={relation} onChange={setRelation} />
      </Field>
      <ErrorText>{error}</ErrorText>
      <Button type="submit" className="w-full" loading={busy} disabled={code.replace(/\W/g, '').length < 8}>
        {t('link')}
      </Button>
    </form>
  )
}
