import { useSyncExternalStore } from 'react'
import type { VehicleRecord } from './db'

/* ---------- Erinnerung an die Datensicherung ---------- */

const LAST_BACKUP_KEY = 'meine-garage:letzte-sicherung'
const BACKUP_EVENT = 'meine-garage:sicherung'

/** Ab so vielen Tagen ohne Sicherung erscheint der Hinweis auf der Startseite. */
export const BACKUP_REMINDER_DAYS = 30

export function markBackupDone(): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
  } catch {
    // Speicher nicht verfügbar – dann eben ohne Erinnerung
  }
  window.dispatchEvent(new Event(BACKUP_EVENT))
}

function readLastBackup(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY)
  } catch {
    return null
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(BACKUP_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(BACKUP_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** Zeitpunkt der letzten erfolgreichen Sicherung (ISO) oder null. */
export function useLastBackup(): string | null {
  return useSyncExternalStore(subscribe, readLastBackup)
}

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

/* ---------- HU / Gasprüfung ---------- */

export type DueLevel = 'overdue' | 'soon' | 'ok'

/** Ab so vielen Monaten vorher gilt ein Termin als „bald fällig“. */
const SOON_MONTHS = 2

/**
 * Wertet einen Termin im Format „MM/JJJJ“ aus. Die Plakette gilt bis zum
 * Monatsende, überfällig ist der Termin also erst ab dem Folgemonat.
 */
export function dueStatus(
  value: string | null | undefined,
  today = new Date(),
): { level: DueLevel; monthsLeft: number; label: string } | null {
  const match = value?.trim().match(/^(\d{1,2})\s*[/.-]\s*(\d{4})$/)
  if (!match) return null
  const month = Number(match[1])
  const year = Number(match[2])
  if (month < 1 || month > 12) return null

  const monthsLeft =
    year * 12 + month - (today.getFullYear() * 12 + today.getMonth() + 1)

  if (monthsLeft < 0) return { level: 'overdue', monthsLeft, label: 'überfällig' }
  if (monthsLeft === 0) return { level: 'soon', monthsLeft, label: 'diesen Monat fällig' }
  if (monthsLeft <= SOON_MONTHS)
    return {
      level: 'soon',
      monthsLeft,
      label: monthsLeft === 1 ? 'nächsten Monat fällig' : `in ${monthsLeft} Monaten fällig`,
    }
  return { level: 'ok', monthsLeft, label: '' }
}

export type DueItem = {
  vehicle: VehicleRecord
  kind: 'HU' | 'Gasprüfung'
  date: string
  level: Exclude<DueLevel, 'ok'>
  label: string
  monthsLeft: number
}

/** Alle überfälligen oder bald fälligen Termine aller Fahrzeuge, dringendste zuerst. */
export function collectDueItems(vehicles: VehicleRecord[]): DueItem[] {
  const items: DueItem[] = []
  for (const vehicle of vehicles) {
    const checks: [DueItem['kind'], string | null][] = [
      ['HU', vehicle.nextHu],
      ['Gasprüfung', vehicle.nextGasInspection],
    ]
    for (const [kind, date] of checks) {
      const status = dueStatus(date)
      if (date && status && status.level !== 'ok') {
        items.push({ vehicle, kind, date, ...status, level: status.level })
      }
    }
  }
  return items.sort((a, b) => a.monthsLeft - b.monthsLeft)
}
