import { BarChart3, BookHeart, ClipboardCheck, FlaskConical, GalleryHorizontalEnd, Home, LogOut, Menu, Puzzle, Settings, Users, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useProfile, useSaveLang } from '../context/AuthContext'
import { useChildren } from '../context/ChildContext'
import { T, useI18n } from '../i18n'
import { ageLabel } from '../lib/dates'
import type { L } from '../lib/types'
import { cx } from './ui'
import { useReminders } from './reminders'

interface NavItem {
  to: string
  label: L
  icon: typeof Home
  mobile?: boolean
}

const INDIVIDUAL_NAV: NavItem[] = [
  { to: '/', label: T('Home', 'होम'), icon: Home, mobile: true },
  { to: '/track', label: T('Track', 'ट्रैक'), icon: BookHeart, mobile: true },
  { to: '/interventions', label: T('Interventions', 'हस्तक्षेप'), icon: Puzzle, mobile: true },
  { to: '/assess', label: T('Questionnaires', 'प्रश्नावली'), icon: ClipboardCheck, mobile: true },
  { to: '/trends', label: T('Progress', 'प्रगति'), icon: BarChart3 },
  { to: '/routines', label: T('Visual routines', 'दृश्य दिनचर्या'), icon: GalleryHorizontalEnd },
  { to: '/children', label: T('Children', 'बच्चे'), icon: Users },
  { to: '/account', label: T('Settings', 'सेटिंग्स'), icon: Settings },
]

const RESEARCHER_NAV: NavItem[] = [
  { to: '/', label: T('Studies', 'अध्ययन'), icon: FlaskConical, mobile: true },
  { to: '/account', label: T('Settings', 'सेटिंग्स'), icon: Settings },
]

export function Layout() {
  useReminders()
  return <Shell items={INDIVIDUAL_NAV} switcher={<ChildSwitcher />} compactSwitcher={<ChildSwitcher compact />} />
}

export function ResearcherLayout() {
  return <Shell items={RESEARCHER_NAV} />
}

function Shell({ items, switcher, compactSwitcher }: { items: NavItem[]; switcher?: ReactNode; compactSwitcher?: ReactNode }) {
  const { tl } = useI18n()
  const mobileItems = items.filter((i) => i.mobile)
  const moreItems = items.filter((i) => !i.mobile)
  const [moreOpen, setMoreOpen] = useState(false)
  const { pathname } = useLocation()
  const moreActive = moreItems.some((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)))
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-y-auto border-r border-slate-200/70 bg-white/80 px-4 py-5 backdrop-blur md:flex md:w-56 lg:w-64">
        <Brand />
        {switcher && <div className="mt-6">{switcher}</div>}
        <nav className="mt-6 flex-1 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
                )
              }
            >
              <it.icon className="h-5 w-5" />
              {tl(it.label)}
            </NavLink>
          ))}
        </nav>
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Brand compact />
        <div className="min-w-0 flex-1">{compactSwitcher}</div>
        <Link to="/account" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label={tl(T('Settings', 'सेटिंग्स'))}>
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      <main className="px-4 pb-28 pt-5 sm:px-6 md:ml-56 md:px-8 md:pb-12 md:pt-8 lg:ml-64 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        style={{ gridTemplateColumns: `repeat(${mobileItems.length + 1}, minmax(0, 1fr))` }}
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {mobileItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) =>
                cx('flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold', isActive ? 'text-brand-600' : 'text-slate-400')
              }
            >
              <it.icon className="h-5 w-5" />
              <span className="max-w-full truncate px-1">{tl(it.label)}</span>
            </NavLink>
          ))}
        <button
          onClick={() => setMoreOpen(true)}
          className={cx('flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold', moreActive || moreOpen ? 'text-brand-600' : 'text-slate-400')}
        >
          <Menu className="h-5 w-5" />
          <span className="max-w-full truncate px-1">{tl(T('More', 'और'))}</span>
        </button>
      </nav>
      {moreOpen && <MoreSheet items={moreItems} onClose={() => setMoreOpen(false)} />}
    </div>
  )
}

/** Phone/tablet menu for the pages that don't fit in the bottom bar, plus language and sign-out. */
function MoreSheet({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  const profile = useProfile()
  const { signOut } = useAuth()
  const { t, tl, lang } = useI18n()
  const setLang = useSaveLang()
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={onClose}>
      <div className="w-full rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={profile.name} small />
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold text-slate-800">{profile.name}</div>
            <div className="text-xs text-slate-500">{profile.mode === 'researcher' ? tl(T('Researcher', 'शोधकर्ता')) : tl(T('Individual', 'व्यक्तिगत'))}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cx('flex flex-col items-center gap-1.5 rounded-2xl px-2 py-4 text-center text-sm font-bold ring-1 transition', isActive ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'text-slate-600 ring-slate-100 hover:bg-slate-50')
              }
            >
              <it.icon className="h-6 w-6" />
              {tl(it.label)}
            </NavLink>
          ))}
        </nav>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <LangToggle lang={lang} setLang={setLang} />
          <button onClick={signOut} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">
            <LogOut className="h-4 w-4" /> {t('signOut')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Brand({ compact }: { compact?: boolean }) {
  const { t } = useI18n()
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-xl">🌱</span>
      {!compact && <span className="text-xl font-extrabold tracking-tight text-brand-800">{t('appName')}</span>}
    </Link>
  )
}

function ChildSwitcher({ compact }: { compact?: boolean }) {
  const { children, child, selectChild } = useChildren()
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  if (!child) return null
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'flex w-full items-center gap-3 rounded-2xl text-left transition hover:bg-slate-50',
          compact ? 'px-2 py-1' : 'bg-brand-50/60 px-3 py-2.5 ring-1 ring-brand-100',
        )}
      >
        <Avatar name={child.name} />
        <div className="min-w-0">
          <div className="truncate font-bold text-slate-800">{child.name}</div>
          <div className="text-xs text-slate-500">{ageLabel(child.dob, lang)}</div>
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-50 mt-2 min-w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-100">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  selectChild(c.id)
                  setOpen(false)
                }}
                className={cx('flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50', c.id === child.id && 'bg-brand-50')}
              >
                <Avatar name={c.name} small />
                <span className="font-semibold text-slate-700">{c.name}</span>
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false)
                navigate('/children')
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              <Users className="h-4 w-4" /> {t('nav_children')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const AVATAR_COLORS = ['bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700']

export function Avatar({ name, small }: { name: string; small?: boolean }) {
  const color = AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full font-extrabold', color, small ? 'h-7 w-7 text-xs' : 'h-10 w-10')}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

function SidebarFooter() {
  const profile = useProfile()
  const { signOut } = useAuth()
  const { t, tl, lang } = useI18n()
  const setLang = useSaveLang()
  return (
    <div className="space-y-3 border-t border-slate-100 pt-4">
      <LangToggle lang={lang} setLang={setLang} />
      <div className="flex items-center gap-3">
        <Avatar name={profile.name} small />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-slate-700">{profile.name}</div>
          <div className="text-xs text-slate-500">{profile.mode === 'researcher' ? tl(T('Researcher', 'शोधकर्ता')) : tl(T('Individual', 'व्यक्तिगत'))}</div>
        </div>
        <button onClick={signOut} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title={t('signOut')}>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function LangToggle({ lang, setLang }: { lang: 'en' | 'hi'; setLang: (l: 'en' | 'hi') => void }): ReactNode {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm font-bold">
      {(['en', 'hi'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cx('rounded-lg px-3 py-1 transition', lang === l ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500')}
        >
          {l === 'en' ? 'English' : 'हिंदी'}
        </button>
      ))}
    </div>
  )
}
