import { ArrowDownRight, ArrowLeft, ArrowUpRight, CalendarClock, Printer, Puzzle, Stethoscope, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, PageHeader, Spinner } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { BAND_STYLE, DOMAINS, DOMAIN_BY_ID, bandFor, type Domain } from '../content/domains'
import { ATEC, ATEC_DOMAIN_MAP, ATEC_INFO, ATEC_LOOK_FOR, ATEC_MAX, ATEC_TOTAL_MAX, LEVEL_CLS, MCHAT, MCHAT_ITEMS, atecDomainScores, instrumentName, interpretMchat } from '../content/instruments'
import { Recommendations } from '../components/interventionUi'
import { T, useI18n } from '../i18n'
import { formatDate } from '../lib/dates'
import { deleteAssessment } from '../lib/db'
import { useAssessments, useInterventions } from '../lib/hooks'
import { RELATION_LABEL } from '../lib/relations'
import type { Assessment } from '../lib/types'

export function AssessmentResultPage({ readOnly, backTo = '/assess' }: { readOnly?: boolean; backTo?: string } = {}) {
  const { id } = useParams()
  const profile = useProfile()
  const child = useChild()
  const { t, tl, lang } = useI18n()
  const navigate = useNavigate()
  const items = useAssessments(child.id)
  if (items === null) return <Spinner />
  const a = items.find((x) => x.id === id)
  if (!a) return <p className="text-slate-500">{t('notEnoughData')}</p>

  // Compare a post-test with the most recent earlier pre-test of the same instrument by the same reporter.
  const baseline =
    a.phase === 'post'
      ? items.find((x) => x.id !== a.id && x.instrument === a.instrument && x.authorUid === a.authorUid && x.phase === 'pre' && x.date <= a.date)
      : undefined
  const name = instrumentName(a.instrument, tl)

  const remove = async () => {
    if (!window.confirm(t('deleteAssessmentConfirm'))) return
    await deleteAssessment(child.id, a.id)
    navigate(backTo, { replace: true })
  }

  return (
    <>
      <button onClick={() => navigate(backTo)} className="mb-5 flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700 print:hidden">
        <ArrowLeft className="h-4 w-4" /> {t('nav_assess')}
      </button>
      <PageHeader
        title={`${t('results')} — ${child.name}`}
        subtitle={`${name} · ${t(`phase_${a.phase}`)} · ${formatDate(a.date, lang)} · ${a.authorName} (${tl(RELATION_LABEL[a.authorRelation])})`}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> {t('printResults')}
            </Button>
            {!readOnly && a.authorUid === profile.uid && (
              <Button variant="danger" onClick={remove} title={t('delete')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sky-900 ring-1 ring-sky-100">
        <CalendarClock className="h-5 w-5 text-sky-600" />
        <span className="font-semibold">{t('retestOn', { date: formatDate(a.retestDue, lang) })}</span>
      </div>

      {a.instrument === 'checklist' ? (
        <ChecklistResult a={a} baseline={baseline} readOnly={readOnly} />
      ) : a.instrument === 'atec' ? (
        <AtecResult a={a} baseline={baseline} readOnly={readOnly} />
      ) : (
        <McHatResult a={a} baseline={baseline} />
      )}
      {!readOnly && a.instrument === 'mchat' && <ScreeningNextStep />}
    </>
  )
}

/** Recommendations come from the domain screening questionnaire, so point M-CHAT / ATEC users to it. */
function ScreeningNextStep() {
  const { tl } = useI18n()
  const navigate = useNavigate()
  return (
    <Card className="mt-5 flex flex-wrap items-center gap-4 bg-brand-50/60 ring-1 ring-brand-100">
      <Puzzle className="h-8 w-8 shrink-0 text-brand-600" />
      <div className="min-w-0 flex-1">
        <div className="font-extrabold text-slate-800">{tl(T('Get intervention recommendations', 'हस्तक्षेप सुझाव पाएँ'))}</div>
        <p className="text-sm text-slate-600">
          {tl(
            T(
              'Recommendations are based on the Domain screening questionnaire, which scores each area of development. Fill it to see which interventions to start.',
              'सुझाव डोमेन स्क्रीनिंग प्रश्नावली पर आधारित हैं, जो विकास के हर क्षेत्र का अंक देती है। कौन से हस्तक्षेप शुरू करें, यह जानने के लिए इसे भरें।',
            ),
          )}
        </p>
      </div>
      <Button onClick={() => navigate('/assess/checklist')}>{tl(T('Take domain screening', 'डोमेन स्क्रीनिंग भरें'))}</Button>
    </Card>
  )
}

function McHatResult({ a, baseline }: { a: Assessment; baseline?: Assessment }) {
  const { t, tl, lang } = useI18n()
  if (a.totalScore === undefined) return null
  const r = interpretMchat(a.totalScore)
  const atRisk = MCHAT_ITEMS.map((item, i) => ({ item, i, ans: a.answers?.[i] })).filter(
    ({ item, ans }) => ans !== undefined && (ans === 1 ? 'yes' : 'no') === item.riskIf,
  )
  return (
    <div className="space-y-5">
      <Card className="p-8 text-center">
        <div className="text-sm font-bold uppercase tracking-wide text-slate-400">{tl(MCHAT.scoreLabel)}</div>
        <div className="mt-2 text-6xl font-extrabold text-slate-800">{a.totalScore}</div>
        <Badge className={`mt-4 text-base ${LEVEL_CLS[r.level]}`}>{tl(r.label)}</Badge>
        {baseline?.totalScore !== undefined && (
          <p className="mt-4 text-slate-500">
            {t('comparedToPre', { date: formatDate(baseline.date, lang) })}: <b>{baseline.totalScore}</b> → <b>{a.totalScore}</b>
          </p>
        )}
      </Card>
      <Card className={r.level === 0 ? 'bg-emerald-50/50' : r.level === 1 ? 'bg-amber-50/60' : 'bg-rose-50/60'}>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
          <Stethoscope className="h-5 w-5" /> {t('recommendation')}
        </h2>
        <p className="mt-2 text-slate-700">{tl(r.advice)}</p>
      </Card>
      {atRisk.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-slate-800">
            {t('atRiskItems')} ({atRisk.length})
          </h2>
          <ul className="space-y-2">
            {atRisk.map(({ item, i, ans }) => (
              <li key={i} className="flex gap-3 rounded-xl bg-sand-50 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-100 text-xs font-extrabold text-rose-700">{i + 1}</span>
                <span className="flex-1 text-slate-700">{tl(item.q)}</span>
                <Badge className="h-fit bg-white text-slate-600 ring-slate-200">{ans === 1 ? t('yes') : t('no')}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p className="text-xs text-slate-400">{tl(MCHAT.licence)}</p>
    </div>
  )
}

function ChecklistResult({ a, baseline, readOnly }: { a: Assessment; baseline?: Assessment; readOnly?: boolean }) {
  const { t, tl, lang } = useI18n()
  const child = useChild()
  const interventions = useInterventions(child.id)
  const scores = a.domainScores!
  const sorted = DOMAINS.filter((d) => scores[d.id] !== undefined).sort((x, y) => scores[y.id] - scores[x.id])
  const flagged = sorted.filter((d) => bandFor(scores[d.id]) !== 'typical')

  return (
    <div className="space-y-8">
      <Card>
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-extrabold text-slate-800">{t('domainScores')}</h2>
          <span className="text-sm text-slate-500">{t('scoreHint')}</span>
        </div>
        {baseline && <p className="mb-2 text-sm font-semibold text-brand-700">{t('comparedToPre', { date: formatDate(baseline.date, lang) })}</p>}
        <div className="mt-4 space-y-3">
          {sorted.map((d) => {
            const s = scores[d.id]
            const band = bandFor(s)
            const prev = baseline?.domainScores?.[d.id]
            const delta = prev !== undefined ? s - prev : null
            return (
              <div key={d.id} className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 sm:grid-cols-[220px_1fr_auto]">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className="text-lg">{d.emoji}</span>
                  <span className="truncate">{tl(d.name)}</span>
                </div>
                <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                  <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    {prev !== undefined && <div className="absolute inset-y-0 left-0 rounded-full bg-slate-300" style={{ width: `${prev}%` }} />}
                    <div className={`absolute inset-y-0 left-0 rounded-full ${BAND_STYLE[band].dot} opacity-90`} style={{ width: `${Math.max(s, 2)}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-slate-700">{s}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                  <Badge className={BAND_STYLE[band].cls}>{tl(BAND_STYLE[band].label)}</Badge>
                  {delta !== null && delta !== 0 && (
                    <span className={`inline-flex items-center text-xs font-bold ${delta < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {delta < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                      {Math.abs(delta)} {delta < 0 ? t('improved') : t('worsened')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {!readOnly && (
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">🧩 {tl(T('Recommended interventions', 'सुझाए गए हस्तक्षेप'))}</h2>
          <p className="mb-4 text-slate-500">{tl(T('Accept to add it to your active interventions, or reject it.', 'सक्रिय हस्तक्षेपों में जोड़ने के लिए स्वीकार करें, या अस्वीकार करें।'))}</p>
          {interventions === null ? <Spinner /> : <Recommendations scores={scores} interventions={interventions} />}
        </div>
      )}

      <div>
        <h2 className="text-xl font-extrabold text-slate-800">💡 {t('suggestions')}</h2>
        <p className="mb-4 text-slate-500">{t('suggestionsHint')}</p>
        {flagged.length === 0 ? (
          <Card className="text-center text-slate-600">🎉 {t('noFlags')}</Card>
        ) : (
          <div className="space-y-5">
            {flagged.map((d) => (
              <SuggestionCard key={d.id} domain={d} score={scores[d.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AtecResult({ a, baseline, readOnly }: { a: Assessment; baseline?: Assessment; readOnly?: boolean }) {
  const { t, tl, lang } = useI18n()
  const child = useChild()
  const navigate = useNavigate()
  const interventions = useInterventions(child.id)
  if (a.totalScore === undefined || !a.subscales) return null
  return (
    <div className="space-y-5">
      <Card className="p-8 text-center">
        <div className="text-sm font-bold uppercase tracking-wide text-slate-400">{tl(T('ATEC total (0–179, lower is better)', 'ATEC कुल (0–179, कम बेहतर)'))}</div>
        <div className="mt-2 text-6xl font-extrabold text-slate-800">{a.totalScore}</div>
        {baseline?.totalScore !== undefined && (
          <p className="mt-4 text-slate-500">
            {t('comparedToPre', { date: formatDate(baseline.date, lang) })}: <b>{baseline.totalScore}</b> → <b>{a.totalScore}</b>{' '}
            <span className={a.totalScore <= baseline.totalScore ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>
              ({a.totalScore <= baseline.totalScore ? '−' : '+'}
              {Math.abs(a.totalScore - baseline.totalScore)})
            </span>
          </p>
        )}
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-extrabold text-slate-800">{tl(T('Subscales', 'उप-पैमाने'))}</h2>
        <div className="space-y-4">
          {ATEC.map((s) => {
            const v = a.subscales![s.id] ?? 0
            const prev = baseline?.subscales?.[s.id]
            return (
              <div key={s.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{tl(s.title)}</span>
                  <span className="font-bold text-slate-800">
                    {prev !== undefined && <span className="mr-2 font-semibold text-slate-400">{prev} →</span>}
                    {v} / {ATEC_MAX[s.id]}
                  </span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                  {prev !== undefined && <div className="absolute inset-y-0 left-0 rounded-full bg-slate-300" style={{ width: `${(prev / ATEC_MAX[s.id]) * 100}%` }} />}
                  <div className="absolute inset-y-0 left-0 rounded-full bg-brand-500" style={{ width: `${Math.max(2, (v / ATEC_MAX[s.id]) * 100)}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {tl(T('Looks at', 'क्या देखता है'))}: {tl(ATEC_LOOK_FOR[s.id])}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {tl(T('Linked areas', 'जुड़े क्षेत्र'))}: {ATEC_DOMAIN_MAP[s.id].map((id) => `${DOMAIN_BY_ID[id].emoji} ${tl(DOMAIN_BY_ID[id].name)}`).join(' · ')}
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          {tl(T(`Max total ${ATEC_TOTAL_MAX}. ATEC has no diagnostic cut-off; it is used to track change.`, `अधिकतम ${ATEC_TOTAL_MAX}। ATEC का कोई नैदानिक कट-ऑफ़ नहीं; इसका उपयोग बदलाव देखने के लिए होता है।`))} {ATEC_INFO.copyright}
        </p>
      </Card>
      {!readOnly && (
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">🧩 {tl(T('Recommended interventions', 'सुझाए गए हस्तक्षेप'))}</h2>
          <p className="mb-4 text-slate-500">
            {tl(
              T(
                'Based on the ATEC areas with higher scores (using the team’s link between ATEC and the AEPS-3 development areas). Accept to add it to your active interventions, or reject it.',
                'ATEC के ज़्यादा अंक वाले क्षेत्रों के आधार पर (ATEC और AEPS-3 विकास क्षेत्रों के बीच टीम द्वारा तय संबंध)। सक्रिय हस्तक्षेपों में जोड़ने के लिए स्वीकार करें, या अस्वीकार करें।',
              ),
            )}
          </p>
          {interventions === null ? <Spinner /> : <Recommendations scores={atecDomainScores(a.subscales)} interventions={interventions} />}
          <p className="mt-3 text-sm text-slate-500">
            {tl(T('For a closer look at each area, also fill the', 'हर क्षेत्र को और ध्यान से देखने के लिए'))}{' '}
            <button onClick={() => navigate('/assess/checklist')} className="font-bold text-brand-700 hover:underline">
              {tl(T('Domain screening questionnaire', 'डोमेन स्क्रीनिंग प्रश्नावली भरें'))}
            </button>
            .
          </p>
        </div>
      )}
    </div>
  )
}

export function SuggestionCard({ domain: d, score }: { domain: Domain; score: number }) {
  const { t, tl } = useI18n()
  const band = bandFor(score)
  return (
    <Card className="overflow-hidden p-0 print:break-inside-avoid">
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: `${d.color}12` }}>
        <span className="text-3xl">{d.emoji}</span>
        <div className="flex-1">
          <h3 className="text-lg font-extrabold" style={{ color: d.color }}>
            {tl(d.name)}
          </h3>
          <p className="text-sm text-slate-600">{tl(d.definition)}</p>
        </div>
        <Badge className={BAND_STYLE[band].cls}>{tl(BAND_STYLE[band].label)}</Badge>
      </div>
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {d.strategies.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl bg-sand-50 p-3 ring-1 ring-sand-200">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white" style={{ background: d.color }}>
                {i + 1}
              </span>
              <span className="pt-1 font-semibold text-slate-700">{tl(s)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-sky-900">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="font-semibold">{t('reviewAfter')}</span>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-rose-900">
            <Stethoscope className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <b>{t('referIf')}:</b> {tl(d.refer)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
