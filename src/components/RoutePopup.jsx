import { useState } from 'react'
import { C } from '../colors'
import { savedRoutes, plannerOrders2 } from '../data'

const DEALERS = ['Zurich AMAG', 'Bern AutoZentrum', 'Basel Autohaus', 'Geneva Auto AG', 'Lucerne Motors', 'St. Gallen VW']
const STOP_COLORS = ['#1A56A0', '#1A7A4A', '#E8A020', '#7C3AED', '#DC2626']
const STOP_BG     = ['#E8F1FB', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FEE2E2']

const STATUS_META = {
  Available:   { color: C.green, bg: '#D1FAE5' },
  Loading:     { color: C.blueM, bg: C.blueL },
  'En Route':  { color: C.amber, bg: '#FEF3C7' },
  Maintenance: { color: C.textL, bg: C.g1 },
}

/**
 * Shared route-planning popup.
 *
 * Props:
 *  - truck        (optional) truck object → shown in header (Route Planner 2 flow)
 *  - vehicle      (optional) order/vehicle object → seeds the custom route with its dealer (Order Queue flow)
 *  - mode         'route-only' (default) | 'plan-truck'
 *  - ctaLabel     primary button label on the route step
 *  - onPlan(route)            called in 'route-only' mode
 *  - getTrucksForRoute(route) returns trucks for the truck step ('plan-truck' mode)
 *  - onAssign({ route, truck }) called when a truck is assigned ('plan-truck' mode)
 *  - onClose
 */
export default function RoutePopup({
  truck, vehicle,
  routes = savedRoutes,
  mode = 'route-only',
  ctaLabel = '⚡ Auto-Plan This Route →',
  onPlan, getTrucksForRoute, onAssign, onClose,
}) {
  const seededDealer = vehicle?.to
  const [tab, setTab] = useState(seededDealer ? 'custom' : 'saved')
  const [selRoute, setSelRoute] = useState(null)
  const [customStops, setCustomStops] = useState([{ id: 1, dealer: seededDealer || '' }])
  const [step, setStep] = useState('route')      // route | truck
  const [plannedRoute, setPlannedRoute] = useState(null)
  const [selTruck, setSelTruck] = useState(null)

  const countForRoute = (route) =>
    route.stops.reduce((sum, s) => sum + plannerOrders2.filter(o => o.to === s.dealer).length, 0)

  const activeRoute = tab === 'saved' ? selRoute : (
    customStops.filter(s => s.dealer).length >= 1
      ? { id: 'custom', name: 'Custom Route', stops: customStops.filter(s => s.dealer).map((s, i) => ({ stopNum: i + 1, dealer: s.dealer, city: s.dealer.split(' ')[0], eta: '—', km: '—' })) }
      : null
  )

  const addStop = () => setCustomStops(s => [...s, { id: Date.now(), dealer: '' }])
  const removeStop = (id) => setCustomStops(s => s.filter(x => x.id !== id))
  const updateStop = (id, dealer) => setCustomStops(s => s.map(x => x.id === id ? { ...x, dealer } : x))

  const handlePrimary = () => {
    if (!activeRoute) return
    if (mode === 'plan-truck') {
      setPlannedRoute(activeRoute)
      setStep('truck')
    } else {
      onPlan?.(activeRoute)
    }
  }

  const trucksForRoute = step === 'truck' && getTrucksForRoute ? getTrucksForRoute(plannedRoute) : []

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: 12, width: 560, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${C.g2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              {step === 'truck' ? '🚛 Plan Truck' : '🗺 Plan Route'}
            </div>
            <div style={{ fontSize: 12.5, color: C.textL, marginTop: 2 }}>
              {truck
                ? `${truck.id} · ${truck.driver} · ${truck.slots - truck.usedSlots} slots free`
                : vehicle
                  ? `${vehicle.id}${vehicle.vehicleName ? ` · ${vehicle.vehicleName}` : ''} → ${vehicle.to}`
                  : 'Select a route to continue'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.g1, border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: C.textL }}>✕</button>
        </div>

        {/* ── ROUTE STEP ──────────────────────────────────────────────────── */}
        {step === 'route' && (
          <>
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.g2}`, padding: '0 24px' }}>
              {['saved','custom'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 13, fontWeight: tab === t ? 700 : 400,
                  color: tab === t ? C.blue : C.textL,
                  borderBottom: tab === t ? `2px solid ${C.blue}` : '2px solid transparent',
                  marginBottom: -1,
                }}>
                  {t === 'saved' ? '📋 Saved Routes' : '✏️ Custom Route'}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {tab === 'saved' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {routes.map(route => {
                    const count = countForRoute(route)
                    const isSelected = selRoute?.id === route.id
                    const servesDealer = seededDealer && route.stops.some(s => s.dealer === seededDealer)
                    return (
                      <div key={route.id} onClick={() => setSelRoute(route)} style={{
                        border: `2px solid ${isSelected ? C.blue : C.g2}`,
                        borderRadius: 8, padding: '12px 14px', cursor: 'pointer',
                        background: isSelected ? C.blueL : C.white, transition: 'all 0.15s',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: isSelected ? C.blue : C.text }}>
                            {route.name}
                            {servesDealer && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: C.green, background: '#D1FAE5', padding: '1px 7px', borderRadius: 9 }}>serves {seededDealer}</span>}
                          </div>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: count > 0 ? C.green : C.textL, background: count > 0 ? '#D1FAE5' : C.g1, padding: '2px 8px', borderRadius: 10 }}>
                            {count} car{count !== 1 ? 's' : ''} available
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          {route.stops.map((s, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: 11, background: STOP_BG[i] || C.g1, color: STOP_COLORS[i] || C.textL, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                                {i + 1}. {s.city}
                              </span>
                              {i < route.stops.length - 1 && <span style={{ fontSize: 10, color: C.g2 }}>→</span>}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 11, color: C.textL }}>
                          ETAs: {route.stops.map(s => s.eta).join(' · ')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {tab === 'custom' && (
                <div>
                  <div style={{ fontSize: 12.5, color: C.textL, marginBottom: 12 }}>
                    Add stops in delivery order. Stop 1 = first delivery.
                    {seededDealer && <span style={{ color: C.blue, fontWeight: 600 }}> (seeded with {seededDealer})</span>}
                  </div>
                  {customStops.map((stop, i) => (
                    <div key={stop.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: STOP_BG[i] || C.g1, border: `2px solid ${STOP_COLORS[i] || C.g2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: STOP_COLORS[i] || C.textL, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <select
                        value={stop.dealer}
                        onChange={e => updateStop(stop.id, e.target.value)}
                        style={{ flex: 1, border: `1px solid ${C.g2}`, borderRadius: 6, padding: '7px 10px', fontSize: 12.5, color: C.text, fontFamily: 'Inter, sans-serif', outline: 'none', background: C.white }}
                      >
                        <option value="">— Select dealer —</option>
                        {DEALERS.map(d => (
                          <option key={d} value={d}>{d} ({plannerOrders2.filter(o => o.to === d).length} orders)</option>
                        ))}
                      </select>
                      {customStops.length > 1 && (
                        <button onClick={() => removeStop(stop.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 5, padding: '6px 9px', cursor: 'pointer', color: C.red, fontSize: 12 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={addStop} style={{ border: `1.5px dashed ${C.g2}`, borderRadius: 6, padding: '7px 14px', background: 'transparent', cursor: 'pointer', color: C.blueM, fontSize: 12.5, fontWeight: 600, width: '100%', marginTop: 4 }}>
                    + Add Stop
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.g2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.g1 }}>
              {activeRoute
                ? <div style={{ fontSize: 12, color: C.textL }}>{activeRoute.stops.length} stops · ~{countForRoute(activeRoute)} cars will be assigned</div>
                : <div />}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ padding: '8px 16px', border: `1px solid ${C.g2}`, borderRadius: 6, background: C.white, cursor: 'pointer', fontSize: 13, color: C.text }}>Cancel</button>
                <button
                  onClick={handlePrimary}
                  disabled={!activeRoute}
                  style={{
                    padding: '8px 20px', border: 'none', borderRadius: 6, cursor: activeRoute ? 'pointer' : 'not-allowed',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                    background: activeRoute ? C.blue : C.g2, transition: 'background 0.15s',
                  }}
                >{ctaLabel}</button>
              </div>
            </div>
          </>
        )}

        {/* ── TRUCK STEP ──────────────────────────────────────────────────── */}
        {step === 'truck' && (
          <>
            <div style={{ padding: '12px 24px', borderBottom: `1px solid ${C.g2}`, fontSize: 12.5, color: C.textL }}>
              Route <strong style={{ color: C.text }}>{plannedRoute?.name}</strong> · {plannedRoute?.stops.map(s => s.city).join(' → ')}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {trucksForRoute.length === 0 ? (
                <div style={{ textAlign: 'center', color: C.textL, fontSize: 13, padding: '24px 0' }}>
                  No trucks are configured for this route.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {trucksForRoute.map(t => {
                    const sm = STATUS_META[t.status] || STATUS_META.Maintenance
                    const free = t.slots - t.usedSlots
                    const isSel = selTruck?.id === t.id
                    return (
                      <div key={t.id} onClick={() => setSelTruck(t)} style={{
                        border: `2px solid ${isSel ? C.blue : C.g2}`, borderRadius: 8, padding: '11px 14px',
                        cursor: 'pointer', background: isSel ? C.blueL : C.white, transition: 'all 0.15s',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: isSel ? C.blue : C.text, fontFamily: 'monospace' }}>{t.id}</div>
                          <div style={{ fontSize: 11.5, color: C.textL, marginTop: 2 }}>{t.driver} · {t.plate} · {free} slots free</div>
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: sm.color, background: sm.bg, padding: '3px 9px', borderRadius: 10 }}>{t.status}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.g2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.g1 }}>
              <button onClick={() => { setStep('route'); setSelTruck(null) }} style={{ padding: '8px 16px', border: `1px solid ${C.g2}`, borderRadius: 6, background: C.white, cursor: 'pointer', fontSize: 13, color: C.text }}>← Back</button>
              <button
                onClick={() => selTruck && onAssign?.({ route: plannedRoute, truck: selTruck })}
                disabled={!selTruck}
                style={{
                  padding: '8px 24px', border: 'none', borderRadius: 6, cursor: selTruck ? 'pointer' : 'not-allowed',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  background: selTruck ? C.green : C.g2, transition: 'background 0.15s',
                }}
              >Assign</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
