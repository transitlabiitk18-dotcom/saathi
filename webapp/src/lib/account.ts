import { EmailAuthProvider, deleteUser, reauthenticateWithCredential } from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'
import { deleteChildEverywhere, removeMember } from './db'
import type { Child, UserProfile } from './types'

/**
 * Deletes the signed-in user's account. Children they created are deleted with all their data; children
 * they only contribute to are left (their past entries stay with that child's profile).
 */
export async function deleteMyAccount(profile: UserProfile, children: Child[], password: string) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('not signed in')
  // Firebase requires a recent sign-in before deleting an account; re-check the password first so we
  // don't delete data and then fail on the account itself.
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
  for (const c of children) {
    if (c.ownerUid === profile.uid) await deleteChildEverywhere(c)
    else await removeMember(c.id, profile.uid)
  }
  await deleteDoc(doc(db, 'users', profile.uid))
  await deleteUser(user)
}

/** Everything recorded for the given children, as a JSON file the user can keep. */
export async function exportChildrenData(children: Child[]) {
  const out: Record<string, unknown>[] = []
  for (const c of children) {
    const sub = async (name: string) => (await getDocs(collection(db, 'children', c.id, name))).docs.map((d) => ({ id: d.id, ...d.data() }))
    const interventions = await sub('interventions')
    for (const i of interventions) {
      ;(i as Record<string, unknown>).logs = (await getDocs(collection(db, 'children', c.id, 'interventions', i.id, 'logs'))).docs.map((d) => ({ id: d.id, ...d.data() }))
    }
    const { code: _code, ...childInfo } = c
    void _code
    out.push({
      child: childInfo,
      entries: await sub('entries'),
      incidents: await sub('incidents'),
      assessments: await sub('assessments'),
      interventions,
      tasks: await sub('tasks'),
      routines: (await sub('routines')).map((r) => ({ ...r, slides: '(omitted)' })),
    })
  }
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), children: out }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `saathi-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
