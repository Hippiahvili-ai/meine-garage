import { useRef, useState, type ChangeEvent } from 'react'
import {
  TABLE_LABELS,
  countTables,
  downloadBackup,
  readBackupFile,
  restoreBackup,
  type BackupCounts,
} from './backup'

type Status = { kind: 'ok' | 'error'; text: string } | null

function describeCounts(counts: BackupCounts): string {
  return (Object.keys(counts) as (keyof BackupCounts)[])
    .map((name) => `${TABLE_LABELS[name]}: ${counts[name]}`)
    .join('\n')
}

export function BackupSection() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const handleExport = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const counts = await downloadBackup()
      const total = Object.values(counts).reduce((a, b) => a + b, 0)
      setStatus({ kind: 'ok', text: `Sicherung erstellt (${total} Einträge).` })
    } catch (error) {
      console.error(error)
      setStatus({ kind: 'error', text: 'Export fehlgeschlagen.' })
    } finally {
      setBusy(false)
    }
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setStatus(null)
    try {
      const backup = await readBackupFile(file)
      const date = new Date(backup.exportedAt).toLocaleString('de-DE')

      const confirmed = window.confirm(
        `Sicherung vom ${date} einlesen?\n\n` +
          `${describeCounts(countTables(backup))}\n\n` +
          'ACHTUNG: Alle aktuellen Daten in der App werden dadurch ersetzt. ' +
          'Der jetzige Stand wird vorher automatisch als Datei gesichert.',
      )
      if (!confirmed) return

      setBusy(true)
      await downloadBackup()
      await restoreBackup(backup)
      window.location.reload()
    } catch (error) {
      console.error(error)
      setStatus({
        kind: 'error',
        text:
          error instanceof Error
            ? `Import fehlgeschlagen: ${error.message}`
            : 'Import fehlgeschlagen.',
      })
      setBusy(false)
    }
  }

  return (
    <section className="backup-section">
      <h2>Datensicherung</h2>
      <p>
        Alle Fahrzeuge, Fahrten, Tankvorgänge, Werkstatt-Einträge und Ausgaben
        als Datei sichern oder aus einer Sicherung wiederherstellen.
      </p>

      <div className="backup-actions">
        <button
          className="primary-action"
          disabled={busy}
          onClick={() => void handleExport()}
        >
          <span>⬇</span>
          Exportieren
        </button>
        <button
          className="secondary-action"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
        >
          <span>⬆</span>
          Importieren
        </button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => void handleFile(event)}
      />

      {status && (
        <p className={`backup-status backup-status-${status.kind}`}>
          {status.text}
        </p>
      )}
    </section>
  )
}
