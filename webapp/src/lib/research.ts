import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { daysBetween, today } from './dates'
import { getAllLogs, getChild } from './db'
import type { Assessment, Child, Entry, Incident, Intervention, Participant, Task } from './types'

export interface ParticipantSummary {
  child: Child | null
  trackingDays: number
  expectedDays: number
  incidents: number
  sessions: number
  tasksDone: number
  tasksTotal: number
  contributors: number
  /** Mean checklist need-score across domains, per phase, within this study. */
  pre: number | null
  post: number | null
  lastActivity: string | null
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

function checklistMean(a?: Assessment): number | null {
  return a?.domainScores ? mean(Object.values(a.domainScores)) : null
}

/** Reads a participant's study-period data (allowed by rules while the child is linked to this researcher). */
export async function loadParticipantSummary(studyId: string, p: Participant): Promise<ParticipantSummary> {
  const child = await getChild(p.childId).catch(() => null)
  const empty: ParticipantSummary = { child, trackingDays: 0, expectedDays: 0, incidents: 0, sessions: 0, tasksDone: 0, tasksTotal: 0, contributors: 0, pre: null, post: null, lastActivity: null }
  if (!child || child.studyId !== studyId) return empty
  const col = (name: string) => collection(db, 'children', p.childId, name)
  const [entries, incidents, assessments, interventions, tasks] = await Promise.all([
    getDocs(query(col('entries'), where('date', '>=', p.startDate))).then((s) => s.docs.map((d) => d.data() as Entry)),
    getDocs(query(col('incidents'), where('date', '>=', p.startDate))).then((s) => s.docs.map((d) => d.data() as Incident)),
    getDocs(col('assessments')).then((s) => s.docs.map((d) => ({ ...(d.data() as Assessment), id: d.id }))),
    getDocs(col('interventions')).then((s) => s.docs.map((d) => ({ ...(d.data() as Intervention), id: d.id }))),
    getDocs(col('tasks')).then((s) => s.docs.map((d) => d.data() as Task).filter((t) => t.studyId === studyId)),
  ])
  const logs = (await getAllLogs(p.childId, interventions)).filter((l) => l.date >= p.startDate)
  const study = assessments.filter((a) => a.studyId === studyId && a.instrument === 'checklist').sort((a, b) => a.date.localeCompare(b.date))
  const dates = [...entries.map((e) => e.date), ...incidents.map((i) => i.date), ...logs.map((l) => l.date)].sort()
  const end = today() < p.endDate ? today() : p.endDate
  return {
    child,
    trackingDays: new Set(entries.map((e) => e.date)).size,
    expectedDays: Math.max(1, daysBetween(p.startDate, end) + 1),
    incidents: incidents.length,
    sessions: logs.length,
    tasksDone: tasks.filter((t) => t.status === 'done').length,
    tasksTotal: tasks.length,
    contributors: child.memberUids.length,
    pre: checklistMean(study.find((a) => a.phase === 'pre')),
    post: checklistMean([...study].reverse().find((a) => a.phase === 'post')),
    lastActivity: dates[dates.length - 1] ?? null,
  }
}
