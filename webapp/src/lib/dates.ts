const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function today(): string {
  return toISODate(new Date())
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(s: string, days: number): string {
  const d = parseISODate(s)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86400000)
}

export function ageYears(dob: string, at = today()): number {
  const b = parseISODate(dob)
  const n = parseISODate(at)
  let age = n.getFullYear() - b.getFullYear()
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--
  return age
}

export function ageLabel(dob: string, lang: 'en' | 'hi'): string {
  const b = parseISODate(dob)
  const n = new Date()
  let months = (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth()
  if (n.getDate() < b.getDate()) months--
  const y = Math.floor(months / 12)
  const m = months % 12
  if (lang === 'hi') return y > 0 ? `${y} वर्ष ${m} माह` : `${m} माह`
  return y > 0 ? `${y}y ${m}m` : `${m} months`
}

export function formatDate(s: string, lang: 'en' | 'hi', opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  return parseISODate(s).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', opts)
}

/** Minutes slept between a bedtime and a wake time (HH:MM), assuming wake is the next morning when earlier. */
export function sleepMinutes(bed?: string, wake?: string): number | null {
  if (!bed || !wake) return null
  const [bh, bm] = bed.split(':').map(Number)
  const [wh, wm] = wake.split(':').map(Number)
  let mins = wh * 60 + wm - (bh * 60 + bm)
  if (mins <= 0) mins += 24 * 60
  return mins
}
