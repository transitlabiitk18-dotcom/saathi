import { Check, ChevronDown, ChevronUp, ClipboardList, Lightbulb, ListOrdered, Wrench, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { BAND_STYLE, DOMAINS, DOMAIN_BY_ID, bandFor } from '../content/domains'
import { CUSTOM_RECORD, INTERVENTION_BY_ID, interventionsForDomain, type InterventionTemplate } from '../content/interventions'
import { T, useI18n } from '../i18n'
import { addDays, today } from '../lib/dates'
import { createIntervention } from '../lib/db'
import type { AnswerValue, Intervention, L, RecordField } from '../lib/types'
import { MoodPicker } from './MoodPicker'
import { Badge, Button, Card, Input, Pills, Textarea } from './ui'

export const INDIVIDUAL_WEEKS = 6

/** Title, description and steps for any intervention, whether from the library or custom-written. */
export function describe(i: Intervention, tl: (l: L) => string) {
  const tpl = i.templateId ? INTERVENTION_BY_ID[i.templateId] : null
  if (tpl) return { emoji: tpl.emoji, title: tl(tpl.title), what: tl(tpl.what), how: tl(tpl.how), steps: tpl.steps.map(tl), record: tpl.record, tool: tpl.tool }
  return {
    emoji: i.source === 'researcher' ? '🔬' : '✍️',
    title: i.custom?.title ?? '—',
    what: i.custom?.description ?? '',
    how: '',
    steps: i.custom?.steps ?? [],
    record: CUSTOM_RECORD,
    tool: undefined,
  }
}

export function InterventionDetails({ what, how, steps, record, tool }: { what: string; how: string; steps: string[]; record: RecordField[]; tool?: 'routines' }) {
  const { tl } = useI18n()
  return (
    <div className="space-y-4 text-sm">
      {what && (
        <Section icon={<Lightbulb className="h-4 w-4" />} title={tl(T('What it involves', 'इसमें क्या है'))}>
          <p className="text-slate-700">{what}</p>
        </Section>
      )}
      {how && (
        <Section icon={<Wrench className="h-4 w-4" />} title={tl(T('How to do it', 'कैसे करें'))}>
          <p className="text-slate-700">{how}</p>
          {tool === 'routines' && (
            <Link to="/routines" className="mt-2 inline-block font-bold text-brand-700 hover:underline">
              {tl(T('Open Visual routines →', 'दृश्य दिनचर्या खोलें →'))}
            </Link>
          )}
        </Section>
      )}
      {steps.length > 0 && (
        <Section icon={<ListOrdered className="h-4 w-4" />} title={tl(T('Steps', 'चरण'))}>
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-extrabold text-white">{i + 1}</span>
                <span className="pt-0.5 text-slate-700">{s}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}
      <Section icon={<ClipboardList className="h-4 w-4" />} title={tl(T('What to record', 'क्या दर्ज करें'))}>
        <ul className="list-inside list-disc text-slate-700">
          {record.map((f) => (
            <li key={f.id}>{tl(f.label)}</li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

export function RecordForm({ fields, values, onChange }: { fields: RecordField[]; values: Record<string, AnswerValue>; onChange: (v: Record<string, AnswerValue>) => void }) {
  const { t, tl } = useI18n()
  const set = (id: string, v: AnswerValue) => onChange({ ...values, [id]: v })
  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <div key={f.id}>
          <div className="mb-2 font-semibold text-slate-700">{tl(f.label)}</div>
          {f.kind === 'text' && <Textarea rows={2} value={(values[f.id] as string) ?? ''} onChange={(e) => set(f.id, e.target.value)} />}
          {f.kind === 'number' && <Input type="number" min={0} className="max-w-32" value={(values[f.id] as number | undefined) ?? ''} onChange={(e) => set(f.id, e.target.value === '' ? null : Number(e.target.value))} />}
          {f.kind === 'mood' && <MoodPicker value={values[f.id] as number} onChange={(v) => set(f.id, v)} />}
          {f.kind === 'yesno' && (
            <Pills
              value={values[f.id] as boolean | undefined}
              onChange={(v) => set(f.id, v)}
              options={[
                { value: true, label: t('yes') },
                { value: false, label: t('no') },
              ]}
            />
          )}
          {f.kind === 'choice' && <Pills value={values[f.id] as string} onChange={(v) => set(f.id, v)} options={(f.options ?? []).map((o) => ({ value: o.value, label: tl(o.label) }))} />}
        </div>
      ))}
    </div>
  )
}

/** Recommendation cards for flagged domains, each with Accept / Reject. */
export function Recommendations({ scores, interventions }: { scores: Record<string, number>; interventions: Intervention[] }) {
  const { tl } = useI18n()
  const flagged = DOMAINS.filter((d) => scores[d.id] !== undefined && bandFor(scores[d.id]) !== 'typical').sort((a, b) => scores[b.id] - scores[a.id])
  const decided = new Map(interventions.map((i) => [`${i.templateId}`, i]))
  const items = flagged.flatMap((d) => interventionsForDomain(d.id).map((tpl) => ({ d, tpl }))).filter(({ tpl }, idx, arr) => arr.findIndex((x) => x.tpl.id === tpl.id) === idx)

  if (items.length === 0) return <Card className="text-center text-slate-600">🎉 {tl(T('No interventions needed right now.', 'अभी किसी हस्तक्षेप की ज़रूरत नहीं।'))}</Card>
  return (
    <div className="space-y-3">
      {items.map(({ d, tpl }) => (
        <RecommendationCard key={tpl.id} tpl={tpl} domainId={d.id} score={scores[d.id]} existing={decided.get(tpl.id)} />
      ))}
    </div>
  )
}

function RecommendationCard({ tpl, domainId, score, existing }: { tpl: InterventionTemplate; domainId: string; score: number; existing?: Intervention }) {
  const profile = useProfile()
  const child = useChild()
  const { tl } = useI18n()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const d = DOMAIN_BY_ID[domainId]
  const band = bandFor(score)

  const decide = async (status: 'active' | 'rejected') => {
    setBusy(true)
    const start = today()
    await createIntervention(child.id, {
      templateId: tpl.id,
      custom: null,
      domainId,
      status,
      source: 'recommendation',
      startDate: start,
      endDate: addDays(start, INDIVIDUAL_WEEKS * 7),
      studyId: null,
      createdBy: profile.uid,
      createdByName: profile.name,
    }).finally(() => setBusy(false))
  }

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span className="text-3xl">{tpl.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-slate-800">{tl(tpl.title)}</div>
          <div className="text-sm text-slate-500">
            {tl(T('Why', 'क्यों'))}: {d.emoji} {tl(d.name)} — <Badge className={BAND_STYLE[band].cls}>{tl(BAND_STYLE[band].label)}</Badge> ({score})
          </div>
        </div>
        {existing ? (
          <Badge className={existing.status === 'rejected' ? 'bg-slate-50 text-slate-500 ring-slate-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}>
            {existing.status === 'rejected' ? tl(T('Rejected', 'अस्वीकृत')) : tl(T('Accepted', 'स्वीकृत'))}
          </Badge>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => decide('rejected')} disabled={busy}>
              <X className="h-4 w-4" /> {tl(T('Reject', 'अस्वीकार'))}
            </Button>
            <Button size="sm" onClick={() => decide('active')} loading={busy}>
              <Check className="h-4 w-4" /> {tl(T('Accept', 'स्वीकार'))}
            </Button>
          </div>
        )}
      </div>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1 border-t border-slate-100 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-slate-50">
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} {tl(T('View details', 'विवरण देखें'))}
      </button>
      {open && (
        <div className="border-t border-slate-100 p-4">
          <InterventionDetails what={tl(tpl.what)} how={tl(tpl.how)} steps={tpl.steps.map(tl)} record={tpl.record} tool={tpl.tool} />
        </div>
      )}
    </Card>
  )
}
