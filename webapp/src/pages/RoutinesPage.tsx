import { ArrowDown, ArrowUp, ImagePlus, Pencil, Play, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Empty, ErrorText, Field, Input, Modal, PageHeader, Pills, Spinner, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { EMOJI_PALETTE, ROUTINE_TEMPLATES } from '../content/routineTemplates'
import { useI18n } from '../i18n'
import { formatDate, today } from '../lib/dates'
import { deleteRoutine, saveRoutine } from '../lib/db'
import { useRoutines } from '../lib/hooks'
import { compressImage } from '../lib/image'
import type { Routine, Slide } from '../lib/types'

const MAX_BYTES = 900_000

export function RoutinesPage() {
  const child = useChild()
  const { t, lang } = useI18n()
  const routines = useRoutines(child.id)
  const [editing, setEditing] = useState<Routine | 'new' | null>(null)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [draft, setDraft] = useState<Omit<Routine, 'id' | 'authorUid' | 'authorName' | 'updatedAt'> | null>(null)

  if (routines === null) return <Spinner />
  const daily = routines.filter((r) => r.kind === 'daily').sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  const events = routines.filter((r) => r.kind === 'event').sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
  const upcoming = events.filter((e) => (e.date ?? '') >= today())
  const past = events.filter((e) => (e.date ?? '') < today()).reverse()

  const openNew = () => {
    setDraft(null)
    setEditing('new')
  }

  return (
    <>
      <PageHeader
        emoji="🖼️"
        title={t('routinesTitle')}
        subtitle={t('routinesIntro')}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setTemplateOpen(true)}>
              {t('useTemplate')}
            </Button>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" /> {t('newRoutine')}
            </Button>
          </div>
        }
      />

      {routines.length === 0 ? (
        <Empty emoji="🖼️" title={t('noRoutines')} hint={t('routinesIntro')} action={<Button onClick={() => setTemplateOpen(true)}>{t('useTemplate')}</Button>} />
      ) : (
        <div className="space-y-8">
          <Section title={t('dailyRoutines')} items={daily} onEdit={setEditing} />
          <Section title={`${t('events')} — ${t('upcoming')}`} items={upcoming} onEdit={setEditing} showDate />
          {past.length > 0 && <Section title={`${t('events')} — ${t('past')}`} items={past} onEdit={setEditing} showDate muted />}
        </div>
      )}

      <Modal open={templateOpen} onClose={() => setTemplateOpen(false)} title={t('useTemplate')} wide>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROUTINE_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              onClick={() => {
                setDraft({
                  title: tpl.title[lang],
                  kind: tpl.kind,
                  time: tpl.time ?? '',
                  date: tpl.kind === 'event' ? today() : '',
                  slides: tpl.slides.map((s) => ({ emoji: s.emoji, caption: s.caption[lang] })),
                })
                setTemplateOpen(false)
                setEditing('new')
              }}
              className="rounded-2xl bg-sand-50 p-4 text-left ring-1 ring-sand-200 transition hover:ring-brand-300"
            >
              <div className="font-bold text-slate-800">{tpl.title[lang]}</div>
              <div className="mt-2 flex flex-wrap gap-1 text-2xl">{tpl.slides.map((s) => s.emoji).join(' ')}</div>
              <div className="mt-2 text-xs font-semibold text-slate-500">{t(`kind_${tpl.kind}`)}</div>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? t('newRoutine') : t('edit')} wide>
        {editing !== null && (
          <RoutineEditor
            key={editing === 'new' ? `new-${draft?.title ?? ''}` : editing.id}
            initial={editing === 'new' ? draft : editing}
            id={editing === 'new' ? undefined : editing.id}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  )

  function Section({ title, items, onEdit, showDate, muted }: { title: string; items: Routine[]; onEdit: (r: Routine) => void; showDate?: boolean; muted?: boolean }) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{title}</h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">—</p>
        ) : (
          <div className={cx('grid gap-4 sm:grid-cols-2 xl:grid-cols-3', muted && 'opacity-60')}>
            {items.map((r) => (
              <Card key={r.id} className="flex flex-col p-4">
                <Link to={`/routines/${r.id}/play`} className="group relative block overflow-hidden rounded-xl bg-sand-50">
                  <div className="flex h-28 items-center gap-2 overflow-hidden px-3">
                    {r.slides.slice(0, 5).map((s, i) => (
                      <div key={i} className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-4xl shadow-sm">
                        {s.image ? <img src={s.image} alt="" className="h-full w-full object-cover" /> : s.emoji}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 grid place-items-center bg-slate-900/0 transition group-hover:bg-slate-900/30">
                    <Play className="h-10 w-10 text-white opacity-0 drop-shadow transition group-hover:opacity-100" />
                  </div>
                </Link>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-800">{r.title}</div>
                    <div className="text-xs font-semibold text-slate-500">
                      {showDate && r.date ? `${formatDate(r.date, lang)} · ` : ''}
                      {r.time || ''} · {r.slides.length} {t('slides').toLowerCase()}
                    </div>
                  </div>
                  <div className="flex">
                    <button onClick={() => onEdit(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" title={t('edit')}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.confirm(t('deleteRoutineConfirm')) && deleteRoutine(child.id, r.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }
}

function RoutineEditor({
  initial,
  id,
  onDone,
}: {
  initial: Omit<Routine, 'id' | 'authorUid' | 'authorName' | 'updatedAt'> | null
  id?: string
  onDone: () => void
}) {
  const profile = useProfile()
  const child = useChild()
  const { t } = useI18n()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [kind, setKind] = useState<Routine['kind']>(initial?.kind ?? 'daily')
  const [time, setTime] = useState(initial?.time ?? '')
  const [date, setDate] = useState(initial?.date || today())
  const [slides, setSlides] = useState<Slide[]>(initial?.slides ?? [{ emoji: '🌅', caption: '' }])
  const [picker, setPicker] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = (i: number, s: Partial<Slide>) => setSlides((list) => list.map((x, j) => (j === i ? { ...x, ...s } : x)))
  const move = (i: number, dir: -1 | 1) =>
    setSlides((list) => {
      const j = i + dir
      if (j < 0 || j >= list.length) return list
      const copy = [...list]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })

  const upload = async (i: number, file?: File) => {
    if (!file) return
    update(i, { image: await compressImage(file) })
  }

  const save = async () => {
    const clean = slides.filter((s) => s.caption.trim() || s.image || s.emoji)
    if (!title.trim() || clean.length === 0) return setError(t('needSlides'))
    // Firestore documents are capped at 1 MiB, and photos are stored inline.
    if (JSON.stringify(clean).length > MAX_BYTES) return setError(t('routineTooBig'))
    setBusy(true)
    setError('')
    try {
      await saveRoutine(
        child.id,
        {
          title: title.trim(),
          kind,
          time,
          date: kind === 'event' ? date : '',
          slides: clean.map((s) => ({ caption: s.caption.trim(), ...(s.image ? { image: s.image } : { emoji: s.emoji ?? '⭐' }) })),
          authorUid: profile.uid,
          authorName: profile.name,
        },
        id,
      )
      onDone()
    } catch (e) {
      setError(String(e))
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('routineTitle')} className="sm:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label={t('routineKind')} className="sm:col-span-2">
          <Pills value={kind} onChange={setKind} options={[{ value: 'daily' as const, label: t('kind_daily') }, { value: 'event' as const, label: t('kind_event') }]} />
        </Field>
        {kind === 'event' && (
          <Field label={t('date')}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        )}
        <Field label={`${t('time')} (${t('optional')})`}>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-slate-700">{t('slides')}</div>
        <div className="space-y-3">
          {slides.map((s, i) => (
            <div key={i} className="flex gap-3 rounded-2xl bg-sand-50 p-3 ring-1 ring-sand-200">
              <div className="relative">
                <button
                  onClick={() => setPicker(picker === i ? null : i)}
                  className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-white text-4xl shadow-sm ring-1 ring-slate-200 hover:ring-brand-400"
                  title={t('pickEmoji')}
                >
                  {s.image ? <img src={s.image} alt="" className="h-full w-full object-cover" /> : s.emoji ?? '⭐'}
                </button>
                {picker === i && (
                  <div className="absolute left-0 top-full z-10 mt-2 w-72 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200">
                    <div className="grid grid-cols-7 gap-1 text-2xl">
                      {EMOJI_PALETTE.map((e) => (
                        <button
                          key={e}
                          onClick={() => {
                            update(i, { emoji: e, image: undefined })
                            setPicker(null)
                          }}
                          className="rounded-lg p-1 hover:bg-slate-100"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-50 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100">
                      <ImagePlus className="h-4 w-4" /> {t('uploadPhoto')}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          upload(i, e.target.files?.[0])
                          setPicker(null)
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="mb-1 text-xs font-bold text-slate-400">{t('slideN', { n: i + 1 })}</div>
                <Input placeholder={t('caption')} value={s.caption} onChange={(e) => update(i, { caption: e.target.value })} />
                {s.image && (
                  <button onClick={() => update(i, { image: undefined })} className="mt-1 text-xs font-semibold text-slate-500 hover:text-rose-600">
                    {t('removePhoto')}
                  </button>
                )}
              </div>
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-1 text-slate-400 hover:bg-white disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="rounded-lg p-1 text-slate-400 hover:bg-white disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button onClick={() => setSlides((l) => l.filter((_, j) => j !== i))} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-rose-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setSlides((l) => [...l, { emoji: '⭐', caption: '' }])}>
          <Plus className="h-4 w-4" /> {t('addSlide')}
        </Button>
      </div>

      <ErrorText>{error}</ErrorText>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          {t('cancel')}
        </Button>
        <Button onClick={save} loading={busy}>
          {t('save')}
        </Button>
      </div>
    </div>
  )
}
