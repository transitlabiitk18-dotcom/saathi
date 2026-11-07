import { useEffect, useState } from 'react'
import { watchAssessments, watchEntriesSince, watchIncidentsSince, watchInterventions, watchRoutines, watchTasks } from './db'
import { today } from './dates'
import type { Assessment, Entry, Incident, Intervention, Routine, Task } from './types'

function useWatch<T>(subscribe: (cb: (v: T) => void) => () => void, deps: unknown[]): T | null {
  const [value, setValue] = useState<T | null>(null)
  useEffect(() => {
    setValue(null)
    return subscribe(setValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return value
}

export const useAssessments = (childId: string) => useWatch<Assessment[]>((cb) => watchAssessments(childId, cb), [childId])
export const useEntries = (childId: string, from: string) => useWatch<Entry[]>((cb) => watchEntriesSince(childId, from, cb), [childId, from])
export const useIncidents = (childId: string, from: string) => useWatch<Incident[]>((cb) => watchIncidentsSince(childId, from, cb), [childId, from])
export const useRoutines = (childId: string) => useWatch<Routine[]>((cb) => watchRoutines(childId, cb), [childId])
export const useInterventions = (childId: string) => useWatch<Intervention[]>((cb) => watchInterventions(childId, cb), [childId])
export const useTasks = (childId: string) => useWatch<Task[]>((cb) => watchTasks(childId, cb), [childId])

/** Latest domain-checklist result, newest first overall. */
export function latestChecklist(items: Assessment[] | null): Assessment | null {
  return items?.find((a) => a.instrument === 'checklist' && a.domainScores) ?? null
}

/** The user's latest pre-test that has no later post-test of the same questionnaire. */
export function pendingRetest(items: Assessment[] | null, uid: string): Assessment | null {
  if (!items) return null
  const mine = items.filter((a) => a.authorUid === uid)
  for (const a of mine) {
    if (a.phase === 'post') continue
    const hasPost = mine.some((b) => b.instrument === a.instrument && b.phase === 'post' && b.date >= a.date)
    if (!hasPost) return a
  }
  return null
}

export function activeInterventions(items: Intervention[] | null): Intervention[] {
  return (items ?? []).filter((i) => i.status === 'active')
}

export function isFinished(i: Intervention): boolean {
  return i.endDate < today()
}
