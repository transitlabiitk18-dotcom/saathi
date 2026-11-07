import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { watchChildren } from '../lib/db'
import type { Child } from '../lib/types'
import { useProfile } from './AuthContext'

interface ChildState {
  children: Child[]
  child: Child | null
  loading: boolean
  selectChild: (id: string) => void
}

const Ctx = createContext<ChildState | null>(null)

function readSelected(): string | null {
  try {
    return localStorage.getItem('selectedChild')
  } catch {
    return null
  }
}

export function ChildProvider({ children: node }: { children: ReactNode }) {
  const profile = useProfile()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(readSelected)

  useEffect(
    () =>
      watchChildren(
        profile.uid,
        (list) => {
          setChildren(list)
          setLoading(false)
        },
        () => setLoading(false),
      ),
    [profile.uid],
  )

  const value = useMemo<ChildState>(() => {
    const child = children.find((c) => c.id === selectedId) ?? children[0] ?? null
    return {
      children,
      child,
      loading,
      selectChild: (id) => {
        setSelectedId(id)
        try {
          localStorage.setItem('selectedChild', id)
        } catch {
          /* ignore */
        }
      },
    }
  }, [children, selectedId, loading])

  return <Ctx.Provider value={value}>{node}</Ctx.Provider>
}

export function useChildren() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useChildren outside provider')
  return v
}

/** Renders children with a fixed child in scope (used by the researcher views to reuse child pages). */
export function ChildScope({ child, children: node }: { child: Child; children: ReactNode }) {
  const value = useMemo<ChildState>(() => ({ children: [child], child, loading: false, selectChild: () => {} }), [child])
  return <Ctx.Provider value={value}>{node}</Ctx.Provider>
}

/** For pages rendered only when a child is selected. */
export function useChild(): Child {
  const { child } = useChildren()
  if (!child) throw new Error('no child selected')
  return child
}
