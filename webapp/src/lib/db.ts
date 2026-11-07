import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Query,
} from 'firebase/firestore'
import { db } from './firebase'
import { addDays, today } from './dates'
import type {
  Assessment,
  Child,
  Entry,
  Incident,
  Intervention,
  InterventionLog,
  Participant,
  Relation,
  ResearchNote,
  Routine,
  Study,
  Task,
  UserProfile,
} from './types'

// ---------- helpers ----------

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion when read aloud

function makeCode(len = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

function withId<T>(d: { id: string; data: () => DocumentData }): T {
  return { ...(d.data() as object), id: d.id } as T
}

function watch<T>(q: Query, cb: (items: T[]) => void, onError?: (e: Error) => void) {
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => withId<T>(d))), onError)
}

const childCol = (childId: string, name: string) => collection(db, 'children', childId, name)

// ---------- Users ----------

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function createProfile(p: UserProfile) {
  await setDoc(doc(db, 'users', p.uid), p)
}

/** One-time upgrade for prototype accounts that predate modes. */
export async function setProfileMode(uid: string) {
  await updateDoc(doc(db, 'users', uid), { mode: 'individual' })
}

export async function updateProfile(uid: string, data: Partial<Pick<UserProfile, 'name' | 'lang' | 'consent'>>) {
  await updateDoc(doc(db, 'users', uid), data)
}

// ---------- Children ----------

export function watchChildren(uid: string, cb: (children: Child[]) => void, onError?: (e: Error) => void) {
  return watch<Child>(query(collection(db, 'children'), where('memberUids', 'array-contains', uid)), (list) => cb(list.sort((a, b) => a.createdAt - b.createdAt)), onError)
}

export async function getChild(childId: string): Promise<Child | null> {
  const snap = await getDoc(doc(db, 'children', childId))
  return snap.exists() ? withId<Child>(snap) : null
}

export type ChildInput = Pick<Child, 'name' | 'dob' | 'gender' | 'primaryLanguage' | 'diagnosis' | 'diagnosisAge' | 'centre' | 'school' | 'notes'>

export async function registerChild(owner: UserProfile, input: ChildInput, relation: Relation): Promise<Child> {
  // A code collision makes the batch fail (the code doc already exists and can't be overwritten), so retry.
  for (let attempt = 0; attempt < 5; attempt++) {
    const childRef = doc(collection(db, 'children'))
    const code = makeCode()
    const child: Omit<Child, 'id'> = {
      ...input,
      publicId: `S${makeCode(5)}`,
      code,
      ownerUid: owner.uid,
      memberUids: [owner.uid],
      members: { [owner.uid]: { name: owner.name, relation, joinedAt: Date.now() } },
      studyId: null,
      researcherUid: null,
      createdAt: Date.now(),
    }
    const batch = writeBatch(db)
    batch.set(childRef, child)
    batch.set(doc(db, 'codes', code), { childId: childRef.id, ownerUid: owner.uid, createdAt: Date.now() })
    try {
      await batch.commit()
      return { ...child, id: childRef.id }
    } catch (e) {
      if (attempt === 4) throw e
    }
  }
  throw new Error('Could not generate a unique code')
}

export async function updateChild(childId: string, data: Partial<ChildInput>) {
  await updateDoc(doc(db, 'children', childId), data)
}

/** Issues a new join code; the old one stops working. */
export async function regenerateCode(child: Child) {
  const code = makeCode()
  const batch = writeBatch(db)
  batch.update(doc(db, 'children', child.id), { code })
  batch.set(doc(db, 'codes', code), { childId: child.id, ownerUid: child.ownerUid, createdAt: Date.now() })
  batch.delete(doc(db, 'codes', child.code))
  await batch.commit()
}

export function normaliseCode(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function linkChildByCode(user: UserProfile, rawCode: string, relation: Relation): Promise<string> {
  const code = normaliseCode(rawCode)
  const codeSnap = await getDoc(doc(db, 'codes', code))
  if (!codeSnap.exists()) throw new Error('invalid-code')
  const { childId } = codeSnap.data() as { childId: string }
  // The joiner can't read the child yet, so it proves knowledge of the code by writing it into its own
  // member entry; the security rules compare that against the child's real code.
  await updateDoc(doc(db, 'children', childId), {
    memberUids: arrayUnion(user.uid),
    [`members.${user.uid}`]: { name: user.name, relation, joinedAt: Date.now(), code },
  })
  return childId
}

/** Owner removes someone, or a contributor leaves. */
export async function removeMember(childId: string, uid: string) {
  await updateDoc(doc(db, 'children', childId), {
    memberUids: arrayRemove(uid),
    [`members.${uid}`]: deleteField(),
  })
}

async function deleteCollection(path: string[], nested?: string) {
  const snap = await getDocs(collection(db, path[0], ...path.slice(1)))
  for (const d of snap.docs) {
    if (nested) await deleteCollection([...path, d.id, nested])
    await deleteDoc(d.ref)
  }
}

/** Owner-only: removes the child and everything recorded about them. */
export async function deleteChildEverywhere(child: Child) {
  const base = ['children', child.id]
  for (const sub of ['entries', 'incidents', 'assessments', 'tasks', 'routines']) await deleteCollection([...base, sub])
  await deleteCollection([...base, 'interventions'], 'logs')
  await deleteDoc(doc(db, 'children', child.id))
  await deleteDoc(doc(db, 'codes', child.code)).catch(() => {})
}

// ---------- Daily tracking ----------

export function entryId(type: string, date: string, uid: string) {
  return `${type}_${date}_${uid}`
}

export async function getEntry(childId: string, id: string): Promise<Entry | null> {
  const snap = await getDoc(doc(db, 'children', childId, 'entries', id))
  return snap.exists() ? withId<Entry>(snap) : null
}

export async function saveEntry(childId: string, e: Omit<Entry, 'id' | 'updatedAt'>) {
  await setDoc(doc(db, 'children', childId, 'entries', entryId(e.type, e.date, e.authorUid)), { ...e, updatedAt: Date.now() })
}

export function watchEntriesSince(childId: string, fromDate: string, cb: (entries: Entry[]) => void) {
  return watch<Entry>(query(childCol(childId, 'entries'), where('date', '>=', fromDate)), cb)
}

export function watchIncidentsSince(childId: string, fromDate: string, cb: (items: Incident[]) => void) {
  return watch<Incident>(query(childCol(childId, 'incidents'), where('date', '>=', fromDate)), (l) =>
    cb(l.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))),
  )
}

export async function saveIncident(childId: string, i: Omit<Incident, 'id' | 'createdAt'>, id?: string) {
  if (id) await updateDoc(doc(db, 'children', childId, 'incidents', id), { ...i })
  else await addDoc(childCol(childId, 'incidents'), { ...i, createdAt: Date.now() })
}

export async function deleteIncident(childId: string, id: string) {
  await deleteDoc(doc(db, 'children', childId, 'incidents', id))
}

// ---------- Assessments ----------

export async function saveAssessment(childId: string, a: Omit<Assessment, 'id'>): Promise<string> {
  const ref = await addDoc(childCol(childId, 'assessments'), a)
  return ref.id
}

export function watchAssessments(childId: string, cb: (items: Assessment[]) => void) {
  return watch<Assessment>(childCol(childId, 'assessments'), (l) => cb(l.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)))
}

export async function deleteAssessment(childId: string, id: string) {
  await deleteDoc(doc(db, 'children', childId, 'assessments', id))
}

// ---------- Interventions ----------

export function watchInterventions(childId: string, cb: (items: Intervention[]) => void) {
  return watch<Intervention>(childCol(childId, 'interventions'), (l) => cb(l.sort((a, b) => b.createdAt - a.createdAt)))
}

export async function createIntervention(childId: string, i: Omit<Intervention, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(childCol(childId, 'interventions'), { ...i, createdAt: Date.now() })
  return ref.id
}

export async function setInterventionStatus(childId: string, id: string, status: Intervention['status']) {
  await updateDoc(doc(db, 'children', childId, 'interventions', id), { status })
}

export async function deleteIntervention(childId: string, id: string) {
  await deleteCollection(['children', childId, 'interventions', id, 'logs'])
  await deleteDoc(doc(db, 'children', childId, 'interventions', id))
}

export function watchLogs(childId: string, interventionId: string, cb: (items: InterventionLog[]) => void) {
  return watch<InterventionLog>(collection(db, 'children', childId, 'interventions', interventionId, 'logs'), (l) =>
    cb(l.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)),
  )
}

export async function getAllLogs(childId: string, interventions: Intervention[]) {
  const out: (InterventionLog & { interventionId: string })[] = []
  for (const i of interventions) {
    const snap = await getDocs(collection(db, 'children', childId, 'interventions', i.id, 'logs'))
    snap.docs.forEach((d) => out.push({ ...withId<InterventionLog>(d), interventionId: i.id }))
  }
  return out
}

export async function addLog(childId: string, interventionId: string, log: Omit<InterventionLog, 'id' | 'createdAt'>) {
  await addDoc(collection(db, 'children', childId, 'interventions', interventionId, 'logs'), { ...log, createdAt: Date.now() })
}

export async function deleteLog(childId: string, interventionId: string, id: string) {
  await deleteDoc(doc(db, 'children', childId, 'interventions', interventionId, 'logs', id))
}

// ---------- Tasks (assigned by a researcher) ----------

export function watchTasks(childId: string, cb: (items: Task[]) => void) {
  return watch<Task>(childCol(childId, 'tasks'), (l) => cb(l.sort((a, b) => b.createdAt - a.createdAt)))
}

export async function createTask(childId: string, t: Omit<Task, 'id' | 'createdAt' | 'status' | 'response' | 'completedBy' | 'completedByName' | 'completedAt'>) {
  await addDoc(childCol(childId, 'tasks'), { ...t, status: 'open', response: '', completedBy: null, completedByName: null, completedAt: null, createdAt: Date.now() })
}

export async function completeTask(childId: string, taskId: string, user: UserProfile, response: string) {
  await updateDoc(doc(db, 'children', childId, 'tasks', taskId), {
    status: 'done',
    response,
    completedBy: user.uid,
    completedByName: user.name,
    completedAt: Date.now(),
  })
}

export async function deleteTask(childId: string, taskId: string) {
  await deleteDoc(doc(db, 'children', childId, 'tasks', taskId))
}

// ---------- Visual routines ----------

export function watchRoutines(childId: string, cb: (items: Routine[]) => void) {
  return watch<Routine>(childCol(childId, 'routines'), cb)
}

export async function saveRoutine(childId: string, r: Omit<Routine, 'id' | 'updatedAt'>, id?: string): Promise<string> {
  const ref = id ? doc(db, 'children', childId, 'routines', id) : doc(childCol(childId, 'routines'))
  await setDoc(ref, { ...r, updatedAt: Date.now() })
  return ref.id
}

export async function deleteRoutine(childId: string, id: string) {
  await deleteDoc(doc(db, 'children', childId, 'routines', id))
}

// ---------- Research studies ----------

export function watchMyStudies(uid: string, cb: (items: Study[]) => void) {
  return watch<Study>(query(collection(db, 'studies'), where('ownerUid', '==', uid)), (l) => cb(l.sort((a, b) => b.createdAt - a.createdAt)))
}

export function watchStudy(id: string, cb: (s: Study | null) => void) {
  return onSnapshot(doc(db, 'studies', id), (snap) => cb(snap.exists() ? withId<Study>(snap) : null))
}

export async function getStudy(id: string): Promise<Study | null> {
  const snap = await getDoc(doc(db, 'studies', id))
  return snap.exists() ? withId<Study>(snap) : null
}

export async function createStudy(owner: UserProfile, s: Omit<Study, 'id' | 'ownerUid' | 'ownerName' | 'code' | 'createdAt' | 'active'>): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = doc(collection(db, 'studies'))
    const code = makeCode()
    const batch = writeBatch(db)
    batch.set(ref, { ...s, ownerUid: owner.uid, ownerName: owner.name, code, active: true, createdAt: Date.now() })
    batch.set(doc(db, 'studyCodes', code), { studyId: ref.id, ownerUid: owner.uid })
    try {
      await batch.commit()
      return ref.id
    } catch (e) {
      if (attempt === 4) throw e
    }
  }
  throw new Error('Could not generate a unique code')
}

export async function updateStudy(id: string, data: Partial<Pick<Study, 'title' | 'description' | 'active' | 'consentText'>>) {
  await updateDoc(doc(db, 'studies', id), data)
}

export async function findStudyByCode(rawCode: string): Promise<Study | null> {
  const snap = await getDoc(doc(db, 'studyCodes', normaliseCode(rawCode)))
  if (!snap.exists()) return null
  return getStudy((snap.data() as { studyId: string }).studyId)
}

/** Enrols a child in a study: creates the participant record and gives the researcher read access. */
export async function enrolChild(user: UserProfile, child: Child, study: Study) {
  const start = today()
  const participant: Participant = {
    childId: child.id,
    childPublicId: child.publicId,
    childDob: child.dob,
    childGender: child.gender,
    enrolledByUid: user.uid,
    enrolledByName: user.name,
    enrolledAt: Date.now(),
    startDate: start,
    endDate: addDays(start, study.durationWeeks * 7),
    status: 'active',
    deleteDataRequested: false,
    withdrawalRequestedAt: null,
    consentAt: Date.now(),
    code: study.code,
  }
  const batch = writeBatch(db)
  batch.set(doc(db, 'studies', study.id, 'participants', child.id), participant)
  batch.update(doc(db, 'children', child.id), { studyId: study.id, researcherUid: study.ownerUid })
  await batch.commit()
  // Interventions the protocol assigns to everyone are added by the family on joining.
  for (const templateId of study.interventionTemplateIds) {
    await createIntervention(child.id, {
      templateId,
      custom: null,
      domainId: null,
      status: 'active',
      source: 'library',
      startDate: start,
      endDate: participant.endDate,
      studyId: study.id,
      createdBy: user.uid,
      createdByName: user.name,
    })
  }
}

export async function getParticipant(studyId: string, childId: string): Promise<Participant | null> {
  const snap = await getDoc(doc(db, 'studies', studyId, 'participants', childId))
  return snap.exists() ? (snap.data() as Participant) : null
}

export function watchParticipants(studyId: string, cb: (items: Participant[]) => void) {
  return onSnapshot(collection(db, 'studies', studyId, 'participants'), (snap) =>
    cb(snap.docs.map((d) => d.data() as Participant).sort((a, b) => a.enrolledAt - b.enrolledAt)),
  )
}

export async function requestWithdrawal(studyId: string, childId: string, deleteData: boolean) {
  await updateDoc(doc(db, 'studies', studyId, 'participants', childId), {
    status: 'withdrawalRequested',
    deleteDataRequested: deleteData,
    withdrawalRequestedAt: Date.now(),
  })
}

/** Researcher completes a withdrawal: optionally deletes research-only data, then drops access. */
export async function completeWithdrawal(studyId: string, childId: string, deleteData: boolean) {
  if (deleteData) {
    const tasks = await getDocs(query(childCol(childId, 'tasks'), where('studyId', '==', studyId)))
    for (const t of tasks.docs) await deleteDoc(t.ref)
    const ivs = await getDocs(query(childCol(childId, 'interventions'), where('studyId', '==', studyId), where('source', '==', 'researcher')))
    for (const i of ivs.docs) await deleteIntervention(childId, i.id)
    await deleteCollection(['studies', studyId, 'participants', childId, 'notes'])
  }
  await updateDoc(doc(db, 'studies', studyId, 'participants', childId), { status: 'withdrawn' })
  await updateDoc(doc(db, 'children', childId), { studyId: null, researcherUid: null })
}

export function watchNotes(studyId: string, childId: string, cb: (items: ResearchNote[]) => void) {
  return watch<ResearchNote>(collection(db, 'studies', studyId, 'participants', childId, 'notes'), (l) => cb(l.sort((a, b) => b.createdAt - a.createdAt)))
}

export async function addNote(studyId: string, childId: string, text: string, authorName: string) {
  await addDoc(collection(db, 'studies', studyId, 'participants', childId, 'notes'), { text, authorName, createdAt: Date.now() })
}
