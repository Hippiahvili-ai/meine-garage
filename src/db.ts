import Dexie, { type Table } from 'dexie'

export type MileageSource =
  | 'Manuell'
  | 'Fahrt'
  | 'Werkstatt'
  | 'Eigenarbeit'
  | 'HU'
  | 'Service'

export type MileageEntry = {
  id: string
  vehicleId: string
  date: string
  mileage: number
  source: MileageSource
  note: string

  workEntryId?: string
  tripEntryId?: string
}

export type VehicleRecord = {
  id: string
  name: string
  manufacturer: string
  model: string
  description: string
  category: 'Freizeit' | 'Alltag' | 'Projekt' | 'Wohnwagen'
  info: string
  icon: string
  photo?: string
  /** Position innerhalb des Bereichs auf der Startseite (klein = oben) */
  sortOrder?: number

  year: number | null
  firstRegistration: string | null
  licensePlate: string | null
  mileage: number | null
  nextHu: string | null
  nextGasInspection: string | null
}
export type WorkType =
  | 'Werkstatt'
  | 'Eigenarbeit'

export type WorkEntry = {
  id: string
  vehicleId: string
  date: string
  mileage: number | null

  type: WorkType

  title: string
  description: string

  workshop: string

  partsCost: number
  laborCost: number
  otherCost: number
}
export type PurchaseEntry = {
  id: string
  vehicleId: string
  date: string

  title: string
  items: string
  cost: number

  vendor: string
  note: string
}
export type TripEntry = {
  id: string
  vehicleId: string
  date: string

  startMileage: number
  endMileage: number

  startLocation: string
  destination: string

  note: string

  googleMapsUrl?: string
}
export type FuelEntry = {
  id: string
  vehicleId: string
  date: string
  mileage: number
  liters: number
  totalCost: number
  pricePerLiter: number
  fuelType: string
  fullTank: boolean
  note: string
}
class GarageDatabase extends Dexie {
  mileageEntries!: Table<MileageEntry, string>
  vehicles!: Table<VehicleRecord, string>
    workEntries!: Table<WorkEntry, string>
    tripEntries!: Table<TripEntry, string>
    fuelEntries!: Table<FuelEntry, string>
    purchaseEntries!: Table<PurchaseEntry, string>

  constructor() {
    super('MeineGarageDB')

    this.version(1).stores({
      mileageEntries: 'id, vehicleId, date',
    })

    this.version(2).stores({
      mileageEntries: 'id, vehicleId, date',
      vehicles: 'id, category, name',
    })
    this.version(3).stores({
  mileageEntries: 'id, vehicleId, date',
  vehicles: 'id, category, name',
  workEntries: 'id, vehicleId, date, type',
})
this.version(4).stores({
  mileageEntries: 'id, vehicleId, date',
  vehicles: 'id, category, name',
  workEntries: 'id, vehicleId, date, type',
  tripEntries: 'id, vehicleId, date',
})
this.version(5).stores({
  mileageEntries: 'id, vehicleId, date',
  vehicles: 'id, category, name',
  workEntries: 'id, vehicleId, date, type',
  tripEntries: 'id, vehicleId, date',
  fuelEntries: 'id, vehicleId, date',
})
this.version(6).stores({
  mileageEntries: 'id, vehicleId, date',
  vehicles: 'id, category, name',
  workEntries: 'id, vehicleId, date, type',
  tripEntries: 'id, vehicleId, date',
  fuelEntries: 'id, vehicleId, date',
  purchaseEntries: 'id, vehicleId, date',
})
  }
}

export const db = new GarageDatabase()