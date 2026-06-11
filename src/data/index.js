export const dispatchers = [
  { id: 'HW', name: 'Hans Weber',       ordersToday: 24, routesActive: 3, avgCompletion: '1.8 hrs', efficiency: 94 },
  { id: 'KZ', name: 'Klaus Zimmermann', ordersToday: 31, routesActive: 4, avgCompletion: '2.1 hrs', efficiency: 88 },
  { id: 'MS', name: 'Maria Schneider',  ordersToday: 28, routesActive: 3, avgCompletion: '1.6 hrs', efficiency: 96 },
  { id: 'PB', name: 'Peter Brunner',    ordersToday: 19, routesActive: 2, avgCompletion: '2.4 hrs', efficiency: 72 },
]

export const vehicleCatalogue = [
  { id: 'VH-001', make: 'VW',       model: 'Golf',        category: 'Sedan',  height: 1.42, weight: 1340, type: 'ICE' },
  { id: 'VH-002', make: 'BMW',      model: '5 Series',    category: 'Sedan',  height: 1.45, weight: 1820, type: 'ICE' },
  { id: 'VH-003', make: 'Audi',     model: 'Q7',          category: 'SUV',    height: 1.72, weight: 2100, type: 'ICE' },
  { id: 'VH-004', make: 'Tesla',    model: 'Model Y',     category: 'SUV/EV', height: 1.62, weight: 2003, type: 'EV'  },
  { id: 'VH-005', make: 'Skoda',    model: 'Octavia',     category: 'Sedan',  height: 1.46, weight: 1415, type: 'ICE' },
  { id: 'VH-006', make: 'Mercedes', model: 'Sprinter',    category: 'Van',    height: 2.10, weight: 2800, type: 'ICE' },
  { id: 'VH-007', make: 'Porsche',  model: '911',         category: 'Sports', height: 1.28, weight: 1580, type: 'ICE' },
  { id: 'VH-008', make: 'VW',       model: 'Transporter', category: 'Van',    height: 1.99, weight: 2200, type: 'ICE' },
]

export const initialOrders = [
  { id: 'CH-2841', vehicleId: 'VH-001', from: 'Studen',   to: 'Bern AutoZentrum',  dispatcher: 'Hans Weber',       status: 'In Transit', priority: 'Normal',   eta: '09:15', created: '07:00', truckId: 'TRK-021', dispatchDate: '2026-06-10' },
  { id: 'CH-2842', vehicleId: 'VH-002', from: 'Lupfig',   to: 'Zurich AMAG',       dispatcher: 'Klaus Zimmermann', status: 'Assigned',   priority: 'High',     eta: '10:30', created: '07:15', truckId: 'TRK-041', dispatchDate: '2026-06-10' },
  { id: 'CH-2843', vehicleId: 'VH-003', from: 'Studen',   to: 'Basel Autohaus',    dispatcher: null,               status: 'Unassigned', priority: 'Critical', eta: '11:00', created: '07:30', truckId: null, dispatchDate: '2026-06-10' },
  { id: 'CH-2844', vehicleId: 'VH-006', from: 'Rümlang',  to: 'Geneva Auto AG',    dispatcher: 'Maria Schneider',  status: 'Violation',  priority: 'Critical', eta: '12:00', created: '06:45', truckId: 'TRK-031', dispatchDate: '2026-06-10' },
  { id: 'CH-2845', vehicleId: 'VH-007', from: 'Lupfig',   to: 'St. Gallen VW',     dispatcher: 'Peter Brunner',    status: 'Delivered',  priority: 'Normal',   eta: '08:30', created: '06:00', truckId: 'TRK-021', dispatchDate: '2026-06-09' },
  { id: 'CH-2846', vehicleId: 'VH-004', from: 'Studen',   to: 'Lucerne Motors',    dispatcher: null,               status: 'Unassigned', priority: 'High',     eta: '13:00', created: '08:00', truckId: null, dispatchDate: '2026-06-11' },
  { id: 'CH-2847', vehicleId: 'VH-002', from: 'Lupfig',   to: 'Zurich AMAG',       dispatcher: 'Hans Weber',       status: 'In Transit', priority: 'High',     eta: '11:00', created: '07:45', truckId: 'TRK-041', dispatchDate: '2026-06-10' },
  { id: 'CH-2848', vehicleId: 'VH-005', from: 'Studen',   to: 'Bern AutoZentrum',  dispatcher: 'Klaus Zimmermann', status: 'Assigned',   priority: 'Normal',   eta: '14:00', created: '08:30', truckId: 'TRK-033', dispatchDate: '2026-06-10' },
  { id: 'CH-2849', vehicleId: 'VH-008', from: 'Rümlang',  to: 'Basel Autohaus',    dispatcher: null,               status: 'Unassigned', priority: 'Normal',   eta: '15:00', created: '09:00', truckId: null, dispatchDate: '2026-06-11' },
  { id: 'CH-2850', vehicleId: 'VH-001', from: 'Lupfig',   to: 'Geneva Auto AG',    dispatcher: 'Maria Schneider',  status: 'Assigned',   priority: 'Normal',   eta: '16:00', created: '09:15', truckId: 'TRK-033', dispatchDate: '2026-06-10' },
  { id: 'CH-2851', vehicleId: 'VH-005', from: 'Studen',   to: 'Lucerne Motors',    dispatcher: null,               status: 'Unassigned', priority: 'Critical', eta: '10:00', created: '08:45', truckId: null, dispatchDate: '2026-06-10' },
  { id: 'CH-2852', vehicleId: 'VH-007', from: 'Rümlang',  to: 'Zurich AMAG',       dispatcher: 'Peter Brunner',    status: 'Assigned',   priority: 'High',     eta: '12:30', created: '09:00', truckId: 'TRK-025', dispatchDate: '2026-06-10' },
  { id: 'CH-2853', vehicleId: 'VH-003', from: 'Lupfig',   to: 'St. Gallen VW',     dispatcher: null,               status: 'Unassigned', priority: 'Normal',   eta: '16:30', created: '09:30', truckId: null, dispatchDate: '2026-06-12' },
  { id: 'CH-2854', vehicleId: 'VH-008', from: 'Studen',   to: 'Basel Autohaus',    dispatcher: 'Hans Weber',       status: 'Violation',  priority: 'Critical', eta: '09:45', created: '06:30', truckId: 'TRK-027', dispatchDate: '2026-06-10' },
]

export const initialTrucks = [
  { id: 'TRK-021', driver: 'Franz Bauer',   plate: 'BE 234 511', slots: 10, usedSlots: 4, maxWeight: 8000, usedWeight: 3200, maxHeight: 4.0, status: 'En Route',    dept: '07:15', driverHrs: 6.8 },
  { id: 'TRK-023', driver: 'Stefan Wolf',   plate: 'ZH 445 892', slots: 10, usedSlots: 7, maxWeight: 8000, usedWeight: 5800, maxHeight: 4.0, status: 'Loading',     dept: '09:00', driverHrs: 8.2 },
  { id: 'TRK-025', driver: 'Andreas Koch',  plate: 'BS 112 344', slots: 10, usedSlots: 2, maxWeight: 8000, usedWeight: 1600, maxHeight: 4.0, status: 'Available',   dept: null,    driverHrs: 9.0 },
  { id: 'TRK-027', driver: 'Martin Huber',  plate: 'LU 667 213', slots: 10, usedSlots: 9, maxWeight: 8000, usedWeight: 7200, maxHeight: 4.0, status: 'En Route',    dept: '08:00', driverHrs: 5.1 },
  { id: 'TRK-029', driver: 'Thomas Keller', plate: 'SG 334 781', slots: 10, usedSlots: 0, maxWeight: 8000, usedWeight: 0,    maxHeight: 4.0, status: 'Maintenance', dept: null,    driverHrs: 0   },
  { id: 'TRK-031', driver: 'Josef Meier',   plate: 'GE 123 456', slots: 10, usedSlots: 5, maxWeight: 8000, usedWeight: 4100, maxHeight: 4.0, status: 'Loading',     dept: '10:00', driverHrs: 7.5 },
  { id: 'TRK-033', driver: 'Werner Braun',  plate: 'BE 789 012', slots: 10, usedSlots: 3, maxWeight: 8000, usedWeight: 2400, maxHeight: 4.0, status: 'Available',   dept: null,    driverHrs: 9.0 },
  { id: 'TRK-041', driver: 'Hans Mueller',  plate: 'ZH 556 234', slots: 10, usedSlots: 8, maxWeight: 8000, usedWeight: 6200, maxHeight: 4.0, status: 'Loading',     dept: '09:30', driverHrs: 4.2 },
]

// Planner-specific data
export const plannerUnassigned = [
  { id: 'CH-2843', make: 'Audi',     model: 'Q7',          category: 'SUV',    height: 1.72, weight: 2100, from: 'Studen',  to: 'Basel Autohaus',  priority: 'Critical', type: 'ICE' },
  { id: 'CH-2846', make: 'Tesla',    model: 'Model Y',     category: 'SUV/EV', height: 1.62, weight: 2003, from: 'Studen',  to: 'Lucerne Motors',  priority: 'High',     type: 'EV'  },
  { id: 'CH-2849', make: 'VW',       model: 'Transporter', category: 'Van',    height: 1.99, weight: 2200, from: 'Rümlang', to: 'Basel Autohaus',  priority: 'Normal',   type: 'ICE' },
  { id: 'CH-2851', make: 'Skoda',    model: 'Octavia',     category: 'Sedan',  height: 1.46, weight: 1415, from: 'Studen',  to: 'Lucerne Motors',  priority: 'Critical', type: 'ICE' },
  { id: 'CH-2853', make: 'Audi',     model: 'Q7',          category: 'SUV',    height: 1.72, weight: 2100, from: 'Lupfig',  to: 'St. Gallen VW',   priority: 'Normal',   type: 'ICE' },
  { id: 'CH-2855', make: 'BMW',      model: '5 Series',    category: 'Sedan',  height: 1.45, weight: 1820, from: 'Studen',  to: 'Zurich AMAG',     priority: 'High',     type: 'ICE' },
  { id: 'CH-2856', make: 'VW',       model: 'Golf',        category: 'Sedan',  height: 1.42, weight: 1340, from: 'Lupfig',  to: 'Bern AutoZentrum',priority: 'Normal',   type: 'ICE' },
  { id: 'CH-2857', make: 'Porsche',  model: '911',         category: 'Sports', height: 1.28, weight: 1580, from: 'Studen',  to: 'Geneva Auto AG',  priority: 'Normal',   type: 'ICE' },
  { id: 'CH-2858', make: 'Mercedes', model: 'Sprinter',    category: 'Van',    height: 2.10, weight: 2800, from: 'Rümlang', to: 'Zurich AMAG',     priority: 'Critical', type: 'ICE' },
  { id: 'CH-2859', make: 'Skoda',    model: 'Octavia',     category: 'Sedan',  height: 1.46, weight: 1415, from: 'Studen',  to: 'St. Gallen VW',   priority: 'High',     type: 'ICE' },
  { id: 'CH-2860', make: 'VW',       model: 'Golf',        category: 'Sedan',  height: 1.42, weight: 1340, from: 'Lupfig',  to: 'Basel Autohaus',  priority: 'Normal',   type: 'ICE' },
  { id: 'CH-2861', make: 'BMW',      model: '5 Series',    category: 'Sedan',  height: 1.45, weight: 1820, from: 'Studen',  to: 'Lucerne Motors',  priority: 'High',     type: 'ICE' },
]

export const plannerTrucks = [
  {
    id: 'TRK-025', driver: 'Andreas Koch',    plate: 'BS 112 344',
    slots: 10, usedSlots: 2, maxWeight: 8000, usedWeight: 2920,
    maxHeight: 4.0, status: 'Available', dept: '10:00', driverHrs: 9.0,
    vehicles: [
      { id: 'P-V01', make: 'Porsche', model: '911',     height: 1.28, weight: 1580, to: 'Geneva Auto AG', category: 'Sports' },
      { id: 'P-V02', make: 'Skoda',   model: 'Octavia', height: 1.46, weight: 1340, to: 'Lucerne Motors', category: 'Sedan'  },
    ],
    stops: ['Studen (Pickup)', 'Lucerne Motors — Skoda', 'Geneva Auto AG — Porsche'],
    confirmed: false,
  },
  {
    id: 'TRK-033', driver: 'Werner Braun',    plate: 'BE 789 012',
    slots: 10, usedSlots: 3, maxWeight: 8000, usedWeight: 4235,
    maxHeight: 4.0, status: 'Available', dept: '10:30', driverHrs: 9.0,
    vehicles: [
      { id: 'P-V03', make: 'BMW',  model: '5 Series', height: 1.45, weight: 1820, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V04', make: 'VW',   model: 'Golf',     height: 1.42, weight: 1340, to: 'Bern AutoZentrum', category: 'Sedan' },
      { id: 'P-V05', make: 'Audi', model: 'A4',       height: 1.45, weight: 1520, to: 'Basel Autohaus',   category: 'Sedan' },
    ],
    stops: ['Lupfig (Pickup)', 'Bern AutoZentrum — VW Golf', 'Zurich AMAG — BMW 5', 'Basel Autohaus — Audi A4'],
    confirmed: false,
  },
  {
    id: 'TRK-031', driver: 'Josef Meier',     plate: 'GE 123 456',
    slots: 10, usedSlots: 5, maxWeight: 8000, usedWeight: 7460,
    maxHeight: 4.0, status: 'Loading', dept: '09:00', driverHrs: 7.5,
    vehicles: [
      { id: 'P-V06', make: 'VW',    model: 'Transporter', height: 1.99, weight: 2200, to: 'St. Gallen VW',   category: 'Van'    },
      { id: 'P-V07', make: 'Tesla', model: 'Model Y',     height: 1.62, weight: 2003, to: 'Zurich AMAG',     category: 'SUV/EV' },
      { id: 'P-V08', make: 'BMW',   model: '5 Series',    height: 1.45, weight: 1820, to: 'Bern AutoZentrum', category: 'Sedan' },
      { id: 'P-V09', make: 'VW',    model: 'Golf',        height: 1.42, weight: 1340, to: 'Basel Autohaus',   category: 'Sedan' },
      { id: 'P-V10', make: 'Skoda', model: 'Octavia',     height: 1.46, weight: 1415, to: 'Lucerne Motors',   category: 'Sedan' },
    ],
    stops: ['Rümlang (Pickup)', 'Bern AutoZentrum', 'Basel Autohaus', 'Zurich AMAG', 'St. Gallen VW'],
    confirmed: false,
  },
  {
    id: 'TRK-021', driver: 'Franz Bauer',     plate: 'BE 234 511',
    slots: 10, usedSlots: 4, maxWeight: 8000, usedWeight: 5680,
    maxHeight: 4.0, status: 'En Route', dept: '07:15', driverHrs: 6.8,
    vehicles: [
      { id: 'P-V11', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V12', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Bern AutoZentrum', category: 'Sedan' },
      { id: 'P-V13', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Basel Autohaus',   category: 'Sedan' },
      { id: 'P-V14', make: 'Audi',  model: 'A4',       height: 1.45, weight: 1520, to: 'Lucerne Motors',   category: 'Sedan' },
    ],
    stops: ['Studen (Pickup)', 'Bern AutoZentrum', 'Basel Autohaus', 'Lucerne Motors', 'Zurich AMAG'],
    confirmed: true,
  },
  {
    id: 'TRK-035', driver: 'Rolf Keller',     plate: 'ZH 321 654',
    slots: 10, usedSlots: 0, maxWeight: 8000, usedWeight: 0,
    maxHeight: 4.0, status: 'Available', dept: null, driverHrs: 9.0,
    vehicles: [],
    stops: ['Lupfig (Pickup)'],
    confirmed: false,
  },
  {
    id: 'TRK-037', driver: 'Urs Fischbach',   plate: 'AG 445 221',
    slots: 10, usedSlots: 1, maxWeight: 8000, usedWeight: 1820,
    maxHeight: 4.0, status: 'Available', dept: '11:00', driverHrs: 9.0,
    vehicles: [
      { id: 'P-V15', make: 'BMW', model: '5 Series', height: 1.45, weight: 1820, to: 'Geneva Auto AG', category: 'Sedan' },
    ],
    stops: ['Lupfig (Pickup)', 'Geneva Auto AG — BMW 5'],
    confirmed: false,
  },
  {
    id: 'TRK-039', driver: 'Beat Zimmermann', plate: 'SO 112 987',
    slots: 10, usedSlots: 6, maxWeight: 8000, usedWeight: 6140,
    maxHeight: 4.0, status: 'Loading', dept: '09:45', driverHrs: 8.0,
    vehicles: [
      { id: 'P-V16', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'St. Gallen VW',   category: 'Sedan' },
      { id: 'P-V17', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Lucerne Motors',  category: 'Sedan' },
      { id: 'P-V18', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'Zurich AMAG',     category: 'Sedan' },
      { id: 'P-V19', make: 'Audi',  model: 'A4',       height: 1.45, weight: 1520, to: 'Bern AutoZentrum',category: 'Sedan' },
      { id: 'P-V20', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Basel Autohaus',  category: 'Sedan' },
      { id: 'P-V21', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Geneva Auto AG',  category: 'Sedan' },
    ],
    stops: ['Studen (Pickup)', 'Lucerne Motors', 'Bern AutoZentrum', 'Basel Autohaus', 'Zurich AMAG', 'Geneva Auto AG', 'St. Gallen VW'],
    confirmed: false,
  },
  {
    id: 'TRK-041', driver: 'Hans Mueller',    plate: 'ZH 556 234',
    slots: 10, usedSlots: 8, maxWeight: 8000, usedWeight: 7380,
    maxHeight: 4.0, status: 'Loading', dept: '09:30', driverHrs: 4.2,
    vehicles: [
      { id: 'P-V22', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V23', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'Bern AutoZentrum', category: 'Sedan' },
      { id: 'P-V24', make: 'Audi',  model: 'A4',       height: 1.45, weight: 1520, to: 'Basel Autohaus',   category: 'Sedan' },
      { id: 'P-V25', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Lucerne Motors',   category: 'Sedan' },
      { id: 'P-V26', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Geneva Auto AG',   category: 'Sedan' },
      { id: 'P-V27', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'St. Gallen VW',    category: 'Sedan' },
      { id: 'P-V28', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V29', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Bern AutoZentrum', category: 'Sedan' },
    ],
    stops: ['Lupfig (Pickup)', 'Bern AutoZentrum', 'Zurich AMAG', 'Basel Autohaus', 'Lucerne Motors', 'Geneva Auto AG', 'St. Gallen VW'],
    confirmed: false,
  },
  {
    id: 'TRK-043', driver: 'Peter Stucki',    plate: 'FR 667 441',
    slots: 10, usedSlots: 0, maxWeight: 8000, usedWeight: 0,
    maxHeight: 4.0, status: 'Available', dept: null, driverHrs: 9.0,
    vehicles: [],
    stops: ['Rümlang (Pickup)'],
    confirmed: false,
  },
  {
    id: 'TRK-045', driver: 'Markus Lüthi',   plate: 'BE 908 123',
    slots: 10, usedSlots: 2, maxWeight: 8000, usedWeight: 3160,
    maxHeight: 4.0, status: 'Available', dept: '11:30', driverHrs: 9.0,
    vehicles: [
      { id: 'P-V30', make: 'Porsche', model: '911',     height: 1.28, weight: 1580, to: 'Zurich AMAG',  category: 'Sports' },
      { id: 'P-V31', make: 'BMW',     model: '5 Series',height: 1.45, weight: 1820, to: 'Basel Autohaus',category: 'Sedan'  },
    ],
    stops: ['Studen (Pickup)', 'Basel Autohaus — BMW 5', 'Zurich AMAG — Porsche'],
    confirmed: false,
  },
  {
    id: 'TRK-047', driver: 'Daniel Berger',   plate: 'ZH 234 778',
    slots: 10, usedSlots: 9, maxWeight: 8000, usedWeight: 7820,
    maxHeight: 4.0, status: 'Loading', dept: '08:45', driverHrs: 5.5,
    vehicles: [
      { id: 'P-V32', make: 'VW',    model: 'Golf',        height: 1.42, weight: 1340, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V33', make: 'BMW',   model: '5 Series',    height: 1.45, weight: 1820, to: 'Bern AutoZentrum', category: 'Sedan' },
      { id: 'P-V34', make: 'Skoda', model: 'Octavia',     height: 1.46, weight: 1415, to: 'Basel Autohaus',   category: 'Sedan' },
      { id: 'P-V35', make: 'Audi',  model: 'A4',          height: 1.45, weight: 1520, to: 'Lucerne Motors',   category: 'Sedan' },
      { id: 'P-V36', make: 'VW',    model: 'Golf',        height: 1.42, weight: 1340, to: 'Geneva Auto AG',   category: 'Sedan' },
      { id: 'P-V37', make: 'BMW',   model: '5 Series',    height: 1.45, weight: 1820, to: 'St. Gallen VW',    category: 'Sedan' },
      { id: 'P-V38', make: 'Audi',  model: 'A4',          height: 1.45, weight: 1520, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V39', make: 'VW',    model: 'Transporter', height: 1.99, weight: 2200, to: 'Bern AutoZentrum', category: 'Van'   },
      { id: 'P-V40', make: 'Skoda', model: 'Octavia',     height: 1.46, weight: 1415, to: 'Basel Autohaus',   category: 'Sedan' },
    ],
    stops: ['Lupfig (Pickup)', 'Bern AutoZentrum', 'Zurich AMAG', 'Basel Autohaus', 'Lucerne Motors', 'Geneva Auto AG', 'St. Gallen VW'],
    confirmed: false,
  },
  {
    id: 'TRK-049', driver: 'Christoph Haas',  plate: 'LU 445 009',
    slots: 10, usedSlots: 3, maxWeight: 8000, usedWeight: 4095,
    maxHeight: 4.0, status: 'Available', dept: '10:15', driverHrs: 9.0,
    vehicles: [
      { id: 'P-V41', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'Geneva Auto AG',  category: 'Sedan' },
      { id: 'P-V42', make: 'Audi',  model: 'A4',       height: 1.45, weight: 1520, to: 'Lucerne Motors',  category: 'Sedan' },
      { id: 'P-V43', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'St. Gallen VW',   category: 'Sedan' },
    ],
    stops: ['Studen (Pickup)', 'Lucerne Motors — Audi A4', 'Geneva Auto AG — BMW 5', 'St. Gallen VW — Skoda'],
    confirmed: false,
  },
  {
    id: 'TRK-051', driver: 'Simon Wyss',      plate: 'VS 338 212',
    slots: 10, usedSlots: 0, maxWeight: 8000, usedWeight: 0,
    maxHeight: 4.0, status: 'Maintenance', dept: null, driverHrs: 0,
    vehicles: [],
    stops: [],
    confirmed: false,
  },
  {
    id: 'TRK-053', driver: 'Roland Maurer',   plate: 'TG 221 560',
    slots: 10, usedSlots: 4, maxWeight: 8000, usedWeight: 5875,
    maxHeight: 4.0, status: 'Available', dept: '11:15', driverHrs: 8.5,
    vehicles: [
      { id: 'P-V44', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V45', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'Bern AutoZentrum', category: 'Sedan' },
      { id: 'P-V46', make: 'Audi',  model: 'A4',       height: 1.45, weight: 1520, to: 'Basel Autohaus',   category: 'Sedan' },
      { id: 'P-V47', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Lucerne Motors',   category: 'Sedan' },
    ],
    stops: ['Rümlang (Pickup)', 'Bern AutoZentrum', 'Zurich AMAG', 'Basel Autohaus', 'Lucerne Motors'],
    confirmed: false,
  },
  {
    id: 'TRK-055', driver: 'Heinz Vogel',     plate: 'GR 114 893',
    slots: 10, usedSlots: 7, maxWeight: 8000, usedWeight: 6735,
    maxHeight: 4.0, status: 'Loading', dept: '09:15', driverHrs: 6.0,
    vehicles: [
      { id: 'P-V48', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Zurich AMAG',      category: 'Sedan' },
      { id: 'P-V49', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'St. Gallen VW',    category: 'Sedan' },
      { id: 'P-V50', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Bern AutoZentrum', category: 'Sedan' },
      { id: 'P-V51', make: 'VW',    model: 'Golf',     height: 1.42, weight: 1340, to: 'Basel Autohaus',   category: 'Sedan' },
      { id: 'P-V52', make: 'Audi',  model: 'A4',       height: 1.45, weight: 1520, to: 'Lucerne Motors',   category: 'Sedan' },
      { id: 'P-V53', make: 'BMW',   model: '5 Series', height: 1.45, weight: 1820, to: 'Geneva Auto AG',   category: 'Sedan' },
      { id: 'P-V54', make: 'Skoda', model: 'Octavia',  height: 1.46, weight: 1415, to: 'Zurich AMAG',      category: 'Sedan' },
    ],
    stops: ['Lupfig (Pickup)', 'Bern AutoZentrum', 'Zurich AMAG', 'Basel Autohaus', 'Lucerne Motors', 'Geneva Auto AG', 'St. Gallen VW'],
    confirmed: false,
  },
]

const ROUTE_OPTIONS = ['Route Z→B→BA', 'Route GE→LU', 'Route SG→ZH', 'Route ZH→LU→GE', 'Route BA→BE→SG']

export const initialRules = {
  truck: Object.fromEntries(plannerTrucks.slice(0, 10).map((truck, index) => [truck.id, {
    id: truck.id,
    label: truck.id,
    subtitle: `${truck.plate} · ${truck.driver} · ${truck.status}`,
    rules: [
      { id: 'deckPositions', name: 'Deck Positions', desc: 'Total loadable deck positions for this truck', value: String(truck.slots), unit: 'slots', enabled: true },
      { id: 'weightCeiling', name: 'Weight Ceiling', desc: 'Maximum permitted loaded vehicle weight', value: String(truck.maxWeight), unit: 'kg', enabled: true },
      { id: 'heightClearance', name: 'Height Clearance', desc: 'Maximum transport height for this truck', value: String(truck.maxHeight), unit: 'm', enabled: true },
      { id: 'upperDeckHeight', name: 'Upper Deck Limit', desc: 'Maximum vehicle height permitted on upper deck', value: '1.55', unit: 'm', enabled: true },
      { id: 'loadingSequence', name: 'Rear-first Loading', desc: 'Enforce LIFO loading sequence for route stops', value: '', unit: '—', enabled: true },
      { id: 'assignedRoute', name: 'Assigned Route', desc: 'Saved route this truck is planned on', value: ROUTE_OPTIONS[index % ROUTE_OPTIONS.length], unit: '—', enabled: true, options: ROUTE_OPTIONS },
    ],
  }])),
  driver: Object.fromEntries(plannerTrucks.slice(0, 10).map(truck => [truck.driver, {
    id: truck.driver,
    label: truck.driver,
    subtitle: `${truck.id} · ${truck.plate} · ${truck.driverHrs}h available`,
    rules: [
      { id: 'maxDriveHours', name: 'Max Drive Hours', desc: 'Maximum legal daily driving time', value: '9', unit: 'hrs', enabled: true },
      { id: 'remainingHours', name: 'Remaining Hours', desc: 'Driving hours currently available today', value: String(truck.driverHrs), unit: 'hrs', enabled: true },
      { id: 'restRequirement', name: 'Rest Requirement', desc: 'Minimum rest period between shifts', value: '11', unit: 'hrs', enabled: true },
      { id: 'assignedTruck', name: 'Truck Assignment Lock', desc: `Keep driver assigned to ${truck.id}`, value: '', unit: '—', enabled: true },
    ],
  }])),
  route: Object.fromEntries([
    { id: 'Z-B-BA', name: 'Route Z→B→BA', description: 'Zurich · Bern · Basel', stopCount: 3 },
    { id: 'GE-LU', name: 'Route GE→LU', description: 'Geneva · Lucerne', stopCount: 2 },
    { id: 'SG-ZH', name: 'Route SG→ZH', description: 'St. Gallen · Zurich', stopCount: 2 },
    { id: 'ZH-LU-GE', name: 'Route ZH→LU→GE', description: 'Zurich · Lucerne · Geneva', stopCount: 3 },
    { id: 'BA-BE-SG', name: 'Route BA→BE→SG', description: 'Basel · Bern · St. Gallen', stopCount: 3 },
  ].map(route => [route.id, {
    id: route.id,
    label: route.name,
    subtitle: route.description,
    rules: [
      { id: 'swissHeightLimit', name: 'Swiss Height Limit', desc: 'Maximum transport height on Swiss roads', value: '4.0', unit: 'm', enabled: true },
      { id: 'euHeightLimit', name: 'EU Height Limit', desc: 'Maximum transport height for EU cross-border', value: '4.3', unit: 'm', enabled: true },
      { id: 'splitRouteAllow', name: 'Split Route Allow', desc: 'Allow vehicles to transfer across compounds', value: '', unit: '—', enabled: true },
      { id: 'maxStops', name: 'Max Stops', desc: 'Maximum dealer stops permitted on this route', value: String(Math.max(route.stopCount, 8)), unit: 'stops', enabled: true },
    ],
  }])),
  compound: Object.fromEntries(['Studen', 'Lupfig', 'Rümlang', 'Basel Hub', 'Geneva Yard'].map((compound, index) => [compound, {
    id: compound,
    label: compound,
    subtitle: index === 0 ? 'Primary dispatch compound' : 'Vehicle staging compound',
    rules: [
      { id: 'stagingLeadTime', name: 'Staging Lead Time', desc: 'Minutes before truck arrival to prep staging lane', value: index === 0 ? '45' : '30', unit: 'min', enabled: true },
      { id: 'laneCapacity', name: 'Lane Capacity', desc: 'Maximum vehicles per staging lane', value: index === 2 ? '5' : '6', unit: 'slots', enabled: true },
      { id: 'autoNotifyYard', name: 'Auto Notify Yard', desc: 'Automatically send prep instruction to yard ops', value: '', unit: '—', enabled: true },
    ],
  }])),
}

export const splitRoutes = [
  {
    id: 'CH-2835',
    make: 'BMW', model: '5 Series',
    vin: 'WBA5A5C5XGD520784',
    status: 'Completed',
    legs: [
      { from: 'Lupfig HQ', to: 'Studen Transfer', truck: 'TRK-019', driver: 'Karl Steiner', status: 'done', departed: '07:15', arrived: '08:10' },
      { from: 'Studen Transfer', to: 'Zurich AMAG', truck: 'TRK-041', driver: 'Hans Mueller', status: 'done', departed: '08:30', arrived: '09:45' },
    ],
    condition: 'No damage logged',
    customerNotified: 'SMS sent 07:16',
    delay: null,
  },
  {
    id: 'CH-2847',
    make: 'BMW', model: '5 Series',
    vin: 'WBA5A5C5XGD520785',
    status: 'In Transit',
    legs: [
      { from: 'Lupfig HQ', to: 'Studen Transfer', truck: 'TRK-021', driver: 'Franz Bauer', status: 'done', departed: '07:15', arrived: '08:05' },
      { from: 'Studen Transfer', to: 'Zurich AMAG', truck: 'TRK-041', driver: 'Hans Mueller', status: 'active', departed: '08:30', eta: '09:30' },
    ],
    condition: 'No damage logged',
    customerNotified: 'SMS sent 07:16',
    delay: null,
  },
  {
    id: 'CH-2862',
    make: 'Audi', model: 'Q7',
    vin: 'WAUZZZ4G5DN012345',
    status: 'Pending',
    legs: [
      { from: 'Rümlang Airport', to: 'Studen Transfer', truck: 'TRK-033', driver: 'Werner Braun', status: 'pending', dept: '11:00', eta: '12:15' },
      { from: 'Studen Transfer', to: 'Basel Autohaus', truck: 'TRK-025', driver: 'Andreas Koch', status: 'pending', dept: '12:30', eta: '13:45' },
    ],
    condition: 'Pre-loaded — awaiting inspection',
    customerNotified: 'Scheduled 10:45',
    delay: null,
  },
  {
    id: 'CH-2871',
    make: 'Mercedes', model: 'Sprinter',
    vin: 'WDB9066331L123456',
    status: 'Delayed',
    legs: [
      { from: 'Lupfig HQ', to: 'Studen Transfer', truck: 'TRK-027', driver: 'Martin Huber', status: 'done', departed: '06:30', arrived: '07:40' },
      { from: 'Studen Transfer', to: 'Geneva Auto AG', truck: 'TRK-031', driver: 'Josef Meier', status: 'delayed', departed: '08:00', eta: '11:30', delayReason: 'Height clearance check at A1 — awaiting permit' },
    ],
    condition: 'Minor surface dust — noted',
    customerNotified: 'Delay SMS sent 09:02',
    delay: 'Height clearance check at A1 — awaiting permit confirmation',
  },
]

// ─── Route Planner 2 data ────────────────────────────────────────────────────

export const savedRoutes = [
  {
    id: 'Z-B-BA',
    name: 'Route Z→B→BA',
    description: 'Zurich · Bern · Basel',
    stops: [
      { stopNum: 1, dealer: 'Zurich AMAG',      city: 'Zurich', eta: '10:30', km: '0 km'   },
      { stopNum: 2, dealer: 'Bern AutoZentrum',  city: 'Bern',   eta: '12:15', km: '128 km' },
      { stopNum: 3, dealer: 'Basel Autohaus',    city: 'Basel',  eta: '14:00', km: '95 km'  },
    ],
  },
  {
    id: 'GE-LU',
    name: 'Route GE→LU',
    description: 'Geneva · Lucerne',
    stops: [
      { stopNum: 1, dealer: 'Geneva Auto AG',  city: 'Geneva',  eta: '09:00', km: '0 km'   },
      { stopNum: 2, dealer: 'Lucerne Motors',  city: 'Lucerne', eta: '12:30', km: '225 km' },
    ],
  },
  {
    id: 'SG-ZH',
    name: 'Route SG→ZH',
    description: 'St. Gallen · Zurich',
    stops: [
      { stopNum: 1, dealer: 'St. Gallen VW', city: 'St. Gallen', eta: '08:00', km: '0 km'  },
      { stopNum: 2, dealer: 'Zurich AMAG',   city: 'Zurich',     eta: '09:30', km: '88 km' },
    ],
  },
  {
    id: 'ZH-LU-GE',
    name: 'Route ZH→LU→GE',
    description: 'Zurich · Lucerne · Geneva',
    stops: [
      { stopNum: 1, dealer: 'Zurich AMAG',   city: 'Zurich',  eta: '07:30', km: '0 km'   },
      { stopNum: 2, dealer: 'Lucerne Motors', city: 'Lucerne', eta: '09:15', km: '62 km'  },
      { stopNum: 3, dealer: 'Geneva Auto AG', city: 'Geneva',  eta: '13:00', km: '215 km' },
    ],
  },
]

// plannerOrders2 = plannerUnassigned enriched with lane/position data
export const plannerOrders2 = [
  { id: 'CH-2843', make: 'Audi',     model: 'Q7',          category: 'SUV',    height: 1.72, weight: 2100, from: 'Studen',  to: 'Basel Autohaus',   priority: 'Critical', type: 'ICE', lane: 'A-1', lanePos: 2 },
  { id: 'CH-2846', make: 'Tesla',    model: 'Model Y',     category: 'SUV/EV', height: 1.62, weight: 2003, from: 'Studen',  to: 'Lucerne Motors',   priority: 'High',     type: 'EV',  lane: 'A-2', lanePos: 1 },
  { id: 'CH-2849', make: 'VW',       model: 'Transporter', category: 'Van',    height: 1.99, weight: 2200, from: 'Rümlang', to: 'Basel Autohaus',   priority: 'Normal',   type: 'ICE', lane: 'B-1', lanePos: 3 },
  { id: 'CH-2851', make: 'Skoda',    model: 'Octavia',     category: 'Sedan',  height: 1.46, weight: 1415, from: 'Studen',  to: 'Lucerne Motors',   priority: 'Critical', type: 'ICE', lane: 'A-3', lanePos: 1 },
  { id: 'CH-2853', make: 'Audi',     model: 'Q7',          category: 'SUV',    height: 1.72, weight: 2100, from: 'Lupfig',  to: 'St. Gallen VW',    priority: 'Normal',   type: 'ICE', lane: 'A-1', lanePos: 1 },
  { id: 'CH-2855', make: 'BMW',      model: '5 Series',    category: 'Sedan',  height: 1.45, weight: 1820, from: 'Studen',  to: 'Zurich AMAG',      priority: 'High',     type: 'ICE', lane: 'B-2', lanePos: 2 },
  { id: 'CH-2856', make: 'VW',       model: 'Golf',        category: 'Sedan',  height: 1.42, weight: 1340, from: 'Lupfig',  to: 'Bern AutoZentrum', priority: 'Normal',   type: 'ICE', lane: 'A-3', lanePos: 2 },
  { id: 'CH-2857', make: 'Porsche',  model: '911',         category: 'Sports', height: 1.28, weight: 1580, from: 'Studen',  to: 'Geneva Auto AG',   priority: 'Normal',   type: 'ICE', lane: 'A-2', lanePos: 3 },
  { id: 'CH-2858', make: 'Mercedes', model: 'Sprinter',    category: 'Van',    height: 2.10, weight: 2800, from: 'Rümlang', to: 'Zurich AMAG',      priority: 'Critical', type: 'ICE', lane: 'C-1', lanePos: 1 },
  { id: 'CH-2859', make: 'Skoda',    model: 'Octavia',     category: 'Sedan',  height: 1.46, weight: 1415, from: 'Studen',  to: 'St. Gallen VW',    priority: 'High',     type: 'ICE', lane: 'B-1', lanePos: 1 },
  { id: 'CH-2860', make: 'VW',       model: 'Golf',        category: 'Sedan',  height: 1.42, weight: 1340, from: 'Lupfig',  to: 'Basel Autohaus',   priority: 'Normal',   type: 'ICE', lane: 'B-2', lanePos: 1 },
  { id: 'CH-2861', make: 'BMW',      model: '5 Series',    category: 'Sedan',  height: 1.45, weight: 1820, from: 'Studen',  to: 'Lucerne Motors',   priority: 'High',     type: 'ICE', lane: 'A-4', lanePos: 2 },
  { id: 'CH-2862', make: 'Mercedes', model: 'GLC',         category: 'SUV',    height: 1.65, weight: 1950, from: 'Lupfig',  to: 'Geneva Auto AG',   priority: 'Normal',   type: 'ICE', lane: 'C-2', lanePos: 1 },
  { id: 'CH-2863', make: 'Audi',     model: 'A4',          category: 'Sedan',  height: 1.43, weight: 1620, from: 'Studen',  to: 'Geneva Auto AG',   priority: 'High',     type: 'ICE', lane: 'C-2', lanePos: 2 },
  { id: 'CH-2864', make: 'Renault',  model: 'Megane',      category: 'Sedan',  height: 1.45, weight: 1390, from: 'Rümlang', to: 'St. Gallen VW',    priority: 'Normal',   type: 'ICE', lane: 'C-3', lanePos: 1 },
  { id: 'CH-2865', make: 'Ford',     model: 'Kuga',        category: 'SUV/EV', height: 1.68, weight: 1850, from: 'Lupfig',  to: 'St. Gallen VW',    priority: 'High',     type: 'EV',  lane: 'C-3', lanePos: 2 },
  { id: 'CH-2866', make: 'Opel',     model: 'Astra',       category: 'Sedan',  height: 1.44, weight: 1350, from: 'Studen',  to: 'Bern AutoZentrum', priority: 'Normal',   type: 'ICE', lane: 'D-1', lanePos: 1 },
]

export const deliveryTimeline = [
  { hour: '06:00', count: 3  },
  { hour: '07:00', count: 8  },
  { hour: '08:00', count: 14 },
  { hour: '09:00', count: 22 },
  { hour: '10:00', count: 31 },
  { hour: '11:00', count: 19 },
  { hour: '12:00', count: 12 },
  { hour: '13:00', count: 27 },
  { hour: '14:00', count: 34 },
  { hour: '15:00', count: 28 },
  { hour: '16:00', count: 21 },
  { hour: '17:00', count: 15 },
  { hour: '18:00', count: 9  },
  { hour: '19:00', count: 4  },
  { hour: '20:00', count: 1  },
]

export const perfDailyOrders = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  manual: Math.floor(380 + Math.random() * 80 - (i * 3)),
  assisted: Math.floor(520 + i * 12 + Math.random() * 40),
})).map(d => ({
  ...d,
  manual: Math.max(280, Math.min(460, d.manual)),
  assisted: Math.max(520, Math.min(900, d.assisted)),
}))

export const truckUtilisation = [
  { id: 'TRK-021', util: 40 },
  { id: 'TRK-023', util: 70 },
  { id: 'TRK-025', util: 20 },
  { id: 'TRK-027', util: 90 },
  { id: 'TRK-029', util: 0  },
  { id: 'TRK-031', util: 50 },
  { id: 'TRK-033', util: 30 },
  { id: 'TRK-041', util: 80 },
]

export const violationsOverTime = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  violations: i < 14 ? Math.floor(8 + Math.random() * 6) : Math.max(0, Math.floor(4 - i * 0.25 + Math.random() * 2)),
}))
