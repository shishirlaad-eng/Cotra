import { useState, useEffect, useRef } from 'react'
import { C } from '../colors'
import { plannerTrucks, plannerOrders2 } from '../data'
import RoutePopup from '../components/RoutePopup'

// ─── Constants ───────────────────────────────────────────────────────────────
const UPPER_MAX_H_CM = 155

const SLOT_META = {
  U1: { deck: 'upper', col: 1, maxH: UPPER_MAX_H_CM },
  U2: { deck: 'upper', col: 2, maxH: UPPER_MAX_H_CM },
  U3: { deck: 'upper', col: 3, maxH: UPPER_MAX_H_CM },
  U4: { deck: 'upper', col: 4, maxH: UPPER_MAX_H_CM },
  L1: { deck: 'lower', col: 1, maxH: 999 },
  L2: { deck: 'lower', col: 2, maxH: 999 },
  L3: { deck: 'lower', col: 3, maxH: 999 },
  L4: { deck: 'lower', col: 4, maxH: 999 },
  L5: { deck: 'lower', col: 5, maxH: 999 },
}
// Rear → Front loading order (last stop = load first = rear slots)
const LOAD_ORDER = ['L5', 'L4', 'L3', 'U4', 'U3', 'L2', 'L1', 'U2', 'U1']

const STOP_COLORS = ['#1A56A0', '#1A7A4A', '#E8A020', '#7C3AED', '#DC2626']
const STOP_BG     = ['#E8F1FB', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FEE2E2']

const STATUS_META = {
  Available:   { color: C.green,  bg: '#D1FAE5', dot: '●' },
  Loading:     { color: C.blueM, bg: C.blueL,   dot: '◉' },
  'En Route':  { color: C.amber, bg: '#FEF3C7',  dot: '▶' },
  Maintenance: { color: C.textL, bg: C.g1,       dot: '⚙' },
}

// ─── Auto-arrange algorithm ───────────────────────────────────────────────────
function autoArrange(route, orders) {
  const stopsWithOrders = route.stops.map(stop => {
    const avail = orders
      .filter(o => o.to === stop.dealer)
      .sort((a, b) => ({'Critical':0,'High':1,'Normal':2}[a.priority]||2) - ({'Critical':0,'High':1,'Normal':2}[b.priority]||2))
      .slice(0, 3)
    return { ...stop, orders: avail }
  })

  const flat = stopsWithOrders.flatMap(s => s.orders.map(o => ({ ...o, stopNum: s.stopNum, stopDealer: s.dealer })))
  const loadSeq = [...flat].sort((a, b) => b.stopNum - a.stopNum)

  const assignment = {}
  const used = new Set()
  const warnings = []

  loadSeq.forEach((car, idx) => {
    const hcm = Math.round(car.height * 100)
    let placed = false
    for (const slotId of LOAD_ORDER) {
      if (used.has(slotId)) continue
      if (hcm > SLOT_META[slotId].maxH) {
        continue
      }
      assignment[slotId] = { ...car, loadNum: idx + 1 }
      used.add(slotId)
      placed = true
      break
    }
    if (!placed) warnings.push(`${car.make} ${car.model} (${car.height}m) — no compatible slot available`)
  })

  const assignedCars = Object.values(assignment)
  const totalWeight = assignedCars.reduce((s, c) => s + (c.weight || 0), 0)

  const frontW = ['L1','L2','U1','U2'].reduce((s, id) => s + (assignment[id]?.weight || 0), 0)
  const rearW  = ['L3','L4','L5','U3','U4'].reduce((s, id) => s + (assignment[id]?.weight || 0), 0)
  const totalW = (frontW + rearW) || 1
  const axle = { front: Math.round(frontW / totalW * 100), rear: Math.round(rearW / totalW * 100) }

  const heightOK = assignedCars.every(c => {
    const slotId = Object.keys(assignment).find(k => assignment[k].id === c.id)
    if (!slotId) return true
    return Math.round(c.height * 100) <= SLOT_META[slotId].maxH
  })

  return { assignment, stopsWithOrders, loadSeq, totalWeight, totalCars: assignedCars.length, axle, warnings, heightOK }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TruckCard({ truck, selected, onClick, planned }) {
  const sm = STATUS_META[truck.status] || STATUS_META.Maintenance
  const free = truck.slots - truck.usedSlots
  const canPlan = truck.status === 'Available' || planned

  return (
    <div
      onClick={() => canPlan && onClick(truck)}
      style={{
        background: planned ? '#F0FDF4' : selected ? C.blueL : C.white,
        border: `1.5px solid ${planned ? C.green : selected ? C.blueM : C.g2}`,
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 8,
        cursor: canPlan ? 'pointer' : 'default',
        opacity: truck.status === 'Maintenance' && !planned ? 0.5 : 1,
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontWeight: 700, fontSize: 12.5, color: C.blue, fontFamily: 'monospace' }}>{truck.id}</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {planned && <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fff', background: C.green, padding: '2px 7px', borderRadius: 10 }}>✓ Planned</span>}
          <span style={{ fontSize: 10.5, fontWeight: 700, color: sm.color, background: sm.bg, padding: '2px 7px', borderRadius: 10 }}>
            {sm.dot} {truck.status}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.text, marginBottom: 3 }}>{truck.driver}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: C.textL }}>{free} slot{free !== 1 ? 's' : ''} free · {truck.plate}</span>
        {canPlan && (
          <span style={{ fontSize: 10.5, color: planned ? C.green : C.blueM, fontWeight: 600 }}>{planned ? 'View deck →' : 'Plan Route →'}</span>
        )}
      </div>
      {/* Capacity bar */}
      <div style={{ marginTop: 6, height: 4, background: C.g2, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${(truck.usedSlots / truck.slots) * 100}%`, height: '100%', background: truck.usedSlots > 7 ? C.amber : C.blueM, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function PlanningAnim({ truck, route, onDone }) {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: '🔍', text: `Scanning orders for ${route.stops.length} stops...` },
    { icon: '📦', text: 'Assigning vehicles by priority...' },
    { icon: '⚖️', text: 'Checking weight & height constraints...' },
    { icon: '🧩', text: 'Arranging deck positions (LIFO)...' },
    { icon: '✅', text: 'Generating lane loading sequence...' },
  ]

  useEffect(() => {
    if (step < steps.length) {
      const t = setTimeout(() => setStep(s => s + 1), 480)
      return () => clearTimeout(t)
    } else {
      setTimeout(onDone, 400)
    }
  }, [step])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: 12, padding: '36px 48px', minWidth: 380, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Auto-Planning Route</div>
        <div style={{ fontSize: 12.5, color: C.textL, marginBottom: 24 }}>{truck.id} · {route.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i < step ? 1 : 0.3, transition: 'opacity 0.3s' }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{i < step ? '✅' : s.icon}</span>
              <span style={{ fontSize: 13, color: i < step ? C.green : C.textL, fontWeight: i < step ? 600 : 400 }}>{s.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, height: 4, background: C.g2, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${(step / steps.length) * 100}%`, height: '100%', background: C.blue, borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Drag-and-drop helpers ────────────────────────────────────────────────────

function checkDropCompat(sourceCar, targetSlotId, targetCar, sourceSlotId) {
  const issues = []
  const isTargetUpper = targetSlotId.startsWith('U')
  const isSourceUpper = sourceSlotId.startsWith('U')
  if (isTargetUpper && Math.round(sourceCar.height * 100) > UPPER_MAX_H_CM)
    issues.push(`${sourceCar.make} ${sourceCar.model} (${sourceCar.height}m) too tall for upper deck — max 1.55m`)
  if (targetCar && isSourceUpper && Math.round(targetCar.height * 100) > UPPER_MAX_H_CM)
    issues.push(`${targetCar.make} ${targetCar.model} (${targetCar.height}m) too tall for upper deck — max 1.55m`)
  return { ok: issues.length === 0, issues }
}

function calcLiveStats(assignment, totalCars) {
  const frontW = ['L1','L2','U1','U2'].reduce((s,id) => s + (assignment[id]?.weight || 0), 0)
  const rearW  = ['L3','L4','L5','U3','U4'].reduce((s,id) => s + (assignment[id]?.weight || 0), 0)
  const total  = (frontW + rearW) || 1
  const axle   = { front: Math.round(frontW / total * 100), rear: Math.round(rearW / total * 100) }
  const conflicts = Object.entries(assignment)
    .filter(([id, car]) => car && id.startsWith('U') && Math.round(car.height * 100) > UPPER_MAX_H_CM)
    .map(([id, car]) => `${car.make} ${car.model} in ${id} (${car.height}m)`)
  return { axle, conflicts, heightOK: conflicts.length === 0 }
}

// ─── Replan helper ────────────────────────────────────────────────────────────
// Mirrors autoArrange's rules exactly:
//   1. LIFO  — last-stop cars load first → fill rear slots first
//   2. Priority tiebreaker within the same stop (Critical > High > Normal)
//   3. Height constraint — cars > 155 cm cannot go to upper deck
//   4. Compact — starts fresh from LOAD_ORDER, no gaps

const PRIORITY_ORDER = { Critical: 0, High: 1, Normal: 2 }

function replanAssignment(candidates, maxWeight = Infinity) {
  const cars = Array.isArray(candidates)
    ? candidates.filter(Boolean)
    : Object.values(candidates).filter(Boolean)
  const sorted = [...cars].sort((a, b) => {
    // Primary: last stop loads first (LIFO)
    if (b.stopNum !== a.stopNum) return b.stopNum - a.stopNum
    // Tiebreaker: higher priority loads first (Critical before High before Normal)
    return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
  })

  const newAsgn = {}
  const used    = new Set()
  const unplaced = []
  let totalWeight = 0

  sorted.forEach((car, idx) => {
    if (totalWeight + (car.weight || 0) > maxWeight) {
      unplaced.push({ ...car, replanReason: 'weight limit' })
      return
    }

    const hcm = Math.round(car.height * 100)
    let placed = false
    for (const slotId of LOAD_ORDER) {
      if (used.has(slotId)) continue
      if (hcm > SLOT_META[slotId].maxH) continue   // height rule
      newAsgn[slotId] = { ...car, loadNum: idx + 1 }
      used.add(slotId)
      totalWeight += car.weight || 0
      placed = true
      break
    }
    if (!placed) unplaced.push({ ...car, replanReason: 'no compatible slot' })
  })

  return { assignment: newAsgn, unplaced, totalWeight }
}

// ─── DeckSlot (drag + remove aware) ──────────────────────────────────────────

function DeckSlot({ slotId, car, dragSource, dragHover, liveAssignment,
                    onDragStart, onDragEnter, onDragLeave, onDrop, onDragEnd,
                    onRemove, selectedCar, onAssign }) {
  const empty   = !car
  const isUpper = slotId.startsWith('U')
  const isSrc   = dragSource === slotId
  const isHov   = dragHover === slotId && dragSource && dragSource !== slotId

  // Is the selected car ready to be assigned to this slot?
  const canAssignHere = empty && !!selectedCar && !dragSource
  const assignHeightWarn = canAssignHere && isUpper && Math.round(selectedCar.height * 100) > UPPER_MAX_H_CM

  let isValidDrop = false, isInvalidDrop = false, isLegalCandidate = false
  if (dragSource && dragSource !== slotId) {
    const sc = liveAssignment[dragSource]
    if (sc) {
      const compat = checkDropCompat(sc, slotId, car, dragSource)
      isLegalCandidate = compat.ok
      if (isHov) { isValidDrop = compat.ok; isInvalidDrop = !compat.ok }
    }
  }

  const stopIdx = car ? (car.stopNum - 1) : 0
  let borderColor, bgColor, borderStyle

  if (isSrc)              { borderColor = C.blueM;    bgColor = C.blueL;    borderStyle = 'dashed' }
  else if (isValidDrop)   { borderColor = C.green;    bgColor = '#DCFCE7';  borderStyle = 'solid'  }
  else if (isInvalidDrop) { borderColor = C.red;      bgColor = '#FEE2E2';  borderStyle = 'solid'  }
  else if (dragSource && isLegalCandidate)
                           { borderColor = '#6EE7B7'; bgColor = '#F0FDF4';  borderStyle = 'dashed' }
  else if (canAssignHere)  { borderColor = assignHeightWarn ? C.amber : C.green
                             bgColor     = assignHeightWarn ? '#FFF7ED' : '#F0FDF4'
                             borderStyle = 'dashed' }
  else {
    borderColor = empty ? C.g2 : (STOP_COLORS[stopIdx] || C.textL)
    bgColor     = empty ? 'transparent' : (STOP_BG[stopIdx] || C.g1)
    borderStyle = empty ? 'dashed' : 'solid'
  }

  const heightConflict = !empty && isUpper && Math.round(car.height * 100) > UPPER_MAX_H_CM

  return (
    <div
      draggable={!empty}
      onDragStart={!empty ? (e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(slotId) } : undefined}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragEnter(slotId) }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(slotId) }}
      onDragEnd={onDragEnd}
      style={{
        width: 108, minHeight: isUpper ? 82 : 90,
        border: `2px ${borderStyle} ${borderColor}`,
        borderRadius: 7, background: bgColor,
        padding: empty ? 0 : '7px 8px',
        display: 'flex', flexDirection: 'column',
        alignItems: empty ? 'center' : 'flex-start',
        justifyContent: empty ? 'center' : 'space-between',
        position: 'relative',
        cursor: !empty ? (isSrc ? 'grabbing' : 'grab') : (dragSource ? 'copy' : 'default'),
        opacity: isSrc ? 0.4 : 1,
        transition: 'border-color 0.1s, background 0.1s, opacity 0.12s',
        userSelect: 'none',
        boxShadow: isValidDrop ? '0 0 0 3px #86EFAC' : isInvalidDrop ? '0 0 0 3px #FCA5A5' : 'none',
      }}
    >
      {/* Drop overlays */}
      {isValidDrop && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, pointerEvents: 'none', zIndex: 2 }}>⬇</div>
      )}
      {isInvalidDrop && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 5, background: '#FEE2E260', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>🚫</div>
            <div style={{ fontSize: 9.5, color: C.red, fontWeight: 700, marginTop: 2 }}>Height conflict</div>
          </div>
        </div>
      )}

      {empty ? (
        canAssignHere ? (
          // ── Assign mode: a car is selected in the panel ──────────────────
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 2px', width: '100%' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: assignHeightWarn ? '#92400E' : C.green, textAlign: 'center', lineHeight: 1.3 }}>
              {selectedCar.make}<br/>{selectedCar.model}
            </div>
            {assignHeightWarn && (
              <div style={{ fontSize: 9, color: C.amber, fontWeight: 700 }}>⚠ Height</div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onAssign(slotId) }}
              style={{
                padding: '3px 8px', border: 'none', borderRadius: 4,
                background: assignHeightWarn ? C.amber : C.green,
                color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                marginTop: 2,
              }}
            >
              ↓ Assign
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 10.5, color: isValidDrop ? C.green : (dragSource && isLegalCandidate ? '#6EE7B7' : C.g2), fontWeight: 500 }}>
            {isValidDrop ? 'Drop here ✓' : 'Empty'}
          </span>
        )
      ) : (
        <>
          {/* ── Remove button (top-right, not shown while dragging) ── */}
          {!dragSource && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(slotId, car) }}
              title={`Remove ${car.make} ${car.model} from deck`}
              style={{
                position: 'absolute', top: 3, right: 3,
                width: 17, height: 17, borderRadius: '50%',
                background: '#FEE2E2', border: `1px solid #FCA5A5`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900, color: C.red, zIndex: 4, padding: 0,
                lineHeight: 1, transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.red + ''}
              onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
            >✕</button>
          )}

          {/* Stop badge */}
          <div style={{ fontSize: 10, fontWeight: 700, color: STOP_COLORS[stopIdx]||C.textL, background: STOP_BG[stopIdx]||C.g1, borderRadius: 4, padding: '1px 5px', border: `1px solid ${STOP_COLORS[stopIdx]||C.g2}`, marginBottom: 3, alignSelf: 'flex-start', zIndex: 1, maxWidth: 76 }}>
            Stop {car.stopNum}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text, lineHeight: 1.3, zIndex: 1 }}>{car.make}</div>
          <div style={{ fontSize: 11, color: C.textL, zIndex: 1 }}>{car.model}</div>
          <div style={{ fontSize: 10, color: heightConflict ? C.red : C.textL, marginTop: 2, zIndex: 1, fontWeight: heightConflict ? 700 : 400 }}>
            {heightConflict && '⚠ '}{car.height}m · {car.weight}kg
          </div>
          <div style={{ position: 'absolute', bottom: 4, right: 5, fontSize: 10, fontWeight: 800, color: STOP_COLORS[stopIdx]||C.textL, opacity: 0.6, zIndex: 1 }}>#{car.loadNum}</div>
        </>
      )}
    </div>
  )
}

// ─── DeckView (drag, remove, replan) ─────────────────────────────────────────

function DeckView({ truck, route, plan, onValidate, aiPlanned, verified }) {
  const upperSlots = ['U1','U2','U3','U4']
  const lowerSlots = ['L1','L2','L3','L4','L5']
  const { stopsWithOrders, loadSeq, warnings, totalCars } = plan

  const [localAssignment, setLocalAssignment] = useState(() => ({ ...plan.assignment }))
  const [removedCars,     setRemovedCars]     = useState([])
  const [dragSource,      setDragSource]      = useState(null)
  const [dragHover,       setDragHover]       = useState(null)
  const [dndMsg,          setDndMsg]          = useState(null)
  const msgTimer = useRef(null)

  // ── Available-cars panel state ─────────────────────────────────────────────
  const [selectedCar,    setSelectedCar]    = useState(null)
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterStop,     setFilterStop]     = useState('All')   // 'All' | stopNum (1,2,…) | 'offRoute'
  const [filterSearch,   setFilterSearch]   = useState('')

  // Live stats always reflect current localAssignment
  const live = calcLiveStats(localAssignment, totalCars)
  const liveCars = Object.values(localAssignment).filter(Boolean)
  const liveWeight = liveCars.reduce((s, c) => s + (c.weight || 0), 0)
  const liveCount  = liveCars.length

  // Cars not yet placed on the deck — only show cars going to a dealer on this route
  const assignedIds   = new Set(liveCars.map(c => c.id))
  const availableCars = plannerOrders2
    .filter(c => !assignedIds.has(c.id))
    .filter(c => stopsWithOrders.some(s => s.dealer === c.to))
  const routeAvailableCars = availableCars
    .map(car => {
      const matchStop = stopsWithOrders.find(s => s.dealer === car.to)
      return matchStop ? { ...car, stopNum: matchStop.stopNum, stopDealer: matchStop.dealer } : null
    })
    .filter(Boolean)
  const filteredAvail = availableCars.filter(c => {
    if (filterPriority !== 'All' && c.priority !== filterPriority) return false
    if (filterStop !== 'All') {
      const matchStop = stopsWithOrders.find(s => s.dealer === c.to)
      if (!matchStop || matchStop.stopNum !== Number(filterStop)) return false
    }
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      if (!`${c.make} ${c.model} ${c.id}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  const flashMsg = (text, type) => {
    setDndMsg({ text, type, key: Date.now() })
    if (msgTimer.current) clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setDndMsg(null), 4000)
  }

  // ── Remove car from a slot ──────────────────────────────────────────────────
  const handleRemove = (slotId, car) => {
    const newAsgn = { ...localAssignment }
    delete newAsgn[slotId]
    setLocalAssignment(newAsgn)
    setRemovedCars(prev => [...prev, { ...car, removedFromSlot: slotId }])
    flashMsg(`🗑 ${car.make} ${car.model} removed from ${slotId} — click "Deck Planning" to re-optimise`, 'warning')
  }

  // ── Replan remaining cars on the deck ─────────────────────────────────────
  const handleReplan = () => {
    const { assignment: newAsgn, unplaced } = replanAssignment(localAssignment)
    setLocalAssignment(newAsgn)
    const placed = Object.keys(newAsgn).length
    if (unplaced.length > 0) {
      flashMsg(
        `♻ Deck re-optimised: ${placed} vehicle${placed !== 1 ? 's' : ''} placed · ⚠ ${unplaced.length} could not fit (height constraint) — added to removed list`,
        'warning'
      )
      setRemovedCars(prev => [...prev, ...unplaced.map(c => ({ ...c, removedFromSlot: 'N/A (height)' }))])
    } else {
      flashMsg(
        `♻ Deck re-optimised · ${placed} vehicle${placed !== 1 ? 's' : ''} arranged LIFO + priority · ${removedCars.length} removed from dispatch`,
        'success'
      )
    }
  }

  // ── Assign a car from the available-cars panel to an empty slot ───────────
  const handleFullReplan = () => {
    const candidateMap = new Map()
    liveCars.forEach(car => candidateMap.set(car.id, car))
    routeAvailableCars.forEach(car => candidateMap.set(car.id, car))

    const { assignment: newAsgn, unplaced } = replanAssignment(
      [...candidateMap.values()],
      truck.maxWeight
    )
    const placed = Object.keys(newAsgn).length
    const added = Object.values(newAsgn).filter(car => !assignedIds.has(car.id)).length

    setLocalAssignment(newAsgn)
    setSelectedCar(null)
    setRemovedCars(unplaced.map(car => ({
      ...car,
      removedFromSlot: car.replanReason || 'not selected by deck planning',
    })))

    flashMsg(
      `Deck planned: ${placed} placed, ${added} added from queue${unplaced.length ? `, ${unplaced.length} could not fit` : ''}`,
      unplaced.length ? 'warning' : 'success'
    )
  }

  const handleAssign = (slotId) => {
    if (!selectedCar) return
    const matchStop = stopsWithOrders.find(s => s.dealer === selectedCar.to)
    const stopNum   = matchStop ? matchStop.stopNum : 0
    const hcm       = Math.round(selectedCar.height * 100)
    const isUpper   = slotId.startsWith('U')
    const loadIdx   = LOAD_ORDER.indexOf(slotId)

    const newAsgn = {
      ...localAssignment,
      [slotId]: { ...selectedCar, stopNum, loadNum: loadIdx + 1 },
    }
    setLocalAssignment(newAsgn)
    setSelectedCar(null)

    if (isUpper && hcm > UPPER_MAX_H_CM)
      flashMsg(`⚠ ${selectedCar.make} ${selectedCar.model} → ${slotId} with height warning (${selectedCar.height}m > 1.55m upper limit)`, 'warning')
    else if (!matchStop)
      flashMsg(`⚠ ${selectedCar.make} ${selectedCar.model} → ${slotId} · Destination "${selectedCar.to}" is not on this route`, 'warning')
    else
      flashMsg(`✓ ${selectedCar.make} ${selectedCar.model} assigned to ${slotId} · Stop ${stopNum} (${matchStop.dealer})`, 'success')
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const handleDrop = (targetSlotId) => {
    if (!dragSource || dragSource === targetSlotId) {
      setDragSource(null); setDragHover(null); return
    }
    const sourceCar = localAssignment[dragSource]
    const targetCar = localAssignment[targetSlotId]
    if (!sourceCar) { setDragSource(null); setDragHover(null); return }

    const compat = checkDropCompat(sourceCar, targetSlotId, targetCar, dragSource)
    const newAsgn = { ...localAssignment }
    if (targetCar) { newAsgn[dragSource] = targetCar; newAsgn[targetSlotId] = sourceCar }
    else           { newAsgn[targetSlotId] = sourceCar; delete newAsgn[dragSource] }
    setLocalAssignment(newAsgn)

    if (compat.ok)
      flashMsg(targetCar
        ? `✓ Swapped ${sourceCar.make} ${sourceCar.model} (${dragSource}) ↔ ${targetCar.make} ${targetCar.model} (${targetSlotId})`
        : `✓ Moved ${sourceCar.make} ${sourceCar.model} → ${targetSlotId}`, 'success')
    else
      flashMsg(`⚠ Non-compliant override: ${compat.issues.join(' · ')}`, 'warning')

    setDragSource(null); setDragHover(null)
  }

  const sharedSlotProps = (id) => ({
    slotId: id, dragSource, dragHover,
    liveAssignment: localAssignment,
    onDragStart: (sid) => setDragSource(sid),
    onDragEnter: (sid) => setDragHover(sid),
    onDragLeave: () => setDragHover(null),
    onDrop: handleDrop,
    onDragEnd: () => { setDragSource(null); setDragHover(null) },
    onRemove: handleRemove,
    selectedCar,
    onAssign: handleAssign,
  })

  const allWarnings = [
    ...warnings,
    ...live.conflicts.map(c => `Height conflict after adjustment: ${c}`),
    ...(liveWeight > truck.maxWeight
      ? [`Total weight ${liveWeight.toLocaleString()}kg exceeds ${truck.maxWeight.toLocaleString()}kg limit for ${truck.id}`]
      : []),
  ]

  // Column header style helper
  const TH = (w, align = 'left') => ({
    width: w, padding: '9px 12px', fontSize: 11, fontWeight: 700,
    color: C.textL, textAlign: align, whiteSpace: 'nowrap',
    borderBottom: `2px solid ${C.g2}`, userSelect: 'none',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{truck.id} — {route.name}</div>
          <div style={{ fontSize: 13, color: C.textL, marginTop: 2 }}>
            {truck.driver} · {liveCount} on deck · {availableCars.length} available to assign · {route.stops.length} stops
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {(removedCars.length > 0 || routeAvailableCars.length > 0) && (
            <button onClick={handleFullReplan} style={{
              padding: '8px 16px', border: `2px solid ${C.amber}`, borderRadius: 7,
              background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ♻ Deck Planning
              <span style={{ background: C.amber, color: '#fff', borderRadius: 10, fontSize: 10.5, fontWeight: 800, padding: '1px 6px' }}>
                {routeAvailableCars.length} available
              </span>
            </button>
          )}
          {allWarnings.length > 0 && (
            <div style={{ fontSize: 12, color: C.amber, background: '#FEF3C7', border: `1px solid #FCD34D`, borderRadius: 6, padding: '6px 12px', fontWeight: 600 }}>
              ⚠ {allWarnings.length} warning{allWarnings.length > 1 ? 's' : ''}
            </div>
          )}
          <button disabled={verified} onClick={() => onValidate(localAssignment, live)} style={{
            background: verified ? C.green : C.blue, border: 'none', borderRadius: 7, padding: '8px 20px',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: verified ? 'default' : 'pointer',
          }}>{verified ? 'Verified' : aiPlanned ? 'Verify' : 'Validate Route →'}</button>
        </div>
      </div>

      {/* ══ REMOVED CARS PANEL ══════════════════════════════════════════════ */}
      {removedCars.length > 0 && (
        <div style={{ background: '#FFF7ED', border: `1.5px solid ${C.amber}`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            🗑 Removed from dispatch ({removedCars.length})
            <span style={{ fontWeight: 400, color: C.textL }}>— these vehicles will NOT be loaded</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {removedCars.map((car, i) => (
              <div key={i} style={{ background: '#FEF3C7', border: `1px solid #FCD34D`, borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                {car.make} {car.model}
                <span style={{ fontWeight: 400, marginLeft: 4, color: C.textL }}>was {car.removedFromSlot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STOP SUMMARY ════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {stopsWithOrders.map((s, i) => (
          <div key={i} style={{ background: STOP_BG[i], border: `1.5px solid ${STOP_COLORS[i]}`, borderRadius: 8, padding: '7px 12px', minWidth: 130 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: STOP_COLORS[i], marginBottom: 2 }}>STOP {s.stopNum}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{s.city || s.dealer.split(' ')[0]}</div>
            <div style={{ fontSize: 11.5, color: C.textL, marginTop: 1 }}>{s.dealer}</div>
            <div style={{ fontSize: 11, color: STOP_COLORS[i], marginTop: 3, fontWeight: 600 }}>{s.orders.length} car{s.orders.length !== 1 ? 's' : ''} · ETA {s.eta}</div>
          </div>
        ))}
      </div>

      {/* ══ TRUCK DECK ILLUSTRATION ══════════════════════════════════════════ */}
      <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 20px rgba(13,31,60,0.12)', border: `1px solid ${C.g2}` }}>

        {/* ── Title bar ─────────────────────────────────────────────────────── */}
        <div style={{ background: C.navy, padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>🚛 COTRA Auto-Transporter AG — Deck View</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
            {selectedCar
              ? <span style={{ color: '#6EE7B7', fontWeight: 600 }}>✓ {selectedCar.make} {selectedCar.model} selected — click Assign on an empty slot</span>
              : <>Drag · ✕ Remove · Select from queue below to assign</>
            }
          </div>
        </div>

        {/* ── Main truck body row (trailer + cab side by side) ── */}
        <div style={{ display: 'flex', alignItems: 'stretch', background: C.white }}>

          {/* ══ TRAILER: cargo body with deck slots ══════════════════════════ */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>

            {/* Trailer side-panel SVG background (stretches to fill slot area) */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none"
              style={{ display: 'none' }}>

              {/* Upper deck tint (light sky blue) */}
              <rect x="0" y="7.5" width="100" height="38.5" fill="rgba(222,236,252,0.92)"/>
              {/* Lower deck tint (near-white) */}
              <rect x="0" y="53" width="100" height="39.5" fill="rgba(247,251,255,0.97)"/>

              {/* ── Top rivet rail ── */}
              <rect x="0" y="0" width="100" height="7.5" fill="#3A4858"/>
              {/* Rivets — orange hex-style bolts */}
              {[5,11.5,18,24.5,31,37.5,44,50.5,57,63.5,70,76.5,83,89.5,96].map(x => (
                <ellipse key={x} cx={x} cy={3.7} rx={1.9} ry={1.3} fill="#C08030" stroke="#8A5820" strokeWidth="0.3"/>
              ))}

              {/* ── Bottom rivet rail ── */}
              <rect x="0" y="92.5" width="100" height="7.5" fill="#3A4858"/>
              {[5,11.5,18,24.5,31,37.5,44,50.5,57,63.5,70,76.5,83,89.5,96].map(x => (
                <ellipse key={x} cx={x} cy={96.3} rx={1.9} ry={1.3} fill="#C08030" stroke="#8A5820" strokeWidth="0.3"/>
              ))}

              {/* ── Deck I-beam divider ── */}
              <rect x="0" y="46.5" width="100" height="7" fill="#283444"/>
              {/* Beam flange highlights */}
              <rect x="0" y="45.2" width="100" height="1.4" fill="#5A88C4" opacity="0.55"/>
              <rect x="0" y="53.4" width="100" height="1.4" fill="#5A88C4" opacity="0.55"/>

              {/* ── Rear door frame (LEFT = rear of truck) ── */}
              <rect x="0" y="0" width="1.4" height="100" fill="#283444"/>
              <rect x="1.4" y="7.5" width="0.7" height="85" fill="#5A6A7A" opacity="0.55"/>
              {/* Hinge bolts */}
              {[24,50,76].map(y => (
                <circle key={y} cx={0.7} cy={y} r={0.9} fill="#6B7C8E"/>
              ))}

              {/* ── Panel ribs (subtle vertical corrugations) ── */}
              {[20,40,60,80].map(x => (
                <line key={x} x1={x} y1={7.5} x2={x} y2={92.5} stroke="rgba(0,20,50,0.05)" strokeWidth="0.8"/>
              ))}

              {/* ── Front connection wall (right edge) ── */}
              <rect x="99.2" y="0" width="0.8" height="100" fill="#283444" opacity="0.7"/>

              {/* MAX height badge */}
              <rect x="82" y="41" width="17" height="5.5" rx="0.6" fill="#C0392B"/>
              <text x="90.5" y="45.2" textAnchor="middle" fill="white" fontSize="2.7" fontWeight="700" fontFamily="Inter, sans-serif">MAX 1.55m ↑</text>
            </svg>

            {/* Slot grid (interactive layer on top) */}
            <div style={{ position: 'relative', zIndex: 1, padding: '10px 8px 12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 52, marginBottom: 4 }}>
                <div style={{ fontSize: 9, color: '#4A5C70', fontWeight: 700, letterSpacing: 0.4 }}>← FRONT / UNLOAD FIRST</div>
                <div style={{ fontSize: 9, color: '#4A5C70', fontWeight: 700, letterSpacing: 0.4 }}>LOAD FIRST / REAR →</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <div style={{ width: 46, fontSize: 9.5, fontWeight: 800, color: C.blueM, textAlign: 'right', flexShrink: 0 }}>UPPER</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {upperSlots.map(id => (
                    <div key={id}>
                      <div style={{ textAlign: 'center', fontSize: 9, color: '#4A5C70', marginBottom: 2, fontWeight: 600 }}>{id}</div>
                      <DeckSlot {...sharedSlotProps(id)} car={localAssignment[id] || null} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 16 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 46, fontSize: 9.5, fontWeight: 800, color: C.green, textAlign: 'right', flexShrink: 0 }}>LOWER</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {lowerSlots.map(id => (
                    <div key={id}>
                      <div style={{ textAlign: 'center', fontSize: 9, color: '#4A5C70', marginBottom: 2, fontWeight: 600 }}>{id}</div>
                      <DeckSlot {...sharedSlotProps(id)} car={localAssignment[id] || null} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>{/* end trailer */}

          {/* ══ CAB: right-facing conventional long-hood truck ════════════════ */}
          <div style={{ display: 'none' }}>
            <svg viewBox="0 0 320 260" preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
              <defs>
                <linearGradient id="cgBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#D84535"/>
                  <stop offset="55%"  stopColor="#C0392B"/>
                  <stop offset="100%" stopColor="#8E2118"/>
                </linearGradient>
                <linearGradient id="cgHood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#C83928"/>
                  <stop offset="100%" stopColor="#9A2418"/>
                </linearGradient>
                <linearGradient id="cgBack" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8E2118"/>
                  <stop offset="100%" stopColor="#C0392B"/>
                </linearGradient>
              </defs>

              {/* ══ OVERALL CAB SILHOUETTE (right-facing long-hood conventional) ══ */}
              {/*
                  Back wall left (x=8), flat roof to A-pillar start (x=196),
                  A-pillar curves down-right to hood level (x=270,y=104),
                  Hood runs right to front face (x=313),
                  Front face straight down to (x=313,y=225),
                  Bottom back to (x=8,y=225)
              */}
              <path d={[
                'M 8,2',
                'L 196,2',
                'C 215,2 237,17 278,104',
                'L 310,104',
                'L 313,111', 'L 314,128',
                'L 314,225',
                'L 8,225',
                'Z'
              ].join(' ')} fill="url(#cgBody)" stroke="#6E1710" strokeWidth="1.5"/>

              {/* Hood panel (slightly darker, right portion) */}
              <path d={[
                'M 272,104 L 310,104 L 313,111 L 314,128 L 314,225 L 256,225 L 256,118 Z'
              ].join(' ')} fill="url(#cgHood)"/>
              <line x1="256" y1="104" x2="256" y2="225" stroke="#6E1710" strokeWidth="1.2"/>

              {/* Cab roof subtle highlight */}
              <rect x="8" y="2" width="188" height="7" fill="rgba(255,255,255,0.09)"/>

              {/* ── Back post (left, connects to trailer) ── */}
              <rect x="8" y="2" width="18" height="223" fill="url(#cgBack)"/>
              <line x1="26" y1="2" x2="26" y2="225" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>

              {/* ── Windshield glass (angled forward-right) ── */}
              <path d={[
                'M 199,6',
                'C 218,6 240,20 280,100',
                'L 289,100',
                'C 246,17 224,6 201,6',
                'Z'
              ].join(' ')} fill="rgba(178,214,246,0.50)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.3"/>
              {/* Upper tint on glass */}
              <path d="M 199,6 C 215,6 230,13 246,32 C 231,15 217,7 201,7 Z" fill="rgba(20,50,120,0.13)"/>
              {/* Wiper */}
              <line x1="215" y1="92" x2="244" y2="38" stroke="rgba(0,0,0,0.25)" strokeWidth="1.6" strokeLinecap="round"/>
              {/* A-pillar chrome edge */}
              <path d="M 196,2 C 216,2 238,17 280,104 L 285,104 C 241,14 220,2 196,2 Z"
                fill="rgba(220,220,220,0.16)"/>

              {/* ── Door area ── */}
              <rect x="28" y="100" width="174" height="117" rx="3" fill="#B83526"/>
              <rect x="30" y="102" width="170" height="113" rx="2" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
              {/* Front door-hinge pillar */}
              <rect x="192" y="102" width="6" height="115" rx="1" fill="#8E2118"/>
              {[112,135,158,181].map(y => (
                <circle key={y} cx={195} cy={y} r={3} fill="#701A12" stroke="#8E2118" strokeWidth="0.5"/>
              ))}

              {/* ── Door window ── */}
              <rect x="34" y="106" width="154" height="70" rx="6"
                fill="rgba(172,210,244,0.44)" stroke="rgba(255,255,255,0.20)" strokeWidth="1.4"/>
              {/* Glare streak */}
              <rect x="36" y="108" width="42" height="66" rx="4" fill="rgba(255,255,255,0.05)"/>

              {/* ── COTRA branding ── */}
              <text x="111" y="151" textAnchor="middle" fill="white" fontSize="19" fontWeight="800"
                fontFamily="Inter, sans-serif" letterSpacing="3.2" opacity="0.97">COTRA</text>
              <text x="111" y="163" textAnchor="middle" fill="rgba(255,255,255,0.46)" fontSize="7"
                fontFamily="Inter, sans-serif" letterSpacing="1.6">AUTOTRANSPORT AG</text>

              {/* ── Swiss cross ── */}
              <rect x="170" y="109" width="20" height="20" rx="2.5" fill="#EE0000"/>
              <rect x="176.5" y="112" width="7" height="14" fill="white"/>
              <rect x="173" y="116.5" width="14" height="7" fill="white"/>

              {/* ── Door handle ── */}
              <rect x="186" y="163" width="13" height="3.5" rx="1.8" fill="rgba(255,255,255,0.52)"/>

              {/* ── Fuel tanks ── */}
              <rect x="30" y="188" width="64" height="36" rx="5" fill="#7A1C1C"/>
              <rect x="33" y="191" width="58" height="30" rx="3.5" fill="#6A1818"/>
              <circle cx="78" cy="199" r="4.5" fill="#444" stroke="#333" strokeWidth="0.6"/>
              <text x="51" y="210" textAnchor="middle" fill="rgba(255,255,255,0.30)" fontSize="7"
                fontFamily="Inter, sans-serif">DIESEL</text>

              {/* ── Steps ── */}
              <rect x="30" y="217" width="52" height="5" rx="1.5" fill="#561212"/>
              <rect x="30" y="224" width="52" height="3.5" rx="1.5" fill="#461010"/>

              {/* ── Exhaust stacks (twin, above cab roof behind windshield) ── */}
              {[190, 208].map(x => (
                <g key={x}>
                  <rect x={x}   y={-38} width={12} height={47} rx="3"   fill="#484848"/>
                  <rect x={x+2} y={-38} width={8}  height={47} rx="2"   fill="#585858"/>
                  <rect x={x-1} y={-44} width={14} height={10} rx="3"   fill="#383838"/>
                  <path d={`M ${x-1},-44 L ${x+5.5},-52 L ${x+13},-44`} fill="#282828"/>
                  {/* Heat shimmer rings */}
                  <ellipse cx={x+6} cy={-50} rx={5} ry={2} fill="none" stroke="rgba(255,200,100,0.12)" strokeWidth="1"/>
                  <ellipse cx={x+6} cy={-56} rx={4} ry={1.5} fill="none" stroke="rgba(255,200,100,0.07)" strokeWidth="1"/>
                </g>
              ))}

              {/* ── Side mirror ── */}
              <line x1="197" y1="48" x2="182" y2="48" stroke="#666" strokeWidth="2.5" strokeLinecap="round"/>
              <rect x="170" y="35" width="23" height="28" rx="4" fill="#3C3C3C" stroke="#505050" strokeWidth="0.8"/>
              <rect x="172" y="37" width="19" height="24" rx="3" fill="rgba(172,210,244,0.40)"/>
              <rect x="172" y="37" width="6"  height="24" fill="rgba(255,255,255,0.05)"/>

              {/* ── Hood louvres / air intake ── */}
              {[126,134,142,150,158,166,174].map(y => (
                <line key={y} x1="260" y1={y} x2="308" y2={y} stroke="rgba(0,0,0,0.17)" strokeWidth="2.5" strokeLinecap="square"/>
              ))}
              <rect x="258" y="120" width="52" height="62" rx="2" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>

              {/* ── Front face: headlights, grille, bumper ── */}
              {/* DRL strip */}
              <rect x="307" y="104" width="8" height="4"  rx="2"   fill="rgba(255,255,255,0.82)"/>
              {/* Headlight */}
              <rect x="307" y="107" width="8" height="28" rx="3"   fill="#FAD04A" opacity="0.92"/>
              <rect x="308" y="108" width="4" height="11" rx="2"   fill="rgba(255,255,255,0.62)"/>
              {/* Turn signal */}
              <rect x="307" y="135" width="8" height="6"  rx="2"   fill="#FF8C00" opacity="0.82"/>
              {/* Fog light */}
              <ellipse cx={311} cy={154} rx={6.5} ry={5.5} fill="rgba(253,211,77,0.62)"/>
              <ellipse cx={311} cy={154} rx={4}   ry={3.5} fill="rgba(255,255,215,0.50)"/>
              {/* Grille surround */}
              <rect x="306" y="141" width="9" height={66} rx="1.5" fill="#0D0D0D"/>
              {[145,151,157,163,169,175,181,187,193,199].map(y => (
                <line key={y} x1={306} y1={y} x2={315} y2={y} stroke="#2A2A2A" strokeWidth="0.9"/>
              ))}
              <rect x="306" y="141" width="9" height={66} rx="1.5" fill="none" stroke="#5A5A5A" strokeWidth="0.8"/>
              {/* Grille COTRA badge */}
              <rect x="307" y="162" width="7" height="7" rx="1" fill="#C0392B" opacity="0.88"/>
              {/* Chrome bumper */}
              <path d="M 304,209 L 315,209 L 315,215 L 316,222 L 316,225 L 302,225 Z"
                fill="#8A8A8A" stroke="#AAAAAA" strokeWidth="0.8"/>
              <rect x="305" y="211" width="9" height={12} rx="0.5" fill="#686868"/>
              {/* Number plate */}
              <rect x="303" y="213" width="10" height="7" rx="1" fill="#F0F0F0"/>
              <text x="308" y="218.5" textAnchor="middle" fill="#333" fontSize="3.5" fontWeight="600" fontFamily="monospace">CH·TG</text>
            </svg>
          </div>{/* end cab */}
        </div>{/* end main truck body row */}

        {/* ── Wheel & chassis row ── */}
        <div style={{ display: 'none' }}>
          <svg viewBox="0 0 1200 82" preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', display: 'block' }}>

            {/* Road */}
            <rect x="0" y="68" width="1200" height="14" fill="#8FA0AE"/>
            <line x1="0" y1="68" x2="1200" y2="68" stroke="#7A8E9A" strokeWidth="1"/>
            {/* Ground shadow */}
            <ellipse cx="600" cy="73" rx="580" ry="7" fill="rgba(0,0,0,0.09)"/>

            {/* ── Chassis rails ── */}
            {/* Trailer chassis (left portion, under trailer body) */}
            <rect x="18"  y="8" width="852" height="10" rx="2" fill="#2A3848"/>
            <rect x="18"  y="8" width="852" height="3"  rx="2" fill="rgba(255,255,255,0.08)"/>
            {/* Tractor chassis (right portion, under cab) */}
            <rect x="840" y="8" width="340" height="10" rx="2" fill="#1E2C3A"/>
            <rect x="840" y="8" width="340" height="3"  rx="2" fill="rgba(255,255,255,0.08)"/>

            {/* ── Landing gear legs (front of trailer) ── */}
            <rect x="285" y="18" width="10" height="38" fill="#4A5A68"/>
            <rect x="313" y="18" width="10" height="38" fill="#4A5A68"/>
            <rect x="278" y="53" width="52"  height="8"  rx="2" fill="#3A4A58"/>

            {/* ── 5th wheel kingpin ── */}
            <rect x="832" y="6" width="74" height="7" rx="2" fill="#4A5060"/>
            <rect x="842" y="11" width="54" height="4" rx="1" fill="#5A6070"/>

            {/* ── Axle bars ── */}
            {/* Rear trailer axle 1 */}
            <line x1="70"   y1="24" x2="148"  y2="24" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round"/>
            {/* Rear trailer axle 2 */}
            <line x1="186"  y1="24" x2="264"  y2="24" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round"/>
            {/* Drive axle (tractor tandem) */}
            <line x1="854"  y1="24" x2="934"  y2="24" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round"/>
            {/* Steer axle (front of tractor) */}
            <line x1="1068" y1="24" x2="1124" y2="24" stroke="#1A1A1A" strokeWidth="8" strokeLinecap="round"/>

            {/* ── Wheels (all 7 in side view) ── */}
            {/* Helper: each entry = [cx, cy] */}
            {[
              /* rear trailer twin 1 */ [70,  44], [148, 44],
              /* rear trailer twin 2 */ [186, 44], [264, 44],
              /* drive tandem twin   */ [854, 44], [934, 44],
              /* steer single        */ [1096,44]
            ].map(([cx, cy]) => {
              const r = 27
              return (
                <g key={`w${cx}`}>
                  {/* Tyre outer */}
                  <circle cx={cx} cy={cy} r={r}   fill="#181818"/>
                  <circle cx={cx} cy={cy} r={r-3}  fill="#212121"/>
                  {/* Tread notches */}
                  {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
                    <line key={a}
                      x1={cx+(r-8)*Math.cos(a*Math.PI/180)} y1={cy+(r-8)*Math.sin(a*Math.PI/180)}
                      x2={cx+(r-0.5)*Math.cos(a*Math.PI/180)} y2={cy+(r-0.5)*Math.sin(a*Math.PI/180)}
                      stroke="#343434" strokeWidth="2.2"/>
                  ))}
                  {/* Rim */}
                  <circle cx={cx} cy={cy} r={r-8}  fill="#6E808E"/>
                  <circle cx={cx} cy={cy} r={r-13} fill="#8A9CAA"/>
                  <circle cx={cx} cy={cy} r={r-18} fill="#6E808E"/>
                  {/* Hub cap */}
                  <circle cx={cx} cy={cy} r={r-21} fill="#C4D0D8"/>
                  <circle cx={cx} cy={cy} r={3.5}  fill="#DDE8EE"/>
                  {/* Lug nuts (7) */}
                  {[0,51,103,154,206,257,309].map(a => (
                    <circle key={a}
                      cx={cx+(r-15)*Math.cos(a*Math.PI/180)}
                      cy={cy+(r-15)*Math.sin(a*Math.PI/180)}
                      r={2.5} fill="#C4D0D8" stroke="#8A9CAA" strokeWidth="0.5"/>
                  ))}
                </g>
              )
            })}
          </svg>
        </div>{/* end wheel row */}

        {/* ── Feedback bar + loading sequence ── */}
        <div style={{ background: C.white, borderTop: `1px solid ${C.g1}`, padding: '10px 18px 12px' }}>
          {dndMsg && (
            <div key={dndMsg.key} style={{
              marginBottom: 8, padding: '8px 14px', borderRadius: 6,
              background: dndMsg.type === 'success' ? '#D1FAE5' : '#FEF3C7',
              border: `1px solid ${dndMsg.type === 'success' ? '#6EE7B7' : '#FCD34D'}`,
              fontSize: 12.5, fontWeight: 600,
              color: dndMsg.type === 'success' ? C.green : '#92400E',
              animation: 'fade-in 0.18s ease',
            }}>{dndMsg.text}</div>
          )}
          {(() => {
            const liveSeq = Object.values(localAssignment).filter(Boolean).sort((a,b) => a.loadNum - b.loadNum)
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text, marginRight: 4, flexShrink: 0 }}>Load order:</span>
                {liveSeq.map((car, i) => (
                  <span key={car.id||i} style={{ fontSize: 11, color: '#fff', background: STOP_COLORS[(car.stopNum-1)]||C.textL, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                    {i+1}. {car.make} {car.model}
                  </span>
                ))}
                {removedCars.map((car, i) => (
                  <span key={'r'+i} style={{ fontSize: 11, color: C.textL, background: C.g2, padding: '2px 7px', borderRadius: 10, fontWeight: 600, textDecoration: 'line-through', opacity: 0.7 }}>
                    {car.make} {car.model}
                  </span>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Total Weight',  value: `${liveWeight.toLocaleString()} kg`, sub: `/ ${truck.maxWeight.toLocaleString()} kg limit`, ok: liveWeight <= truck.maxWeight },
          { label: 'On Deck',       value: `${liveCount} / ${truck.slots}`,     sub: removedCars.length > 0 ? `${removedCars.length} removed` : 'slots used', ok: liveCount <= truck.slots },
          { label: 'Axle Balance',  value: `${live.axle.front}% / ${live.axle.rear}%`, sub: liveCount <= 5 ? 'partial — chassis ok' : 'front / rear', ok: liveCount <= 5 || (live.axle.rear >= 45 && live.axle.rear <= 60) },
          { label: 'Height Check',  value: live.heightOK ? 'All clear' : `${live.conflicts.length} conflict${live.conflicts.length > 1 ? 's' : ''}`, sub: `≤${UPPER_MAX_H_CM}cm upper deck`, ok: live.heightOK },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, border: `1.5px solid ${s.ok ? C.g2 : C.amber}`, borderRadius: 8, padding: '10px 12px', transition: 'border-color 0.2s' }}>
            <div style={{ fontSize: 11, color: C.textL, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.ok ? C.text : C.amber }}>{s.value}</div>
            <div style={{ fontSize: 10.5, color: s.ok ? C.green : C.amber, fontWeight: 600 }}>{s.ok ? '✓ OK' : '⚠ Check'} · {s.sub}</div>
          </div>
        ))}
      </div>

      {/* ══ WARNINGS ════════════════════════════════════════════════════════ */}
      {allWarnings.length > 0 && (
        <div style={{ background: '#FEF3C7', border: `1px solid #FCD34D`, borderRadius: 8, padding: '10px 14px' }}>
          {allWarnings.map((w, i) => <div key={i} style={{ fontSize: 12.5, color: '#92400E' }}>⚠ {w}</div>)}
        </div>
      )}

      {/* ══ AVAILABLE CARS QUEUE (Order Queue style) ════════════════════════ */}
      <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 10, overflow: 'hidden' }}>

        {/* Table header bar */}
        <div style={{ background: C.navy, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>🚗 Available Cars</span>
            <span style={{ background: availableCars.length > 0 ? C.blueM : 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 800, padding: '2px 9px' }}>
              {filteredAvail.length}{filteredAvail.length !== availableCars.length ? ` / ${availableCars.length}` : ''} vehicles
            </span>
            {selectedCar && (
              <span style={{ background: C.amber, color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                ✓ {selectedCar.make} {selectedCar.model} selected
                <button onClick={() => setSelectedCar(null)} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 10, fontWeight: 800, cursor: 'pointer', padding: '1px 5px', marginLeft: 2 }}>✕</button>
              </span>
            )}
          </div>

          {/* Filter controls */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Priority chips */}
            <div style={{ display: 'flex', gap: 3 }}>
              {['All','Critical','High','Normal'].map(p => (
                <button key={p} onClick={() => setFilterPriority(p)} style={{
                  padding: '4px 10px', border: `1.5px solid ${filterPriority === p ? C.blueM : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 10,
                  background: filterPriority === p ? C.blueM : 'transparent',
                  color: filterPriority === p ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.12s',
                }}>{p}</button>
              ))}
            </div>

            {/* Stop filter */}
            <select value={filterStop} onChange={e => setFilterStop(e.target.value)} style={{
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6, padding: '5px 10px',
              fontSize: 12, color: '#fff', fontFamily: 'Inter, sans-serif',
              background: 'rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer',
            }}>
              <option value="All" style={{ background: C.navy }}>All destinations</option>
              {stopsWithOrders.map(s => (
                <option key={s.stopNum} value={s.stopNum} style={{ background: C.navy }}>Stop {s.stopNum} — {s.dealer}</option>
              ))}
            </select>

            {/* Search */}
            <input
              type="text" placeholder="Search…" value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              style={{
                width: 160, border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6,
                padding: '5px 10px', fontSize: 12, color: '#fff',
                fontFamily: 'Inter, sans-serif', background: 'rgba(255,255,255,0.1)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.g1 }}>
                <th style={TH(110)}>Order ID</th>
                <th style={TH(170)}>Vehicle</th>
                <th style={TH(60, 'center')}>Type</th>
                <th style={TH(90, 'center')}>Priority</th>
                <th style={TH(140)}>From</th>
                <th style={TH(160)}>Destination</th>
                <th style={TH(70, 'center')}>Height</th>
                <th style={TH(70, 'center')}>Weight</th>
                <th style={TH(100, 'center')}>Route</th>
                <th style={TH(110, 'center')}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvail.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, color: C.textL }}>
                    {availableCars.length === 0
                      ? '✅ All available vehicles are already on the deck'
                      : 'No vehicles match the current filters'}
                  </td>
                </tr>
              ) : filteredAvail.map((car, rowIdx) => {
                const matchStop  = stopsWithOrders.find(s => s.dealer === car.to)
                const isSel      = selectedCar?.id === car.id
                const stopIdx    = matchStop ? matchStop.stopNum - 1 : -1
                const priColor   = car.priority === 'Critical' ? C.red   : car.priority === 'High' ? C.amber  : C.green
                const priBg      = car.priority === 'Critical' ? '#FEE2E2' : car.priority === 'High' ? '#FEF3C7' : '#D1FAE5'
                const rowBg      = isSel ? '#FFF7ED' : rowIdx % 2 === 0 ? C.white : C.offW

                const TD = (align = 'left', extra = {}) => ({
                  padding: '10px 12px', fontSize: 12.5, color: C.text,
                  textAlign: align, borderBottom: `1px solid ${C.g2}`,
                  background: rowBg, transition: 'background 0.1s', ...extra,
                })

                return (
                  <tr
                    key={car.id}
                    onClick={() => setSelectedCar(isSel ? null : car)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => { if (!isSel) [...e.currentTarget.cells].forEach(td => td.style.background = C.blueL) }}
                    onMouseLeave={e => { [...e.currentTarget.cells].forEach(td => td.style.background = rowBg) }}
                  >
                    {/* Order ID */}
                    <td style={TD()}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: C.blue }}>{car.id}</span>
                    </td>

                    {/* Vehicle */}
                    <td style={TD()}>
                      <div style={{ fontWeight: 700, color: C.text }}>{car.make} {car.model}</div>
                      <div style={{ fontSize: 11, color: C.textL }}>{car.category}</div>
                    </td>

                    {/* Type */}
                    <td style={TD('center')}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: car.type === 'EV' ? C.green : C.textL, background: car.type === 'EV' ? '#D1FAE5' : C.g1, padding: '2px 7px', borderRadius: 8 }}>
                        {car.type}
                      </span>
                    </td>

                    {/* Priority */}
                    <td style={TD('center')}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: priColor, background: priBg, padding: '3px 9px', borderRadius: 10 }}>
                        {car.priority}
                      </span>
                    </td>

                    {/* From */}
                    <td style={TD()}>
                      <span style={{ fontSize: 12, color: C.text }}>{car.from}</span>
                    </td>

                    {/* Destination */}
                    <td style={TD()}>
                      <div style={{ fontSize: 12, color: C.text }}>{car.to}</div>
                    </td>

                    {/* Height */}
                    <td style={TD('center')}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: car.height > 1.55 ? C.amber : C.text }}>
                        {car.height}m {car.height > 1.55 && <span style={{ fontSize: 10 }}>⚠</span>}
                      </span>
                    </td>

                    {/* Weight */}
                    <td style={TD('center')}>
                      <span style={{ fontSize: 12, color: C.text }}>{car.weight.toLocaleString()} kg</span>
                    </td>

                    {/* Route match */}
                    <td style={TD('center')}>
                      {matchStop ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: STOP_COLORS[stopIdx]||C.textL, background: STOP_BG[stopIdx]||C.g1, padding: '3px 9px', borderRadius: 10, border: `1px solid ${STOP_COLORS[stopIdx]||C.g2}` }}>
                          Stop {matchStop.stopNum}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.textL, background: C.g1, padding: '3px 9px', borderRadius: 10 }}>
                          Off-route
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td style={TD('center')}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCar(isSel ? null : car) }}
                        style={{
                          padding: '5px 14px', border: 'none', borderRadius: 6,
                          background: isSel ? C.amber : C.blue,
                          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          transition: 'background 0.12s', whiteSpace: 'nowrap',
                        }}
                      >
                        {isSel ? '✓ Selected' : 'Select →'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer hint */}
        {availableCars.length > 0 && (
          <div style={{ padding: '8px 20px', borderTop: `1px solid ${C.g1}`, background: C.offW, fontSize: 11, color: C.textL }}>
            {selectedCar
              ? `✓ ${selectedCar.make} ${selectedCar.model} is selected — click the ↓ Assign button on any green empty slot in the deck above`
              : 'Click Select → on a vehicle row, then click the Assign button on an empty deck slot above to place it'
            }
          </div>
        )}
      </div>

    </div>
  )
}

function ValidationModal({ truck, route, plan, onConfirm, onBack, verifyOnly }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const truckWeightLimit = truck.maxWeight

  const checks = [
    { label: 'Truck capacity', detail: `${plan.totalCars} of ${truck.slots} slots used`, pass: true },
    { label: 'Total deck weight', detail: `${plan.totalWeight.toLocaleString()} kg / ${truckWeightLimit.toLocaleString()} kg max`, pass: plan.totalWeight <= truckWeightLimit },
    { label: 'Vehicle height clearance', detail: plan.heightOK ? 'All slots compatible' : 'Height conflict detected', pass: plan.heightOK },
    { label: 'Axle weight balance', detail: plan.totalCars <= 5 ? `${plan.axle.front}% / ${plan.axle.rear}% — partial load, chassis weight dominates` : `${plan.axle.front}% front / ${plan.axle.rear}% rear`, pass: plan.totalCars <= 5 || (plan.axle.rear >= 40 && plan.axle.rear <= 65) },
    { label: 'Driver hours', detail: `${truck.driverHrs}h available today`, pass: truck.driverHrs >= 2 },
    { label: 'Rules Engine compliance', detail: 'Staging lead time · Lane capacity · Loading sequence', pass: true },
    { label: 'Route feasibility', detail: `${route.stops.length} stops confirmed reachable`, pass: true },
  ]

  useEffect(() => {
    if (step < checks.length) {
      const t = setTimeout(() => setStep(s => s + 1), 380)
      return () => clearTimeout(t)
    } else {
      setTimeout(() => setDone(true), 300)
    }
  }, [step])

  const allPassed = verifyOnly || checks.every(c => c.pass)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: 12, width: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${C.g2}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>🔍 Route Validation</div>
          <div style={{ fontSize: 12.5, color: C.textL, marginTop: 2 }}>{truck.id} · {route.name}</div>
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {checks.map((c, i) => {
            const visible = i < step
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: visible ? 1 : 0.2, transition: 'opacity 0.25s' }}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>
                  {visible ? (c.pass ? '✅' : '❌') : '⏳'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: visible ? (c.pass ? C.text : C.red) : C.textL }}>{c.label}</div>
                  {visible && <div style={{ fontSize: 11.5, color: C.textL }}>{c.detail}</div>}
                </div>
              </div>
            )
          })}

          {done && (
            <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 7, background: allPassed ? '#D1FAE5' : '#FEE2E2', border: `1px solid ${allPassed ? '#6EE7B7' : '#FCA5A5'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{allPassed ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: allPassed ? C.green : C.red }}>
                  {allPassed ? 'All checks passed — ready to dispatch' : 'Validation failed — review warnings'}
                </div>
                <div style={{ fontSize: 11.5, color: C.textL }}>{allPassed ? (verifyOnly ? 'Click Verify to approve this AI plan' : 'Click Confirm & Dispatch to proceed') : 'Go back and adjust the plan'}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.g2}`, display: 'flex', justifyContent: 'space-between', background: C.g1 }}>
          <button onClick={onBack} style={{ padding: '8px 16px', border: `1px solid ${C.g2}`, borderRadius: 6, background: C.white, cursor: 'pointer', fontSize: 13, color: C.text }}>← Back</button>
          {done && allPassed && (
            <button onClick={onConfirm} style={{
              padding: '9px 24px', border: 'none', borderRadius: 7, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, color: '#fff', background: C.green,
              animation: 'fade-in 0.3s ease',
            }}>
              {verifyOnly ? 'Verify' : 'Confirm & Dispatch →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RoutePlanner2({ showToast, onDispatch, plannedTrucks = [], routes }) {
  const [phase, setPhase] = useState('idle') // idle|route-popup|planning|deck|validation
  const [selectedTruck, setSelectedTruck] = useState(null)
  const [activeRoute, setActiveRoute] = useState(null)
  const [plan, setPlan] = useState(null)
  const [verified, setVerified] = useState(false)

  const plannedFor = (truckId) => plannedTrucks.find(p => p.truckId === truckId)
  const plannedIds = new Set(plannedTrucks.map(p => p.truckId))

  // Available trucks plus any pre-planned trucks (which may not be "Available")
  const visibleTrucks = plannerTrucks.filter(t => t.status === 'Available' || plannedIds.has(t.id))

  const handleSelectTruck = (truck) => {
    setSelectedTruck(truck)
    const planned = plannedFor(truck.id)
    if (planned) {
      setActiveRoute(planned.route)
      setPlan(autoArrange(planned.route, plannerOrders2))
      setVerified(false)
      setPhase('deck')
      return
    }
    setPhase('route-popup')
  }

  const handlePlan = (route) => {
    setActiveRoute(route)
    setPhase('planning')
  }

  const handlePlanDone = () => {
    const result = autoArrange(activeRoute, plannerOrders2)
    setPlan(result)
    setPhase('deck')
    showToast?.(`Auto-arranged ${result.totalCars} vehicles across ${activeRoute.stops.length} stops`, 'success')
  }

  // Called from DeckView with the (possibly manually adjusted) assignment
  const handleValidate = (updatedAssignment, liveStats) => {
    const assignedCars = Object.values(updatedAssignment).filter(Boolean)
    setPlan(prev => ({
      ...prev,
      assignment: updatedAssignment,
      axle:       liveStats.axle,
      heightOK:   liveStats.heightOK,
      totalCars:  assignedCars.length,
      totalWeight: assignedCars.reduce((sum, car) => sum + (car.weight || 0), 0),
    }))
    setPhase('validation')
  }

  const handleConfirmDispatch = () => {
    if (plannedFor(selectedTruck?.id)) {
      setVerified(true)
      showToast?.(`${selectedTruck.id} AI plan verified`, 'success')
      onDispatch?.({
        truck: selectedTruck,
        route: activeRoute,
        plan,
        dispatchedAt: new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
        departureTime: activeRoute.stops[0]?.eta || '—',
      })
      return
    }
    const dispatchPayload = {
      truck: selectedTruck,
      route: activeRoute,
      plan,
      dispatchedAt: new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
      departureTime: activeRoute.stops[0]?.eta || '—',
    }
    showToast?.(`${selectedTruck.id} dispatched on ${activeRoute.name} ✓`, 'success')
    onDispatch?.(dispatchPayload)
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 56px)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* ── Left: Truck list ──────────────────────────────────────────────── */}
      <div style={{ width: 270, background: C.white, borderRight: `1px solid ${C.g2}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${C.g1}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Fleet — Select Truck</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: C.textL, marginBottom: 8 }}>
            Click an <strong>Available</strong> truck to plan a route
          </div>
          {visibleTrucks.map(truck => (
            <TruckCard
              key={truck.id}
              truck={truck}
              selected={selectedTruck?.id === truck.id}
              onClick={handleSelectTruck}
              planned={!!plannedFor(truck.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Right: Planning area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 24, background: C.offW }}>
        {phase === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div style={{ fontSize: 48 }}>🚛</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Select an Available Truck</div>
            <div style={{ fontSize: 13.5, color: C.textL, textAlign: 'center', maxWidth: 400, lineHeight: 1.6 }}>
              Click any <strong>Available</strong> truck on the left to start planning.<br />
              You'll choose a route, and the system will auto-assign vehicles and arrange the deck for you.
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
              {[
                { icon: '📋', label: 'Select Route' },
                { icon: '⚡', label: 'Auto-Plan' },
                { icon: '🧩', label: 'Deck Arrange' },
                { icon: '✅', label: 'Validate & Dispatch' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', opacity: 0.5 }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, color: C.textL, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'deck' && plan && (
          <DeckView
            truck={selectedTruck}
            route={activeRoute}
            plan={plan}
            onValidate={handleValidate}
            aiPlanned={!!plannedFor(selectedTruck?.id)}
            verified={verified}
          />
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {phase === 'route-popup' && (
        <RoutePopup
          truck={selectedTruck}
          routes={routes}
          onClose={() => { setPhase('idle'); setSelectedTruck(null) }}
          onPlan={handlePlan}
        />
      )}

      {phase === 'planning' && (
        <PlanningAnim
          truck={selectedTruck}
          route={activeRoute}
          onDone={handlePlanDone}
        />
      )}

      {phase === 'validation' && (
        <ValidationModal
          truck={selectedTruck}
          route={activeRoute}
          plan={plan}
          onBack={() => setPhase('deck')}
          onConfirm={handleConfirmDispatch}
          verifyOnly={!!plannedFor(selectedTruck?.id)}
        />
      )}
    </div>
  )
}
