import { useState } from 'react'
import { db, type VehicleRecord } from './db'
import { readPhotoResized } from './photo'

type Category = VehicleRecord['category']

const CATEGORIES: Category[] = ['Freizeit', 'Alltag', 'Projekt', 'Wohnwagen']

/** Vorgaben je Bereich – entsprechen den bestehenden Fahrzeugen */
const CATEGORY_DEFAULTS: Record<Category, { description: string; info: string; icon: string }> = {
  Freizeit: { description: 'Freizeitfahrzeug', info: 'Fahrten & Historie', icon: '🚗' },
  Alltag: { description: 'Alltagsfahrzeug', info: 'Werkstatt & Wartung', icon: '🚙' },
  Projekt: { description: 'Projekt', info: 'Projektdokumentation', icon: '🔧' },
  Wohnwagen: { description: 'Wohnwagen', info: 'Reisen, HU & Gas', icon: '🏕️' },
}

const ICONS = ['🚗', '🚙', '🚘', '🏎️', '🛵', '🏍️', '🚐', '🛻', '🚜', '🏕️', '🔧', '🚲']

type Props = {
  onAdded: (vehicle: VehicleRecord) => void
  onCancel: () => void
}

export function AddVehicleForm({ onAdded, onCancel }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Freizeit')
  const [icon, setIcon] = useState(CATEGORY_DEFAULTS.Freizeit.icon)
  const [iconTouched, setIconTouched] = useState(false)
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [description, setDescription] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [photo, setPhoto] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const changeCategory = (next: Category) => {
    setCategory(next)
    if (!iconTouched) setIcon(CATEGORY_DEFAULTS[next].icon)
  }

  const save = async () => {
    if (!name.trim()) {
      setError('Bitte gib dem Fahrzeug einen Namen.')
      return
    }
    setSaving(true)
    const defaults = CATEGORY_DEFAULTS[category]
    const vehicle: VehicleRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      description: description.trim() || defaults.description,
      category,
      info: defaults.info,
      icon,
      photo: photo || undefined,
      year: null,
      firstRegistration: null,
      licensePlate: licensePlate.trim() || null,
      mileage: null,
      nextHu: null,
      nextGasInspection: null,
    }
    try {
      await db.vehicles.add(vehicle)
      onAdded(vehicle)
    } catch (e) {
      console.error(e)
      setError('Speichern fehlgeschlagen.')
      setSaving(false)
    }
  }

  return (
    <section className="edit-area add-vehicle-form">
      <h2>Fahrzeug hinzufügen</h2>

      <label>
        Name *
        <input
          type="text"
          placeholder="z. B. Vespa GTS 300"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
        />
      </label>

      <label>
        Bereich
        <select
          value={category}
          onChange={(event) => changeCategory(event.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="icon-picker">
        <span>Symbol</span>
        <div>
          {ICONS.map((i) => (
            <button
              key={i}
              type="button"
              className={i === icon ? 'icon-option icon-option-active' : 'icon-option'}
              aria-pressed={i === icon}
              onClick={() => {
                setIcon(i)
                setIconTouched(true)
              }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <label>
        Hersteller
        <input
          type="text"
          placeholder="z. B. Vespa"
          value={manufacturer}
          onChange={(event) => setManufacturer(event.target.value)}
        />
      </label>

      <label>
        Modell
        <input
          type="text"
          placeholder="z. B. GTS 300"
          value={model}
          onChange={(event) => setModel(event.target.value)}
        />
      </label>

      <label>
        Kennzeichen
        <input
          type="text"
          autoCapitalize="characters"
          placeholder="Optional"
          value={licensePlate}
          onChange={(event) => setLicensePlate(event.target.value)}
        />
      </label>

      <label>
        Beschreibung
        <input
          type="text"
          placeholder={CATEGORY_DEFAULTS[category].description}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <label>
        Foto
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            readPhotoResized(file)
              .then(setPhoto)
              .catch(() => setError('Das Foto konnte nicht gelesen werden.'))
          }}
        />
      </label>
      {photo && <img className="add-vehicle-photo" src={photo} alt="Fahrzeugvorschau" />}

      <p className="add-vehicle-hint">
        Baujahr, Erstzulassung, HU und Kilometerstand trägst du danach auf der
        Fahrzeugseite unter „Fahrzeugdaten bearbeiten“ ein.
      </p>

      {error && <p className="backup-status backup-status-error">{error}</p>}

      <div className="backup-actions">
        <button className="primary-action" disabled={saving} onClick={() => void save()}>
          Speichern
        </button>
        <button className="secondary-action" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </section>
  )
}
