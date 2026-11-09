export type Mode = 'individual' | 'researcher'
export type Lang = 'en' | 'hi'
export type L = { en: string; hi: string }

/** How a contributor is related to a child. Every linked person records with their own relation. */
export type Relation = 'parent' | 'otherParent' | 'sibling' | 'relative' | 'caregiver' | 'teacher'
export const RELATIONS: Relation[] = ['parent', 'otherParent', 'sibling', 'relative', 'caregiver', 'teacher']

export interface ConsentRecord {
  accepted: boolean
  at: number
  version: string
}

export interface UserProfile {
  uid: string
  name: string
  email: string
  mode: Mode
  lang: Lang
  consent?: { general?: ConsentRecord; research?: ConsentRecord }
  createdAt: number
}

export interface Member {
  name: string
  relation: Relation
  joinedAt: number
  code?: string // the code used to join (checked by security rules)
}

export interface Child {
  id: string
  /** Non-secret display ID shown to researchers, e.g. S7K2PX. */
  publicId: string
  name: string
  dob: string // YYYY-MM-DD
  gender: 'male' | 'female' | 'other'
  primaryLanguage: string
  diagnosis: string
  diagnosisAge?: string
  centre?: string
  school?: string
  notes?: string
  /** Secret join code shared with family/caregivers; the owner can regenerate it. */
  code: string
  ownerUid: string
  memberUids: string[]
  members: Record<string, Member>
  studyId: string | null
  researcherUid: string | null
  createdAt: number
}

export interface Authored {
  authorUid: string
  authorName: string
  authorRelation: Relation
}

export type EntryType = 'sleep' | 'mood' | 'appetite'
export type AnswerValue = string | number | boolean | string[] | null

export interface Entry extends Authored {
  id: string
  type: EntryType
  date: string // YYYY-MM-DD
  answers: Record<string, AnswerValue>
  updatedAt: number
}

export interface Incident extends Authored {
  id: string
  date: string
  time: string
  severity: 'mild' | 'moderate' | 'severe'
  what: string
  before: string
  after: string
  response: string
  helped: string
  notes: string
  createdAt: number
}

export type Phase = 'pre' | 'post'
export type InstrumentId = 'checklist' | 'mchat' | 'atec'

export interface Assessment extends Authored {
  id: string
  instrument: InstrumentId
  phase: Phase
  date: string
  answers: Record<string, number>
  domainScores?: Record<string, number> // checklist: 0–100, higher = more need
  subscales?: Record<string, number> // ATEC subscale scores
  totalScore?: number // M-CHAT-R / ATEC total
  retestDue: string
  studyId: string | null
  createdAt: number
}

export type FieldKind = 'text' | 'choice' | 'yesno' | 'mood' | 'number'

export interface RecordField {
  id: string
  kind: FieldKind
  label: L
  options?: { value: string; label: L }[]
}

export interface Intervention {
  id: string
  templateId: string | null
  /** Only for custom or researcher-written interventions (templates render from content). */
  custom: { title: string; description: string; steps: string[] } | null
  domainId: string | null
  status: 'active' | 'completed' | 'rejected'
  source: 'recommendation' | 'library' | 'custom' | 'researcher'
  startDate: string
  endDate: string
  studyId: string | null
  createdBy: string
  createdByName: string
  createdAt: number
}

export interface InterventionLog extends Authored {
  id: string
  date: string
  values: Record<string, AnswerValue>
  notes: string
  createdAt: number
}

export interface Task {
  id: string
  studyId: string
  title: string
  instructions: string
  kind: 'text' | 'checkbox'
  dueDate: string
  /** Contributor the task is for; null (or missing on older tasks) = anyone in the child's care team. */
  assignedTo?: string | null
  assignedToName?: string | null
  assignedToRelation?: Relation | null
  status: 'open' | 'done'
  response: string
  completedBy: string | null
  completedByName: string | null
  completedAt: number | null
  createdBy: string
  createdAt: number
}

export interface Slide {
  emoji?: string
  image?: string // small JPEG data URL
  caption: string
}

export interface Routine {
  id: string
  title: string
  kind: 'daily' | 'event'
  time?: string
  date?: string
  slides: Slide[]
  authorUid: string
  authorName: string
  updatedAt: number
}

export interface Study {
  id: string
  ownerUid: string
  ownerName: string
  title: string
  description: string
  durationWeeks: number
  instruments: InstrumentId[]
  interventionTemplateIds: string[]
  consentText: string
  code: string
  active: boolean
  createdAt: number
}

export interface Participant {
  childId: string
  childPublicId: string
  childDob: string
  childGender: Child['gender']
  enrolledByUid: string
  enrolledByName: string
  enrolledAt: number
  startDate: string
  endDate: string
  status: 'active' | 'withdrawalRequested' | 'withdrawn'
  deleteDataRequested: boolean
  withdrawalRequestedAt: number | null
  consentAt: number
  code: string
}

export interface ResearchNote {
  id: string
  text: string
  authorName: string
  createdAt: number
}
