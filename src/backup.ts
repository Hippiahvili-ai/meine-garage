import Dexie, { type Table } from 'dexie'
import { db } from './db'

/**
 * Datensicherung: alle Tabellen der lokalen Datenbank als eine JSON-Datei
 * exportieren bzw. aus einer solchen Datei wiederherstellen.
 */

const BACKUP_FORMAT = 'meine-garage-backup'
const BACKUP_VERSION = 1

const TABLE_NAMES = [
  'vehicles',
  'mileageEntries',
  'workEntries',
  'tripEntries',
  'fuelEntries',
  'purchaseEntries',
] as const

type TableName = (typeof TABLE_NAMES)[number]

export const TABLE_LABELS: Record<TableName, string> = {
  vehicles: 'Fahrzeuge',
  mileageEntries: 'Kilometerstände',
  workEntries: 'Werkstatt & Eigenarbeit',
  tripEntries: 'Fahrten',
  fuelEntries: 'Tankvorgänge',
  purchaseEntries: 'Einkäufe',
}

export type BackupFile = {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  dbVersion: number
  tables: Record<TableName, Record<string, unknown>[]>
}

export type BackupCounts = Record<TableName, number>

export async function createBackup(): Promise<BackupFile> {
  const tables = {} as BackupFile['tables']

  await db.transaction('r', TABLE_NAMES.map((name) => db.table(name)), async () => {
    for (const name of TABLE_NAMES) {
      tables[name] = await db.table(name).toArray()
    }
  })

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    dbVersion: db.verno,
    tables,
  }
}

/** Zeitstempel für Dateinamen in Ortszeit: 2026-11-19_13-30 */
const fileStamp = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`
}

export type PreparedBackup = {
  file: File
  counts: BackupCounts
}

/** Liest alle Daten und packt sie in eine .json-Datei (noch nicht gespeichert). */
export async function prepareBackupFile(): Promise<PreparedBackup> {
  const backup = await createBackup()
  const json = JSON.stringify(backup, null, 2)
  const file = new File([json], `meine-garage-backup_${fileStamp(new Date())}.json`, {
    type: 'application/json',
  })
  return { file, counts: countTables(backup) }
}

/**
 * iPhone/iPad: Das Teilen-Menü („In Dateien sichern“, iCloud, Mail …) ist der
 * richtige Weg. iOS öffnet es nur direkt nach einem Fingertipp – deshalb wird die
 * Datei vorher mit prepareBackupFile() erzeugt und hier ohne Wartezeit geteilt.
 */
export function canUseShareSheet(file?: File): boolean {
  if (!window.matchMedia('(pointer: coarse)').matches) return false
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
    return false
  }
  const probe = file ?? new File(['{}'], 'test.json', { type: 'application/json' })
  return navigator.canShare({ files: [probe] })
}

/**
 * Gibt die Datei aus. MUSS direkt im Klick-Handler aufgerufen werden (kein await davor).
 * Ergebnis: true = gespeichert/weitergegeben, false = vom Nutzer abgebrochen.
 */
export async function saveBackupFile(file: File): Promise<boolean> {
  if (canUseShareSheet(file)) {
    try {
      await navigator.share({ files: [file], title: 'Meine Garage – Sicherung' })
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return false
      }
      console.warn('Teilen nicht möglich, nutze Download', error)
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

export function countTables(backup: BackupFile): BackupCounts {
  const counts = {} as BackupCounts
  for (const name of TABLE_NAMES) {
    counts[name] = backup.tables[name].length
  }
  return counts
}

/** Liest und prüft eine Sicherungsdatei. Wirft einen Error mit deutscher Meldung. */
export async function readBackupFile(file: File): Promise<BackupFile> {
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('Die Datei ist keine gültige JSON-Datei.')
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    (data as BackupFile).format !== BACKUP_FORMAT
  ) {
    throw new Error('Die Datei ist keine Sicherung von „Meine Garage“.')
  }

  const backup = data as BackupFile
  if (typeof backup.version !== 'number' || backup.version > BACKUP_VERSION) {
    throw new Error(
      'Diese Sicherung stammt aus einer neueren App-Version und kann nicht eingelesen werden.',
    )
  }

  if (typeof backup.tables !== 'object' || backup.tables === null) {
    throw new Error('Die Sicherung enthält keine Daten.')
  }

  for (const name of TABLE_NAMES) {
    const rows = backup.tables[name] ?? []
    if (!Array.isArray(rows)) {
      throw new Error(`Der Bereich „${TABLE_LABELS[name]}“ ist beschädigt.`)
    }
    for (const row of rows) {
      if (typeof row !== 'object' || row === null || typeof row.id !== 'string') {
        throw new Error(
          `Der Bereich „${TABLE_LABELS[name]}“ enthält einen ungültigen Eintrag.`,
        )
      }
    }
    backup.tables[name] = rows
  }

  return backup
}

/** Ersetzt den kompletten Datenbestand durch die Sicherung (alles oder nichts). */
export async function restoreBackup(backup: BackupFile): Promise<void> {
  await db.transaction('rw', TABLE_NAMES.map((name) => db.table(name)), async () => {
    for (const name of TABLE_NAMES) {
      const table = db.table(name)
      await table.clear()
      await table.bulkAdd(backup.tables[name])
    }
  })
}

/* ------------------------------------------------------------------ */
/* Sicherheitskopie vor einem Import – liegt in einer eigenen,         */
/* getrennten Datenbank auf dem Gerät, damit ein Import rückgängig     */
/* gemacht werden kann (ohne Datei, ohne Teilen-Menü).                 */
/* ------------------------------------------------------------------ */

type SafetyCopy = {
  id: 'vor-import'
  createdAt: string
  /** Wovor gesichert wurde, z. B. „dem letzten Import“ */
  reason?: string
  backup: BackupFile
}

class SafetyDatabase extends Dexie {
  copies!: Table<SafetyCopy, string>
  constructor() {
    super('MeineGarageSicherheitskopie')
    this.version(1).stores({ copies: 'id' })
  }
}

const safetyDb = new SafetyDatabase()

export async function getSafetyCopy(): Promise<SafetyCopy | undefined> {
  return safetyDb.copies.get('vor-import')
}

/**
 * Sichert den jetzigen Stand als Sicherheitskopie und führt dann die Änderung aus.
 * `reason` erscheint später im Hinweis, z. B. „dem Löschen von Vespa PX80“.
 */
export async function withSafetyCopy(reason: string, change: () => Promise<void>): Promise<void> {
  const current = await createBackup()
  await safetyDb.copies.put({ id: 'vor-import', createdAt: current.exportedAt, reason, backup: current })
  await change()
}

/** Spielt eine Sicherung ein und legt vorher den jetzigen Stand als Sicherheitskopie ab. */
export async function importWithSafetyCopy(backup: BackupFile): Promise<void> {
  await withSafetyCopy('dem letzten Import', () => restoreBackup(backup))
}

/** Stellt den gesicherten Stand wieder her und entfernt die Kopie. */
export async function undoLastImport(): Promise<void> {
  const copy = await getSafetyCopy()
  if (!copy) throw new Error('Es gibt keine Sicherheitskopie.')
  await restoreBackup(copy.backup)
  await safetyDb.copies.delete('vor-import')
}

/** Löscht ein Fahrzeug samt aller zugehörigen Einträge (alles oder nichts). */
export async function deleteVehicleWithEntries(vehicleId: string): Promise<void> {
  await db.transaction('rw', TABLE_NAMES.map((name) => db.table(name)), async () => {
    for (const name of TABLE_NAMES) {
      if (name === 'vehicles') continue
      await db.table(name).where('vehicleId').equals(vehicleId).delete()
    }
    await db.vehicles.delete(vehicleId)
  })
}

/** Zählt, wie viele Einträge zu einem Fahrzeug gehören. */
export async function countVehicleEntries(vehicleId: string): Promise<Partial<BackupCounts>> {
  const counts: Partial<BackupCounts> = {}
  for (const name of TABLE_NAMES) {
    if (name === 'vehicles') continue
    counts[name] = await db.table(name).where('vehicleId').equals(vehicleId).count()
  }
  return counts
}
