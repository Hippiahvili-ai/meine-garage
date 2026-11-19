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

/** Erzeugt die Sicherung und lädt sie als .json-Datei herunter. */
export async function downloadBackup(): Promise<BackupCounts> {
  const backup = await createBackup()
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const stamp = backup.exportedAt.slice(0, 16).replace('T', '_').replace(':', '-')
  const link = document.createElement('a')
  link.href = url
  link.download = `meine-garage-backup_${stamp}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)

  return countTables(backup)
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
