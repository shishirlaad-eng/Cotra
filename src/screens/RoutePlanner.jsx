import { useState, useRef } from 'react'
import { C } from '../colors'

const priorityColor = {
  Critical: C.red,
  High:     C.amber,
  Normal:   C.green,
}

function PriorityBadge({ priority }) {
  return (
    <span style={{
      background: priority === 'Critical' ? '#FEE2E2' : priority === 'High' ? '#FEF3C7' : '#D1FAE5',
      color: priorityColor[priority],
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
    }}>{priority}</span>
  )
}

function CapacityBar({ used, total, color }) {
  const pct = total > 0 ? Math.min(used / total, 1) : 0
  const c = color || (pct < 0.6 ? C.green : pct < 0.85 ? C.amber : C.red)
  return (
    <div style={{ height: 5, background: C.g2, borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', background: c, borderRadius: 3 }} />
    </div>
  )
}

function checkCompatibility(vehicle, truck) {
  const newWeight = truck.usedWeight + vehicle.weight
  const newSlots  = truck.usedSlots + 1
  const violations = []

  if (newSlots > truck.slots) violations.push(`Exceeds slot limit (${truck.slots})`)
  if (newWeight > truck.maxWeight) violations.push(`Exceeds weight limit (${truck.maxWeight.toLocaleString()} kg)`)
  if (vehicle.height > 2.0)   violations.push(`Vehicle height ${vehicle.height}m may exceed clearance`)
  if (vehicle.type === 'EV' && !truck.hasClosedCarrier) {
    // EV on open carrier — warning but not block
  }
  return { ok: violations.length === 0, violations, weightPct: Math.round(newWeight / truck.maxWeight * 100) }
}

function ValidationPanel({ truck, onConfirm, onClose }) {
  const [state, setState] = useState('idle') // idle | checking | done
  const [results, setResults] = useState([])

  const checks = [
    { label: 'Height within Swiss limit (4.0m)', pass: true,  detail: `Max load height: ${truck.vehicles.reduce((m,v) => Math.max(m, v.height), 0).toFixed(2)}m / 4.0m` },
    { label: 'Weight within truck limit',        pass: truck.usedWeight <= truck.maxWeight, detail: `${truck.usedWeight.toLocaleString()} / ${truck.maxWeight.toLocaleString()} kg` },
    { label: `Driver hours available`,           pass: truck.driverHrs >= 4, detail: `${truck.driverHrs} hrs remaining today` },
    { label: 'Route stops within limit (≤8)',    pass: truck.stops.length <= 8, detail: `${truck.stops.length} stops planned` },
    { label: 'EV vehicles on open carrier',      pass: !truck.vehicles.some(v => v.category === 'SUV/EV'), detail: truck.vehicles.some(v => v.category === 'SUV/EV') ? '⚠ Tesla Model Y requires closed carrier' : 'No EV constraints' },
    { label: 'A1 bridge clearance',              pass: null, detail: 'Route passes low bridge near Aarburg — verify clearance' },
  ]

  const failures = checks.filter(c => c.pass === false)

  const run = () => {
    setState('checking')
    setResults([])
    checks.forEach((c, i) => {
      setTimeout(() => {
        setResults(prev => [...prev, c])
        if (i === checks.length - 1) setState('done')
      }, 300 + i * 350)
    })
  }

  const allPass = results.length === checks.length && results.every(r => r.pass !== false)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.6)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: C.white, borderRadius: 10, width: 480, maxHeight: '85vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.g2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Route Validation — {truck.id}</div>
            <div style={{ fontSize: 12, color: C.textL, marginTop: 2 }}>{truck.driver} · {truck.vehicles.length} vehicles · {truck.stops.length} stops</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.textL }}>×</button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {state === 'idle' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 6 }}>Ready to validate route</div>
              <div style={{ fontSize: 12, color: C.textL, marginBottom: 20 }}>Checks: height limits, weight capacity, driver hours, route compliance</div>
              <button onClick={run} style={{
                background: C.blue, color: '#fff', border: 'none',
                borderRadius: 7, padding: '10px 24px', fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>Run Validation</button>
            </div>
          )}

          {(state === 'checking' || state === 'done') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {checks.map((c, i) => {
                const done = i < results.length
                const r = results[i]
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 6,
                    background: !done ? C.g1 : r.pass === false ? '#FEE2E2' : r.pass === null ? '#FEF3C7' : '#D1FAE5',
                    border: `1px solid ${!done ? C.g2 : r.pass === false ? '#FCA5A5' : r.pass === null ? '#FCD34D' : '#6EE7B7'}`,
                    transition: 'all 0.2s',
                    opacity: done ? 1 : 0.5,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>
                      {!done ? '⏳' : r.pass === false ? '❌' : r.pass === null ? '⚠️' : '✅'}
                    </span>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{c.label}</div>
                      {done && <div style={{ fontSize: 11.5, color: C.textL, marginTop: 2 }}>{r.detail}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {state === 'done' && (
            <div style={{ marginTop: 16 }}>
              {failures.length > 0 ? (
                <div style={{ background: '#FEE2E2', border: `1px solid #FCA5A5`, borderRadius: 7, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: C.red, fontSize: 13, marginBottom: 6 }}>⛔ {failures.length} violation{failures.length > 1 ? 's' : ''} found</div>
                  {failures.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.red, marginTop: 3 }}>• {f.label}: {f.detail}</div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#D1FAE5', border: `1px solid #6EE7B7`, borderRadius: 7, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: C.green, fontSize: 13 }}>✅ All checks passed — ready to dispatch</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{
                  background: 'transparent', border: `1px solid ${C.g2}`,
                  borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', color: C.textL, fontFamily: 'Inter, sans-serif',
                }}>Close</button>
                <button
                  disabled={!allPass}
                  onClick={() => { onConfirm(truck.id); onClose() }}
                  style={{
                    background: allPass ? C.green : C.g2,
                    color: allPass ? '#fff' : C.textL,
                    border: 'none', borderRadius: 6, padding: '8px 18px',
                    fontSize: 13, fontWeight: 700, cursor: allPass ? 'pointer' : 'default',
                    fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
                  }}
                >Confirm & Dispatch</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RoutePlanner({ plannerOrders, setPlannerOrders, plannerTrucks, setPlannerTrucks, showToast }) {
  const [viewMode, setViewMode] = useState('board')
  const [selectedTruck, setSelectedTruck] = useState(null)
  const [truckFilter, setTruckFilter] = useState('All')
  const [dragItem, setDragItem] = useState(null)
  const [dragOverTruck, setDragOverTruck] = useState(null)
  const [validating, setValidating] = useState(null)
  const [search, setSearch] = useState('')
  const dragGhost = useRef(null)

  const filtered = plannerOrders.filter(o =>
    !search || `${o.make} ${o.model} ${o.id} ${o.to}`.toLowerCase().includes(search.toLowerCase())
  )

  const compat = dragItem && dragOverTruck
    ? checkCompatibility(dragItem, dragOverTruck)
    : null

  const handleDragStart = (e, order) => {
    setDragItem(order)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDragItem(null)
    setDragOverTruck(null)
  }

  const handleDragOver = (e, truck) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTruck(truck)
  }

  const handleDrop = (e, truck) => {
    e.preventDefault()
    if (!dragItem) return
    const c = checkCompatibility(dragItem, truck)
    if (!c.ok) {
      showToast(`Cannot assign: ${c.violations[0]}`, 'error')
      setDragItem(null)
      setDragOverTruck(null)
      return
    }
    // Move order from unassigned to truck
    setPlannerOrders(prev => prev.filter(o => o.id !== dragItem.id))
    setPlannerTrucks(prev => prev.map(t => t.id === truck.id ? {
      ...t,
      vehicles: [...t.vehicles, { id: dragItem.id, make: dragItem.make, model: dragItem.model, height: dragItem.height, weight: dragItem.weight, to: dragItem.to, category: dragItem.category }],
      usedSlots: t.usedSlots + 1,
      usedWeight: t.usedWeight + dragItem.weight,
      stops: [...t.stops, `${dragItem.to} — ${dragItem.make} ${dragItem.model}`],
    } : t))
    if (selectedTruck?.id === truck.id) {
      setSelectedTruck(prev => ({
        ...prev,
        vehicles: [...prev.vehicles, { id: dragItem.id, make: dragItem.make, model: dragItem.model, height: dragItem.height, weight: dragItem.weight, to: dragItem.to, category: dragItem.category }],
        usedSlots: prev.usedSlots + 1,
        usedWeight: prev.usedWeight + dragItem.weight,
        stops: [...prev.stops, `${dragItem.to} — ${dragItem.make} ${dragItem.model}`],
      }))
    }
    showToast(`${dragItem.make} ${dragItem.model} added to ${truck.id}`, 'success')
    setDragItem(null)
    setDragOverTruck(null)
  }

  const handleRemoveVehicle = (truckId, vehicleId) => {
    setPlannerTrucks(prev => prev.map(t => {
      if (t.id !== truckId) return t
      const v = t.vehicles.find(v => v.id === vehicleId)
      if (!v) return t
      return { ...t, vehicles: t.vehicles.filter(v => v.id !== vehicleId), usedSlots: t.usedSlots - 1, usedWeight: t.usedWeight - v.weight }
    }))
    if (selectedTruck?.id === truckId) {
      setSelectedTruck(prev => {
        const v = prev.vehicles.find(v => v.id === vehicleId)
        return { ...prev, vehicles: prev.vehicles.filter(v => v.id !== vehicleId), usedSlots: prev.usedSlots - 1, usedWeight: prev.usedWeight - (v?.weight || 0) }
      })
    }
  }

  const handleConfirm = (truckId) => {
    setPlannerTrucks(prev => prev.map(t => t.id === truckId ? { ...t, confirmed: true } : t))
    if (selectedTruck?.id === truckId) setSelectedTruck(prev => ({ ...prev, confirmed: true }))
    showToast(`${truckId} route confirmed and dispatched`, 'success')
  }

  const selectedTruckData = selectedTruck ? plannerTrucks.find(t => t.id === selectedTruck.id) : null
  const visibleTrucks = truckFilter === 'All' ? plannerTrucks : plannerTrucks.filter(t => t.status === truckFilter)

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 56px)', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* LEFT — Unassigned Orders */}
      <div style={{
        width: 280, minWidth: 280, background: C.white,
        borderRight: `1px solid ${C.g2}`, display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.g2}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 8 }}>
            Unassigned Orders
            <span style={{ marginLeft: 6, background: C.amber, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>{plannerOrders.length}</span>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            style={{
              width: '100%', border: `1px solid ${C.g2}`, borderRadius: 5,
              padding: '6px 10px', fontSize: 12, background: C.g1,
              fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filtered.map(order => (
            <div
              key={order.id}
              draggable
              onDragStart={e => handleDragStart(e, order)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex', alignItems: 'stretch', gap: 0,
                background: C.white, border: `1px solid ${C.g2}`,
                borderRadius: 7, marginBottom: 6, overflow: 'hidden',
                cursor: 'grab', transition: 'box-shadow 0.15s, border-color 0.15s',
                boxShadow: dragItem?.id === order.id ? '0 4px 16px rgba(26,86,160,0.2)' : 'none',
                opacity: dragItem?.id === order.id ? 0.5 : 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueM; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.g2; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Drag handle */}
              <div style={{
                width: 22, background: C.g1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.textL, fontSize: 13, flexShrink: 0, cursor: 'grab',
              }}>⠿</div>
              {/* Content */}
              <div style={{ padding: '9px 10px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: C.blue, fontFamily: 'monospace' }}>{order.id}</span>
                  <PriorityBadge priority={order.priority} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 3 }}>{order.make} {order.model} · {order.category}</div>
                <div style={{ fontSize: 11, color: C.textL, marginBottom: 4 }}>
                  📏 H: {order.height}m &nbsp;⚖ W: {order.weight.toLocaleString()}kg
                </div>
                <div style={{ fontSize: 11, color: C.textL }}>
                  📍 <span style={{ fontWeight: 500 }}>{order.from}</span> → <span style={{ fontWeight: 500, color: C.text }}>{order.to}</span>
                </div>
                {order.type === 'EV' && (
                  <span style={{ marginTop: 4, display: 'inline-block', background: '#D1FAE5', color: C.green, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>EV — Closed carrier</span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: C.textL, fontSize: 12.5 }}>
              {plannerOrders.length === 0 ? '✅ All orders assigned' : 'No results'}
            </div>
          )}
        </div>
      </div>

      {/* CENTRE — Truck Board */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.offW }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px', background: C.white, borderBottom: `1px solid ${C.g2}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Active Trucks — 06 Jun 2026</div>
            <div style={{ fontSize: 11.5, color: C.textL, marginTop: 1 }}>{visibleTrucks.length} of {plannerTrucks.length} trucks · {plannerTrucks.reduce((s,t)=>s+t.usedSlots,0)} vehicles assigned</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['All','Available','Loading','En Route','Maintenance'].map(f => (
              <button key={f} onClick={() => setTruckFilter(f)} style={{
                padding: '4px 10px', fontSize: 11.5, fontWeight: 600, borderRadius: 5, cursor: 'pointer',
                background: truckFilter === f ? C.navy : 'transparent',
                color:      truckFilter === f ? '#fff' : C.textL,
                border:     `1px solid ${truckFilter === f ? C.navy : C.g2}`,
                fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
              }}>{f}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['board', 'list'].map(m => (
              <button key={m} onClick={() => setViewMode(m)} style={{
                background: viewMode === m ? C.navy : 'transparent',
                color: viewMode === m ? '#fff' : C.textL,
                border: `1px solid ${viewMode === m ? C.navy : C.g2}`,
                borderRadius: 5, padding: '5px 12px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                textTransform: 'capitalize',
              }}>{m === 'board' ? '⊞ Board' : '☰ List'}</button>
            ))}
          </div>
        </div>

        {/* Truck columns */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: 16 }}>
          {viewMode === 'board' ? (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', minWidth: 'max-content' }}>
              {visibleTrucks.map(truck => {
                const isOver = dragOverTruck?.id === truck.id
                const dropCompat = dragItem ? checkCompatibility(dragItem, truck) : null
                const slotPct = truck.usedSlots / truck.slots
                const weightPct = truck.usedWeight / truck.maxWeight

                return (
                  <div
                    key={truck.id}
                    style={{
                      width: 220, background: C.white,
                      border: `2px solid ${isOver ? (dropCompat?.ok ? C.green : C.red) : truck.confirmed ? C.green : C.g2}`,
                      borderRadius: 9, overflow: 'hidden', cursor: 'pointer',
                      boxShadow: truck.confirmed ? `0 0 0 3px rgba(26,122,74,0.15)` : 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onClick={() => setSelectedTruck(truck)}
                  >
                    {/* Truck header */}
                    <div style={{ padding: '10px 12px', background: C.navy }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: 'monospace' }}>🚛 {truck.id}</span>
                        {truck.confirmed && <span style={{ background: C.green, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>DISPATCHED</span>}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 8 }}>{truck.driver}</div>
                      {/* Capacity */}
                      <div style={{ marginBottom: 5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>Slots</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: slotPct >= 0.85 ? '#FCA5A5' : slotPct >= 0.6 ? '#FCD34D' : '#6EE7B7' }}>{truck.usedSlots}/{truck.slots}</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${slotPct * 100}%`, height: '100%', background: slotPct >= 0.85 ? '#F87171' : slotPct >= 0.6 ? '#FCD34D' : '#6EE7B7', borderRadius: 2 }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>Weight</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: weightPct >= 0.85 ? '#FCA5A5' : weightPct >= 0.6 ? '#FCD34D' : '#6EE7B7' }}>{(truck.usedWeight/1000).toFixed(1)}t/{truck.maxWeight/1000}t</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${weightPct * 100}%`, height: '100%', background: weightPct >= 0.85 ? '#F87171' : weightPct >= 0.6 ? '#FCD34D' : '#6EE7B7', borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                        {truck.status}{truck.dept ? ` · Dept ${truck.dept}` : ''}
                      </div>
                    </div>

                    {/* Vehicles */}
                    <div style={{ padding: '6px 8px', maxHeight: 260, overflowY: 'auto' }}>
                      {truck.vehicles.map((v, i) => (
                        <div key={v.id} style={{
                          background: C.g1, border: `1px solid ${C.g2}`, borderRadius: 5,
                          padding: '6px 8px', marginBottom: 5, fontSize: 11.5,
                        }}>
                          <div style={{ fontWeight: 600, color: C.text }}>{v.make} {v.model}</div>
                          <div style={{ color: C.textL, fontSize: 10.5 }}>H: {v.height}m · {v.weight.toLocaleString()}kg</div>
                          <div style={{ color: C.blueM, fontSize: 10.5, fontWeight: 500 }}>→ {v.to}</div>
                        </div>
                      ))}
                    </div>

                    {/* Drop zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOverTruck(truck) }}
                      onDragLeave={() => setDragOverTruck(null)}
                      onDrop={e => handleDrop(e, truck)}
                      style={{
                        margin: '0 8px 8px', padding: '10px',
                        border: `2px dashed ${isOver ? (dropCompat?.ok ? C.green : C.red) : C.g2}`,
                        borderRadius: 6, textAlign: 'center',
                        fontSize: 11, color: isOver ? (dropCompat?.ok ? C.green : C.red) : C.textL,
                        background: isOver ? (dropCompat?.ok ? 'rgba(26,122,74,0.06)' : 'rgba(192,57,43,0.06)') : 'transparent',
                        transition: 'all 0.15s', fontWeight: 500,
                      }}
                    >
                      {isOver
                        ? dropCompat?.ok
                          ? `✓ Drop · ${dropCompat.weightPct}% weight`
                          : `✗ ${dropCompat?.violations?.[0] || 'Incompatible'}`
                        : '+ Drop vehicle here'
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // List view
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 900 }}>
              {visibleTrucks.map(truck => (
                <div key={truck.id} style={{
                  background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
                  padding: '14px 16px', cursor: 'pointer',
                  border: `1px solid ${truck.confirmed ? C.green : C.g2}`,
                }}
                onClick={() => setSelectedTruck(truck)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: C.text, fontFamily: 'monospace' }}>🚛 {truck.id}</span>
                      <span style={{ fontSize: 13, color: C.textL }}>{truck.driver}</span>
                      <span style={{ fontSize: 12, color: C.textL }}>{truck.vehicles.length} vehicles · {truck.usedWeight.toLocaleString()}kg</span>
                    </div>
                    {truck.confirmed && <span style={{ background: C.green, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>✓ DISPATCHED</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {truck.vehicles.map(v => (
                      <span key={v.id} style={{ background: C.blueL, color: C.blue, fontSize: 11.5, fontWeight: 600, padding: '3px 8px', borderRadius: 4 }}>
                        {v.make} {v.model} → {v.to}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Inspector: empty state */}
      {!selectedTruckData && (
        <div style={{
          width: 260, minWidth: 260, background: C.white,
          borderLeft: `1px solid ${C.g2}`, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: 24,
        }}>
          <div style={{ fontSize: 32 }}>🚛</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, textAlign: 'center' }}>No truck selected</div>
          <div style={{ fontSize: 12, color: C.textL, textAlign: 'center', lineHeight: 1.5 }}>
            Click any truck card to inspect capacity, compliance and route stops.
          </div>
        </div>
      )}

      {/* RIGHT — Inspector */}
      {selectedTruckData && (
        <div style={{
          width: 320, minWidth: 320, background: C.white,
          borderLeft: `1px solid ${C.g2}`, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.g2}`, background: C.navy }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 2 }}>🚛 {selectedTruckData.id}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{selectedTruckData.driver}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 1 }}>{selectedTruckData.plate}</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Capacity gauges */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.g1}` }}>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: C.textL, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Capacity</div>
              {[
                { label: 'Slots', used: selectedTruckData.usedSlots, total: selectedTruckData.slots, unit: 'slots' },
                { label: 'Weight', used: selectedTruckData.usedWeight, total: selectedTruckData.maxWeight, unit: 'kg' },
              ].map(g => {
                const pct = g.total > 0 ? g.used / g.total : 0
                const color = pct < 0.6 ? C.green : pct < 0.85 ? C.amber : C.red
                return (
                  <div key={g.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.textL, fontWeight: 500 }}>{g.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>
                        {g.unit === 'kg' ? `${g.used.toLocaleString()} / ${g.total.toLocaleString()} kg` : `${g.used} of ${g.total} ${g.unit}`}
                      </span>
                    </div>
                    <div style={{ height: 8, background: C.g2, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
              <div style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.textL, fontWeight: 500 }}>Max Height</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>
                    {selectedTruckData.vehicles.length > 0 ? `${selectedTruckData.vehicles.reduce((m,v) => Math.max(m, v.height), 0).toFixed(2)}m` : '—'} / 4.0m
                  </span>
                </div>
                <div style={{ height: 8, background: C.g2, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${selectedTruckData.vehicles.length > 0 ? (selectedTruckData.vehicles.reduce((m,v) => Math.max(m, v.height), 0) / 4.0 * 100) : 0}%`,
                    height: '100%', background: C.green, borderRadius: 4
                  }} />
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.g1}` }}>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: C.textL, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Compliance</div>
              {[
                { ok: true,  label: 'Height within Swiss limit (4.0m)' },
                { ok: selectedTruckData.usedWeight <= selectedTruckData.maxWeight, label: 'Weight within truck limit' },
                { ok: selectedTruckData.driverHrs >= 4, label: `Driver hours: ${selectedTruckData.driverHrs} hrs remaining` },
                { ok: null,  label: 'Route passes low bridge on A1 — verify clearance' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>{c.ok === true ? '✅' : c.ok === null ? '⚠️' : '❌'}</span>
                  <span style={{ fontSize: 12, color: c.ok === false ? C.red : C.text, lineHeight: 1.4 }}>{c.label}</span>
                </div>
              ))}
            </div>

            {/* Route Stops */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.g1}` }}>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: C.textL, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Route Stops</div>
              {selectedTruckData.stops.map((stop, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: i === 0 ? C.navy : C.blueM,
                    color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{stop}</span>
                </div>
              ))}
            </div>

            {/* Vehicles assigned */}
            {selectedTruckData.vehicles.length > 0 && (
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.g1}` }}>
                <div style={{ fontWeight: 700, fontSize: 11.5, color: C.textL, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Assigned Vehicles</div>
                {selectedTruckData.vehicles.map((v, i) => (
                  <div key={v.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 9px', background: C.g1, borderRadius: 5, marginBottom: 5,
                    border: `1px solid ${C.g2}`,
                  }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{v.make} {v.model}</div>
                      <div style={{ fontSize: 11, color: C.textL }}>H: {v.height}m · {v.weight.toLocaleString()}kg · → {v.to}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveVehicle(selectedTruckData.id, v.id)}
                      style={{
                        background: 'none', border: `1px solid ${C.g2}`, borderRadius: 4,
                        padding: '3px 6px', fontSize: 11, color: C.red,
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.g2}`, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <button
              onClick={() => setValidating(selectedTruckData)}
              style={{
                background: C.blue, color: '#fff', border: 'none', borderRadius: 7,
                padding: '9px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', width: '100%',
              }}
            >🔍 Validate Route</button>
            <button
              disabled={selectedTruckData.confirmed}
              onClick={() => handleConfirm(selectedTruckData.id)}
              style={{
                background: selectedTruckData.confirmed ? '#D1FAE5' : C.green,
                color: selectedTruckData.confirmed ? C.green : '#fff',
                border: `1px solid ${selectedTruckData.confirmed ? C.green : 'transparent'}`,
                borderRadius: 7, padding: '9px', fontSize: 13, fontWeight: 700,
                cursor: selectedTruckData.confirmed ? 'default' : 'pointer',
                fontFamily: 'Inter, sans-serif', width: '100%',
              }}
            >{selectedTruckData.confirmed ? '✓ Dispatched' : '✓ Confirm & Dispatch'}</button>
          </div>
        </div>
      )}

      {validating && (
        <ValidationPanel
          truck={validating}
          onConfirm={handleConfirm}
          onClose={() => setValidating(null)}
        />
      )}
    </div>
  )
}
