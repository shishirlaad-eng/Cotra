import { useState, useMemo, useEffect } from 'react'
import { C } from '../colors'
import { vehicleCatalogue, initialTrucks } from '../data'

const priorityMeta = {
  Critical: { color: C.red,   bg: '#FEE2E2', dot: '🔴', sort: 0 },
  High:     { color: C.amber, bg: '#FEF3C7', dot: '🟡', sort: 1 },
  Normal:   { color: C.green, bg: '#D1FAE5', dot: '🟢', sort: 2 },
}

const AI_PLAN_STEPS = [
  { icon: '🚗', text: 'Picking cars from the queue...' },
  { icon: '🚛', text: 'Finding an available truck...' },
  { icon: '🗺', text: 'Finding the best route...' },
  { icon: '👤', text: 'Assigning drivers...' },
  { icon: '🏗', text: 'Checking compound & staging rules...' },
]

function AIPlanningModal({ plannedOrders, onCarPicked, onDone }) {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState(0)

  useEffect(() => {
    if (step < AI_PLAN_STEPS.length) {
      const t = setTimeout(() => setStep(s => s + 1), 480)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(onDone, 400)
      return () => clearTimeout(t)
    }
  }, [step])

  useEffect(() => {
    if (picked >= plannedOrders.length) return
    const t = setTimeout(() => {
      onCarPicked(plannedOrders[picked].id)
      setPicked(count => count + 1)
    }, 260)
    return () => clearTimeout(t)
  }, [picked, plannedOrders, onCarPicked])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.14)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '76px 28px 28px', pointerEvents: 'none' }}>
      <div style={{ background: C.white, borderRadius: 12, padding: '28px 34px', minWidth: 380, textAlign: 'center', border: `1px solid ${C.blueM}`, boxShadow: '0 20px 60px rgba(13,31,60,0.28)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>AI Planner</div>
        <div style={{ fontSize: 12.5, color: C.textL, marginBottom: 8 }}>Building an optimised dispatch plan...</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 20 }}>{picked} of {plannedOrders.length} cars picked</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {AI_PLAN_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i < step ? 1 : 0.3, transition: 'opacity 0.3s' }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{i < step ? '✅' : s.icon}</span>
              <span style={{ fontSize: 13, color: i < step ? C.green : C.textL, fontWeight: i < step ? 600 : 400 }}>#{i + 1} {s.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, height: 4, background: C.g2, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${(step / AI_PLAN_STEPS.length) * 100}%`, height: '100%', background: C.blue, borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
      </div>
    </div>
  )
}

const fitScores = [
  { truckId: 'TRK-025', score: 96, reason: 'Capacity OK · Weight OK · Route match' },
  { truckId: 'TRK-033', score: 88, reason: 'Capacity OK · Slight detour' },
  { truckId: 'TRK-031', score: 71, reason: 'Near capacity · Weight borderline' },
]

function VehicleCell({ vehicle }) {
  const tall   = vehicle.height > 1.6
  const heavy  = vehicle.weight > 2500
  const isEV   = vehicle.type === 'EV'
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{vehicle.make} {vehicle.model}</div>
      <div style={{ fontSize: 11, color: C.textL, marginTop: 1 }}>
        H: {vehicle.height}m · W: {vehicle.weight.toLocaleString()}kg · {vehicle.category}
        {isEV && <span style={{ marginLeft: 5, background: '#D1FAE5', color: C.green, padding: '0 5px', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>EV</span>}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
        {tall  && <span style={{ background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, border: `1px solid #FCD34D` }}>TALL</span>}
        {heavy && <span style={{ background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, border: `1px solid #FCD34D` }}>HEAVY</span>}
      </div>
    </div>
  )
}

function ExpandedRow({ order, vehicle, onAssign }) {
  return (
    <tr className="slide-down">
      <td colSpan={10} style={{ padding: 0, background: C.blueL, borderTop: `1px solid ${C.g2}`, borderBottom: `2px solid ${C.blueM}` }}>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Vehicle spec */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: C.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Vehicle Specification</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
              {[
                ['Make / Model', `${vehicle.make} ${vehicle.model}`],
                ['Category', vehicle.category],
                ['Height', `${vehicle.height} m`],
                ['Weight', `${vehicle.weight.toLocaleString()} kg`],
                ['Fuel Type', vehicle.type],
                ['Origin', order.from],
                ['Destination', order.to],
                ['ETA', order.eta],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, color: C.textL, fontWeight: 500 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested trucks */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: C.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested Trucks — Ranked by Fit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fitScores.map((t, i) => (
                <div key={t.truckId} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: C.white, border: `1px solid ${C.g2}`, borderRadius: 6, padding: '8px 12px',
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: i === 0 ? C.blue : C.g2,
                    color: i === 0 ? '#fff' : C.textL,
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{t.truckId}</div>
                    <div style={{ fontSize: 10.5, color: C.textL }}>{t.reason}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 800,
                      color: t.score >= 90 ? C.green : t.score >= 75 ? C.amber : C.red,
                    }}>{t.score}%</span>
                    <button
                      onClick={() => onAssign(order.id, t.truckId)}
                      style={{
                        background: i === 0 ? C.blue : 'transparent',
                        color: i === 0 ? '#fff' : C.blue,
                        border: `1px solid ${C.blue}`,
                        borderRadius: 5, padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >{i === 0 ? 'Assign' : 'Select'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function OrderQueue({ orders, setOrders, filters, showToast, onAIPlan }) {
  const [aiPlanning, setAiPlanning] = useState(false)
  const [plannedOrders, setPlannedOrders] = useState([])
  const [vanishingIds, setVanishingIds] = useState(new Set())
  const [hiddenIds, setHiddenIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [filterCompound, setFilterCompound] = useState('')
  const [filterDealer, setFilterDealer] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [sortBy, setSortBy] = useState('priority')
  const [expanded, setExpanded] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 8

  useEffect(() => {
    setPage(0)
  }, [filters])

  const getVehicle = id => vehicleCatalogue.find(v => v.id === id) || {}

  const unassigned = useMemo(() => orders.filter(o => o.status === 'Unassigned'), [orders])

  const filtered = useMemo(() => {
    let arr = unassigned.map(o => ({ ...o, vehicle: getVehicle(o.vehicleId) }))
    if (search) arr = arr.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.to.toLowerCase().includes(search.toLowerCase()) ||
      (o.vehicle.make + ' ' + o.vehicle.model).toLowerCase().includes(search.toLowerCase())
    )
    if (filterCompound) arr = arr.filter(o => o.from === filterCompound)
    if (filterDealer)   arr = arr.filter(o => o.to === filterDealer)
    if (filterType)     arr = arr.filter(o => o.vehicle.type === filterType)
    if (filterPriority) arr = arr.filter(o => o.priority === filterPriority)
    if (filterDate)     arr = arr.filter(o => o.dispatchDate === filterDate)

    arr.sort((a, b) => {
      if (sortBy === 'priority')     return (priorityMeta[a.priority]?.sort ?? 9) - (priorityMeta[b.priority]?.sort ?? 9)
      if (sortBy === 'eta')          return a.eta.localeCompare(b.eta)
      if (sortBy === 'created')      return a.created.localeCompare(b.created)
      if (sortBy === 'dispatchDate') return (a.dispatchDate || '').localeCompare(b.dispatchDate || '')
      return 0
    })
    return arr
  }, [unassigned, search, filterCompound, filterDealer, filterType, filterPriority, filterDate, sortBy])

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const startAIPlanning = () => {
    setPage(0)
    setExpanded(null)
    setPlannedOrders(filtered.slice(0, 8))
    setVanishingIds(new Set())
    setHiddenIds(new Set())
    setAiPlanning(true)
  }

  const handleCarPicked = (id) => {
    setVanishingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      setHiddenIds(prev => new Set(prev).add(id))
      setVanishingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 230)
  }

  const handleAssign = (orderId, truckId) => {
    setOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, status: 'Assigned', truckId, dispatcher: 'Hans Weber' }
      : o
    ))
    showToast(`Order ${orderId} assigned to ${truckId}`, 'success')
    setExpanded(null)
  }

  const handleDateChange = (orderId, dispatchDate) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, dispatchDate } : o))
  }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const sel = (label, value, current, setter, options) => (
    <select
      value={current}
      onChange={e => { setter(e.target.value); setPage(0) }}
      style={{
        border: `1px solid ${C.g2}`, borderRadius: 5, padding: '6px 10px',
        fontSize: 12.5, color: current ? C.text : C.textL, background: C.white,
        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
      }}
    >
      <option value="">{label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ padding: 24, width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Order Queue</div>
          <div style={{ fontSize: 13, color: C.textL, marginTop: 2 }}>
            {filtered.length} of {unassigned.length} unassigned orders awaiting dispatch
          </div>
        </div>
        <button
          onClick={startAIPlanning}
          disabled={aiPlanning || filtered.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: C.navy, color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 8px rgba(13,31,60,0.25)',
          }}
        >
          🤖 AI Planner
        </button>
      </div>

      {aiPlanning && (
        <AIPlanningModal
          plannedOrders={plannedOrders}
          onCarPicked={handleCarPicked}
          onDone={() => {
            setAiPlanning(false)
            onAIPlan?.(plannedOrders.map(order => order.id))
          }}
        />
      )}

      {/* Filter bar */}
      <div style={{
        background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
        padding: '12px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search order ID, vehicle or dealer…"
          style={{
            border: `1px solid ${C.g2}`, borderRadius: 5, padding: '6px 12px',
            fontSize: 12.5, color: C.text, background: C.g1, width: 240,
            fontFamily: 'Inter, sans-serif', outline: 'none',
          }}
        />
        {sel('Compound', 'filterCompound', filterCompound, setFilterCompound, ['Studen', 'Lupfig', 'Rümlang'])}
        {sel('Dealer', 'filterDealer', filterDealer, setFilterDealer, ['Zurich AMAG', 'Bern AutoZentrum', 'Basel Autohaus', 'Geneva Auto AG', 'Lucerne Motors', 'St. Gallen VW'])}
        {sel('Vehicle Type', 'filterType', filterType, setFilterType, ['ICE', 'EV'])}
        {sel('Priority', 'filterPriority', filterPriority, setFilterPriority, ['Critical', 'High', 'Normal'])}

        <input
          type="date"
          value={filterDate}
          onChange={e => { setFilterDate(e.target.value); setPage(0) }}
          title="Filter by dispatch date"
          style={{
            border: `1px solid ${C.g2}`, borderRadius: 5, padding: '6px 10px',
            fontSize: 12.5, color: filterDate ? C.text : C.textL, background: C.white,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        />
        {filterDate && (
          <button onClick={() => setFilterDate('')} style={{
            border: 'none', background: 'transparent', color: C.textL,
            fontSize: 11.5, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif',
          }}>Clear date</button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 6 }}>
          <span style={{ fontSize: 11, color: C.textL, fontWeight: 500 }}>Sort:</span>
          {['priority', 'eta', 'created', 'dispatchDate'].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              background: sortBy === s ? C.navy : 'transparent',
              color: sortBy === s ? '#fff' : C.textL,
              border: `1px solid ${sortBy === s ? C.navy : C.g2}`,
              borderRadius: 4, padding: '4px 10px', fontSize: 11.5,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              textTransform: 'capitalize',
            }}>{s === 'dispatchDate' ? 'Dispatch Date' : s}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button
            disabled={selected.size === 0}
            onClick={() => {
              const ids = [...selected]
              setOrders(prev => prev.map(o => ids.includes(o.id) && o.status === 'Unassigned'
                ? { ...o, status: 'Assigned', dispatcher: 'Hans Weber' } : o
              ))
              showToast(`Bulk assigned ${selected.size} orders`, 'success')
              setSelected(new Set())
            }}
            style={{
              background: selected.size > 0 ? C.blue : C.g2,
              color: selected.size > 0 ? '#fff' : C.textL,
              border: 'none', borderRadius: 6, padding: '7px 14px',
              fontSize: 12.5, fontWeight: 700, cursor: selected.size > 0 ? 'pointer' : 'default',
              fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
            }}
          >Bulk Assign{selected.size > 0 ? ` (${selected.size})` : ''}</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: C.g1 }}>
              <th style={{ padding: '10px 14px', width: 32 }}>
                <input type="checkbox" onChange={e => {
                  setSelected(e.target.checked ? new Set(paginated.map(o => o.id)) : new Set())
                }} checked={selected.size === paginated.length && paginated.length > 0} />
              </th>
              {['Priority', 'Order ID', 'Vehicle Details', 'From', 'To Dealer', 'ETA', 'Dispatcher', 'Dispatch Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: C.textL, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.filter(order => !hiddenIds.has(order.id)).map((order, i) => {
              const pm = priorityMeta[order.priority] || priorityMeta.Normal
              const isExpanded = expanded === order.id
              return (
                <>
                  <tr
                    key={order.id}
                    className={vanishingIds.has(order.id) ? 'ai-car-vanish' : ''}
                    style={{
                      borderTop: `1px solid ${C.g1}`,
                      background: isExpanded ? C.blueL : (i % 2 === 0 ? C.white : '#FAFBFD'),
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = C.blueL }}
                    onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = i % 2 === 0 ? C.white : '#FAFBFD' }}
                  >
                    <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(order.id)} onChange={() => toggleSelect(order.id)} />
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 14 }}>{pm.dot}</span>
                      <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 700, color: pm.color }}>{order.priority}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: C.blue, fontFamily: 'monospace', fontSize: 12 }}>{order.id}</td>
                    <td style={{ padding: '10px 14px' }}><VehicleCell vehicle={order.vehicle} /></td>
                    <td style={{ padding: '10px 14px', color: C.textL, fontSize: 12 }}>{order.from}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text, fontSize: 12 }}>{order.to}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: C.text, fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{order.eta}</td>
                    <td style={{ padding: '10px 14px', color: C.textL, fontSize: 12 }}>{order.dispatcher || <span style={{ color: C.amber, fontWeight: 600 }}>—</span>}</td>
                    <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="date"
                        value={order.dispatchDate || ''}
                        onChange={e => handleDateChange(order.id, e.target.value)}
                        style={{
                          border: `1px solid ${C.g2}`, borderRadius: 5, padding: '5px 8px',
                          fontSize: 12, color: C.text, background: C.white,
                          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : order.id)}
                          style={{
                            background: 'transparent', border: `1px solid ${C.g2}`,
                            borderRadius: 4, padding: '3px 8px', fontSize: 11,
                            fontWeight: 600, cursor: 'pointer', color: C.textL,
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >{isExpanded ? '▲ Close' : '▼ View'}</button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && <ExpandedRow key={`exp-${order.id}`} order={order} vehicle={order.vehicle} onAssign={handleAssign} />}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, color: C.textL }}>
          Showing {Math.min(page * PAGE_SIZE + 1, filtered.length)}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} orders
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{
            border: `1px solid ${C.g2}`, background: page === 0 ? C.g1 : C.white,
            borderRadius: 5, padding: '5px 12px', fontSize: 12, fontWeight: 600,
            cursor: page === 0 ? 'default' : 'pointer', color: page === 0 ? C.textL : C.text,
            fontFamily: 'Inter, sans-serif',
          }}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              border: `1px solid ${page === i ? C.blue : C.g2}`,
              background: page === i ? C.blue : C.white,
              color: page === i ? '#fff' : C.text,
              borderRadius: 5, padding: '5px 10px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              minWidth: 32,
            }}>{i + 1}</button>
          ))}
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{
            border: `1px solid ${C.g2}`, background: page >= totalPages - 1 ? C.g1 : C.white,
            borderRadius: 5, padding: '5px 12px', fontSize: 12, fontWeight: 600,
            cursor: page >= totalPages - 1 ? 'default' : 'pointer', color: page >= totalPages - 1 ? C.textL : C.text,
            fontFamily: 'Inter, sans-serif',
          }}>Next →</button>
        </div>
      </div>
    </div>
  )
}
