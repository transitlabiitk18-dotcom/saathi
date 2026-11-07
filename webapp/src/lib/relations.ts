import type { Child, L, Relation } from './types'

export const RELATION_LABEL: Record<Relation, L> = {
  parent: { en: 'Parent', hi: 'माता-पिता' },
  otherParent: { en: 'Other parent', hi: 'दूसरे अभिभावक' },
  sibling: { en: 'Sibling', hi: 'भाई / बहन' },
  relative: { en: 'Relative', hi: 'रिश्तेदार' },
  caregiver: { en: 'Caregiver / therapist', hi: 'देखभालकर्ता / थेरेपिस्ट' },
  teacher: { en: 'Teacher', hi: 'शिक्षक' },
}

export const RELATION_COLOR: Record<Relation, string> = {
  parent: '#35847b',
  otherParent: '#0ea5e9',
  sibling: '#a855f7',
  relative: '#ec4899',
  caregiver: '#f59e0b',
  teacher: '#6366f1',
}

/** Home contributors vs centre/school contributors, used for the home-vs-centre mood comparison. */
export const isHomeRelation = (r: Relation) => r === 'parent' || r === 'otherParent' || r === 'sibling' || r === 'relative'

export function myRelation(child: Child, uid: string): Relation {
  return child.members[uid]?.relation ?? 'caregiver'
}
