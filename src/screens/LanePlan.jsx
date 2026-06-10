import { useEffect, useState } from 'react'
import { C } from '../colors'

const STOP_COLORS = ['#1A56A0', '#1A7A4A', '#E8A020', '#7C3AED', '#DC2626']
const STOP_BG     = ['#E8F1FB', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FEE2E2']

const UPPER_SLOTS = ['U1','U2','U3','U4']
const LOWER_SLOTS = ['L1','L2','L3','L4','L5']

// ─── Derive lane groups from load sequence ────────────────────────────────────
// All cars for a single truck stage in the same lane, in sequence: the first car
// to load (deepest in the lane) gets the highest lane position.
const STAGING_LANE = 'A-1'

function buildLaneGroups(loadSeq) {
  const n = loadSeq.length
  const cars = loadSeq.map((car, i) => ({
    ...car,
    globalLoadNum: i + 1,
    lane: STAGING_LANE,
    lanePos: n - i,
  }))
  return { [STAGING_LANE]: cars }
}

// ─── Components ──────────────────────────────────────────────────────────────

function DeckMiniSlot({ slotId, car }) {
  const isEmpty = !car
  const stopIdx = car ? (car.stopNum - 1) : 0
  const color = car ? (STOP_COLORS[stopIdx] || C.blueM) : C.g2
  const bg    = car ? (STOP_BG[stopIdx]     || C.blueL) : 'transparent'
  const border = isEmpty ? `2px dashed ${C.g2}` : `2px solid ${color}`

  return (
    <div style={{
      width: 96, height: 72,
      border,
      borderRadius: 6,
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 6px',
      position: 'relative',
    }}>
      {isEmpty ? (
        <span style={{ fontSize: 10, color: C.g2 }}>—</span>
      ) : (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 2 }}>Stop {car.stopNum}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.3 }}>
            {car.make}<br />{car.model}
          </div>
          <div style={{ position: 'absolute', bottom: 3, right: 4, fontSize: 9, color, fontWeight: 800 }}>
            #{car.loadNum || car.globalLoadNum}
          </div>
        </>
      )}
    </div>
  )
}

function LaneCard({ laneName, cars, assignment }) {
  const [loaded, setLoaded] = useState({})

  // The physical lane position determines load order (last lane pos = must be loaded first)
  // Reverse the lane order so that lanePos 1 = last loaded, highest = first loaded
  const sortedForLoading = [...cars].sort((a, b) => (b.lanePos || 1) - (a.lanePos || 1))

  // Find which slot each car is on
  const getSlot = (carId) => Object.keys(assignment || {}).find(k => assignment[k]?.id === carId) || '—'

  const allLoaded = cars.length > 0 && cars.every(c => loaded[c.id])

  return (
    <div style={{
      background: C.white,
      border: `1.5px solid ${allLoaded ? C.green : C.g2}`,
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: allLoaded ? `0 0 0 2px ${C.green}30` : 'none',
    }}>
      {/* Lane header */}
      <div style={{
        padding: '10px 16px',
        background: allLoaded ? '#D1FAE5' : C.g1,
        borderBottom: `1px solid ${C.g2}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: allLoaded ? C.green : C.navy, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {laneName}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Lane {laneName}</div>
            <div style={{ fontSize: 11.5, color: C.textL }}>{cars.length} vehicle{cars.length !== 1 ? 's' : ''} · {cars[0]?.from || 'Compound'}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: allLoaded ? C.green : C.textL, fontWeight: allLoaded ? 700 : 400 }}>
          {allLoaded ? '✅ Lane complete' : `${Object.keys(loaded).length} / ${cars.length} loaded`}
        </div>
      </div>

      {/* Direction hint */}
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${C.g1}`, background: '#FAFBFD', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10.5, color: C.textL, fontWeight: 600 }}>Loading order (position in lane):</span>
        <span style={{ fontSize: 10, color: C.textL }}>Back of lane →</span>
        {sortedForLoading.map((c, i) => (
          <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 10.5, background: STOP_BG[c.stopNum-1]||C.g1, color: STOP_COLORS[c.stopNum-1]||C.textL, padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>
              {i+1}. Pos {c.lanePos}
            </span>
            {i < sortedForLoading.length - 1 && <span style={{ fontSize: 10, color: C.g2 }}>→</span>}
          </span>
        ))}
        <span style={{ fontSize: 10, color: C.textL }}>→ Bay</span>
      </div>

      {/* Car rows */}
      <div style={{ padding: '0 0 4px' }}>
        {sortedForLoading.map((car, i) => {
          const slotId = getSlot(car.id)
          const isLoaded = !!loaded[car.id]
          const stopIdx = (car.stopNum || 1) - 1

          return (
            <div key={car.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderBottom: i < sortedForLoading.length - 1 ? `1px solid ${C.g1}` : 'none',
              background: isLoaded ? '#F0FDF4' : 'transparent',
              transition: 'background 0.2s',
            }}>
              {/* Load number */}
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: isLoaded ? C.green : C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </div>

              {/* Lane position badge */}
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textL, background: C.g1, borderRadius: 5, padding: '3px 8px', flexShrink: 0 }}>
                Pos {car.lanePos || '—'}
              </div>

              {/* Vehicle info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{car.make} {car.model}</span>
                  <span style={{ fontSize: 11, color: STOP_COLORS[stopIdx]||C.textL, background: STOP_BG[stopIdx]||C.g1, padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>
                    Stop {car.stopNum} — {car.stopDealer || ''}
                  </span>
                  <span style={{ fontSize: 10.5, color: C.textL }}>{car.height}m · {car.weight}kg</span>
                  <span style={{ fontSize: 10.5, color: C.textL }}>{car.id}</span>
                </div>
              </div>

              {/* Deck slot */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 9.5, color: C.textL, marginBottom: 2 }}>Deck Slot</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.blue, background: C.blueL, padding: '3px 10px', borderRadius: 5, fontFamily: 'monospace' }}>
                  {slotId}
                </div>
              </div>

              {/* Load toggle */}
              <button
                onClick={() => setLoaded(prev => ({ ...prev, [car.id]: !prev[car.id] }))}
                style={{
                  padding: '6px 14px',
                  border: `1.5px solid ${isLoaded ? C.green : C.g2}`,
                  borderRadius: 6,
                  background: isLoaded ? '#D1FAE5' : C.white,
                  color: isLoaded ? C.green : C.textL,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {isLoaded ? '✅ Loaded' : 'Mark Loaded'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function LanePlan({ activePlan, onNavigate }) {
  useEffect(() => {
    const startPrint = () => {
      document.body.classList.add('printing-lane-plan')
    }
    const endPrint = () => {
      document.body.classList.remove('printing-lane-plan')
    }

    window.addEventListener('beforeprint', startPrint)
    window.addEventListener('afterprint', endPrint)
    return () => {
      window.removeEventListener('beforeprint', startPrint)
      window.removeEventListener('afterprint', endPrint)
      document.body.classList.remove('printing-lane-plan')
    }
  }, [])

  if (!activePlan) {
    return (
      <div style={{ padding: 24, width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12, color: C.textL }}>
          <div style={{ fontSize: 48 }}>🏗</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>No Active Lane Plan</div>
          <div style={{ fontSize: 13.5, color: C.textL, textAlign: 'center', maxWidth: 400, lineHeight: 1.6 }}>
            Dispatch a truck from <strong>Route Planner 2</strong> to generate an automated lane loading plan here.
          </div>
          <button
            onClick={() => onNavigate?.('planner2')}
            style={{ marginTop: 8, padding: '10px 24px', background: C.blue, border: 'none', borderRadius: 7, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            → Go to Route Planner 2
          </button>
        </div>
      </div>
    )
  }

  const { truck, route, plan, dispatchedAt, departureTime } = activePlan
  const { assignment, loadSeq, stopsWithOrders, totalCars, axle, totalWeight } = plan

  const laneGroups = buildLaneGroups(loadSeq)
  const laneNames = Object.keys(laneGroups).sort()

  return (
    <div className="lane-plan-print-root" style={{ padding: 24, width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <div style={{ background: C.navy, borderRadius: 10, padding: '16px 22px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Lane Loading Plan</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{truck.id} — {route.name}</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
            Driver: {truck.driver} &nbsp;·&nbsp; {totalCars} vehicles &nbsp;·&nbsp; Dispatched {dispatchedAt}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ textAlign: 'right', marginRight: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>First Stop ETA</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{route.stops?.[0]?.eta || departureTime}</div>
          </div>
          <button className="no-print" onClick={() => window.print()} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
            🖨 Print Plan
          </button>
        </div>
      </div>

      {/* ── Route stops ────────────────────────────────────────────────────── */}
      <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>🗺 Delivery Route</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {route.stops.map((stop, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: STOP_BG[i], border: `1.5px solid ${STOP_COLORS[i]}`, borderRadius: 8, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, color: STOP_COLORS[i] }}>
                Stop {i + 1}: {stop.dealer}
                <span style={{ fontWeight: 400, color: stop.city ? STOP_COLORS[i] : C.textL, marginLeft: 5, opacity: 0.75 }}>
                  · ETA {stop.eta}
                </span>
                <span style={{ marginLeft: 6, fontWeight: 600 }}>
                  ({(stopsWithOrders[i]?.orders || []).length} cars)
                </span>
              </span>
              {i < route.stops.length - 1 && <span style={{ fontSize: 14, color: C.g2, fontWeight: 700 }}>→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── Deck diagram ───────────────────────────────────────────────────── */}
      <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🚛 Truck Deck — Final Arrangement</div>
          <div style={{ fontSize: 11.5, color: C.textL }}>← FRONT (unload first) &nbsp;&nbsp; REAR (load first) →</div>
        </div>

        {/* Upper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 50, fontSize: 11, fontWeight: 700, color: C.textL, textAlign: 'right', flexShrink: 0 }}>UPPER</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {UPPER_SLOTS.map(id => (
              <div key={id}>
                <div style={{ textAlign: 'center', fontSize: 10, color: C.textL, marginBottom: 3 }}>{id}</div>
                <DeckMiniSlot slotId={id} car={assignment[id] || null} />
              </div>
            ))}
          </div>
        </div>
        {/* Lower */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 50, fontSize: 11, fontWeight: 700, color: C.textL, textAlign: 'right', flexShrink: 0 }}>LOWER</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {LOWER_SLOTS.map(id => (
              <div key={id}>
                <div style={{ textAlign: 'center', fontSize: 10, color: C.textL, marginBottom: 3 }}>{id}</div>
                <DeckMiniSlot slotId={id} car={assignment[id] || null} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ marginTop: 14, display: 'flex', gap: 12, borderTop: `1px solid ${C.g1}`, paddingTop: 12 }}>
          {[
            { icon: '⚖️', label: 'Weight', value: `${totalWeight?.toLocaleString() || 0} kg` },
            { icon: '🏋️', label: 'Axle Balance', value: `${axle?.front}% F / ${axle?.rear}% R` },
            { icon: '🚗', label: 'Vehicles', value: `${totalCars} loaded` },
            { icon: '📍', label: 'Lanes Used', value: `${laneNames.length} lane${laneNames.length !== 1 ? 's' : ''}` },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <span style={{ fontSize: 12, color: C.textL }}>{s.label}: <strong style={{ color: C.text }}>{s.value}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lane cards ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          🏗 Lane-by-Lane Loading Plan
        </div>
        <div style={{ fontSize: 12.5, color: C.textL, marginBottom: 14 }}>
          Each lane shows the physical loading order. Yard crew should load from the highest position number first (deepest in lane = first on truck = last stop car).
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {laneNames.map(lane => (
          <LaneCard key={lane} laneName={lane} cars={laneGroups[lane]} assignment={assignment} />
        ))}
      </div>

      {/* ── Footer actions ─────────────────────────────────────────────────── */}
      <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end', padding: '14px 0', borderTop: `1px solid ${C.g2}` }}>
        <button
          onClick={() => onNavigate?.('planner2')}
          style={{ padding: '9px 20px', border: `1.5px solid ${C.g2}`, borderRadius: 7, background: C.white, cursor: 'pointer', fontSize: 13, color: C.text, fontWeight: 600 }}
        >
          ← Plan Another Dispatch
        </button>
        <button
          onClick={() => window.print()}
          style={{ padding: '9px 20px', border: `1.5px solid ${C.blueM}`, borderRadius: 7, background: C.blueL, cursor: 'pointer', fontSize: 13, color: C.blue, fontWeight: 700 }}
        >
          🖨 Print Lane Plan
        </button>
      </div>
    </div>
  )
}
