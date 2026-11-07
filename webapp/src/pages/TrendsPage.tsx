import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { describe } from '../components/interventionUi'
import { Badge, Card, PageHeader, Pills, Spinner } from '../components/ui'
import { useChild } from '../context/ChildContext'
import { APPETITE_SCORE, MOODS, QUALITY_SCORE } from '../content/diaries'
import { DOMAINS, DOMAIN_BY_ID } from '../content/domains'
import { LEVEL_CLS, interpretMchat } from '../content/instruments'
import { T, useI18n } from '../i18n'
import { addDays, formatDate, sleepMinutes, today } from '../lib/dates'
import { getAllLogs } from '../lib/db'
import { useAssessments, useEntries, useIncidents, useInterventions } from '../lib/hooks'
import { RELATION_COLOR, RELATION_LABEL, isHomeRelation } from '../lib/relations'
import type { InterventionLog } from '../lib/types'

const tick = { fontSize: 12, fill: '#64748b' }
const PALETTE = ['#35847b', '#f59e0b', '#6366f1', '#ec4899', '#0ea5e9', '#84cc16']

/** Progress dashboard. `embedded` hides the page header (used inside the researcher's participant view). */
export function TrendsPage({ embedded }: { embedded?: boolean } = {}) {
  const child = useChild()
  const { t, tl, lang } = useI18n()
  const [range, setRange] = useState<30 | 90>(30)
  const [who, setWho] = useState<string>('all')
  const [domain, setDomain] = useState<string>('all')
  const from = addDays(today(), -(range - 1))
  const entriesAll = useEntries(child.id, from)
  const incidentsAll = useIncidents(child.id, from)
  const assessmentsAll = useAssessments(child.id)
  const interventions = useInterventions(child.id)
  const [logsAll, setLogsAll] = useState<(InterventionLog & { interventionId: string })[]>([])
  useEffect(() => {
    if (interventions) getAllLogs(child.id, interventions.filter((i) => i.status !== 'rejected')).then(setLogsAll).catch(() => setLogsAll([]))
  }, [child.id, interventions])

  const short = (d: string) => formatDate(d, lang, { day: 'numeric', month: 'short' })
  const byWho = <X extends { authorUid: string }>(xs: X[] | null) => (xs ?? []).filter((x) => who === 'all' || x.authorUid === who)
  const entries = byWho(entriesAll)
  const incidents = byWho(incidentsAll)
  const assessments = byWho(assessmentsAll)
  const logs = byWho(logsAll).filter((l) => l.date >= from)
  const members = Object.entries(child.members).filter(([uid]) => child.memberUids.includes(uid))
  const days = useMemo(() => Array.from({ length: range }, (_, i) => addDays(from, i)), [from, range])

  const checklists = assessments.filter((a) => a.instrument === 'checklist' && a.domainScores).slice().reverse()
  const domainSeries = checklists.map((a) => ({ label: `${short(a.date)} · ${a.authorName.split(' ')[0]}`, ...a.domainScores }))

  // Latest checklist per contributor, per domain (multi-informant comparison).
  const informant = (() => {
    const latest = new Map<string, (typeof checklists)[number]>()
    for (const a of [...checklists].reverse()) if (!latest.has(a.authorUid)) latest.set(a.authorUid, a)
    const people = [...latest.values()]
    return {
      people,
      data: DOMAINS.map((d) => ({ name: d.emoji, full: tl(d.name), ...Object.fromEntries(people.map((a) => [a.authorUid, a.domainScores![d.id]])) })),
    }
  })()

  const daily = days.map((d) => {
    const es = entries.filter((e) => e.date === d)
    const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null)
    const moodsHome = es.filter((e) => e.type === 'mood' && isHomeRelation(e.authorRelation)).map((e) => e.answers.overallMood as number)
    const moodsCentre = es.filter((e) => e.type === 'mood' && !isHomeRelation(e.authorRelation)).map((e) => e.answers.overallMood as number)
    const sleepE = es.filter((e) => e.type === 'sleep')
    const sleepH = sleepE.map((e) => sleepMinutes(e.answers.sleepTime as string, e.answers.wakeTime as string)).filter((m): m is number => m !== null)
    const appetite = es.filter((e) => e.type === 'appetite').map((e) => APPETITE_SCORE[e.answers.appetite as string]).filter(Boolean)
    const quality = sleepE.map((e) => QUALITY_SCORE[e.answers.quality as string]).filter(Boolean)
    return {
      day: short(d),
      home: avg(moodsHome.filter((v) => typeof v === 'number')),
      centre: avg(moodsCentre.filter((v) => typeof v === 'number')),
      sleep: sleepH.length ? Math.round((sleepH.reduce((a, b) => a + b, 0) / sleepH.length / 60) * 10) / 10 : null,
      quality: avg(quality),
      appetite: avg(appetite),
    }
  })

  const weeks = Array.from({ length: Math.ceil(range / 7) }, (_, w) => {
    const s = addDays(from, w * 7)
    const e = addDays(s, 7)
    const row: Record<string, string | number> = { week: short(s), incidents: incidents.filter((i) => i.date >= s && i.date < e).length }
    for (const iv of interventions ?? []) row[iv.id] = logs.filter((l) => l.interventionId === iv.id && l.date >= s && l.date < e).length
    return row
  })
  const loggedInterventions = (interventions ?? []).filter((iv) => logs.some((l) => l.interventionId === iv.id))

  const atec = assessments.filter((a) => a.instrument === 'atec' && a.totalScore !== undefined).slice().reverse()
  const mchat = assessments.filter((a) => a.instrument === 'mchat' && a.totalScore !== undefined)

  if (entriesAll === null || assessmentsAll === null || incidentsAll === null) return <Spinner />

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <select value={who} onChange={(e) => setWho(e.target.value)} className="rounded-xl border-0 bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200">
        <option value="all">{tl(T('All contributors', 'सभी योगदानकर्ता'))}</option>
        {members.map(([uid, m]) => (
          <option key={uid} value={uid}>
            {m.name} ({tl(RELATION_LABEL[m.relation])})
          </option>
        ))}
      </select>
      <Pills value={range} onChange={setRange} options={[{ value: 30 as const, label: t('days30') }, { value: 90 as const, label: t('days90') }]} />
    </div>
  )

  return (
    <>
      {embedded ? <div className="mb-5">{filters}</div> : <PageHeader emoji="📈" title={tl(T('Progress', 'प्रगति'))} subtitle={child.name} action={filters} />}
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">{t('domainTrend')}</h2>
              <p className="text-sm text-slate-500">{t('scoreHint')}</p>
            </div>
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded-xl border-0 bg-slate-50 px-3 py-2 text-sm font-semibold ring-1 ring-slate-200">
              <option value="all">{t('allDomains')}</option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.emoji} {tl(d.name)}
                </option>
              ))}
            </select>
          </div>
          {domainSeries.length === 0 ? (
            <NoData />
          ) : (
            <Chart h="h-80">
              <LineChart data={domainSeries} margin={{ left: -20, right: 10, top: 5 }}>
                <ReferenceArea y1={60} y2={100} fill="#fda4af" fillOpacity={0.12} />
                <ReferenceArea y1={30} y2={60} fill="#fcd34d" fillOpacity={0.12} />
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={tick} />
                <YAxis domain={[0, 100]} tick={tick} />
                <Tooltip formatter={(v: number, k: string) => [v, tl(DOMAIN_BY_ID[k]?.name ?? { en: k, hi: k })]} />
                {DOMAINS.filter((d) => domain === 'all' || d.id === domain).map((d) => (
                  <Line key={d.id} type="monotone" dataKey={d.id} stroke={d.color} strokeWidth={domain === 'all' ? 2 : 3} dot={{ r: 4 }} connectNulls />
                ))}
              </LineChart>
            </Chart>
          )}
        </Card>

        {who === 'all' && (
          <Card className="xl:col-span-2">
            <h2 className="text-lg font-extrabold text-slate-800">{tl(T('Who sees what? Latest score by contributor', 'कौन क्या देखता है? योगदानकर्ता अनुसार नवीनतम अंक'))}</h2>
            <p className="mb-4 text-sm text-slate-500">{t('informantHint')}</p>
            {informant.people.length === 0 ? (
              <NoData />
            ) : (
              <Chart h="h-72">
                <BarChart data={informant.data} margin={{ left: -20, right: 10, top: 5 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 18 }} />
                  <YAxis domain={[0, 100]} tick={tick} />
                  <Tooltip labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ''} />
                  <Legend />
                  {informant.people.map((a) => (
                    <Bar key={a.authorUid} dataKey={a.authorUid} name={`${a.authorName} (${tl(RELATION_LABEL[a.authorRelation])})`} fill={RELATION_COLOR[a.authorRelation]} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              </Chart>
            )}
          </Card>
        )}

        <Card>
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{tl(T('Mood — home vs centre/school', 'मूड — घर बनाम केंद्र/स्कूल'))}</h2>
          {!daily.some((d) => d.home !== null || d.centre !== null) ? (
            <NoData />
          ) : (
            <Chart>
              <LineChart data={daily} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={tick} interval="preserveStartEnd" minTickGap={20} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 16 }} tickFormatter={(v) => MOODS[v - 1]?.emoji ?? ''} />
                <Tooltip />
                <Legend />
                <Line name={tl(T('Home', 'घर'))} dataKey="home" stroke={RELATION_COLOR.parent} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                <Line name={tl(T('Centre / school', 'केंद्र / स्कूल'))} dataKey="centre" stroke={RELATION_COLOR.caregiver} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </Chart>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{tl(T('Sleep (hours)', 'नींद (घंटे)'))}</h2>
          {!daily.some((d) => d.sleep !== null) ? (
            <NoData />
          ) : (
            <Chart>
              <BarChart data={daily} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={tick} interval="preserveStartEnd" minTickGap={20} />
                <YAxis tick={tick} />
                <Tooltip />
                <Bar dataKey="sleep" name={tl(T('Hours', 'घंटे'))} fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </Chart>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-extrabold text-slate-800">{tl(T('Appetite & sleep quality', 'भूख और नींद की गुणवत्ता'))}</h2>
          <p className="mb-4 text-xs text-slate-500">{tl(T('Appetite: 1 poor → 4 more than usual · Sleep quality: 1 poor → 3 good', 'भूख: 1 बहुत कम → 4 सामान्य से अधिक · नींद: 1 खराब → 3 अच्छी'))}</p>
          {!daily.some((d) => d.appetite !== null || d.quality !== null) ? (
            <NoData />
          ) : (
            <Chart>
              <LineChart data={daily} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={tick} interval="preserveStartEnd" minTickGap={20} />
                <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]} tick={tick} />
                <Tooltip />
                <Legend />
                <Line name={tl(T('Appetite', 'भूख'))} dataKey="appetite" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                <Line name={tl(T('Sleep quality', 'नींद की गुणवत्ता'))} dataKey="quality" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </Chart>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{tl(T('Incidents per week', 'प्रति सप्ताह घटनाएँ'))}</h2>
          {incidents.length === 0 ? (
            <NoData />
          ) : (
            <Chart>
              <BarChart data={weeks} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" tick={tick} />
                <YAxis allowDecimals={false} tick={tick} />
                <Tooltip />
                <Bar dataKey="incidents" name={tl(T('Incidents', 'घटनाएँ'))} fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </Chart>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{tl(T('Intervention progress — sessions recorded per week', 'हस्तक्षेप प्रगति — प्रति सप्ताह दर्ज सत्र'))}</h2>
          {loggedInterventions.length === 0 ? (
            <NoData />
          ) : (
            <Chart h="h-72">
              <BarChart data={weeks} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="week" tick={tick} />
                <YAxis allowDecimals={false} tick={tick} />
                <Tooltip />
                <Legend />
                {loggedInterventions.map((iv, k) => (
                  <Bar key={iv.id} dataKey={iv.id} name={describe(iv, tl).title} stackId="iv" fill={PALETTE[k % PALETTE.length]} />
                ))}
              </BarChart>
            </Chart>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-extrabold text-slate-800">ATEC</h2>
          <p className="mb-4 text-xs text-slate-500">{tl(T('Total score over time — lower is better', 'समय के साथ कुल अंक — कम बेहतर'))}</p>
          {atec.length === 0 ? (
            <NoData />
          ) : (
            <Chart>
              <LineChart data={atec.map((a) => ({ label: `${short(a.date)} · ${a.authorName.split(' ')[0]}`, total: a.totalScore, ...a.subscales }))} margin={{ left: -20, right: 10, top: 5 }}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={tick} />
                <YAxis tick={tick} />
                <Tooltip />
                <Line name={tl(T('Total', 'कुल'))} dataKey="total" stroke="#35847b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </Chart>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-extrabold text-slate-800">{t('externalScores')}</h2>
          {mchat.length === 0 ? (
            <NoData />
          ) : (
            <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {mchat.map((a) => {
                  const r = interpretMchat(a.totalScore!)
                  return (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-4 font-semibold text-slate-600">{formatDate(a.date, lang)}</td>
                      <td className="py-2.5 pr-4">{t(`phase_${a.phase}`)}</td>
                      <td className="py-2.5 pr-4 text-lg font-extrabold">{a.totalScore}</td>
                      <td className="py-2.5">
                        <Badge className={LEVEL_CLS[r.level]}>{tl(r.label)}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function Chart({ children, h = 'h-64' }: { children: React.ReactElement; h?: string }) {
  return (
    <div className={h}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  )
}

function NoData() {
  const { t } = useI18n()
  return <div className="grid h-40 place-items-center rounded-2xl bg-sand-50 text-slate-400">{t('notEnoughData')}</div>
}
