import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, PageHeader, Pills, cx } from '../components/ui'
import { useChild } from '../context/ChildContext'
import { DOMAINS } from '../content/domains'
import { ATEC_INFO, CHECKLIST_NAME, MCHAT, MCHAT_ITEMS } from '../content/instruments'
import { T, useI18n } from '../i18n'
import { parseISODate } from '../lib/dates'
import type { InstrumentId, L, Phase } from '../lib/types'

function ageMonths(dob: string) {
  const b = parseISODate(dob)
  const n = new Date()
  return (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth()
}

export function NewAssessmentPage() {
  const child = useChild()
  const { t, tl } = useI18n()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('pre')
  const itemCount = DOMAINS.reduce((n, d) => n + d.indicators.length, 0)
  const toddler = ageMonths(child.dob) <= 30

  const cards: { id: InstrumentId; title: string; subtitle: string; desc: L; meta: string; emojis?: string[] }[] = [
    {
      id: 'checklist',
      title: tl(CHECKLIST_NAME),
      subtitle: tl(T('Main questionnaire · domain scores + intervention recommendations', 'मुख्य प्रश्नावली · क्षेत्रवार अंक + हस्तक्षेप सुझाव')),
      desc: T(
        'Rate everyday behaviour in each domain. Domains scored Low / Medium / High get recommended interventions.',
        'हर क्षेत्र में रोज़ के व्यवहार का मूल्यांकन करें। मध्यम / अधिक अंक वाले क्षेत्रों के लिए हस्तक्षेप सुझाए जाते हैं।',
      ),
      meta: `${t('questions', { n: itemCount })} · ~8 min`,
      emojis: DOMAINS.map((d) => d.emoji),
    },
    {
      id: 'atec',
      title: ATEC_INFO.name,
      subtitle: tl(ATEC_INFO.full),
      desc: T(
        'Tracks change over time in speech, sociability, sensory/cognitive awareness and health/behaviour. Lower scores are better.',
        'बोली, सामाजिकता, संवेदी/संज्ञानात्मक जागरूकता और स्वास्थ्य/व्यवहार में बदलाव मापता है। कम अंक बेहतर है।',
      ),
      meta: `${t('questions', { n: ATEC_INFO.itemCount })} · ~15 min`,
    },
    {
      id: 'mchat',
      title: MCHAT.name,
      subtitle: tl(MCHAT.full),
      desc: T('Autism screening for children up to 2.5 years, answered by the parent.', '2.5 वर्ष तक के बच्चों के लिए ऑटिज़्म जाँच, माता-पिता द्वारा।'),
      meta: `${t('questions', { n: MCHAT_ITEMS.length })} · ~5 min · ${tl(MCHAT.ages)}`,
    },
  ]
  // Show M-CHAT first for toddlers, last (and dimmed) for older children.
  const ordered = toddler ? [cards[2], cards[0], cards[1]] : cards

  return (
    <>
      <PageHeader emoji="📝" title={t('newAssessment')} subtitle={child.name} />
      <Card>
        <h2 className="mb-3 font-bold text-slate-800">{t('choosePhase')}</h2>
        <Pills value={phase} onChange={setPhase} options={[{ value: 'pre' as Phase, label: t('phase_pre') }, { value: 'post' as Phase, label: t('phase_post') }]} />
      </Card>

      <h2 className="mb-3 mt-8 font-bold text-slate-800">{t('chooseInstrument')}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {ordered.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => navigate(`/assess/${c.id}?phase=${phase}`)}
            className={cx(
              'group flex flex-col rounded-3xl p-6 text-left transition',
              idx === 0 ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg hover:shadow-xl' : 'bg-white shadow-soft ring-1 ring-slate-100 hover:ring-brand-300',
              c.id === 'mchat' && !toddler && 'opacity-60',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={cx('text-xl font-extrabold', idx === 0 ? '' : 'text-slate-800')}>{c.title}</div>
              <ArrowRight className={cx('h-5 w-5 shrink-0 transition group-hover:translate-x-1', idx === 0 ? '' : 'text-brand-600')} />
            </div>
            <div className={cx('text-sm font-semibold', idx === 0 ? 'text-brand-200' : 'text-slate-400')}>{c.subtitle}</div>
            <p className={cx('mt-3 flex-1 text-sm', idx === 0 ? 'text-brand-50' : 'text-slate-500')}>{tl(c.desc)}</p>
            {c.emojis && <div className="mt-3 flex flex-wrap gap-1 text-lg">{c.emojis.join(' ')}</div>}
            <p className={cx('mt-3 text-xs font-bold', idx === 0 ? 'text-brand-200' : 'text-slate-400')}>{c.meta}</p>
          </button>
        ))}
      </div>
    </>
  )
}
