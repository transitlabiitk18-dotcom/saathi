import { AlarmClock, ChevronRight, ClipboardList, FileBarChart, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Empty, PageHeader, Spinner, cx } from '../components/ui'
import { useProfile } from '../context/AuthContext'
import { useChild } from '../context/ChildContext'
import { bandFor } from '../content/domains'
import { instrumentName, interpretMchat } from '../content/instruments'
import { RELATION_LABEL } from '../lib/relations'
import { useI18n } from '../i18n'
import { daysBetween, formatDate, today } from '../lib/dates'
import { pendingRetest, useAssessments } from '../lib/hooks'
import type { Assessment } from '../lib/types'

export function AssessmentsPage() {
  const profile = useProfile()
  const child = useChild()
  const { t } = useI18n()
  const navigate = useNavigate()
  const items = useAssessments(child.id)

  return (
    <>
      <PageHeader
        emoji="📋"
        title={t('nav_assess')}
        action={
          <Button onClick={() => navigate('/assess/new')}>
            <Plus className="h-4 w-4" /> {t('newAssessment')}
          </Button>
        }
      />
      <RetestBanner items={items} uid={profile.uid} />
      {items === null ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty emoji="📋" title={t('noHistory')} hint={t('noAssessmentYet')} action={<Button onClick={() => navigate('/assess/new')}>{t('startAssessment')}</Button>} />
      ) : (
        <>
          <h2 className="mb-3 mt-2 text-sm font-bold uppercase tracking-wide text-slate-400">{t('history')}</h2>
          <div className="space-y-3">
            {items.map((a) => (
              <AssessmentRow key={a.id} a={a} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

export function RetestBanner({ items, uid }: { items: Assessment[] | null; uid: string }) {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const p = pendingRetest(items, uid)
  if (!p) return null
  const due = p.retestDue <= today()
  return (
    <div
      className={cx(
        'mb-6 flex flex-wrap items-center gap-4 rounded-2xl p-4 ring-1',
        due ? 'bg-amber-50 ring-amber-200' : 'bg-sky-50 ring-sky-100',
      )}
    >
      <AlarmClock className={cx('h-8 w-8 shrink-0', due ? 'text-amber-600' : 'text-sky-600')} />
      <div className="min-w-0 flex-1">
        {due ? (
          <>
            <div className="font-extrabold text-amber-900">{t('retestDue')}</div>
            <div className="text-sm text-amber-800">
              {t('retestDueBody', { days: daysBetween(p.date, today()), phase: t(`phase_${p.phase}`).toLowerCase(), date: formatDate(p.date, lang) })}
            </div>
          </>
        ) : (
          <div className="font-semibold text-sky-900">{t('retestSoon', { date: formatDate(p.retestDue, lang) })}</div>
        )}
      </div>
      {due && (
        <Button
          onClick={() => navigate(`/assess/${p.instrument}?phase=post`)}
        >
          {t('takeNow')}
        </Button>
      )}
    </div>
  )
}

function AssessmentRow({ a }: { a: Assessment }) {
  const { t, tl, lang } = useI18n()
  const name = instrumentName(a.instrument, tl)
  let summary = ''
  if (a.domainScores) {
    const flagged = Object.values(a.domainScores).filter((s) => bandFor(s) === 'support').length
    const monitor = Object.values(a.domainScores).filter((s) => bandFor(s) === 'monitor').length
    summary = `${flagged} ${lang === 'hi' ? 'अधिक' : 'high'} · ${monitor} ${lang === 'hi' ? 'मध्यम' : 'medium'}`
  } else if (a.totalScore !== undefined) {
    summary = a.instrument === 'mchat' ? `${t('score')}: ${a.totalScore} — ${tl(interpretMchat(a.totalScore).label)}` : `${t('score')}: ${a.totalScore} / 179`
  }
  return (
    <Link to={`/assess/${a.id}`}>
      <Card className="flex items-center gap-4 p-4 transition hover:ring-brand-200">
        <div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-2xl', a.instrument === 'checklist' ? 'bg-brand-50 text-brand-600' : 'bg-violet-50 text-violet-600')}>
          {a.instrument === 'checklist' ? <ClipboardList className="h-6 w-6" /> : <FileBarChart className="h-6 w-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">{name}</span>
            <Badge className={a.phase === 'pre' ? 'bg-slate-50 text-slate-600 ring-slate-200' : 'bg-brand-50 text-brand-700 ring-brand-200'}>{t(`phase_${a.phase}`)}</Badge>
          </div>
          <div className="mt-0.5 text-sm text-slate-500">
            {formatDate(a.date, lang)} · {a.authorName} ({tl(RELATION_LABEL[a.authorRelation])})
          </div>
          {summary && <div className="mt-1 text-sm font-semibold text-slate-600">{summary}</div>}
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300" />
      </Card>
    </Link>
  )
}
