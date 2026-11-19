import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  TABLE_LABELS,
  canUseShareSheet,
  countTables,
  getSafetyCopy,
  importWithSafetyCopy,
  prepareBackupFile,
  readBackupFile,
  saveBackupFile,
  undoLastImport,
  type BackupCounts,
  type PreparedBackup,
} from './backup'

type Status = { kind: 'ok' | 'error'; text: string } | null

const describeCounts = (counts: BackupCounts) =>
  (Object.keys(counts) as (keyof BackupCounts)[])
    .map((name) => `${TABLE_LABELS[name]}: ${counts[name]}`)
    .join('\n')

const totalOf = (counts: BackupCounts) =>
  Object.values(counts).reduce((a, b) => a + b, 0)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })

export function BackupSection() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  /** iPhone: vorbereitete Datei, die mit dem zweiten Tipp geteilt wird */
  const [prepared, setPrepared] = useState<PreparedBackup | null>(null)
  const [safetyCopyDate, setSafetyCopyDate] = useState<string | null>(null)

  useEffect(() => {
    void getSafetyCopy().then((copy) => setSafetyCopyDate(copy?.createdAt ?? null))
  }, [])

  const handleExport = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const backup = await prepareBackupFile()
      if (canUseShareSheet(backup.file)) {
        // iPhone: Teilen-Menü braucht einen frischen Fingertipp → zweiter Knopf
        setPrepared(backup)
        return
      }
      await saveBackupFile(backup.file)
      setStatus({ kind: 'ok', text: `Sicherung erstellt (${totalOf(backup.counts)} Einträge).` })
    } catch (error) {
      console.error(error)
      setStatus({ kind: 'error', text: 'Export fehlgeschlagen.' })
    } finally {
      setBusy(false)
    }
  }

  // Wird direkt im Klick ausgeführt – kein await davor, sonst blockiert iOS das Teilen-Menü.
  const handleShare = () => {
    if (!prepared) return
    const { file, counts } = prepared
    void saveBackupFile(file).then((saved) => {
      if (saved) {
        setPrepared(null)
        setStatus({ kind: 'ok', text: `Sicherung gespeichert (${totalOf(counts)} Einträge).` })
      } else {
        setStatus({ kind: 'error', text: 'Nicht gespeichert – du kannst es erneut versuchen.' })
      }
    })
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setStatus(null)
    setPrepared(null)
    try {
      const backup = await readBackupFile(file)

      const confirmed = window.confirm(
        `Sicherung vom ${formatDate(backup.exportedAt)} einlesen?\n\n` +
          `${describeCounts(countTables(backup))}\n\n` +
          'ACHTUNG: Alle aktuellen Daten in der App werden dadurch ersetzt. ' +
          'Der jetzige Stand wird vorher in der App zwischengespeichert und lässt sich ' +
          'mit „Import rückgängig machen“ zurückholen.',
      )
      if (!confirmed) return

      setBusy(true)
      await importWithSafetyCopy(backup)
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

  const handleUndo = async () => {
    if (!safetyCopyDate) return
    const confirmed = window.confirm(
      `Den Stand vom ${formatDate(safetyCopyDate)} (vor dem letzten Import) wiederherstellen?\n\n` +
        'Alles, was seit dem Import eingetragen wurde, geht dabei verloren.',
    )
    if (!confirmed) return

    setBusy(true)
    try {
      await undoLastImport()
      window.location.reload()
    } catch (error) {
      console.error(error)
      setStatus({ kind: 'error', text: 'Rückgängig machen fehlgeschlagen.' })
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

      {prepared ? (
        <div className="backup-prepared">
          <p>
            Sicherung bereit ({totalOf(prepared.counts)} Einträge). Im nächsten
            Schritt „In Dateien sichern“ wählen – am besten in iCloud Drive.
          </p>
          <div className="backup-actions">
            <button className="primary-action" onClick={handleShare}>
              <span>⬆</span>
              In Dateien sichern
            </button>
            <button className="secondary-action" onClick={() => setPrepared(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
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
      )}

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

      {safetyCopyDate && !prepared && (
        <div className="backup-undo">
          <span>Stand vor dem letzten Import ({formatDate(safetyCopyDate)}) ist gespeichert.</span>
          <button disabled={busy} onClick={() => void handleUndo()}>
            Import rückgängig machen
          </button>
        </div>
      )}
    </section>
  )
}
