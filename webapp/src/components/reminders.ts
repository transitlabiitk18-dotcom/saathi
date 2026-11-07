import { useEffect, useState } from 'react'
import { useProfile } from '../context/AuthContext'
import { useChildren } from '../context/ChildContext'
import { useI18n } from '../i18n'
import { today } from '../lib/dates'
import { entryId, getEntry } from '../lib/db'
import { TRACKER_TYPES } from '../content/diaries'

/**
 * Without a backend there are no server push notifications, so reminders are local: while the app is
 * open in a tab, after 6 pm we show one browser notification per day if today's tracking is missing.
 * The dashboard also shows the same pending check-ins in-app.
 */
const REMINDER_HOUR = 18

export function remindersEnabled(): boolean {
  try {
    return localStorage.getItem('reminders') === 'on' && 'Notification' in window && Notification.permission === 'granted'
  } catch {
    return false
  }
}

export async function enableReminders(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return false
  try {
    localStorage.setItem('reminders', 'on')
  } catch {
    /* ignore */
  }
  return true
}

export function disableReminders() {
  try {
    localStorage.removeItem('reminders')
  } catch {
    /* ignore */
  }
}

export function useRemindersEnabled() {
  const [on, setOn] = useState(remindersEnabled)
  return [on, async () => setOn(await enableReminders()), () => (disableReminders(), setOn(false))] as const
}

export function useReminders() {
  const profile = useProfile()
  const { children } = useChildren()
  const { t } = useI18n()

  useEffect(() => {
    const check = async () => {
      if (!remindersEnabled() || new Date().getHours() < REMINDER_HOUR) return
      const day = today()
      try {
        if (localStorage.getItem('lastReminder') === day) return
      } catch {
        return
      }
      const pending: string[] = []
      for (const c of children) {
        for (const type of TRACKER_TYPES) {
          const e = await getEntry(c.id, entryId(type, day, profile.uid)).catch(() => null)
          if (!e) {
            pending.push(c.name)
            break
          }
        }
      }
      if (pending.length === 0) return
      try {
        localStorage.setItem('lastReminder', day)
      } catch {
        /* ignore */
      }
      new Notification(`${t('appName')} — ${t('todaysTasks')}`, { body: `${t('pending')}: ${pending.join(', ')}` })
    }
    check()
    const id = window.setInterval(check, 10 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [children, profile.uid, t])
}
