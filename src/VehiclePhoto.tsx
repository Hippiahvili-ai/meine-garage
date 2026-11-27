import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { PhotoCrop } from './db'

export const DEFAULT_CROP: PhotoCrop = { x: 50, y: 50, zoom: 1 }
const MAX_ZOOM = 3

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** Zoom, bei dem das ganze Foto in einen quadratischen Rahmen passt. */
const fitZoom = (aspect: number) => Math.min(aspect, 1 / aspect)

/**
 * Breite des Fotos in Prozent der Rahmenbreite. Zoom 1 = Rahmen ganz gefüllt
 * (Rahmen quadratisch oder breiter als hoch), Zoom < 1 = herausgezoomt.
 */
const widthPercent = (zoom: number, aspect: number) => 100 * zoom * Math.max(1, aspect)

/**
 * Der Punkt (x %, y %) des Fotos liegt immer an derselben relativen Stelle im
 * Rahmen (left/top in % des Rahmens, translate in % des Fotos). Dadurch sieht der
 * Ausschnitt in jeder Größe (Karte, Fahrzeugseite, Editor) gleich aus.
 * Solange das Seitenverhältnis noch nicht bekannt ist: einfach Rahmen füllen.
 */
function cropStyle(crop: PhotoCrop | undefined, aspect: number | null): CSSProperties {
  const { x, y, zoom } = crop ?? DEFAULT_CROP
  if (!aspect) {
    return {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: `${x}% ${y}%`,
      display: 'block',
    }
  }
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${widthPercent(zoom, aspect)}%`,
    height: 'auto',
    maxWidth: 'none',
    transform: `translate(-${x}%, -${y}%)`,
    display: 'block',
  }
}

/** Seitenverhältnis (Breite / Höhe) des Fotos, sobald es geladen ist. */
function useAspect() {
  const [aspect, setAspect] = useState<number | null>(null)
  const onLoad = (event: { currentTarget: HTMLImageElement }) => {
    const { naturalWidth: w, naturalHeight: h } = event.currentTarget
    setAspect(w && h ? w / h : null)
  }
  return { aspect, onLoad }
}

type PhotoProps = { src: string; alt: string; crop?: PhotoCrop }

/** Fahrzeugfoto im gewählten Ausschnitt; füllt den umgebenden Rahmen. */
export function VehiclePhoto({ src, alt, crop }: PhotoProps) {
  const { aspect, onLoad } = useAspect()
  return (
    <div className="vehicle-photo-frame">
      <img
        src={src}
        alt={alt}
        style={cropStyle(crop, aspect)}
        draggable={false}
        onLoad={onLoad}
      />
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
  const { aspect, onLoad } = useAspect()
  const minZoom = aspect ? fitZoom(aspect) : 1

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { startX: event.clientX, startY: event.clientY, crop: current }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    const box = frame.current
    if (!start || !box || !aspect) return

    // Das Foto folgt genau dem Finger: Verschiebung im Verhältnis zum Spielraum
    // zwischen Foto- und Rahmengröße (bei herausgezoomtem Foto umgekehrt).
    const photoWidth = (box.clientWidth * widthPercent(start.crop.zoom, aspect)) / 100
    const photoHeight = photoWidth / aspect
    const step = (delta: number, room: number, value: number) =>
      Math.abs(room) < 1 ? value : clamp(value - (delta / room) * 100, 0, 100)

    onChange({
      ...start.crop,
      x: step(event.clientX - start.startX, photoWidth - box.clientWidth, start.crop.x),
      y: step(event.clientY - start.startY, photoHeight - box.clientHeight, start.crop.y),
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
        <img
          src={src}
          alt="Ausschnitt wählen"
          style={cropStyle(current, aspect)}
          draggable={false}
          onLoad={onLoad}
        />
      </div>

      <div className="photo-crop-controls">
        <p>Foto mit dem Finger verschieben</p>
        <label>
          Zoom
          <input
            type="range"
            min={minZoom}
            max={MAX_ZOOM}
            step={0.01}
            value={current.zoom}
            onChange={(event) => onChange({ ...current, zoom: Number(event.target.value) })}
          />
        </label>
        <div className="photo-crop-buttons">
          <button
            type="button"
            onClick={() => onChange({ x: 50, y: 50, zoom: minZoom })}
          >
            Ganzes Foto
          </button>
          <button type="button" onClick={() => onChange(DEFAULT_CROP)}>
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  )
}
