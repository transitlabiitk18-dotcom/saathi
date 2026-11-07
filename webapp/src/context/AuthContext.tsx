import { onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getProfile, setProfileMode, updateProfile } from '../lib/db'
import { auth } from '../lib/firebase'
import type { Lang, UserProfile } from '../lib/types'
import { useI18n } from '../i18n'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  setProfile: (p: UserProfile) => void
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { setLang } = useI18n()

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u)
        if (u) {
          // A just-registered user's profile may not exist yet; Register sets it directly.
          const p = await getProfile(u.uid).catch(() => null)
          // Accounts from the first prototype had a `role` instead of a `mode`; they become Individual.
          if (p && !p.mode) {
            p.mode = 'individual'
            await setProfileMode(u.uid).catch(() => {})
          }
          if (p) {
            setProfile(p)
            setLang(p.lang)
          }
        } else {
          setProfile(null)
        }
        setLoading(false)
      }),
    [setLang],
  )

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return
    const p = await getProfile(auth.currentUser.uid)
    if (p) setProfile(p)
  }, [])

  const signOut = useCallback(async () => {
    await fbSignOut(auth)
    try {
      localStorage.removeItem('selectedChild')
    } catch {
      /* ignore */
    }
  }, [])

  return <Ctx.Provider value={{ user, profile, loading, refreshProfile, setProfile, signOut }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth outside provider')
  return v
}

/** For pages rendered only after sign-in + profile load. */
export function useProfile(): UserProfile {
  const { profile } = useAuth()
  if (!profile) throw new Error('profile not loaded')
  return profile
}

/** Changes the UI language and remembers it on the user's profile. */
export function useSaveLang() {
  const { setLang } = useI18n()
  const { profile, setProfile } = useAuth()
  return (l: Lang) => {
    setLang(l)
    if (profile && profile.lang !== l) {
      setProfile({ ...profile, lang: l })
      updateProfile(profile.uid, { lang: l }).catch(() => {})
    }
  }
}
