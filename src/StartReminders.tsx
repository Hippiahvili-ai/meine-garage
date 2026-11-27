import type { VehicleRecord } from './db'
import {
  BACKUP_REMINDER_DAYS,
  collectDueItems,
  daysSince,
  useLastBackup,
} from './reminders'

type Props = {
  vehicles: VehicleRecord[]
  onOpenVehicle: (vehicle: VehicleRecord) => void
}

/** Hinweise oben auf der Startseite: fällige Termine und alte Datensicherung. */
export function StartReminders({ vehicles, onOpenVehicle }: Props) {
  const lastBackup = useLastBackup()
  const dueItems = collectDueItems(vehicles)

  const backupDays = lastBackup ? daysSince(lastBackup) : null
  const backupDue = backupDays === null || backupDays >= BACKUP_REMINDER_DAYS

  if (dueItems.length === 0 && !backupDue) return null

  return (
    <section className="start-reminders" aria-label="Hinweise">
      {dueItems.map((item) => (
        <button
          key={`${item.vehicle.id}-${item.kind}`}
          className={`reminder reminder-${item.level}`}
          onClick={() => onOpenVehicle(item.vehicle)}
        >
          <span className="reminder-icon" aria-hidden="true">
            {item.level === 'overdue' ? '!' : '⏰'}
          </span>
          <span className="reminder-text">
            <strong>
              {item.kind} {item.vehicle.name} {item.label}
            </strong>
            <span>Termin {item.date}</span>
          </span>
          <span className="reminder-arrow" aria-hidden="true">›</span>
        </button>
      ))}

      {backupDue && (
        <button
          className="reminder reminder-backup"
          onClick={() =>
            document
              .getElementById('datensicherung')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        >
          <span className="reminder-icon" aria-hidden="true">💾</span>
          <span className="reminder-text">
            <strong>
              {backupDays === null
                ? 'Noch keine Datensicherung'
                : `Letzte Sicherung vor ${backupDays} Tagen`}
            </strong>
            <span>Deine Daten liegen nur auf diesem Gerät. Jetzt sichern</span>
          </span>
          <span className="reminder-arrow" aria-hidden="true">›</span>
        </button>
      )}
    </section>
  )
}
