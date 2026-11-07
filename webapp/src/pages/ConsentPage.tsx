import { useState } from 'react'
import { LangToggle } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { useAuth, useProfile } from '../context/AuthContext'
import { CONSENT_VERSION, GENERAL_CONSENT, RESEARCHER_CONSENT, RESEARCH_CONSENT } from '../content/consent'
import { T, useI18n } from '../i18n'
import { updateProfile } from '../lib/db'

export function ConsentBody() {
  const { tl } = useI18n()
  const researcher = useProfile().mode === 'researcher'
  const main = researcher ? RESEARCHER_CONSENT : GENERAL_CONSENT
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 font-bold text-slate-800">{tl(main.title)}</h3>
        <ul className="space-y-2">
          {main.points.map((p, i) => (
            <li key={i} className="flex gap-2 text-slate-600">
              <span className="mt-0.5 text-brand-500">•</span>
              {tl(p)}
            </li>
          ))}
        </ul>
      </div>
      {!researcher && (
        <div>
          <h3 className="mb-2 font-bold text-slate-800">{tl(RESEARCH_CONSENT.title)}</h3>
          <p className="text-slate-600">{tl(RESEARCH_CONSENT.body)}</p>
        </div>
      )}
    </div>
  )
}

export function ConsentPage() {
  const profile = useProfile()
  const { setProfile, signOut } = useAuth()
  const { t, tl, lang, setLang } = useI18n()
  const [general, setGeneral] = useState(false)
  const [research, setResearch] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    const now = Date.now()
    const consent = {
      general: { accepted: true, at: now, version: CONSENT_VERSION },
      research: { accepted: research, at: now, version: CONSENT_VERSION },
    }
    await updateProfile(profile.uid, { consent })
    setProfile({ ...profile, consent })
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-sand-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-4xl">🌱</span>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">{t('consentTitle')}</h1>
        <p className="mt-2 text-slate-500">{t('consentIntro')}</p>
        <Card className="mt-6">
          <ConsentBody />
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-600" checked={general} onChange={(e) => setGeneral(e.target.checked)} />
              <span className="font-semibold text-slate-700">
                {profile.mode === 'researcher' ? tl(T('I have read and accept the researcher agreement', 'मैंने शोधकर्ता सहमति पढ़ ली है और स्वीकार करता/करती हूँ')) : t('consentAgree')}
              </span>
            </label>
            {profile.mode !== 'researcher' && (
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-1 h-5 w-5 accent-brand-600" checked={research} onChange={(e) => setResearch(e.target.checked)} />
                <span className="text-slate-700">
                  {t('consentResearchAgree')} <span className="text-slate-400">({t('optional')})</span>
                </span>
              </label>
            )}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={signOut}>
              {t('signOut')}
            </Button>
            <Button disabled={!general} loading={busy} onClick={submit}>
              {t('consentContinue')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
