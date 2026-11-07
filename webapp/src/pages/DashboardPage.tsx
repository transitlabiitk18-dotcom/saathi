import { Bell, BellRing, CheckCircle2, ChevronRight, Circle, ClipboardCheck, FlaskConical, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { describe } from '../components/interventionUi'
import { moodEmoji } from '../components/MoodPicker'
import { useRemindersEnabled } from '../components/reminders'
import { Badge, Button, Card, Textarea } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { APPETITE_SCORE, TRACKERS, TRACKER_TYPES } from '../content/diaries'
import { BAND_STYLE, DOMAIN_BY_ID, bandFor } from '../content/domains'
import { instrumentName } from '../content/instruments'
import { T, useI18n } from '../i18n'
import { addDays, ageLabel, daysBetween, formatDate, sleepMinutes, today } from '../lib/dates'
import { completeTask, getParticipant, getStudy } from '../lib/db'
import { activeInterventions, latestChecklist, useAssessments, useEntries, useIncidents, useInterventions, useRoutines, useTasks } from '../lib/hooks'
import type { Assessment, Entry, Incident, Participant, Routine, Study, Task } from '../lib/types'
import { RetestBanner } from './AssessmentsPage'

export function DashboardPage() {
  const profile = useProfile()
  const child = useChild()
  const { t, tl, lang } = useI18n()
  const day = today()
  const weekAgo = addDays(day, -6)
  const entries = useEntries(child.id, weekAgo)
  const incidents = useIncidents(child.id, weekAgo)
  const assessments = useAssessments(child.id)
  const routines = useRoutines(child.id)
  const interventions = useInterventions(child.id)
  const tasks = useTasks(child.id)
  const [remindersOn, enableReminders] = useRemindersEnabled()

  const mineToday = new Set((entries ?? []).filter((e) => e.date === day && e.authorUid === profile.uid).map((e) => e.type))
  const allDone = TRACKER_TYPES.every((ty) => mineToday.has(ty))
  const latest = latestChecklist(assessments)
  const focus = latest?.domainScores
    ? Object.entries(latest.domainScores)
        .filter(([, s]) => bandFor(s) !== 'typical')
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : []
  const active = activeInterventions(interventions)
  const openTasks = (tasks ?? []).filter((x) => x.status === 'open')

  return (
    <>
      <div className="mb-6">
        <p className="font-semibold text-slate-500">{formatDate(day, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="text-3xl font-extrabold text-slate-800">{t('hello', { name: profile.name.split(' ')[0] })} 👋</h1>
      </div>

      {child.studyId && <StudyBanner studyId={child.studyId} assessments={assessments} />}
      {!child.studyId && <RetestBanner items={assessments} uid={profile.uid} />}

      {openTasks.length > 0 && (
        <Card className="mb-5 ring-violet-200">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-violet-900">
            <FlaskConical className="h-5 w-5" /> {tl(T('Tasks from the researcher', 'शोधकर्ता के कार्य'))}
          </h2>
          <div className="space-y-3">
            {openTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800">{t('todaysTasks')}</h2>
            <span className="text-sm font-semibold text-slate-400">
              {child.name} · {ageLabel(child.dob, lang)}
            </span>
          </div>
          {allDone && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">
              <span className="text-3xl">🎉</span> {t('allDone')}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TRACKER_TYPES.map((type) => {
              const done = mineToday.has(type)
              return (
                <Link
                  key={type}
                  to={`/track?type=${type}`}
                  className={`flex items-center gap-3 rounded-2xl p-3 ring-1 transition ${done ? 'bg-slate-50 ring-slate-100' : 'bg-white ring-brand-200 hover:bg-brand-50'}`}
                >
                  <span className="text-2xl">{TRACKERS[type].emoji}</span>
                  <span className="flex-1">
                    <span className="block font-bold text-slate-800">{tl(TRACKERS[type].title)}</span>
                    <span className={`text-xs font-bold ${done ? 'text-emerald-600' : 'text-amber-600'}`}>{done ? t('completed') : t('pending')}</span>
                  </span>
                  {done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                </Link>
              )
            })}
            <Link to="/track?type=incidents" className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100 transition hover:bg-amber-50">
              <span className="text-2xl">⚠️</span>
              <span className="flex-1">
                <span className="block font-bold text-slate-800">{tl(T('Incident', 'घटना'))}</span>
                <span className="text-xs font-semibold text-slate-500">{tl(T('Log if anything happened', 'कुछ हुआ हो तो दर्ज करें'))}</span>
              </span>
            </Link>
          </div>
          {!remindersOn && 'Notification' in window && (
            <button onClick={enableReminders} className="mt-4 flex items-center gap-2 text-sm font-bold text-brand-700 hover:underline" title={t('remindersHint')}>
              <Bell className="h-4 w-4" /> {t('enableReminders')}
            </button>
          )}
          {remindersOn && (
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
              <BellRing className="h-4 w-4" /> {t('remindersOn')}
            </p>
          )}
        </Card>

        <WeekStats entries={entries ?? []} incidents={incidents ?? []} />

        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800">🧩 {tl(T('Active interventions', 'सक्रिय हस्तक्षेप'))}</h2>
            <Link to="/interventions" className="text-sm font-bold text-brand-700 hover:underline">
              {tl(T('All', 'सभी'))} →
            </Link>
          </div>
          {active.length === 0 ? (
            <p className="text-slate-500">{tl(T('None yet. Take the questionnaire to get recommendations, or pick one from the library.', 'अभी कोई नहीं। सुझाव पाने के लिए प्रश्नावली भरें, या लाइब्रेरी से चुनें।'))}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {active.map((i) => {
                const d = describe(i, tl)
                const left = daysBetween(day, i.endDate)
                return (
                  <Link key={i.id} to={`/interventions/${i.id}`} className="flex items-center gap-3 rounded-2xl bg-sand-50 p-3 ring-1 ring-sand-200 transition hover:ring-brand-300">
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-800">{d.title}</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {left >= 0 ? tl(T(`${left} days left`, `${left} दिन बाकी`)) : tl(T('Period ended', 'अवधि पूरी'))}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-brand-700">{tl(T('Record', 'दर्ज करें'))}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-extrabold text-slate-800">{t('focusAreas')}</h2>
          <p className="mb-4 text-sm text-slate-500">{latest ? `${t('focusAreasHint')} · ${formatDate(latest.date, lang)}` : ''}</p>
          {!latest ? (
            <div>
              <p className="text-slate-500">{t('noAssessmentYet')}</p>
              <Link to="/assess/checklist">
                <Button className="mt-4" size="sm">
                  {t('startAssessment')}
                </Button>
              </Link>
            </div>
          ) : focus.length === 0 ? (
            <p className="text-slate-600">🎉 {t('noFlags')}</p>
          ) : (
            <div className="space-y-2">
              {focus.map(([id, s]) => {
                const d = DOMAIN_BY_ID[id]
                const band = bandFor(s)
                return (
                  <Link key={id} to={`/assess/${latest.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="flex-1 font-semibold text-slate-700">{tl(d.name)}</span>
                    <Badge className={BAND_STYLE[band].cls}>{tl(BAND_STYLE[band].label)}</Badge>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>

        <TodayRoutines routines={routines ?? []} />
      </div>
    </>
  )
}

function StudyBanner({ studyId, assessments }: { studyId: string; assessments: Assessment[] | null }) {
  const child = useChild()
  const { tl, lang } = useI18n()
  const [study, setStudy] = useState<Study | null>(null)
  const [p, setP] = useState<Participant | null>(null)
  useEffect(() => {
    getStudy(studyId).then(setStudy)
    getParticipant(studyId, child.id).then(setP)
  }, [studyId, child.id])
  if (!study || !p) return null

  const day = today()
  const total = Math.max(1, study.durationWeeks)
  const week = Math.min(total, Math.floor(daysBetween(p.startDate, day) / 7) + 1)
  const inStudy = (assessments ?? []).filter((a) => a.studyId === studyId)
  const due: { instrument: string; phase: 'pre' | 'post' }[] = []
  for (const inst of study.instruments) {
    if (!inStudy.some((a) => a.instrument === inst && a.phase === 'pre')) due.push({ instrument: inst, phase: 'pre' })
    else if (day >= p.endDate && !inStudy.some((a) => a.instrument === inst && a.phase === 'post')) due.push({ instrument: inst, phase: 'post' })
  }

  return (
    <div className="mb-6 rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-200">
      <div className="flex flex-wrap items-center gap-3">
        <FlaskConical className="h-6 w-6 text-violet-600" />
        <div className="flex-1">
          <div className="font-extrabold text-violet-900">{study.title}</div>
          <div className="text-sm text-violet-800">
            {tl(T('Week', 'सप्ताह'))} {week} / {total} · {formatDate(p.startDate, lang)} → {formatDate(p.endDate, lang)}
          </div>
        </div>
        {p.status === 'withdrawalRequested' && <Badge className="bg-amber-50 text-amber-700 ring-amber-200">{tl(T('Withdrawal requested', 'वापसी का अनुरोध'))}</Badge>}
      </div>
      {due.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {due.map((d) => (
            <Link key={d.instrument} to={`/assess/${d.instrument}?phase=${d.phase}`}>
              <Button size="sm">
                <ClipboardCheck className="h-4 w-4" /> {d.phase === 'pre' ? tl(T('Baseline', 'आधार-रेखा')) : tl(T('Follow-up', 'फ़ॉलो-अप'))}: {instrumentName(d.instrument, tl)}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function TaskItem({ task }: { task: Task }) {
  const profile = useProfile()
  const child = useChild()
  const { tl, lang } = useI18n()
  const [response, setResponse] = useState('')
  const [busy, setBusy] = useState(false)
  const done = async () => {
    setBusy(true)
    await completeTask(child.id, task.id, profile, response.trim()).finally(() => setBusy(false))
  }
  return (
    <div className="rounded-2xl bg-violet-50/60 p-4 ring-1 ring-violet-100">
      <div className="font-bold text-slate-800">{task.title}</div>
      {task.instructions && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{task.instructions}</p>}
      {task.dueDate && (
        <p className="mt-1 text-xs font-semibold text-slate-500">
          {tl(T('Due', 'अंतिम तिथि'))}: {formatDate(task.dueDate, lang)}
        </p>
      )}
      {task.kind === 'text' && <Textarea className="mt-3" rows={2} value={response} onChange={(e) => setResponse(e.target.value)} placeholder={tl(T('Your response', 'आपका उत्तर'))} />}
      <Button size="sm" className="mt-3" onClick={done} loading={busy} disabled={task.kind === 'text' && !response.trim()}>
        <CheckCircle2 className="h-4 w-4" /> {tl(T('Mark as done', 'पूरा चिह्नित करें'))}
      </Button>
    </div>
  )
}

function WeekStats({ entries, incidents }: { entries: Entry[]; incidents: Incident[] }) {
  const { t, tl } = useI18n()
  const moods = entries.filter((e) => e.type === 'mood').map((e) => e.answers.overallMood).filter((v): v is number => typeof v === 'number')
  const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null
  const sleeps = entries
    .filter((e) => e.type === 'sleep')
    .map((e) => sleepMinutes(e.answers.sleepTime as string, e.answers.wakeTime as string))
    .filter((v): v is number => v !== null)
  const avgSleep = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : null
  const lowAppetite = new Set(entries.filter((e) => e.type === 'appetite' && (APPETITE_SCORE[e.answers.appetite as string] ?? 3) <= 2).map((e) => e.date)).size

  const stats = [
    { label: t('avgMood'), value: avgMood !== null ? `${moodEmoji(Math.round(avgMood))} ${avgMood.toFixed(1)}` : '—' },
    { label: t('avgSleep'), value: avgSleep !== null ? t('hours', { h: Math.floor(avgSleep / 60), m: Math.round(avgSleep % 60) }) : '—' },
    { label: tl(T('Low-appetite days', 'कम भूख वाले दिन')), value: String(lowAppetite) },
    { label: tl(T('Incidents', 'घटनाएँ')), value: String(incidents.length) },
  ]
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-800">{t('weekAtGlance')}</h2>
        <Link to="/trends" className="text-sm font-bold text-brand-700 hover:underline">
          {tl(T('Progress', 'प्रगति'))} →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-sand-50 p-3">
            <div className="text-xs font-bold text-slate-500">{s.label}</div>
            <div className="mt-1 text-xl font-extrabold text-slate-800">{s.value}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function routinesForDay(routines: Routine[], day: string) {
  return routines.filter((r) => r.kind === 'daily' || r.date === day).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
}

function TodayRoutines({ routines }: { routines: Routine[] }) {
  const { t } = useI18n()
  const list = routinesForDay(routines, today())
  return (
    <Card className="xl:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-800">{t('upNext')}</h2>
        <Link to="/routines" className="text-sm font-bold text-brand-700 hover:underline">
          {t('nav_routines')} →
        </Link>
      </div>
      {list.length === 0 ? (
        <Link to="/routines" className="flex items-center gap-3 rounded-2xl bg-sand-50 p-4 text-slate-500 hover:bg-sand-100">
          <span className="text-3xl">🖼️</span>
          <span className="flex-1">{t('noRoutines')}</span>
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {list.map((r) => (
            <Link
              key={r.id}
              to={`/routines/${r.id}/play`}
              className={`group w-40 shrink-0 rounded-2xl p-3 ring-1 transition hover:shadow-md ${r.kind === 'event' ? 'bg-amber-50 ring-amber-200' : 'bg-white ring-slate-100'}`}
            >
              <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-white text-5xl">
                {r.slides[0]?.image ? <img src={r.slides[0].image} alt="" className="h-full w-full object-cover" /> : r.slides[0]?.emoji ?? '🖼️'}
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <span className="truncate text-sm font-bold text-slate-700">{r.title}</span>
                <Play className="h-4 w-4 shrink-0 text-brand-600" />
              </div>
              {r.time && <div className="text-xs font-semibold text-slate-400">{r.time}</div>}
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
