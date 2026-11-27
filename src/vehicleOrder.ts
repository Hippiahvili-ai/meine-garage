import { db, type VehicleRecord } from './db'

/**
 * Reihenfolge der Fahrzeuge innerhalb eines Bereichs. Fahrzeuge ohne sortOrder
 * (alte Daten, neu angelegte) stehen hinten, in ihrer bisherigen Reihenfolge.
 */
export function sortVehicles(vehicles: VehicleRecord[]): VehicleRecord[] {
  return [...vehicles].sort(
    (a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity) || 0,
  )
}

/**
 * Verschiebt ein Fahrzeug innerhalb seines Bereichs um eine Stelle nach oben (-1)
 * oder unten (+1), nummeriert den Bereich neu durch und speichert ihn.
 * Gibt die komplette, aktualisierte Fahrzeugliste zurück.
 */
export async function moveVehicle(
  vehicles: VehicleRecord[],
  vehicleId: string,
  direction: -1 | 1,
): Promise<VehicleRecord[]> {
  const vehicle = vehicles.find((v) => v.id === vehicleId)
  if (!vehicle) return vehicles

  const section = sortVehicles(vehicles.filter((v) => v.category === vehicle.category))
  const from = section.findIndex((v) => v.id === vehicleId)
  const to = from + direction
  if (to < 0 || to >= section.length) return vehicles

  ;[section[from], section[to]] = [section[to], section[from]]
  const renumbered = section.map((v, index) => ({ ...v, sortOrder: index }))

  await db.vehicles.bulkPut(renumbered)

  const byId = new Map(renumbered.map((v) => [v.id, v]))
  return vehicles.map((v) => byId.get(v.id) ?? v)
}
