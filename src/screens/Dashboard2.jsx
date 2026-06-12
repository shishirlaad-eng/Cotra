import { useState } from 'react'
import { C } from '../colors'
import { dispatchers, perfDailyOrders } from '../data'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const planningRates = [
  { name: 'Roger', rate: 12 }, { name: 'Klaus Zimmermann', rate: 8 },
  { name: 'Maria Schneider', rate: 22 }, { name: 'Peter Brunner', rate: 38 },
]
const efficiencyData = dispatchers.map((d, i) => ({ ...d, violationsCaught: [3, 5, 7, 1][i], avgAssignmentTime: ['1m 12s', '1m 48s', '0m 58s', '2m 34s'][i] }))
const stages = ['Truck Arrival', 'Route Planned', 'Loading Start', 'Loading Complete', 'Dispatched']
const stageMeta = { 'En Route': [5, '3h 10m'], Loading: [3, '2h 45m'], Available: [2, 'Planning'], Maintenance: [1, 'On hold'] }

function Tip({ active, payload, label, suffix = '' }) {
  if (!active || !payload?.length) return null
  return <div style={{ background: C.navy, color: '#fff', borderRadius: 6, padding: '8px 12px', fontSize: 12 }}><div style={{ opacity: .6 }}>{label}</div>{payload.map(p => <div key={p.dataKey} style={{ fontWeight: 700 }}>{p.name}: {p.value}{suffix}</div>)}</div>
}

function Score({ value }) {
  const color = value >= 90 ? C.green : value >= 75 ? C.amber : C.red
  return <span style={{ background: value >= 90 ? '#D1FAE5' : value >= 75 ? '#FEF3C7' : '#FEE2E2', color, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}>{value}%</span>
}

function Timeline({ truck }) {
  const [complete, total] = stageMeta[truck.status] || stageMeta.Available
  const base = 6 * 60 + Number(truck.id.slice(-2)) % 90
  const offsets = [0, 12, 25, 70, 100]
  const time = offset => `${String(Math.floor((base + offset) / 60)).padStart(2, '0')}:${String((base + offset) % 60).padStart(2, '0')}`
  return <div style={{ padding: '18px 22px 22px', background: C.offW, borderTop: `1px solid ${C.g2}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}><span style={{ fontSize: 12, color: C.textL }}>{truck.driver} · {truck.plate} · {truck.usedSlots}/{truck.slots} slots loaded</span><span style={{ fontSize: 11.5, fontWeight: 800, color: C.green, background: '#D1FAE5', padding: '4px 11px', borderRadius: 12 }}>Total cycle: {total}</span></div>
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
      <div style={{ position: 'absolute', left: '10%', right: '10%', top: 10, height: 4, background: C.g2 }} />
      <div style={{ position: 'absolute', left: '10%', top: 10, height: 4, width: `${Math.max(0, complete - 1) * 20}%`, background: C.blueM }} />
      {stages.map((label, i) => <div key={label} style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ width: 22, height: 22, margin: '0 auto 8px', borderRadius: '50%', background: i < complete ? C.blueM : C.white, border: `3px solid ${i < complete ? C.blueM : i === complete ? C.amber : C.g2}`, boxShadow: `0 0 0 3px ${C.offW}` }} />
        <div style={{ fontSize: 11.5, fontWeight: 700, color: i < complete ? C.text : C.textL }}>{label}</div>
        <div style={{ fontSize: 10.5, color: i === complete ? C.amber : C.textL, marginTop: 3 }}>{i < complete ? time(offsets[i]) : i === complete ? 'in progress' : 'pending'}</div>
        {i > 0 && i < complete && <div style={{ fontSize: 10, color: C.blueM, fontWeight: 700 }}>+{offsets[i] - offsets[i - 1]} min</div>}
      </div>)}
    </div>
  </div>
}

export default function Dashboard2({ trucks }) {
  const unplannedTrucks = trucks.filter(truck => truck.status === 'Available' && !truck.dept)
  const [expanded, setExpanded] = useState(unplannedTrucks[0]?.id)
  const card = { background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: '16px 18px' }
  return <div style={{ padding: 24, width: '100%', fontFamily: 'Inter, sans-serif' }}>
    <div style={{ marginBottom: 20 }}><div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Dashboard 2 — Truck Dispatch Timeline</div><div style={{ fontSize: 13, color: C.textL, marginTop: 3 }}>End-to-end truck lifecycle visibility and dispatcher planning performance.</div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <div style={card}><div style={{ fontWeight: 700, fontSize: 14 }}>Daily Orders Processed — Last 30 Days</div><div style={{ fontSize: 11.5, color: C.textL, margin: '2px 0 14px' }}>Manual baseline vs. AI-assisted dispatch</div><ResponsiveContainer width="100%" height={210}><LineChart data={perfDailyOrders} margin={{ left: -16 }}><CartesianGrid strokeDasharray="3 3" stroke={C.g2} vertical={false} /><XAxis dataKey="day" interval={4} tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip content={<Tip />} /><Legend wrapperStyle={{ fontSize: 12 }} /><Line dataKey="manual" name="Manual" stroke={C.g2} dot={false} /><Line dataKey="assisted" name="AI-Assisted" stroke={C.blueM} strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div>
      <div style={card}><div style={{ fontWeight: 700, fontSize: 14 }}>Average Planning Rate of Dispatcher</div><div style={{ fontSize: 11.5, color: C.textL, margin: '2px 0 14px' }}>Average minutes required to complete truck planning</div><ResponsiveContainer width="100%" height={210}><BarChart data={planningRates} layout="vertical" margin={{ left: 20, right: 25 }}><CartesianGrid strokeDasharray="3 3" stroke={C.g2} horizontal={false} /><XAxis type="number" /><YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10.5 }} /><Tooltip content={<Tip suffix=" min" />} /><Bar dataKey="rate" name="Planning time" radius={[0, 4, 4, 0]}>{planningRates.map(p => <Cell key={p.name} fill={p.rate <= 15 ? C.green : p.rate <= 25 ? C.amber : C.red} />)}</Bar></BarChart></ResponsiveContainer></div>
    </div>
    <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}><div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.g1}`, display: 'flex', justifyContent: 'space-between' }}><div><div style={{ fontWeight: 800, fontSize: 14 }}>DISPATCHER PLANNING PERFORMANCE</div><div style={{ fontSize: 12, color: C.textL }}>Dispatcher Efficiency Breakdown · Today</div></div><div style={{ fontSize: 12, color: C.textL }}>Team avg: <strong>87.5%</strong></div></div><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}><thead><tr style={{ background: C.g1 }}>{['Dispatcher', 'Orders Today', 'Avg Assignment Time', 'Routes Confirmed', 'Violations Caught', 'Efficiency Score'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.textL, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead><tbody>{efficiencyData.map((d, i) => <tr key={d.id} style={{ borderTop: `1px solid ${C.g1}`, background: i % 2 ? '#FAFBFD' : C.white }}><td style={{ padding: '11px 16px', fontWeight: 700 }}>{d.name}</td><td style={{ padding: '11px 16px', fontWeight: 700 }}>{d.ordersToday}</td><td style={{ padding: '11px 16px' }}>{d.avgAssignmentTime}</td><td style={{ padding: '11px 16px', fontWeight: 700 }}>{d.routesActive}</td><td style={{ padding: '11px 16px', fontWeight: 700 }}>{d.violationsCaught}</td><td style={{ padding: '11px 16px' }}><Score value={d.efficiency} /></td></tr>)}</tbody></table></div>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>TRUCK TIMELINES</div>
    {unplannedTrucks.map(truck => { const open = expanded === truck.id; return <div key={truck.id} style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 9, marginBottom: 10, overflow: 'hidden' }}><button onClick={() => setExpanded(open ? null : truck.id)} style={{ width: '100%', padding: '13px 18px', border: 'none', borderLeft: `4px solid ${C.blue}`, background: open ? C.g1 : C.white, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ width: 20, height: 20, borderRadius: 5, background: C.blueL, color: C.blue, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, transform: open ? 'rotate(90deg)' : 'none' }}>›</span><div><div style={{ fontSize: 14, fontWeight: 800, color: C.blue }}>{truck.id}</div><div style={{ fontSize: 11.5, color: C.textL }}>{truck.driver} · {truck.plate}</div></div></div><span style={{ fontSize: 11, fontWeight: 700, color: C.blue, background: C.blueL, padding: '4px 9px', borderRadius: 12 }}>Unplanned</span></button>{open && <Timeline truck={truck} />}</div> })}
  </div>
}
