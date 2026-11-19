import { useEffect, useState } from 'react'
import './App.css'
import {
  db,
  type FuelEntry,
  type TripEntry,
  type MileageEntry,
  type MileageSource,
  type VehicleRecord,
  type WorkEntry,
  type PurchaseEntry,
  type WorkType,
} from './db'
import { BackupSection } from './BackupSection'

/** Heutiges Datum als JJJJ-MM-TT in deutscher Ortszeit (nicht UTC). */
const todayLocal = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Zahl für ein Eingabefeld: 42.5 → "42,5" */
const toInputNumber = (value: number) => String(value).replace('.', ',')


const initialVehicles: VehicleRecord[] = [
  {
    id: 'golf-cabrio',
    name: 'Golf Cabrio',
    manufacturer: 'Volkswagen',
    model: 'Golf Cabrio',
    description: 'Freizeitfahrzeug',
    category: 'Freizeit',
    info: 'Fahrten & Historie',
    icon: '🚗',
    year: null,
    firstRegistration: null,
    licensePlate: null,
    mileage: null,
    nextHu: null,
    nextGasInspection: null,
  },
  {
    id: 'vespa-px125',
    name: 'Vespa PX125',
    manufacturer: 'Vespa',
    model: 'PX125',
    description: 'Freizeitfahrzeug',
    category: 'Freizeit',
    info: 'Fahrten & Historie',
    icon: '🛵',
    year: null,
    firstRegistration: null,
    licensePlate: null,
    mileage: null,
    nextHu: null,
    nextGasInspection: null,
  },
  {
    id: 'vespa-px80',
    name: 'Vespa PX80',
    manufacturer: 'Vespa',
    model: 'PX80',
    description: 'Freizeitfahrzeug',
    category: 'Freizeit',
    info: 'Fahrten & Historie',
    icon: '🛵',
    year: null,
    firstRegistration: null,
    licensePlate: null,
    mileage: null,
    nextHu: null,
    nextGasInspection: null,
  },
  {
    id: 'mercedes-e-klasse',
    name: 'Mercedes E-Klasse',
    manufacturer: 'Mercedes-Benz',
    model: 'E-Klasse Kombi',
    description: 'Alltagsfahrzeug',
    category: 'Alltag',
    info: 'Werkstatt & Wartung',
    icon: '🚙',
    year: null,
    firstRegistration: null,
    licensePlate: null,
    mileage: null,
    nextHu: null,
    nextGasInspection: null,
  },
  {
    id: 'skoda-octavia',
    name: 'Skoda Octavia',
    manufacturer: 'Skoda',
    model: 'Octavia',
    description: 'Fahrzeug deiner Frau',
    category: 'Alltag',
    info: 'Werkstatt & Wartung',
    icon: '🚘',
    year: null,
    firstRegistration: null,
    licensePlate: null,
    mileage: null,
    nextHu: null,
    nextGasInspection: null,
  },
  {
    id: 'vespa-v50',
    name: 'Vespa V50',
    manufacturer: 'Vespa',
    model: 'V50',
    description: 'Wiederaufbau',
    category: 'Projekt',
    info: 'Projektdokumentation',
    icon: '🔧',
    year: null,
    firstRegistration: null,
    licensePlate: null,
    mileage: null,
    nextHu: null,
    nextGasInspection: null,
  },
  {
    id: 'siggi',
    name: "Dethleffs c'go „Siggi“",
    manufacturer: 'Dethleffs',
    model: "c'go",
    description: 'Wohnwagen',
    category: 'Wohnwagen',
    info: 'Reisen, HU & Gas',
    icon: '🏕️',
    year: null,
    firstRegistration: null,
    licensePlate: null,
    mileage: null,
    nextHu: null,
    nextGasInspection: null,
  },
]

const sections = ['Freizeit', 'Alltag', 'Projekt', 'Wohnwagen'] as const

function App() {
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleRecord | null>(null)

  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [mileageHistory, setMileageHistory] = useState<MileageEntry[]>([])
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([])
  const [tripEntries, setTripEntries] = useState<TripEntry[]>([])
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([])
  const [purchaseEntries, setPurchaseEntries] =
  useState<PurchaseEntry[]>([])
  useEffect(() => {
  const loadFuelEntries = async () => {
    const entries = await db.fuelEntries.toArray()
    setFuelEntries(entries)
  }

  void loadFuelEntries()
}, [])
useEffect(() => {
  const loadPurchaseEntries = async () => {
    const entries = await db.purchaseEntries.toArray()
    setPurchaseEntries(entries)
  }

  void loadPurchaseEntries()
}, [])
  const [isEditing, setIsEditing] = useState(false)
const [isAddVehicleFormOpen, setIsAddVehicleFormOpen] =
  useState(false)
  const [isMileageFormOpen, setIsMileageFormOpen] = useState(false)
  const [isTripFormOpen, setIsTripFormOpen] =
  useState(false)
  const [editingTripId, setEditingTripId] =
  useState<string | null>(null)
  const [tripDate, setTripDate] = useState(
  todayLocal(),
)
const [tripStartMileage, setTripStartMileage] =
  useState('')
  const [tripEndMileage, setTripEndMileage] =
  useState('')
  const [tripStartLocation, setTripStartLocation] =
  useState('')
  const [tripDestination, setTripDestination] =
  useState('')
  const [tripNote, setTripNote] =
  useState('')
  const [mileageInput, setMileageInput] = useState('')
  const [mileageDate, setMileageDate] = useState(
    todayLocal(),
  )
  const [mileageSource, setMileageSource] =
  useState<MileageSource | ''>('')
  const [mileageNote, setMileageNote] = useState('')
  const [editingMileageId, setEditingMileageId] =
  useState<string | null>(null)

  const [editManufacturer, setEditManufacturer] = useState('')
  const [editModel, setEditModel] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editFirstRegistration, setEditFirstRegistration] = useState('')
  const [editLicensePlate, setEditLicensePlate] = useState('')
  const [editNextHu, setEditNextHu] = useState('')
  const [editNextGasInspection, setEditNextGasInspection] = useState('')
  const [editPhoto, setEditPhoto] = useState('')

  const [isWorkFormOpen, setIsWorkFormOpen] = useState(false)
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] =
  useState(false)
const [editingPurchaseId, setEditingPurchaseId] =
  useState<string | null>(null)
  const [purchaseDate, setPurchaseDate] = useState(
  todayLocal(),
)
 const [purchaseTitle, setPurchaseTitle] = useState('') 
 const [purchaseItems, setPurchaseItems] = useState('')
 const [purchaseCost, setPurchaseCost] = useState('')
 const [purchaseVendor, setPurchaseVendor] = useState('')
 const [purchaseNote, setPurchaseNote] = useState('')
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false)
  const [editingFuelId, setEditingFuelId] =
  useState<string | null>(null)
 const [fuelDate, setFuelDate] = useState(
  todayLocal(),
)
const [fuelMileage, setFuelMileage] = useState('')
const [fuelLiters, setFuelLiters] = useState('')
const [fuelTotalCost, setFuelTotalCost] = useState('')
const [fuelPricePerLiter, setFuelPricePerLiter] = useState('')
const [fuelType, setFuelType] = useState('')
const [fuelFullTank, setFuelFullTank] = useState(false)
const [fuelNote, setFuelNote] = useState('')
const [costYear, setCostYear] = useState(
  String(new Date().getFullYear()),
)
const [costMonth, setCostMonth] = useState('all')
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null)

  const [workType, setWorkType] = useState<WorkType>('Eigenarbeit')
  const [workDate, setWorkDate] = useState(
    todayLocal(),
  )
  const [workMileage, setWorkMileage] = useState('')
  const [workTitle, setWorkTitle] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [workWorkshop, setWorkWorkshop] = useState('')
  const [workPartsCost, setWorkPartsCost] = useState('')
  const [workLaborCost, setWorkLaborCost] = useState('')
  const [workOtherCost, setWorkOtherCost] = useState('')
useEffect(() => {
  const liters = Number(fuelLiters.replace(',', '.'))
  const pricePerLiter = Number(
    fuelPricePerLiter.replace(',', '.'),
  )

  if (
    Number.isNaN(liters) ||
    Number.isNaN(pricePerLiter) ||
    liters <= 0 ||
    pricePerLiter <= 0
  ) {
    setFuelTotalCost('')
    return
  }

  setFuelTotalCost(
    (liters * pricePerLiter).toFixed(2),
  )
}, [fuelLiters, fuelPricePerLiter])
  useEffect(() => {
    const loadMileageHistory = async () => {
      const entries = await db.mileageEntries.toArray()
      setMileageHistory(entries)
    }

    void loadMileageHistory()
  }, [])

  useEffect(() => {
    const loadVehicles = async () => {
      const vehicleCount = await db.vehicles.count()

      if (vehicleCount === 0) {
        await db.vehicles.bulkAdd(initialVehicles)
      }

      const storedVehicles = await db.vehicles.toArray()
      setVehicles(storedVehicles)
    }

    void loadVehicles()
  }, [])

  useEffect(() => {
    const loadWorkEntries = async () => {
      const entries = await db.workEntries.toArray()
      setWorkEntries(entries)
    }

    void loadWorkEntries()
  }, [])
  useEffect(() => {
  const loadTripEntries = async () => {
    const entries = await db.tripEntries.toArray()
    setTripEntries(entries)
  }

  void loadTripEntries()
}, [])

  const selectedMileageHistory = selectedVehicle
  ? mileageHistory
      .filter((entry) => entry.vehicleId === selectedVehicle.id)
      .sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date)

        if (dateComparison !== 0) {
          return dateComparison
        }

        return b.mileage - a.mileage
      })
  : []
const visibleMileageHistory =
  selectedMileageHistory.filter(
    (entry) =>
      !entry.tripEntryId &&
      !entry.workEntryId &&
      !workEntries.some(
        (workEntry) =>
          workEntry.vehicleId === entry.vehicleId &&
          workEntry.mileage !== null &&
          workEntry.date === entry.date &&
          workEntry.mileage === entry.mileage &&
          workEntry.type === entry.source &&
          workEntry.title === entry.note,
      ),
  )
  const latestTripMileage = selectedVehicle
  ? tripEntries
      .filter(
        (entry) => entry.vehicleId === selectedVehicle.id,
      )
      .sort((a, b) =>
        b.date.localeCompare(a.date),
      )[0]?.endMileage ?? null
  : null
const latestFuelMileage = selectedVehicle
  ? fuelEntries
      .filter(
        (entry) => entry.vehicleId === selectedVehicle.id,
      )
      .sort((a, b) => {
        const dateComparison =
          b.date.localeCompare(a.date)

        if (dateComparison !== 0) {
          return dateComparison
        }

        return b.mileage - a.mileage
      })[0]?.mileage ?? null
  : null
const latestMileage =
  Math.max(
    selectedMileageHistory[0]?.mileage ?? 0,
    latestTripMileage ?? 0,
    latestFuelMileage ?? 0,
  ) ||
  selectedVehicle?.mileage ||
  null

  const selectedFuelEntries = selectedVehicle
  ? fuelEntries
      .filter(
        (entry) => entry.vehicleId === selectedVehicle.id,
      )
      .sort((a, b) => {
  const dateComparison = a.date.localeCompare(b.date)

  if (dateComparison !== 0) {
    return dateComparison
  }

  return a.mileage - b.mileage
})
  : []

const latestFuelStats = (() => {
  let previousFullMileage: number | null = null
  let litersSinceFull = 0
  let costSinceFull = 0
  let consumption: number | null = null
  let costPer100Km: number | null = null

  for (const entry of selectedFuelEntries) {
    if (previousFullMileage === null) {
      if (entry.fullTank) {
        previousFullMileage = entry.mileage
      }

      continue
    }

    litersSinceFull += entry.liters
    costSinceFull += entry.totalCost

    if (!entry.fullTank) {
      continue
    }

    const distance =
      entry.mileage - previousFullMileage

    if (distance > 0) {
      consumption =
        (litersSinceFull / distance) * 100

      costPer100Km =
        (costSinceFull / distance) * 100
    }

    previousFullMileage = entry.mileage
    litersSinceFull = 0
    costSinceFull = 0
  }

  return {
    consumption,
    costPer100Km,
  }
})()
  const selectedWorkEntries = selectedVehicle
    ? workEntries
        .filter((entry) => entry.vehicleId === selectedVehicle.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : []

  const fuelTotalAllTime = selectedFuelEntries.reduce(
    (sum, entry) => sum + entry.totalCost,
    0,
  )
  const workTotal = selectedWorkEntries.reduce(
    (sum, entry) =>
      sum + entry.partsCost + entry.laborCost + entry.otherCost,
    0,
  )
const filteredFuelEntries = selectedFuelEntries.filter(
  (entry) => {
    if (
      costYear !== 'all' &&
      !entry.date.startsWith(`${costYear}-`)
    ) {
      return false
    }

    if (
      costMonth !== 'all' &&
      entry.date.slice(5, 7) !== costMonth
    ) {
      return false
    }

    return true
  },
)

const filteredWorkEntries = selectedWorkEntries.filter(
  (entry) => {
    if (
      costYear !== 'all' &&
      !entry.date.startsWith(`${costYear}-`)
    ) {
      return false
    }

    if (
      costMonth !== 'all' &&
      entry.date.slice(5, 7) !== costMonth
    ) {
      return false
    }

    return true
  },
)
const filteredPurchaseEntries = purchaseEntries.filter(
  (entry) => {
    if (entry.vehicleId !== selectedVehicle?.id) {
      return false
    }

    if (
      costYear !== 'all' &&
      !entry.date.startsWith(`${costYear}-`)
    ) {
      return false
    }

    if (
      costMonth !== 'all' &&
      entry.date.slice(5, 7) !== costMonth
    ) {
      return false
    }

    return true
  },
)

const filteredPurchaseTotal =
  filteredPurchaseEntries.reduce(
    (sum, entry) => sum + entry.cost,
    0,
  )
const filteredFuelTotal = filteredFuelEntries.reduce(
  (sum, entry) => sum + entry.totalCost,
  0,
)
const dashboardYear = String(new Date().getFullYear())

const dashboardFuelTotal = fuelEntries
  .filter(
    (entry) =>
      entry.date.startsWith(`${dashboardYear}-`) &&
      vehicles.some(
        (vehicle) =>
          vehicle.id === entry.vehicleId &&
          vehicle.category.trim() === 'Freizeit',
      ),
  )
  .reduce(
    (sum, entry) => sum + entry.totalCost,
    0,
  )

const dashboardWorkTotal = workEntries
  .filter(
    (entry) =>
      entry.date.startsWith(`${dashboardYear}-`) &&
      vehicles.some(
        (vehicle) =>
          vehicle.id === entry.vehicleId &&
          vehicle.category.trim() === 'Freizeit',
      ),
  )
  .reduce(
    (sum, entry) =>
      sum +
      entry.partsCost +
      entry.laborCost +
      entry.otherCost,
    0,
  )

const dashboardTotal =
  dashboardFuelTotal + dashboardWorkTotal
 const dashboardYearMileage = tripEntries
  .filter(
    (entry) =>
      entry.date.startsWith(`${dashboardYear}-`) &&
      vehicles.some(
        (vehicle) =>
          vehicle.id === entry.vehicleId &&
          vehicle.category.trim() === 'Freizeit',
      ),
  )
  .reduce(
    (total, entry) =>
      total + (entry.endMileage - entry.startMileage),
    0,
  )
const nextHuVehicle = vehicles
  .filter(
  (vehicle) =>
    vehicle.nextHu &&
    vehicle.category.trim() === 'Freizeit',
)
  .map((vehicle) => {
    const [month, year] = vehicle.nextHu!.split('/')

    return {
      vehicle,
      sortValue: Number(`${year}${month.padStart(2, '0')}`),
    }
  })
  .filter((entry) => !Number.isNaN(entry.sortValue))
  .sort((a, b) => a.sortValue - b.sortValue)[0]
const filteredWorkTotal = filteredWorkEntries.reduce(
  (sum, entry) =>
    sum +
    entry.partsCost +
    entry.laborCost +
    entry.otherCost,
  0,
)
  const workshopCount = selectedWorkEntries.filter(
    (entry) => entry.type === 'Werkstatt',
  ).length

  const ownWorkCount = selectedWorkEntries.filter(
    (entry) => entry.type === 'Eigenarbeit',
  ).length

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)

  const parseCost = (value: string) => {
    if (!value.trim()) {
      return 0
    }

    const number = Number(value.replace(',', '.'))
    return Number.isNaN(number) ? 0 : number
  }

  const resetWorkForm = () => {
    setEditingWorkId(null)
    setWorkType('Eigenarbeit')
    setWorkDate(todayLocal())
    setWorkMileage('')
    setWorkTitle('')
    setWorkDescription('')
    setWorkWorkshop('')
    setWorkPartsCost('')
    setWorkLaborCost('')
    setWorkOtherCost('')
  }

 const findLinkedMileageEntry = async (workEntry: WorkEntry) => {
  if (workEntry.mileage === null) {
    return undefined
  }

  const entries = await db.mileageEntries
    .where('vehicleId')
    .equals(workEntry.vehicleId)
    .toArray()

  const directlyLinkedEntry = entries.find(
    (entry) => entry.workEntryId === workEntry.id,
  )

  if (directlyLinkedEntry) {
    return directlyLinkedEntry
  }

  return entries.find(
    (entry) =>
      !entry.workEntryId &&
      entry.date === workEntry.date &&
      entry.mileage === workEntry.mileage &&
      entry.source === workEntry.type &&
      entry.note === workEntry.title,
  )
}

/* HIER KOMMT DER NEUE CODE HIN */

const resetMileageForm = () => {
  setEditingMileageId(null)
  setMileageInput('')
  setMileageDate(todayLocal())
  setMileageSource('')
  setMileageNote('')
}

const getLinkedWorkEntryForMileage = (
  
  mileageEntry: MileageEntry,
) => {
  if (mileageEntry.workEntryId) {
    return workEntries.find(
      (workEntry) =>
        workEntry.id === mileageEntry.workEntryId,
    )
  }

  return workEntries.find(
    (workEntry) =>
      workEntry.vehicleId === mileageEntry.vehicleId &&
      workEntry.mileage !== null &&
      workEntry.date === mileageEntry.date &&
      workEntry.mileage === mileageEntry.mileage &&
      workEntry.type === mileageEntry.source &&
      workEntry.title === mileageEntry.note,
  )
}
const getMileageEntryCost = (
  mileageEntry: MileageEntry,
) => {
  const linkedWorkEntry =
    getLinkedWorkEntryForMileage(mileageEntry)

  if (!linkedWorkEntry) {
    return null
  }

  return (
    linkedWorkEntry.partsCost +
    linkedWorkEntry.laborCost +
    linkedWorkEntry.otherCost
  )
}
const getLinkedTripEntryForMileage = (
  mileageEntry: MileageEntry,
) => {
  if (!mileageEntry.tripEntryId) {
    return undefined
  }

  return tripEntries.find(
    (tripEntry) =>
      tripEntry.id === mileageEntry.tripEntryId,
  )
}
const startEditingWork = (entry: WorkEntry) => {
  setIsEditing(false)
setIsMileageFormOpen(false)
setIsTripFormOpen(false)
  setEditingWorkId(entry.id)
  setWorkType(entry.type)
  setWorkDate(entry.date)

  setWorkMileage(
    entry.mileage !== null ? String(entry.mileage) : '',
  )

  setWorkTitle(entry.title)
  setWorkDescription(entry.description)
  setWorkWorkshop(entry.workshop)

  setWorkPartsCost(
    entry.partsCost !== 0 ? toInputNumber(entry.partsCost) : '',
  )

  setWorkLaborCost(
    entry.laborCost !== 0 ? toInputNumber(entry.laborCost) : '',
  )

  setWorkOtherCost(
    entry.otherCost !== 0 ? toInputNumber(entry.otherCost) : '',
  )

  setIsWorkFormOpen(true)

setTimeout(() => {
  document
    .getElementById('work-form')
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
}, 0)
}
const startEditingMileage = (
  mileageEntry: MileageEntry,
) => {
  setIsEditing(false)
setIsWorkFormOpen(false)
setIsTripFormOpen(false)
  const linkedWorkEntry =
    getLinkedWorkEntryForMileage(mileageEntry)

  if (linkedWorkEntry) {
    setIsMileageFormOpen(false)
    startEditingWork(linkedWorkEntry)
    return
  }
  const linkedTripEntry =
  getLinkedTripEntryForMileage(mileageEntry)

if (linkedTripEntry) {
  setIsMileageFormOpen(false)
  startEditingTrip(linkedTripEntry)
  return
}

  setEditingMileageId(mileageEntry.id)
  setMileageDate(mileageEntry.date)
  setMileageInput(String(mileageEntry.mileage))
  setMileageSource(mileageEntry.source)
  setMileageNote(mileageEntry.note)
  setIsMileageFormOpen(true)
}
setTimeout(() => {
  document.getElementById('event-form')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}, 0)
  const saveMileageEntry = async () => {
  if (!selectedVehicle || !mileageInput || !mileageSource) {
    return
  }

  const mileage = Number(mileageInput)

  if (Number.isNaN(mileage) || mileage < 0) {
    return
  }

  if (editingMileageId) {
    const existingEntry =
      await db.mileageEntries.get(editingMileageId)

    if (!existingEntry) {
      return
    }

    const linkedWorkEntry =
      getLinkedWorkEntryForMileage(existingEntry)

    if (linkedWorkEntry) {
      setIsMileageFormOpen(false)
      startEditingWork(linkedWorkEntry)
      return
    }

    const updatedEntry: MileageEntry = {
      ...existingEntry,
      date: mileageDate,
      mileage,
      source: mileageSource,
      note: mileageNote.trim(),
    }

    await db.mileageEntries.put(updatedEntry)

    setMileageHistory((currentHistory) =>
      currentHistory.map((entry) =>
        entry.id === updatedEntry.id
          ? updatedEntry
          : entry,
      ),
    )
  } else {
    const newEntry: MileageEntry = {
      id: crypto.randomUUID(),
      vehicleId: selectedVehicle.id,
      date: mileageDate,
      mileage,
      source: mileageSource,
      note: mileageNote.trim(),
    }

    await db.mileageEntries.add(newEntry)

    setMileageHistory((currentHistory) => [
      ...currentHistory,
      newEntry,
    ])
  }

  resetMileageForm()
  setIsMileageFormOpen(false)
}
const deleteMileageEntry = async (
  mileageEntry: MileageEntry,
) => {
  const linkedWorkEntry =
    getLinkedWorkEntryForMileage(mileageEntry)

  if (linkedWorkEntry) {
    window.alert(
      'Dieser Kilometerstand gehört zu einem Werkstatt- oder Eigenarbeits-Eintrag. Bitte bearbeite oder lösche den zugehörigen Arbeitseintrag.',
    )
    return
  }
  const linkedTripEntry =
  getLinkedTripEntryForMileage(mileageEntry)

if (linkedTripEntry) {
  window.alert(
    'Dieser Kilometerstand gehört zu einer Fahrt. Bitte bearbeite oder lösche die zugehörige Fahrt.',
  )
  return
}

  const confirmed = window.confirm(
    `${mileageEntry.mileage.toLocaleString(
      'de-DE',
    )} km wirklich aus der Kilometer-Historie löschen?`,
  )

  if (!confirmed) {
    return
  }

  await db.mileageEntries.delete(mileageEntry.id)

  setMileageHistory((currentHistory) =>
    currentHistory.filter(
      (entry) => entry.id !== mileageEntry.id,
    ),
  )

  if (editingMileageId === mileageEntry.id) {
    resetMileageForm()
    setIsMileageFormOpen(false)
  }
}
const resetTripForm = () => {
  setEditingTripId(null)
  setTripDate(todayLocal())
  setTripStartMileage(
  latestMileage !== null ? String(latestMileage) : '',
)
  setTripEndMileage('')
  setTripStartLocation('')
  setTripDestination('')
  setTripNote('')
}
const startEditingTrip = (entry: TripEntry) => {
  setIsEditing(false)
setIsMileageFormOpen(false)
setIsWorkFormOpen(false)
  setEditingTripId(entry.id)
  setTripDate(entry.date)
  setTripStartMileage(String(entry.startMileage))
  setTripEndMileage(String(entry.endMileage))
  setTripStartLocation(entry.startLocation)
  setTripDestination(entry.destination)
  setTripNote(entry.note)
  setIsTripFormOpen(true)
}
const deleteTripEntry = async (entry: TripEntry) => {
  const confirmed = window.confirm(
    'Diese Fahrt wirklich löschen?',
  )

  if (!confirmed) {
    return
  }

  const linkedMileageEntry =
  await findLinkedMileageEntryForTrip(entry)

if (linkedMileageEntry) {
  await db.mileageEntries.delete(linkedMileageEntry.id)

  setMileageHistory((currentHistory) =>
    currentHistory.filter(
      (mileageEntry) =>
        mileageEntry.id !== linkedMileageEntry.id,
    ),
  )
}
  await db.tripEntries.delete(entry.id)

  setTripEntries((currentEntries) =>
    currentEntries.filter(
      (tripEntry) => tripEntry.id !== entry.id,
    ),
  )
}
const findLinkedMileageEntryForTrip = async (
  tripEntry: TripEntry,
) => {
  const entries = await db.mileageEntries
    .where('vehicleId')
    .equals(tripEntry.vehicleId)
    .toArray()

  return entries.find(
    (entry) => entry.tripEntryId === tripEntry.id,
  )
}
const saveTripEntry = async () => {
  if (
  !selectedVehicle ||
  !tripDate ||
  (selectedVehicle.category !== 'Wohnwagen' &&
    !tripStartMileage) ||
  !tripEndMileage
) {
    return
  }

  const startMileage =
  selectedVehicle.category === 'Wohnwagen'
    ? 0
    : Number(tripStartMileage)
  const endMileage = Number(tripEndMileage)
if (
  selectedVehicle.category !== 'Wohnwagen' &&
  !editingTripId &&
  latestMileage !== null &&
  startMileage < latestMileage
) {
  window.alert(
    'Der Start-Kilometerstand darf nicht unter dem aktuell bekannten Kilometerstand liegen.',
  )
  return
}
if (endMileage < startMileage) {
  window.alert(
    'Der End-Kilometerstand darf nicht kleiner als der Start-Kilometerstand sein.',
  )
  return
}
  if (
    Number.isNaN(startMileage) ||
    Number.isNaN(endMileage) ||
    startMileage < 0 ||
    endMileage < startMileage
  ) {
    return
  }

  const newEntry: TripEntry = {
    id: editingTripId ?? crypto.randomUUID(),
    vehicleId: selectedVehicle.id,
    date: tripDate,
    startMileage,
    endMileage,
    startLocation: tripStartLocation.trim(),
    destination: tripDestination.trim(),
    note: tripNote.trim(),
  }

  if (editingTripId) {
  await db.tripEntries.put(newEntry)

  setTripEntries((currentEntries) =>
  currentEntries.map((entry) =>
    entry.id === editingTripId
      ? newEntry
      : entry,
  ),
)

const linkedMileageEntry =
  await findLinkedMileageEntryForTrip(newEntry)

const mileageNote =
  tripNote.trim() ||
  [tripStartLocation.trim(), tripDestination.trim()]
    .filter(Boolean)
    .join(' → ') ||
  'Fahrt'

if (
  selectedVehicle.category !== 'Wohnwagen' &&
  linkedMileageEntry
) {
  const updatedMileageEntry: MileageEntry = {
    ...linkedMileageEntry,
    date: tripDate,
    mileage: endMileage,
    source: 'Fahrt',
    note: mileageNote,
    tripEntryId: newEntry.id,
  }

  await db.mileageEntries.put(updatedMileageEntry)

  setMileageHistory((currentHistory) =>
    currentHistory.map((entry) =>
      entry.id === updatedMileageEntry.id
        ? updatedMileageEntry
        : entry,
    ),
  )
} else if (
  selectedVehicle.category !== 'Wohnwagen'
) {
  const newMileageEntry: MileageEntry = {
    id: crypto.randomUUID(),
    vehicleId: selectedVehicle.id,
    date: tripDate,
    mileage: endMileage,
    source: 'Fahrt',
    note: mileageNote,
    tripEntryId: newEntry.id,
  }

  await db.mileageEntries.add(newMileageEntry)

  setMileageHistory((currentHistory) => [
    ...currentHistory,
    newMileageEntry,
  ])
}
} else {
  await db.tripEntries.add(newEntry)

  setTripEntries((currentEntries) => [
    ...currentEntries,
    newEntry,
  ])
  const newMileageEntry: MileageEntry = {
  id: crypto.randomUUID(),
  vehicleId: selectedVehicle.id,
  date: tripDate,
  mileage: endMileage,
  source: 'Fahrt',
  note:
    [
      tripStartLocation.trim(),
      tripDestination.trim(),
    ]
      .filter(Boolean)
      .join(' → ') || 'Fahrt',
  tripEntryId: newEntry.id,
}

await db.mileageEntries.add(newMileageEntry)

setMileageHistory((currentHistory) => [
  ...currentHistory,
  newMileageEntry,
])
}
  setEditingTripId(null)
  setTripDate(todayLocal())
  setTripStartMileage('')
  setTripEndMileage('')
  setTripStartLocation('')
  setTripDestination('')
  setTripNote('')
  setIsTripFormOpen(false)
}
const saveFuelEntry = async () => {
  if (
    !selectedVehicle ||
    !fuelDate ||
    !fuelMileage ||
    !fuelLiters ||
    !fuelTotalCost ||
    !fuelPricePerLiter ||
    !fuelType
  ) {
    return
  }

 const mileage = Number(fuelMileage)

if (
  Number.isNaN(mileage) ||
  mileage < 0 ||
  (!editingFuelId &&
    latestMileage !== null &&
    mileage < latestMileage)
) {
  window.alert(
    'Der Kilometerstand darf nicht unter dem aktuell bekannten Kilometerstand liegen.',
  )
  return
}
  const newFuelEntry: FuelEntry = {
   id: editingFuelId ?? crypto.randomUUID(),
    vehicleId: selectedVehicle.id,
    date: fuelDate,
    mileage,
    liters: Number(fuelLiters.replace(',', '.')),
    totalCost: Number(fuelTotalCost.replace(',', '.')),
    pricePerLiter: Number(
      fuelPricePerLiter.replace(',', '.'),
    ),
    fuelType,
    fullTank: fuelFullTank,
    note: fuelNote.trim(),
  }
  await db.fuelEntries.put(newFuelEntry)

const updatedFuelEntries =
  await db.fuelEntries.toArray()

setFuelEntries(updatedFuelEntries)
  setFuelDate(todayLocal())
setFuelMileage('')
setFuelLiters('')
setFuelTotalCost('')
setFuelPricePerLiter('')
setFuelType('')
setFuelFullTank(false)
setFuelNote('')
setEditingFuelId(null)
setIsFuelFormOpen(false)

}  
const startEditingFuel = (entry: FuelEntry) => {
  setIsEditing(false)
  setIsMileageFormOpen(false)
  setIsWorkFormOpen(false)
  setIsTripFormOpen(false)

  setEditingFuelId(entry.id)
  setFuelDate(entry.date)
  setFuelMileage(String(entry.mileage))
  setFuelLiters(toInputNumber(entry.liters))
  setFuelTotalCost(String(entry.totalCost))
  setFuelPricePerLiter(toInputNumber(entry.pricePerLiter))
  setFuelType(entry.fuelType)
  setFuelFullTank(entry.fullTank)
  setFuelNote(entry.note)
  setIsFuelFormOpen(true)
}
const deleteFuelEntry = async (entry: FuelEntry) => {
  const confirmed = window.confirm(
    `Tankvorgang bei ${entry.mileage.toLocaleString(
      'de-DE',
    )} km wirklich löschen?`,
  )

  if (!confirmed) {
    return
  }

  await db.fuelEntries.delete(entry.id)

  const updatedFuelEntries =
    await db.fuelEntries.toArray()

  setFuelEntries(updatedFuelEntries)
}
const saveVehicleChanges = async () => {
    if (!selectedVehicle) {
      return
    }

    const updatedVehicle: VehicleRecord = {
      ...selectedVehicle,
      manufacturer: editManufacturer.trim(),
      model: editModel.trim(),
      year: editYear ? Number(editYear) : null,
      firstRegistration: editFirstRegistration.trim() || null,
      licensePlate: editLicensePlate.trim() || null,
      nextHu: editNextHu.trim() || null,
      nextGasInspection: editNextGasInspection.trim() || null,
      photo: editPhoto || undefined,
    }

    await db.vehicles.put(updatedVehicle)

    setVehicles((currentVehicles) =>
      currentVehicles.map((vehicle) =>
        vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
      ),
    )

    setSelectedVehicle(updatedVehicle)
    setIsEditing(false)
  }


  const saveWorkEntry = async () => {
    if (!selectedVehicle || !workTitle.trim()) {
      return
    }

    const mileage = workMileage ? Number(workMileage) : null

    if (
      mileage !== null &&
      (Number.isNaN(mileage) || mileage < 0)
    ) {
      return
    }

    const workData = {
      vehicleId: selectedVehicle.id,
      date: workDate,
      mileage,
      type: workType,
      title: workTitle.trim(),
      description: workDescription.trim(),
      workshop:
        workType === 'Werkstatt' ? workWorkshop.trim() : '',
      partsCost: parseCost(workPartsCost),
      laborCost: parseCost(workLaborCost),
      otherCost: parseCost(workOtherCost),
    }

    if (editingWorkId) {
      const oldEntry = await db.workEntries.get(editingWorkId)

      if (!oldEntry) {
        return
      }

      const linkedMileageEntry =
        await findLinkedMileageEntry(oldEntry)

      const updatedEntry: WorkEntry = {
        id: editingWorkId,
        ...workData,
      }

      await db.workEntries.put(updatedEntry)

      setWorkEntries((currentEntries) =>
        currentEntries.map((entry) =>
          entry.id === editingWorkId ? updatedEntry : entry,
        ),
      )

      if (mileage !== null) {
        if (linkedMileageEntry) {
          const updatedMileageEntry: MileageEntry = {
            ...linkedMileageEntry,
            date: workDate,
            mileage,
            source: workType,
            note: workTitle.trim(),
            workEntryId: updatedEntry.id,
          }

          await db.mileageEntries.put(updatedMileageEntry)

          setMileageHistory((currentHistory) =>
            currentHistory.map((entry) =>
              entry.id === updatedMileageEntry.id
                ? updatedMileageEntry
                : entry,
            ),
          )
        } else {
          const newMileageEntry: MileageEntry = {
            id: crypto.randomUUID(),
            vehicleId: selectedVehicle.id,
            date: workDate,
            mileage,
            source: workType,
            note: workTitle.trim(),
            workEntryId: updatedEntry.id,
          }

          await db.mileageEntries.add(newMileageEntry)

          setMileageHistory((currentHistory) => [
            ...currentHistory,
            newMileageEntry,
          ])
        }
      } else if (linkedMileageEntry) {
        await db.mileageEntries.delete(linkedMileageEntry.id)

        setMileageHistory((currentHistory) =>
          currentHistory.filter(
            (entry) => entry.id !== linkedMileageEntry.id,
          ),
        )
      }
    } else {
      const newWorkEntry: WorkEntry = {
        id: crypto.randomUUID(),
        ...workData,
      }

      await db.workEntries.add(newWorkEntry)

      setWorkEntries((currentEntries) => [
        ...currentEntries,
        newWorkEntry,
      ])

      if (mileage !== null) {
        const mileageEntry: MileageEntry = {
          id: crypto.randomUUID(),
          vehicleId: selectedVehicle.id,
          date: workDate,
          mileage,
          source: workType,
          note: workTitle.trim(),
          workEntryId: newWorkEntry.id,
        }

        await db.mileageEntries.add(mileageEntry)

        setMileageHistory((currentHistory) => [
          ...currentHistory,
          mileageEntry,
        ])
      }
    }

    resetWorkForm()
    setIsWorkFormOpen(false)
  }
  const savePurchaseEntry = async () => {
  if (
    !selectedVehicle ||
    !purchaseDate ||
    !purchaseTitle.trim()
  ) {
    return
  }

  const newPurchaseEntry: PurchaseEntry = {
    id: editingPurchaseId ?? crypto.randomUUID(),
    vehicleId: selectedVehicle.id,
    date: purchaseDate,
    title: purchaseTitle.trim(),
    items: purchaseItems.trim(),
    cost: parseCost(purchaseCost),
    vendor: purchaseVendor.trim(),
    note: purchaseNote.trim(),
  }

  await db.purchaseEntries.put(newPurchaseEntry)

  setPurchaseEntries((currentEntries) =>
  editingPurchaseId
    ? currentEntries.map((entry) =>
        entry.id === editingPurchaseId
          ? newPurchaseEntry
          : entry,
      )
    : [...currentEntries, newPurchaseEntry],
)

  setPurchaseDate(todayLocal())
  setPurchaseTitle('')
  setPurchaseItems('')
  setPurchaseCost('')
  setPurchaseVendor('')
  setPurchaseNote('')
  setEditingPurchaseId(null)
  setIsPurchaseFormOpen(false)
}
const startEditingPurchase = (entry: PurchaseEntry) => {
  setEditingPurchaseId(entry.id)
  setPurchaseDate(entry.date)
  setPurchaseTitle(entry.title)
  setPurchaseItems(entry.items)
  setPurchaseCost(toInputNumber(entry.cost))
  setPurchaseVendor(entry.vendor)
  setPurchaseNote(entry.note)

  setIsEditing(false)
  setIsMileageFormOpen(false)
  setIsWorkFormOpen(false)
  setIsTripFormOpen(false)
  setIsFuelFormOpen(false)
  setIsPurchaseFormOpen(true)
  setTimeout(() => {
  document
    .getElementById('purchase-form')
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
}, 0)
}
const deletePurchaseEntry = async (entry: PurchaseEntry) => {
  const confirmed = window.confirm(
    `Anschaffung „${entry.title}“ wirklich löschen?`,
  )

  if (!confirmed) {
    return
  }

  await db.purchaseEntries.delete(entry.id)

  setPurchaseEntries((currentEntries) =>
    currentEntries.filter(
      (currentEntry) => currentEntry.id !== entry.id,
    ),
  )
}
  const deleteWorkEntry = async (entry: WorkEntry) => {
    const confirmed = window.confirm(
      `Eintrag „${entry.title}“ wirklich löschen?`,
    )

    if (!confirmed) {
      return
    }

    const linkedMileageEntry =
      await findLinkedMileageEntry(entry)

    await db.workEntries.delete(entry.id)

    setWorkEntries((currentEntries) =>
      currentEntries.filter(
        (currentEntry) => currentEntry.id !== entry.id,
      ),
    )

    if (linkedMileageEntry) {
      await db.mileageEntries.delete(linkedMileageEntry.id)

      setMileageHistory((currentHistory) =>
        currentHistory.filter(
          (mileageEntry) =>
            mileageEntry.id !== linkedMileageEntry.id,
        ),
      )
    }

    if (editingWorkId === entry.id) {
      resetWorkForm()
      setIsWorkFormOpen(false)
    }
  }

  if (selectedVehicle) {
    return (
      <main className="app">
       <button
  className="back-button"
  onClick={() => {
    setIsEditing(false)

    setIsMileageFormOpen(false)
    resetMileageForm()

    setIsWorkFormOpen(false)
    resetWorkForm()

    setIsTripFormOpen(false)
    resetTripForm()

    setSelectedVehicle(null)
  }}
>
  ← Zurück
</button>

        <section className="detail-header">
          <div className="detail-icon">
  {selectedVehicle.photo ? (
    <img
      src={selectedVehicle.photo}
      alt={selectedVehicle.name}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
        display: 'block',
      }}
    />
  ) : (
    selectedVehicle.icon
  )}
</div>

          <div>
            <p className="eyebrow">
              {selectedVehicle.category}
            </p>

            <h1>{selectedVehicle.name}</h1>

            <p className="welcome">
              {selectedVehicle.description}
            </p>
          </div>
        </section>

        <section className="vehicle-data">
          <h2>Fahrzeugdaten</h2>

          <div className="vehicle-data-grid">
            <div>
              <span>Hersteller</span>
              <strong>
                {selectedVehicle.manufacturer}
              </strong>
            </div>

            <div>
              <span>Modell</span>
              <strong>{selectedVehicle.model}</strong>
            </div>

            <div>
              <span>Baujahr</span>
              <strong>
                {selectedVehicle.year ??
                  'Noch nicht eingetragen'}
              </strong>
            </div>

            <div>
              <span>Erstzulassung</span>
              <strong>
                {selectedVehicle.firstRegistration ??
                  'Noch nicht eingetragen'}
              </strong>
            </div>

            <div>
              <span>Kennzeichen</span>
              <strong>
                {selectedVehicle.licensePlate ??
                  'Noch nicht eingetragen'}
              </strong>
            </div>

           {selectedVehicle.category !== 'Wohnwagen' && (
  <div>
    <span>Kilometerstand</span>
    <strong>
      {latestMileage !== null
        ? `${latestMileage.toLocaleString(
            'de-DE',
          )} km`
        : 'Noch nicht eingetragen'}
    </strong>
  </div>
)}
  <div
  style={{
    gridColumn:
      selectedVehicle.category === 'Wohnwagen'
        ? 'auto'
        : '1 / -1',
  }}
>
  <span>
  {selectedVehicle.category === 'Wohnwagen'
    ? 'HU & Gasprüfung'
    : 'Nächste HU'}
</span>
  <strong>
    {selectedVehicle.category === 'Wohnwagen'
  ? selectedVehicle.nextHu ??
    selectedVehicle.nextGasInspection ??
    'Noch nicht eingetragen'
  : selectedVehicle.nextHu ??
    'Noch nicht eingetragen'}
  </strong>
</div>

          </div>
        </section>

        <section className="vehicle-data">
          <h2>Kosten & Auswertung</h2>

          <div className="vehicle-data-grid">



<div className="cost-filter-card">
  <span>Kosten pro Jahr</span>
  <select
    value={costYear}
    onChange={(event) => {
  const newYear = event.target.value
  setCostYear(newYear)

  if (newYear === 'all') {
    setCostMonth('all')
  }
}}
    >
    <option value="all">Alle Jahre</option>
   {Array.from(
  new Set([
    String(new Date().getFullYear()),
    ...selectedFuelEntries.map(
      (entry) => entry.date.slice(0, 4),
    ),
    ...selectedWorkEntries.map(
      (entry) => entry.date.slice(0, 4),
    ),
  ]),
)
  .sort((a, b) => b.localeCompare(a))
  .map((year) => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
  </select>
</div>
<div className="cost-filter-card">
  <span>Kosten pro Monat</span>
  <select
    value={costMonth}
    disabled={costYear === 'all'}
    onChange={(event) =>
      setCostMonth(event.target.value)
    }
  >
    <option value="all">Ganzes Jahr</option>
    <option value="01">Januar</option>
    <option value="02">Februar</option>
    <option value="03">März</option>
    <option value="04">April</option>
    <option value="05">Mai</option>
    <option value="06">Juni</option>
    <option value="07">Juli</option>
    <option value="08">August</option>
    <option value="09">September</option>
    <option value="10">Oktober</option>
    <option value="11">November</option>
    <option value="12">Dezember</option>
  </select>
</div>

<div>
  <span>Erfasste Gesamtkosten</span>
  <strong>
  {formatCurrency(
   selectedVehicle.category === 'Wohnwagen'
  ? filteredWorkTotal + filteredPurchaseTotal
  : filteredWorkTotal + filteredFuelTotal,
  )}
</strong>
</div>
{selectedVehicle.category !== 'Wohnwagen' && (
  <div>
    <span>Tankkosten</span>
    <strong>
      {formatCurrency(filteredFuelTotal)}
    </strong>
  </div>
)}
<div>
  <span>Werkstattkosten</span>
  <strong>
  {formatCurrency(filteredWorkTotal)}
</strong>
</div>
{selectedVehicle.category.trim() === 'Wohnwagen' && (
  <div>
    <span>Anschaffungskosten</span>
    <strong>
      {formatCurrency(filteredPurchaseTotal)}
    </strong>
  </div>
)}


            

           
          </div>
        </section>
 <button
          className={`edit-button vehicle-edit-button ${
  isEditing ? 'edit-button-active' : ''
}`}
          onClick={() => {
            if (!isEditing) {
              setEditManufacturer(
                selectedVehicle.manufacturer,
              )

              setEditModel(selectedVehicle.model)

              setEditYear(
                selectedVehicle.year !== null
                  ? String(selectedVehicle.year)
                  : '',
              )

              setEditFirstRegistration(
                selectedVehicle.firstRegistration ?? '',
              )

              setEditLicensePlate(
                selectedVehicle.licensePlate ?? '',
              )

              setEditNextHu(
                selectedVehicle.nextHu ?? '',
              )

              setEditNextGasInspection(
                selectedVehicle.nextGasInspection ?? '',
              )
              setEditPhoto(selectedVehicle.photo ?? '')
            }

            setIsEditing(!isEditing)
          }}
        >
          {isEditing
  ? 'Fahrzeugdaten schließen'
  : 'Fahrzeugdaten bearbeiten'}
</button>
        {isEditing && (
          <section className="edit-area">
            <h2>Fahrzeugdaten bearbeiten</h2>
<label>
  Fahrzeugfoto
  <input
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditPhoto(reader.result)
        }
      }

      reader.readAsDataURL(file)
    }}
  />
  {editPhoto && (
  <>
    <img
      src={editPhoto}
      alt="Fahrzeugvorschau"
      style={{
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '16px',
        marginTop: '12px',
      }}
    />

    <button
      type="button"
      className="entry-delete-button"
      onClick={() => setEditPhoto('')}
    >
      Foto entfernen
    </button>
  </>
)}
</label>
            <label>
              Hersteller
              <input
                type="text"
                value={editManufacturer}
                onChange={(event) =>
                  setEditManufacturer(event.target.value)
                }
              />
            </label>

            <label>
              Modell
              <input
                type="text"
                value={editModel}
                onChange={(event) =>
                  setEditModel(event.target.value)
                }
              />
            </label>

            <label>
              Baujahr
              <input
                type="number"
                inputMode="numeric"
                value={editYear}
                onChange={(event) =>
                  setEditYear(event.target.value)
                }
              />
            </label>

            <label>
              Erstzulassung
              <input
                type="text"
                placeholder="z. B. 05/2018"
                value={editFirstRegistration}
                onChange={(event) =>
                  setEditFirstRegistration(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Kennzeichen
              <input
                type="text"
                value={editLicensePlate}
                onChange={(event) =>
                  setEditLicensePlate(event.target.value)
                }
              />
            </label>

            <label>
              Nächste HU
              <input
                type="text"
                placeholder="z. B. 05/2027"
                value={editNextHu}
                onChange={(event) =>
                  setEditNextHu(event.target.value)
                }
              />
            </label>

            {selectedVehicle.category === 'Wohnwagen' && (
              <label>
                Nächste Gasprüfung
                <input
                  type="text"
                  placeholder="z. B. 06/2027"
                  value={editNextGasInspection}
                  onChange={(event) =>
                    setEditNextGasInspection(
                      event.target.value,
                    )
                  }
                />
              </label>
            )}

            <button
              className="primary-action"
              onClick={saveVehicleChanges}
            >
              Fahrzeugdaten speichern
            </button>
          </section>
        )}
        {selectedVehicle.category.trim() !== 'Wohnwagen' && (
        <button
        className={`edit-button action-button ${
  isMileageFormOpen ? 'edit-button-active' : ''
}`}
         onClick={() => {
  if (!isMileageFormOpen) {
    setIsEditing(false)
    setIsWorkFormOpen(false)
    setIsTripFormOpen(false)
  }

  setIsMileageFormOpen(!isMileageFormOpen)
}}
        >
         {isMileageFormOpen
  ? 'Ereignis schließen'
  : '+ Ereignis hinzufügen'}
        </button>
)}
        {isMileageFormOpen && (
          <section
  id="event-form"
  className="edit-area"
>
            <h2>Ereignis eintragen</h2>

            <label>
              Datum
              <input
                type="date"
                value={mileageDate}
                onChange={(event) =>
                  setMileageDate(event.target.value)
                }
              />
            </label>

            <label>
              Kilometerstand
              <input
                type="number"
                inputMode="numeric"
                placeholder="z. B. 24850"
                value={mileageInput}
                onChange={(event) =>
                  setMileageInput(event.target.value)
                }
              />
            </label>

            <label>
  Art des Ereignisses
  <select
    value={mileageSource}
    onChange={(event) =>
      setMileageSource(
        event.target.value as MileageSource,
      )
    }
  >
    <option value="" disabled>
  Bitte auswählen …
</option>
    <option value="Manuell">
      Sonstiges
    </option>

    <option value="HU">
      HU / TÜV
    </option>

    <option value="Service">
      Service
    </option>
  </select>
</label>

            <label>
              Bezeichnung / Notiz
              <textarea
                placeholder="z. B. HU bestanden, Inspektion durchgeführt"
                value={mileageNote}
                onChange={(event) =>
                  setMileageNote(event.target.value)
                }
              />
            </label>

            <button
              className="primary-action"
              onClick={saveMileageEntry}
            >
              Ereignis speichern
            </button>
          </section>
        )}

        <button
          className="edit-button action-button"
         onClick={() => {
  if (isWorkFormOpen) {
    setIsWorkFormOpen(false)
    resetWorkForm()
  } else {
    setIsEditing(false)
    setIsMileageFormOpen(false)
    setIsTripFormOpen(false)
    if (selectedVehicle.category.trim() === 'Wohnwagen') {
  setWorkType('Werkstatt')
}
    setIsWorkFormOpen(true)
  }
}}
        >
          {isWorkFormOpen
  ? selectedVehicle.category.trim() === 'Wohnwagen'
    ? 'Werkstatt schließen'
    : 'Werkstatt / Arbeit schließen'
  : selectedVehicle.category.trim() === 'Wohnwagen'
    ? '+ Werkstatt eintragen'
    : '+ Werkstatt / Arbeit eintragen'}
        </button>
        {selectedVehicle.category === 'Wohnwagen' && (
  <button
    className={`edit-button action-button ${
      isPurchaseFormOpen ? 'edit-button-active' : ''
    }`}
    onClick={() => {
      if (!isPurchaseFormOpen) {
        setIsEditing(false)
        setIsMileageFormOpen(false)
        setIsWorkFormOpen(false)
        setIsTripFormOpen(false)
        setIsFuelFormOpen(false)
      }

      setIsPurchaseFormOpen(!isPurchaseFormOpen)
    }}
  >
    {isPurchaseFormOpen
      ? 'Anschaffung schließen'
      : '+ Anschaffung eintragen'}
  </button>
)}
{selectedVehicle.category === 'Wohnwagen' &&
  isPurchaseFormOpen && (
    <section
  id="purchase-form"
  className="edit-area"
>
      <h2>Anschaffung eintragen</h2>

      <label>
  Datum
  <input
    type="date"
    value={purchaseDate}
    onChange={(event) =>
      setPurchaseDate(event.target.value)
    }
  />
</label>

<label>
  Bezeichnung
  <input
    type="text"
    value={purchaseTitle}
    onChange={(event) =>
      setPurchaseTitle(event.target.value)
    }
    placeholder="z. B. Zusatzheizung"
  />
</label>
<label>
  Teile / Artikel
  <input
    type="text"
    value={purchaseItems}
    onChange={(event) =>
      setPurchaseItems(event.target.value)
    }
    placeholder="z. B. Heizung, Montagesatz"
  />
</label>
<label>
  Kosten
  <input
    type="text"
    inputMode="decimal"
    min="0"
    value={purchaseCost}
    onChange={(event) =>
      setPurchaseCost(event.target.value)
    }
    placeholder="z. B. 429,00"
  />
</label>
<label>
  Händler / Bezugsquelle
  <input
    type="text"
    value={purchaseVendor}
    onChange={(event) =>
      setPurchaseVendor(event.target.value)
    }
    placeholder="z. B. Camping Wagner"
  />
  </label>
  <label>
  Bemerkung
  <textarea
    value={purchaseNote}
    onChange={(event) =>
      setPurchaseNote(event.target.value)
    }
    placeholder="Optional"
  />
</label>

<button
  className="primary-action"
  onClick={() => void savePurchaseEntry()}
>
  Anschaffung speichern
</button>
</section>
)}
{selectedVehicle.category !== 'Wohnwagen' && (
  <button
    className={`edit-button action-button ${
      isFuelFormOpen ? 'edit-button-active' : ''
    }`}
    onClick={() => {
      if (!isFuelFormOpen) {
        setIsEditing(false)
        setIsMileageFormOpen(false)
        setIsWorkFormOpen(false)
        setIsTripFormOpen(false)

        if (latestMileage !== null) {
          setFuelMileage(String(latestMileage))
        }
      }

      setIsFuelFormOpen(!isFuelFormOpen)
    }}
  >
    {isFuelFormOpen
      ? 'Tanken schließen'
      : '+ Tanken'}
  </button>
)}
    
{selectedVehicle.category !== 'Wohnwagen' &&
  isFuelFormOpen && (
  <section className="edit-area">
   <h2>
  {editingFuelId
    ? 'Tankvorgang bearbeiten'
    : 'Tankvorgang eintragen'}
</h2>
    <label>
  Datum
  <input
    type="date"
    value={fuelDate}
    onChange={(event) =>
      setFuelDate(event.target.value)
    }
  />
</label>

<label>
  Kilometerstand
  <input
    type="number"
    inputMode="numeric"
    placeholder="z. B. 123456"
    value={fuelMileage}
    onChange={(event) =>
      setFuelMileage(event.target.value)
    }
  />
</label>
<label>
  Liter
  <input
    type="text"
    inputMode="decimal"
    placeholder="z. B. 42,5"
    value={fuelLiters}
    onChange={(event) =>
      setFuelLiters(event.target.value)
    }
  />
</label>
<label>
  Gesamtkosten
  <input
    type="text"
    placeholder="Wird automatisch berechnet"
    value={
      fuelTotalCost
        ? `${fuelTotalCost.replace('.', ',')} €`
        : ''
    }
    readOnly
  />
</label>
<label>
  Preis pro Liter
  <input
    type="text"
    inputMode="decimal"
    placeholder="z. B. 2,699"
    value={fuelPricePerLiter}
    onChange={(event) =>
      setFuelPricePerLiter(event.target.value)
    }
  />
</label>
<label>
  Kraftstoffart
  <select
    value={fuelType}
    onChange={(event) =>
      setFuelType(event.target.value)
    }
  >
    <option value="">Bitte auswählen …</option>
    <option value="Super E5">Super E5</option>
    <option value="Super E10">Super E10</option>
    <option value="Super Plus">Super Plus</option>
    <option value="Diesel">Diesel</option>
    <option value="2-Takt-Gemisch">2-Takt-Gemisch</option>
    <option value="Sonstiges">Sonstiges</option>
  </select>
</label>
<label>
  <input
    type="checkbox"
    checked={fuelFullTank}
    onChange={(event) =>
      setFuelFullTank(event.target.checked)
    }
  />
  Vollgetankt
</label>
<label>
  Notiz
  <textarea
    placeholder="Optional"
    value={fuelNote}
    onChange={(event) =>
      setFuelNote(event.target.value)
    }
  />
</label>

<button
  className="primary-action"
  onClick={() => void saveFuelEntry()}
>
  Tankvorgang speichern
</button>
  </section>
)}
{selectedVehicle.category !== 'Wohnwagen' &&
  fuelEntries.filter(
    (entry) => entry.vehicleId === selectedVehicle.id,
  ).length > 0 && (
  <section className="mileage-history">
    <h2>Tank-Historie</h2>
    {latestFuelStats.consumption !== null &&
latestFuelStats.costPer100Km !== null ? (
 <p className="mileage-meta">
  <span>
    Verbrauch:{' '}
    {latestFuelStats.consumption.toLocaleString(
      'de-DE',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}{' '}
    l/100 km
  </span>

  <span className="fuel-cost-stat">
    {'Kosten: '}
    {formatCurrency(
      latestFuelStats.costPer100Km,
    )}{' '}
    / 100 km
  </span>
</p>
) : (
  <p className="mileage-meta">
    Verbrauch nach zwei Volltankungen verfügbar.
  </p>
)}

    <div className="mileage-list">
      {fuelEntries
        .filter(
          (entry) =>
            entry.vehicleId === selectedVehicle.id,
        )
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((entry) => (
          <article
            className="mileage-entry fuel-entry"
            key={entry.id}
          >
           <div className="mileage-entry-top">
  <strong>
    {entry.mileage.toLocaleString('de-DE')} km
  </strong>

  <span>
  {new Date(
    `${entry.date}T00:00:00`,
  ).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}
</span>
</div>

<p>
  {entry.liters.toLocaleString('de-DE')} Liter
</p>

            <p>
  {entry.pricePerLiter.toLocaleString('de-DE', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}{' '}
  €/Liter
</p>

            <p>
  <strong>
    Gesamt: {formatCurrency(entry.totalCost)}
  </strong>
</p>
<p>
  {entry.fuelType}
</p>
            {entry.fullTank && <p>Vollgetankt</p>}

            {entry.note && <p>{entry.note}</p>}
            <div className="entry-actions">
  <button
  className="entry-edit-button"
  onClick={() => startEditingFuel(entry)}
>
  Bearbeiten
</button>
  <button
    className="entry-delete-button"
    onClick={() => void deleteFuelEntry(entry)}
  >
    Löschen
  </button>
</div>
          </article>
        ))}
    </div>
  </section>
)}
        {isWorkFormOpen && (
          <section
  id="work-form"
  className="edit-area"
>
            <h2>
              {selectedVehicle.category.trim() === 'Wohnwagen'
  ? editingWorkId
    ? 'Werkstatt bearbeiten'
    : 'Werkstatt eintragen'
  : editingWorkId
    ? 'Werkstatt / Arbeit bearbeiten'
    : 'Werkstatt / Arbeit eintragen'}
            </h2>

            {selectedVehicle.category.trim() !== 'Wohnwagen' && (
  <label>
    Art
    <select
      value={workType}
      onChange={(event) =>
        setWorkType(
          event.target.value as WorkType,
        )
      }
    >
      <option value="Eigenarbeit">
        Eigenarbeit
      </option>

      <option value="Werkstatt">
        Werkstatt
      </option>
    </select>
  </label>
)}

            <label>
              Datum
              <input
                type="date"
                value={workDate}
                onChange={(event) =>
                  setWorkDate(event.target.value)
                }
              />
            </label>

           {selectedVehicle.category.trim() !== 'Wohnwagen' && (
  <label>
    Kilometerstand
    <input
      type="number"
      inputMode="numeric"
      placeholder="Optional"
      value={workMileage}
      onChange={(event) =>
        setWorkMileage(event.target.value)
      }
    />
  </label>
)}

            <label>
              Titel
              <input
                type="text"
                placeholder="z. B. Bremsen vorne erneuert"
                value={workTitle}
                onChange={(event) =>
                  setWorkTitle(event.target.value)
                }
              />
            </label>

            <label>
              Beschreibung / Bemerkung
              <textarea
                placeholder="Was wurde gemacht?"
                value={workDescription}
                onChange={(event) =>
                  setWorkDescription(event.target.value)
                }
              />
            </label>

            {workType === 'Werkstatt' && (
              <label>
                Werkstatt
                <input
                  type="text"
                  placeholder="Name der Werkstatt"
                  value={workWorkshop}
                  onChange={(event) =>
                    setWorkWorkshop(event.target.value)
                  }
                />
              </label>
            )}

            <label>
              Teilekosten
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={workPartsCost}
                onChange={(event) =>
                  setWorkPartsCost(event.target.value)
                }
              />
            </label>

            <label>
              Arbeitskosten
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={workLaborCost}
                onChange={(event) =>
                  setWorkLaborCost(event.target.value)
                }
              />
            </label>

            <label>
              Sonstige Kosten
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={workOtherCost}
                onChange={(event) =>
                  setWorkOtherCost(event.target.value)
                }
              />
            </label>

            <button
  className="primary-action"
  onClick={saveWorkEntry}
>
  {selectedVehicle.category.trim() === 'Wohnwagen'
  ? editingWorkId
    ? 'Änderungen speichern'
    : 'Werkstatt speichern'
  : editingWorkId
    ? 'Änderungen speichern'
    : 'Eintrag speichern'}
</button>
          </section>
        )}

        <section className="mileage-history">
         {(selectedVehicle.category === 'Freizeit' ||
  selectedVehicle.category === 'Wohnwagen') && (
  <section className="trip-history">
    <h2>
  {selectedVehicle.category === 'Wohnwagen'
    ? 'Reisen'
    : 'Fahrten'}
</h2>
    <p className="mileage-meta">
  {tripEntries.filter(
    (entry) => entry.vehicleId === selectedVehicle.id,
  ).length}{' '}
  {selectedVehicle.category === 'Wohnwagen'
  ? tripEntries.filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    ).length === 1
    ? 'Reise'
    : 'Reisen'
  : tripEntries.filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    ).length === 1
    ? 'Fahrt'
    : 'Fahrten'}{' · '}
  {tripEntries
    .filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    )
    .reduce(
      (sum, entry) =>
        sum + (entry.endMileage - entry.startMileage),
      0,
    )
    .toLocaleString('de-DE')}{' '}
  km gesamt
  {' · Ø '}
{tripEntries.filter(
  (entry) => entry.vehicleId === selectedVehicle.id,
).length > 0
  ? Math.round(
      tripEntries
        .filter(
          (entry) =>
            entry.vehicleId === selectedVehicle.id,
        )
        .reduce(
          (sum, entry) =>
            sum +
            (entry.endMileage - entry.startMileage),
          0,
        ) /
        tripEntries.filter(
          (entry) =>
            entry.vehicleId === selectedVehicle.id,
        ).length,
    ).toLocaleString('de-DE')
  : 0}{' '}
km/{selectedVehicle.category === 'Wohnwagen' ? 'Reise' : 'Fahrt'}
{' · längste '}
{Math.max(
  0,
  ...tripEntries
    .filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    )
    .map(
      (entry) =>
        entry.endMileage - entry.startMileage,
    ),
).toLocaleString('de-DE')}{' '}
km
</p>
<button
  className="trip-toggle-button action-button"
 onClick={() => {
  if (!isTripFormOpen) {
    setIsEditing(false)
    setIsMileageFormOpen(false)
    setIsWorkFormOpen(false)
  }

  resetTripForm()
  setIsTripFormOpen(!isTripFormOpen)
}}
>
  {isTripFormOpen
    ? 'Abbrechen'
   : selectedVehicle.category === 'Wohnwagen'
  ? '+ Reise hinzufügen'
  : '+ Fahrt hinzufügen'}
</button>

{isTripFormOpen && (
  <div className="trip-form">
    <label>
      Datum
      <input
        type="date"
        value={tripDate}
        onChange={(event) =>
          setTripDate(event.target.value)
        }
      />
    </label>
   {selectedVehicle.category !== 'Wohnwagen' && (
  <label>
    Start-km
    <input
      type="number"
      inputMode="numeric"
      min="0"
      value={tripStartMileage}
      onChange={(event) =>
        setTripStartMileage(event.target.value)
      }
      placeholder="z. B. 24850"
    />
  </label>
)}

<label>
  {selectedVehicle.category === 'Wohnwagen'
    ? 'Gefahrene Kilometer'
    : 'End-km'}
  <input
    type="number"
    inputMode="numeric"
    min="0"
    value={tripEndMileage}
    onChange={(event) =>
      setTripEndMileage(event.target.value)
    }
    placeholder={
      selectedVehicle.category === 'Wohnwagen'
        ? 'z. B. 3250'
        : 'z. B. 24923'
    }
  />
</label>

<label>
  Startort
  <input
    type="text"
    value={tripStartLocation}
    onChange={(event) =>
      setTripStartLocation(event.target.value)
    }
    placeholder="z. B. Hattingen"
  />
</label>

<label>
  Ziel
  <input
    type="text"
    value={tripDestination}
    onChange={(event) =>
      setTripDestination(event.target.value)
    }
    placeholder="z. B. Eifel"
  />
</label>

<label>
  Bemerkung
  <textarea
    value={tripNote}
    onChange={(event) =>
      setTripNote(event.target.value)
    }
    placeholder="z. B. Schöne Runde, kurzer Regenschauer"
  />
</label>
<button
  className="trip-save-button"
  onClick={() => void saveTripEntry()}
>
  {selectedVehicle.category === 'Wohnwagen'
  ? 'Reise speichern'
  : 'Fahrt speichern'}
</button>
  </div>
)}
    {tripEntries.filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    ).length === 0 ? (
     <p>
  {selectedVehicle.category === 'Wohnwagen'
    ? 'Noch keine Reisen eingetragen.'
    : 'Noch keine Fahrten eingetragen.'}
</p>
    ) : (
     null 
    )}
    {tripEntries
  .filter(
    (entry) =>
      entry.vehicleId === selectedVehicle.id,
  )
  .sort((a, b) =>
    b.date.localeCompare(a.date),
  )
  .map((entry, index) => (
  <div
  key={entry.id}
  className="trip-card"
>
    <div className="trip-card-header">
  <strong>
    {selectedVehicle.category === 'Wohnwagen' && (
  <>
    {tripEntries.filter(
      (trip) => trip.vehicleId === selectedVehicle.id,
    ).length - index}. Reise ·{' '}
  </>
)}
    {new Date(
  `${entry.date}T00:00:00`,
).toLocaleDateString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})}
  </strong>

  <span className="trip-distance">
    {(entry.endMileage - entry.startMileage).toLocaleString(
      'de-DE',
    )}{' '}
    km
  </span>
</div>

{(entry.startLocation || entry.destination) && (
  <p className="trip-route">
    {entry.startLocation || '–'}
    {' → '}
    {entry.destination || '–'}
  </p>
)}

<p className="trip-mileage">
  {selectedVehicle.category === 'Wohnwagen'
    ? `${(
        entry.endMileage - entry.startMileage
      ).toLocaleString('de-DE')} km gefahren`
    : `${entry.startMileage.toLocaleString(
        'de-DE',
      )} km → ${entry.endMileage.toLocaleString(
        'de-DE',
      )} km`}
</p>

{entry.note && (
  <p className="trip-note">
    <strong>Bemerkung:</strong> {entry.note}
  </p>
)}

<button
  className="trip-edit-button"
  onClick={() => startEditingTrip(entry)}
>
  Bearbeiten
</button>
<button
  className="trip-delete-button"
  onClick={() => void deleteTripEntry(entry)}
>
  Löschen
</button>
</div>
  ))}
  </section>
)}
{selectedVehicle.category.trim() !== 'Wohnwagen' && (
  <>
          <h2>Fahrzeug-Historie</h2>

          {visibleMileageHistory.length === 0 ? (
            <p className="empty-state">
              Noch keine Ereignisse eingetragen.
            </p>
          ) : (
            <div className="mileage-list">
              {visibleMileageHistory.map((entry) => (
                <article
                  className="mileage-entry"
                  key={entry.id}
                >
                  <div className="mileage-entry-top">
  <strong>
    {entry.mileage.toLocaleString(
      'de-DE',
    )}{' '}
    km
  </strong>
</div>

                  {entry.note && (
  <p className="mileage-event-title">
    {entry.note}
  </p>
)}

<p className="mileage-meta">
  {entry.source === 'HU' ? 'HU / TÜV' : entry.source} ·{' '}
  {new Date(
    `${entry.date}T00:00:00`,
  ).toLocaleDateString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})}
</p>
{getMileageEntryCost(entry) !== null && (
  <p className="mileage-cost">
    Kosten:{' '}
    {formatCurrency(
      getMileageEntryCost(entry) ?? 0,
    )}
  </p>
)}
                  <div className="entry-actions">
  <button
    className="entry-edit-button"
    onClick={() => startEditingMileage(entry)}
  >
   Bearbeiten
  </button>

  <button
    className="entry-delete-button"
    onClick={() => void deleteMileageEntry(entry)}
  >
    Löschen
  </button>
</div>
                </article>
              ))}
            </div>
          )}
          </>
)}
        </section>

        <section className="mileage-history">
          <h2>
  {selectedVehicle.category.trim() === 'Wohnwagen'
    ? 'Werkstatt'
    : 'Werkstatt & Eigenarbeit'}
</h2>

          {selectedWorkEntries.length === 0 ? (
            <p className="empty-state">
              Noch keine Arbeiten eingetragen.
            </p>
          ) : (
            <div className="mileage-list">
              {selectedWorkEntries.map((entry) => {
                const total =
                  entry.partsCost +
                  entry.laborCost +
                  entry.otherCost

                return (
                  <article
                    className="mileage-entry"
                    key={entry.id}
                  >
                    <div className="mileage-entry-top">
                      <strong>{entry.title}</strong>
                     <span>
  {new Date(
    `${entry.date}T00:00:00`,
  ).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}
</span>
                    </div>

                    {selectedVehicle.category.trim() !== 'Wohnwagen' && (
  <p>
    {entry.type}

    {entry.mileage !== null
      ? ` · ${entry.mileage.toLocaleString(
          'de-DE',
        )} km`
      : ''}
  </p>
)}

                    {entry.workshop && (
                      <p>
                        Betrieb: {entry.workshop}
                      </p>
                    )}

                    {entry.description && (
                      <p className="mileage-note">
                        {entry.description}
                      </p>
                    )}

                    <p>
                      Kosten: {formatCurrency(total)}
                    </p>

                    <div className="entry-actions">
                      <button
                        className="entry-edit-button"
                        onClick={() =>
                          startEditingWork(entry)
                        }
                      >
                        Bearbeiten
                      </button>

                      <button
                        className="entry-delete-button"
                        onClick={() =>
                          void deleteWorkEntry(entry)
                        }
                      >
                        Löschen
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

       

        <section className="detail-grid">
          {selectedVehicle.category === 'Freizeit' && (
            <>
              <article className="detail-card">
                <h3>Aktueller Kilometerstand</h3>

                <p>
                  {latestMileage !== null
                    ? `${latestMileage.toLocaleString(
                        'de-DE',
                      )} km`
                    : 'Noch nicht eingetragen'}
                </p>
              </article>

              <article className="detail-card">
                <h3>Gefahren dieses Jahr</h3>
                <p>
  {tripEntries
    .filter(
      (entry) =>
        entry.vehicleId === selectedVehicle.id &&
        entry.date.startsWith(
          `${new Date().getFullYear()}-`,
        ),
    )
    .reduce(
      (sum, entry) =>
        sum + (entry.endMileage - entry.startMileage),
      0,
    )
    .toLocaleString('de-DE')}{' '}
  km
</p>
              </article>

              <article className="detail-card">
                <h3>Fahrten</h3>
             <p>
  {(() => {
    const selectedTrips = tripEntries.filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    )

    const totalKm = selectedTrips.reduce(
      (sum, entry) =>
        sum + (entry.endMileage - entry.startMileage),
      0,
    )

    const averageKm =
      selectedTrips.length > 0
        ? Math.round(totalKm / selectedTrips.length)
        : 0

    return `${selectedTrips.length} ${
      selectedTrips.length === 1 ? 'Fahrt' : 'Fahrten'
    } · Ø ${averageKm.toLocaleString('de-DE')} km`
  })()}
</p>
              </article>

              <article className="detail-card">
                <h3>Werkstatt & Eigenarbeit</h3>
               <p>
  {selectedWorkEntries.length}{' '}
  {selectedWorkEntries.length === 1
    ? 'Eintrag'
    : 'Einträge'}
</p>
              </article>

              <article className="detail-card">
                <h3>HU / Termine</h3>

                <p>
                  {selectedVehicle.nextHu ??
                    'Noch kein Termin eingetragen'}
                </p>
              </article>

              <article className="detail-card">
                <h3>Kosten gesamt</h3>
                <p>{formatCurrency(workTotal + fuelTotalAllTime)}</p>
              </article>
            </>
          )}

          {selectedVehicle.category === 'Alltag' && (
            <>
              <article className="detail-card">
                <h3>Aktueller Kilometerstand</h3>

                <p>
                  {latestMileage !== null
                    ? `${latestMileage.toLocaleString(
                        'de-DE',
                      )} km`
                    : 'Noch nicht eingetragen'}
                </p>
              </article>

              <article className="detail-card">
                <h3>HU</h3>

                <p>
                  {selectedVehicle.nextHu ??
                    'Noch kein Termin eingetragen'}
                </p>
              </article>

              <article className="detail-card">
                <h3>Werkstatt</h3>
                <p>{workshopCount} Einträge</p>
              </article>

              <article className="detail-card">
                <h3>Eigenarbeiten</h3>
                <p>{ownWorkCount} Einträge</p>
              </article>

              <article className="detail-card">
                <h3>Kosten gesamt</h3>
                <p>{formatCurrency(workTotal + fuelTotalAllTime)}</p>
              </article>

              <article className="detail-card">
                <h3>Notizen</h3>
                <p>Noch keine separaten Notizen</p>
              </article>
            </>
          )}

          {selectedVehicle.category === 'Projekt' && (
            <>
              <article className="detail-card">
                <h3>Projektstatus</h3>
                <p>Wiederaufbau läuft</p>
              </article>

              <article className="detail-card">
                <h3>Arbeitsschritte</h3>

                <p>
                  {selectedWorkEntries.length} Einträge
                </p>
              </article>

              <article className="detail-card">
                <h3>Fotos</h3>
                <p>Kommt später</p>
              </article>

              <article className="detail-card">
                <h3>Teile & Kosten</h3>
                <p>{formatCurrency(workTotal)}</p>
              </article>
            </>
          )}

          {selectedVehicle.category === 'Wohnwagen' && (
            <>
             <article className="detail-card">
  <h3>HU & Gasprüfung</h3>

  <p>
    <strong>HU:</strong>{' '}
    {selectedVehicle.nextHu ??
      'Noch nicht eingetragen'}
  </p>

  <p>
    <strong>Gasprüfung:</strong>{' '}
    {selectedVehicle.nextGasInspection ??
      'Noch nicht eingetragen'}
  </p>
</article>

              <article className="detail-card">
  <h3>Reisen</h3>
  <p>
    {
      tripEntries.filter(
        (entry) => entry.vehicleId === selectedVehicle.id,
      ).length
    }{' '}
    {tripEntries.filter(
  (entry) => entry.vehicleId === selectedVehicle.id,
).length === 1
  ? 'Reise'
  : 'Reisen'} ·{' '}
    {tripEntries
      .filter(
        (entry) => entry.vehicleId === selectedVehicle.id,
      )
      .reduce(
        (sum, entry) =>
          sum + (entry.endMileage - entry.startMileage),
        0,
      )
      .toLocaleString('de-DE')}{' '}
    km gesamt
  </p>
</article>

             <article className="detail-card">
  <h3>Anschaffungen</h3>

  <p>
    {
      purchaseEntries.filter(
        (entry) => entry.vehicleId === selectedVehicle.id,
      ).length
    }{' '}
    {purchaseEntries.filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    ).length === 1
      ? 'Eintrag'
      : 'Einträge'}
  </p>

  {purchaseEntries
    .filter(
      (entry) => entry.vehicleId === selectedVehicle.id,
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((entry) => (
      <details key={entry.id}>
        <summary>
          <strong>{entry.title}</strong> ·{' '}
          {formatCurrency(entry.cost)}
        </summary>

        <p>
          {new Date(
            `${entry.date}T00:00:00`,
          ).toLocaleDateString('de-DE')}
        </p>

        {entry.items && (
          <p>
            <strong>Teile / Artikel:</strong> {entry.items}
          </p>
        )}

        {entry.vendor && (
          <p>
            <strong>Bezugsquelle:</strong> {entry.vendor}
          </p>
        )}

       {entry.note && (
  <p>
    <strong>Bemerkung:</strong> {entry.note}
  </p>
)}

<div className="entry-actions">
  <button
    className="entry-edit-button"
    onClick={() => startEditingPurchase(entry)}
  >
    Bearbeiten
  </button>

  <button
    className="entry-delete-button"
    onClick={() => void deletePurchaseEntry(entry)}
  >
    Löschen
  </button>
</div>
</details>
    ))}
</article>

              <article className="detail-card">
                <h3>Kosten</h3>
                <p>
  {formatCurrency(
    workTotal +
      purchaseEntries
        .filter(
          (entry) =>
            entry.vehicleId === selectedVehicle.id,
        )
        .reduce(
          (sum, entry) => sum + entry.cost,
          0,
        ),
  )}
</p>
              </article>

              <article className="detail-card">
                <h3>Fotos & Notizen</h3>
                <p>Kommt später</p>
              </article>
            </>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">MEIN FUHRPARK</p>
          <h1>Meine Garage</h1>

          <p className="welcome">
            Fahrzeuge, Fahrten, Werkstatt und Projekte auf
            einen Blick.
          </p>
        </div>

        <button
  className="add-button"
  onClick={() =>
    setIsAddVehicleFormOpen(!isAddVehicleFormOpen)
  }
>
  +
</button>
      </header>

      <section className="quick-actions">
        <button className="primary-action">
          <span>▶</span>
          Fahrt starten
        </button>

        <button className="secondary-action">
          <span>＋</span>
          Eintrag
        </button>
      
      </section>
<section className="vehicle-data">
  <h2>Dashboard</h2>

  <div className="vehicle-data-grid">
    <div>
      <span>Fahrzeuge</span>
     <strong>
  {
    vehicles.filter(
      (vehicle) =>
        vehicle.category.trim() === 'Freizeit',
    ).length
  }
</strong>
    </div>

    <div>
      <span>Gesamtkosten {dashboardYear}</span>
      <strong>{formatCurrency(dashboardTotal)}</strong>
    </div>

    <div>
      <span>Tankkosten {dashboardYear}</span>
      <strong>{formatCurrency(dashboardFuelTotal)}</strong>
    </div>

    <div>
      <span>Werkstatt & weitere Kosten {dashboardYear}</span>
      <strong>{formatCurrency(dashboardWorkTotal)}</strong>
    </div>
    <div>
  <span>Gefahrene Kilometer {dashboardYear}</span>
  <strong>
    {dashboardYearMileage.toLocaleString('de-DE')} km
  </strong>
</div>

<div>
  <span>Nächste HU</span>
  <strong>
    {nextHuVehicle
      ? `${nextHuVehicle.vehicle.name} · ${nextHuVehicle.vehicle.nextHu}`
      : 'Keine HU eingetragen'}
  </strong>
</div>
  </div>
</section>
      {sections.map((section) => {
        const sectionVehicles = vehicles.filter(
          (vehicle) => vehicle.category === section,
        )

        return (
          <section
            className="vehicle-section"
            key={section}
          >
            <div className="section-heading">
              <h2>{section}</h2>
              <span>{sectionVehicles.length}</span>
            </div>

            <div className="vehicle-list">
              {sectionVehicles.map((vehicle) => (
                <article
                  className="vehicle-card"
                  key={vehicle.id}
                  onClick={() =>
                    setSelectedVehicle(vehicle)
                  }
                >
                 <div className="vehicle-image">
  {vehicle.photo ? (
    <img
      src={vehicle.photo}
      alt={vehicle.name}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
        display: 'block',
      }}
    />
  ) : (
    <span>{vehicle.icon}</span>
  )}
</div>

                  <div className="vehicle-content">
                    <p className="vehicle-category">
                      {vehicle.category}
                    </p>

                    <h3>{vehicle.name}</h3>

                    <p>{vehicle.description}</p>

                    <strong>{vehicle.info}</strong>
                  </div>

                  <div className="arrow">›</div>
                </article>
              ))}
            </div>
          </section>
        )
      })}

      <BackupSection />
    </main>
  )
}

export default App