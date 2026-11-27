import { useRef, type CSSProperties, type PointerEvent } from 'react'
import type { PhotoCrop } from './db'

export const DEFAULT_CROP: PhotoCrop = { x: 50, y: 50, zoom: 1 }
const MAX_ZOOM = 3

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * Der Punkt (x %, y %) des Fotos liegt immer an derselben relativen Stelle im
 * Rahmen; der Zoom vergrößert um genau diesen Punkt. Dadurch sieht der
 * Ausschnitt in jeder Größe (Karte, Fahrzeugseite, Editor) gleich aus.
 */
function cropStyle(crop: PhotoCrop | undefined): CSSProperties {
  const { x, y, zoom } = crop ?? DEFAULT_CROP
  return {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${x}% ${y}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${x}% ${y}%`,
    display: 'block',
  }
}

type PhotoProps = { src: string; alt: string; crop?: PhotoCrop }

/** Fahrzeugfoto im gewählten Ausschnitt; füllt den umgebenden Rahmen. */
export function VehiclePhoto({ src, alt, crop }: PhotoProps) {
  return (
    <div className="vehicle-photo-frame">
      <img src={src} alt={alt} style={cropStyle(crop)} draggable={false} />
    </div>
  )
}

type EditorProps = {
  src: string
  crop: PhotoCrop | undefined
  onChange: (crop: PhotoCrop) => void
}

/** Ausschnitt wählen: Foto mit dem Finger verschieben, Zoom per Regler. */
export function PhotoCropEditor({ src, crop, onChange }: EditorProps) {
  const current = crop ?? DEFAULT_CROP
  const drag = useRef<{ startX: number; startY: number; crop: PhotoCrop } | null>(null)
  const frame = useRef<HTMLDivElement>(null)

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { startX: event.clientX, startY: event.clientY, crop: current }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    const size = frame.current?.clientWidth
    if (!start || !size) return
    // Finger nach rechts → Foto wandert mit → Ausschnitt rückt nach links
    const factor = 100 / size / start.crop.zoom
    onChange({
      ...start.crop,
      x: clamp(start.crop.x - (event.clientX - start.startX) * factor, 0, 100),
      y: clamp(start.crop.y - (event.clientY - start.startY) * factor, 0, 100),
    })
  }

  const endDrag = () => {
    drag.current = null
  }

  return (
    <div className="photo-crop-editor">
      <div
        ref={frame}
        className="photo-crop-frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img src={src} alt="Ausschnitt wählen" style={cropStyle(current)} draggable={false} />
      </div>

      <div className="photo-crop-controls">
        <p>Foto mit dem Finger verschieben</p>
        <label>
          Zoom
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.05}
            value={current.zoom}
            onChange={(event) => onChange({ ...current, zoom: Number(event.target.value) })}
          />
        </label>
        <button type="button" onClick={() => onChange(DEFAULT_CROP)}>
          Zurücksetzen
        </button>
      </div>
    </div>
  )
}
