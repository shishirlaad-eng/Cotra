import { useState } from 'react'
import { C } from '../colors'
import { splitRoutes } from '../data'

const statusMeta = {
  'Completed': { color: C.green, bg: '#D1FAE5', border: '#6EE7B7', dot: '●' },
  'In Transit': { color: C.blueM, bg: C.blueL, border: '#93C5FD', dot: '●' },
  'Pending':   { color: C.textL, bg: C.g1, border: C.g2, dot: '○' },
  'Delayed':   { color: C.amber, bg: '#FEF3C7', border: '#FCD34D', dot: '▲' },
}

const legStatusMeta = {
  done:    { icon: '✅', color: C.green,  label: 'Completed' },
  active:  { icon: '🟡', color: C.blueM, label: 'En Route'  },
  delayed: { icon: '⚠️', color: C.amber,  label: 'Delayed'   },
  pending: { icon: '○',  color: C.textL,  label: 'Pending'   },
}

function Timeline({ route }) {
  const legs = route.legs
  const nodes = [legs[0].from, ...legs.map(l => l.to)]

  return (
    <div style={{ padding: '16px 20px', position: 'relative' }}>
      {/* Nodes + line */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative', marginBottom: 4 }}>
        {nodes.map((node, i) => {
          const isLast = i === nodes.length - 1
          const legAfter = legs[i]
          const legBefore = legs[i - 1]
          const nodeStatus = i === 0 ? legs[0].status
            : i < legs.length ? legs[i - 1].status
            : legs[legs.length - 1].status

          const dotColor = nodeStatus === 'done' ? C.green : nodeStatus === 'active' || nodeStatus === 'delayed' ? C.blueM : C.g2

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? 0 : 1 }}>
              {/* Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: dotColor,
                  border: `2px solid ${nodeStatus === 'done' ? C.green : nodeStatus === 'active' ? C.blueM : C.g2}`,
                  boxShadow: nodeStatus === 'active' ? `0 0 0 4px ${C.blueL}` : 'none',
                  flexShrink: 0, zIndex: 1,
                  transition: 'all 0.2s',
                }} />
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{node.replace(' Transfer', '\nTransfer').split('\n').join('\n')}</div>
                  {i === 0 && legs[0].departed && (
                    <div style={{ fontSize: 10, color: C.green, marginTop: 2, fontWeight: 600 }}>✓ {legs[0].departed}</div>
                  )}
                  {i > 0 && legs[i-1] && (
                    <div style={{ fontSize: 10, color: C.textL, marginTop: 2 }}>
                      {legs[i-1].status === 'done'
                        ? <span style={{ color: C.green, fontWeight: 600 }}>✓ {legs[i-1].arrived}</span>
                        : legs[i-1].eta
                        ? <span style={{ color: legs[i-1].status === 'delayed' ? C.amber : C.blueM, fontWeight: 600 }}>ETA {legs[i-1].eta}</span>
                        : legs[i-1].dept
                        ? <span style={{ color: C.textL }}>Dep {legs[i-1].dept}</span>
                        : null
                      }
                    </div>
                  )}
                  {i > 0 && legs[i-1] && (
                    <div style={{ fontSize: 10, color: C.textL, marginTop: 1 }}>{legs[i-1].truck}</div>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && legAfter && (
                <div style={{
                  flex: 1, height: 3, marginTop: 5.5,
                  background: legAfter.status === 'done' ? C.green
                    : legAfter.status === 'active' ? C.blueM
                    : legAfter.status === 'delayed' ? C.amber
                    : C.g2,
                  position: 'relative',
                  mx: 4,
                }}>
                  {legAfter.status === 'active' && (
                    <div className="pulse-dot" style={{
                      position: 'absolute', right: '30%', top: -3,
                      width: 9, height: 9, borderRadius: '50%',
                      background: C.blueM,
                    }} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SplitRouteTracker() {
  const [dateFilter, setDateFilter] = useState('2026-06-06')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const filtered = splitRoutes.filter(r =>
    !search || `${r.id} ${r.make} ${r.model} ${r.vin}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 24, width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Multi-Leg Route Tracker</div>
        <div style={{ fontSize: 13, color: C.textL, marginTop: 3 }}>Track vehicles across compound transfers · {splitRoutes.length} active split routes today</div>
      </div>

      {/* Filters */}
      <div style={{
        background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
        padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{
            border: `1px solid ${C.g2}`, borderRadius: 5, padding: '6px 10px',
            fontSize: 12.5, color: C.text, fontFamily: 'Inter, sans-serif', outline: 'none',
          }}
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Vehicle, Order ID or VIN…"
          style={{
            border: `1px solid ${C.g2}`, borderRadius: 5, padding: '6px 12px',
            fontSize: 12.5, color: C.text, background: C.g1, width: 280,
            fontFamily: 'Inter, sans-serif', outline: 'none',
          }}
        />
        <div style={{ marginLeft: 'auto', fontSize: 12, color: C.textL }}>
          {filtered.length} routes shown
        </div>
      </div>

      {/* Route cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(route => {
          const sm = statusMeta[route.status] || statusMeta.Pending
          const isOpen = expanded === route.id

          return (
            <div key={route.id} style={{
              background: C.white, border: `1px solid ${C.g2}`, borderRadius: 9, overflow: 'hidden',
              boxShadow: route.status === 'Delayed' ? `0 0 0 2px ${C.amber}30` : 'none',
            }}>
              {/* Card header */}
              <div
                style={{
                  padding: '14px 20px', cursor: 'pointer',
                  background: route.delay ? '#FFFBEB' : C.white,
                  borderBottom: `1px solid ${C.g1}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}
                onClick={() => setExpanded(isOpen ? null : route.id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: C.blue, fontFamily: 'monospace' }}>ORDER #{route.id}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>· {route.make} {route.model}</span>
                    <span style={{ fontSize: 12, color: C.textL }}>· VIN: {route.vin}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={route.status === 'In Transit' ? 'pulse-dot' : ''} style={{
                      width: 8, height: 8, borderRadius: '50%', background: sm.color, display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: sm.color }}>
                      {route.status === 'In Transit' ? 'IN TRANSIT' : route.status.toUpperCase()} — Leg {route.legs.filter(l => l.status === 'done' || l.status === 'active').length} of {route.legs.length}
                    </span>
                    {route.delay && (
                      <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, border: `1px solid #FCD34D` }}>
                        ⚠ Delayed
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.textL }}>
                    {isOpen ? '▲ Collapse' : '▼ Expand'}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <Timeline route={route} />

              {/* Legs detail */}
              <div style={{ padding: '0 20px 12px' }}>
                {route.legs.map((leg, i) => {
                  const lm = legStatusMeta[leg.status] || legStatusMeta.pending
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '7px 12px', borderRadius: 5, marginBottom: 4,
                      background: leg.status === 'delayed' ? '#FEF3C7' : C.g1,
                      border: `1px solid ${leg.status === 'delayed' ? '#FCD34D' : C.g2}`,
                    }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{lm.icon}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>LEG {i + 1}: </span>
                        <span style={{ fontSize: 12, color: C.textL }}>{leg.truck} · {leg.driver}</span>
                        {leg.status === 'done' && (
                          <span style={{ fontSize: 12, color: C.green, marginLeft: 8 }}>· Departed {leg.departed} · Arrived {leg.arrived} ✅</span>
                        )}
                        {leg.status === 'active' && (
                          <span style={{ fontSize: 12, color: C.blueM, marginLeft: 8 }}>· En route · ETA {leg.eta} 🟡</span>
                        )}
                        {leg.status === 'delayed' && (
                          <span style={{ fontSize: 12, color: C.amber, marginLeft: 8 }}>· {leg.delayReason}</span>
                        )}
                        {leg.status === 'pending' && (
                          <span style={{ fontSize: 12, color: C.textL, marginLeft: 8 }}>· Scheduled {leg.dept || 'TBD'}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div style={{
                borderTop: `1px solid ${C.g1}`, padding: '10px 20px',
                display: 'flex', gap: 24, background: C.g1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>✅</span>
                  <span style={{ fontSize: 12, color: C.textL }}>Vehicle condition: <strong style={{ color: C.text }}>{route.condition}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13 }}>{route.delay ? '⚠️' : '✅'}</span>
                  <span style={{ fontSize: 12, color: C.textL }}>Customer notified: <strong style={{ color: C.text }}>{route.customerNotified}</strong></span>
                </div>
                {route.delay && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>{route.delay}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
