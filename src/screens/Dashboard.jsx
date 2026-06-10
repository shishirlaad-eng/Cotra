import { C } from '../colors'
import StatusBadge from '../components/StatusBadge'
import { vehicleCatalogue, dispatchers, deliveryTimeline } from '../data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const kpis = [
  { value: '847', label: 'Orders Today',    sub: '↑ 12 vs yesterday', subColor: C.green,  nav: 'orders',  filter: {} },
  { value: '23',  label: 'Active Trucks',   sub: '8 loading · 6 en route', subColor: C.textL, nav: 'planner', filter: {} },
  { value: '4',   label: 'Violations',      sub: '🔴 Requires action', subColor: C.red,    nav: 'orders',  filter: { status: 'Violation' } },
  { value: '94%', label: 'On-Time Delivery',sub: '↑ 3% vs last week', subColor: C.green,  nav: 'performance', filter: {} },
  { value: '6',   label: 'Unassigned',      sub: '⚠ Action needed',   subColor: C.amber,  nav: 'orders',  filter: { status: 'Unassigned' } },
  { value: '2.4h',label: 'Avg Route Duration',sub: '↓ 0.3h improvement', subColor: C.green, nav: 'performance', filter: {} },
]

function CapacityBar({ used, total, height: h }) {
  const pct = total > 0 ? used / total : 0
  const color = pct < 0.6 ? C.green : pct < 0.85 ? C.amber : C.red
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: C.textL }}>{used}/{total}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color }}>{Math.round(pct * 100)}%</span>
      </div>
      <div style={{ height: h || 5, background: C.g2, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

const statusDot = {
  'Available':   C.green,
  'En Route':    C.blueM,
  'Loading':     C.amber,
  'Maintenance': C.red,
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.navy, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{payload[0].value} deliveries</div>
    </div>
  )
}

export default function Dashboard({ orders, trucks, onNavigate, showToast }) {
  const now = new Date()
  const currentHour = `${String(now.getHours()).padStart(2, '0')}:00`
  const getVehicle = id => vehicleCatalogue.find(v => v.id === id) || {}

  const recentOrders = orders.slice(0, 10)

  const handleAssign = (order) => {
    showToast(`Opening Route Planner for ${order.id}`, 'info')
    onNavigate('planner')
  }

  return (
    <div style={{ padding: 24, width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <button
            key={i}
            onClick={() => onNavigate(k.nav, k.filter)}
            style={{
              background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
              padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
              transition: 'box-shadow 0.15s, border-color 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = C.blueM
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = C.g2
            }}
          >
            <div style={{
              fontSize: 26, fontWeight: 800, color: C.text,
              fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginBottom: 3,
            }}>{k.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textL, marginBottom: 5 }}>{k.label}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: k.subColor }}>{k.sub}</div>
          </button>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: 16, marginBottom: 16 }}>

        {/* Recent Orders */}
        <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.g1}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Recent Orders</span>
            <button
              onClick={() => onNavigate('orders')}
              style={{ fontSize: 12, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >View all →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: C.g1 }}>
                {['Order ID', 'Vehicle', 'From', 'To', 'Dispatcher', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: C.textL, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => {
                const v = getVehicle(order.vehicleId)
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderTop: `1px solid ${C.g1}`,
                      background: i % 2 === 0 ? C.white : '#FAFBFD',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = C.blueL}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? C.white : '#FAFBFD'}
                  >
                    <td style={{ padding: '9px 14px', fontWeight: 700, color: C.blue, fontFamily: 'monospace', fontSize: 12 }}>{order.id}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontWeight: 600, color: C.text, fontSize: 12.5 }}>{v.make} {v.model}</div>
                      <div style={{ fontSize: 10.5, color: C.textL }}>{v.category}</div>
                    </td>
                    <td style={{ padding: '9px 14px', color: C.textL, fontSize: 12 }}>{order.from}</td>
                    <td style={{ padding: '9px 14px', color: C.text, fontSize: 12, fontWeight: 500 }}>{order.to}</td>
                    <td style={{ padding: '9px 14px', color: C.textL, fontSize: 12 }}>{order.dispatcher || <span style={{ color: C.amber, fontWeight: 600 }}>Unassigned</span>}</td>
                    <td style={{ padding: '9px 14px' }}><StatusBadge status={order.status} small /></td>
                    <td style={{ padding: '9px 14px' }}>
                      {order.status === 'Unassigned' && (
                        <button onClick={() => handleAssign(order)} style={{
                          background: C.blue, color: '#fff', border: 'none', borderRadius: 5,
                          padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}>Assign</button>
                      )}
                      {order.status === 'Violation' && (
                        <button onClick={() => onNavigate('orders', { status: 'Violation' })} style={{
                          background: C.red, color: '#fff', border: 'none', borderRadius: 5,
                          padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}>Review</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'start' }}>

          {/* Fleet Status */}
          <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.g1}` }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Truck Fleet Status</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {trucks.map(truck => {
                const slotPct = truck.usedSlots / truck.slots
                return (
                  <div
                    key={truck.id}
                    style={{ padding: '10px 16px', borderBottom: `1px solid ${C.g1}`, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.blueL}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => onNavigate('planner')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 12.5, color: C.text, fontFamily: 'monospace' }}>{truck.id}</span>
                        <span style={{ fontSize: 11.5, color: C.textL, marginLeft: 6 }}>{truck.driver}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusDot[truck.status] || C.textL }} />
                        <span style={{ fontSize: 10.5, color: C.textL, fontWeight: 500 }}>{truck.status}</span>
                      </div>
                    </div>
                    <CapacityBar used={truck.usedSlots} total={truck.slots} height={4} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dispatcher Workload */}
          <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.g1}` }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Dispatcher Workload</span>
            </div>
            <div style={{ padding: '6px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {dispatchers.map(d => (
                <div key={d.id} style={{
                  background: C.g1, borderRadius: 6, padding: '10px 12px',
                  border: `1px solid ${C.g2}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>{d.name.split(' ')[0]} {d.name.split(' ')[1][0]}.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10.5, color: C.textL }}>Orders</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{d.ordersToday}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10.5, color: C.textL }}>Routes</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{d.routesActive}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10.5, color: C.textL }}>Avg</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{d.avgCompletion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: '16px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 4 }}>Today's Delivery Timeline</div>
        <div style={{ fontSize: 12, color: C.textL, marginBottom: 14 }}>Hourly delivery completions — 06:00 to 20:00</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={deliveryTimeline} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={C.g2} vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10.5, fill: C.textL }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10.5, fill: C.textL }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: C.blueL }} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {deliveryTimeline.map((entry) => (
                <Cell
                  key={entry.hour}
                  fill={entry.hour === currentHour ? C.blueM : C.blue}
                  opacity={entry.hour === currentHour ? 1 : 0.65}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
