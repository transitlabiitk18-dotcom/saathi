import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile as fbUpdateProfile } from 'firebase/auth'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LangToggle } from '../components/Layout'
import { Button, ErrorText, Field, Input, cx } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'
import { createProfile } from '../lib/db'
import { auth } from '../lib/firebase'
import type { L, Mode, UserProfile } from '../lib/types'

const MODES: { mode: Mode; emoji: string; title: L; hint: L }[] = [
  {
    mode: 'individual',
    emoji: '👪',
    title: { en: 'Individual', hi: 'व्यक्तिगत' },
    hint: { en: 'Parent, family member, caregiver or teacher tracking a child', hi: 'माता-पिता, परिवार, देखभालकर्ता या शिक्षक जो बच्चे की प्रगति देखते हैं' },
  },
  {
    mode: 'researcher',
    emoji: '🔬',
    title: { en: 'Researcher', hi: 'शोधकर्ता' },
    hint: { en: 'Create studies, invite participants and monitor progress', hi: 'अध्ययन बनाएँ, प्रतिभागियों को आमंत्रित करें और प्रगति देखें' },
  },
]

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { t, tl, lang, setLang } = useI18n()
  const { setProfile } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountMode, setAccountMode] = useState<Mode>('individual')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await fbUpdateProfile(cred.user, { displayName: name.trim() })
        const profile: UserProfile = { uid: cred.user.uid, name: name.trim(), email: email.trim(), mode: accountMode, lang, createdAt: Date.now() }
        await createProfile(profile)
        setProfile(profile)
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? String(err)
      setError(mode === 'login' ? t('authError') : t('signUpError', { msg: code.replace('auth/', '').replaceAll('-', ' ') }))
    } finally {
      setBusy(false)
    }
  }

  const reset = async () => {
    if (!email) return
    await sendPasswordResetEmail(auth, email.trim()).catch(() => {})
    setInfo(t('resetSent'))
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-700 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,220,160,.25),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3 text-2xl font-extrabold">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-2xl">🌱</span>
            {t('appName')}
          </div>
          <div>
            <div className="mb-8 flex gap-3 text-5xl">
              <span className="animate-[bounce_3s_infinite]">🍽️</span>
              <span className="animate-[bounce_3s_infinite_.4s]">🌙</span>
              <span className="animate-[bounce_3s_infinite_.8s]">🌤️</span>
              <span className="animate-[bounce_3s_infinite_1.2s]">🧩</span>
            </div>
            <h2 className="max-w-md text-4xl font-extrabold leading-tight">{t('tagline')}</h2>
            <p className="mt-4 max-w-md text-brand-100">{t('aboutText')}</p>
          </div>
          <p className="text-sm text-brand-200">IIT Kanpur</p>
        </div>
      </div>

      <div className="flex flex-col bg-sand-50 px-6 py-8">
        <div className="flex justify-end">
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="mb-6 lg:hidden">
            <span className="flex items-center gap-2"><span className="text-4xl">🌱</span><span className="text-2xl font-extrabold tracking-tight text-brand-800">{t('appName')}</span></span>
            <p className="mt-2 text-slate-500">{t('tagline')}</p>
            <p className="mt-1 font-semibold text-brand-700">{t('aboutText')}</p>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">{mode === 'login' ? t('signIn') : t('signUp')}</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">{tl({ en: 'Choose mode', hi: 'मोड चुनें' })}</span>
                  <div className="grid gap-2">
                    {MODES.map((r) => (
                      <button
                        type="button"
                        key={r.mode}
                        onClick={() => setAccountMode(r.mode)}
                        className={cx(
                          'flex items-center gap-3 rounded-2xl p-3 text-left ring-1 transition',
                          accountMode === r.mode ? 'bg-brand-50 ring-2 ring-brand-500' : 'bg-white ring-slate-200 hover:bg-slate-50',
                        )}
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <span>
                          <span className="block font-bold text-slate-800">{tl(r.title)}</span>
                          <span className="block text-sm text-slate-500">{tl(r.hint)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <Field label={t('fullName')}>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </Field>
              </>
            )}
            <Field label={t('email')}>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Field label={t('password')}>
              <Input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </Field>
            <ErrorText>{error}</ErrorText>
            {info && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{info}</p>}
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              {mode === 'login' ? t('signIn') : t('signUp')}
            </Button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm">
            {mode === 'login' ? (
              <>
                <span className="text-slate-500">
                  {t('noAccount')}{' '}
                  <Link to="/register" className="font-bold text-brand-700 hover:underline">
                    {t('signUp')}
                  </Link>
                </span>
                <button onClick={reset} className="font-semibold text-slate-500 hover:text-slate-700">
                  {t('forgotPassword')}
                </button>
              </>
            ) : (
              <span className="text-slate-500">
                {t('haveAccount')}{' '}
                <Link to="/login" className="font-bold text-brand-700 hover:underline">
                  {t('signIn')}
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
