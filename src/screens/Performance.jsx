import { C } from '../colors'
import { dispatchers, perfDailyOrders, truckUtilisation, violationsOverTime } from '../data'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const impactStats = [
  { value: '34%',    label: 'Fewer manual\nassignments',   sub: '↑ from baseline', color: C.blueM },
  { value: '0',      label: 'Height violations\nin 30 days', sub: 'Down from 14/month', color: C.green },
  { value: '91%',    label: 'Avg truck\nutilisation',      sub: '↑ 28% improvement', color: C.blueM },
  { value: '2.1 hrs',label: 'Saved per\ndispatcher/day',   sub: '× 4 dispatchers', color: C.green },
]

const efficiencyData = dispatchers.map(d => ({
  ...d,
  violationsCaught: [3, 5, 7, 1][dispatchers.indexOf(d)],
  avgAssignmentTime: ['1m 12s', '1m 48s', '0m 58s', '2m 34s'][dispatchers.indexOf(d)],
}))

function CustomLineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.navy, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }}>Day {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function ScoreBadge({ score }) {
  const color = score >= 90 ? C.green : score >= 75 ? C.amber : C.red
  const bg    = score >= 90 ? '#D1FAE5' : score >= 75 ? '#FEF3C7' : '#FEE2E2'
  return (
    <span style={{
      background: bg, color, fontWeight: 800, fontSize: 13,
      padding: '4px 10px', borderRadius: 6,
      fontVariantNumeric: 'tabular-nums',
    }}>{score}%</span>
  )
}

const pieDataBefore = [
  { name: 'Route Planning', value: 78, color: C.blue },
  { name: 'Exception Handling', value: 22, color: C.blueM },
]
const pieDataAfter = [
  { name: 'Route Planning', value: 25, color: C.blue },
  { name: 'Exceptions & Value Work', value: 75, color: C.green },
]

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.navy, borderRadius: 6, padding: '8px 12px' }}>
      <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{payload[0].name}: {payload[0].value}%</div>
    </div>
  )
}

export default function Performance() {
  return (
    <div style={{ padding: 24, width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Operational Performance</div>
        <div style={{ fontSize: 13, color: C.textL, marginTop: 3 }}>Business impact of AI-assisted dispatch optimisation</div>
      </div>

      {/* Impact Banner */}
      <div style={{
        background: C.navy, borderRadius: 10, padding: '20px 24px',
        marginBottom: 20,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 16 }}>
          Since implementing AI-assisted dispatch:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {impactStats.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 8, padding: '14px 16px',
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{
                fontSize: 32, fontWeight: 800, color: '#fff',
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginBottom: 4,
              }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4, lineHeight: 1.4 }}>
                {s.label.split('\n').map((line, j) => <span key={j}>{line}<br /></span>)}
              </div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Daily Orders */}
        <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>Daily Orders Processed — Last 30 Days</div>
          <div style={{ fontSize: 11.5, color: C.textL, marginBottom: 14 }}>Manual baseline vs. AI-assisted dispatch</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={perfDailyOrders} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.g2} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textL }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: C.textL }} axisLine={false} tickLine={false} domain={[250, 950]} />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="manual" name="Manual" stroke={C.g2} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="assisted" name="AI-Assisted" stroke={C.blueM} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Truck Utilisation */}
        <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>Truck Utilisation Rate</div>
          <div style={{ fontSize: 11.5, color: C.textL, marginBottom: 14 }}>Today's loading vs target (80%)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={truckUtilisation} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.g2} vertical={false} />
              <XAxis dataKey="id" tick={{ fontSize: 9.5, fill: C.textL }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textL }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, 'Utilisation']} contentStyle={{ background: C.navy, border: 'none', borderRadius: 6, color: '#fff', fontSize: 12 }} labelStyle={{ color: 'rgba(255,255,255,0.6)' }} />
              <ReferenceLine y={80} stroke={C.blue} strokeDasharray="4 3" label={{ value: '80% target', fill: C.blue, fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="util" radius={[3, 3, 0, 0]}>
                {truckUtilisation.map((entry) => (
                  <Cell key={entry.id} fill={entry.util >= 85 ? C.green : entry.util >= 60 ? C.amber : C.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Time Allocation Donut */}
        <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>Dispatcher Time Allocation</div>
          <div style={{ fontSize: 11.5, color: C.textL, marginBottom: 14 }}>Routing work vs. exception handling — Before vs. After</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[{ label: 'Before', data: pieDataBefore }, { label: 'After', data: pieDataAfter }].map(({ label, data }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textL, marginBottom: 4 }}>{label}</div>
                <PieChart width={130} height={130} style={{ margin: '0 auto' }}>
                  <Pie data={data} cx={60} cy={60} innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={2}>
                    {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  {data.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10.5, color: C.textL }}>{d.name}: <strong>{d.value}%</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Violations Over Time */}
        <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>Compliance Violations Over Time</div>
          <div style={{ fontSize: 11.5, color: C.textL, marginBottom: 14 }}>AI-assisted system introduced at Day 15</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={violationsOverTime} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="violationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.g2} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textL }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: C.textL }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [v, 'Violations']} contentStyle={{ background: C.navy, border: 'none', borderRadius: 6, color: '#fff', fontSize: 12 }} labelStyle={{ color: 'rgba(255,255,255,0.6)' }} labelFormatter={l => `Day ${l}`} />
              <ReferenceLine x="15" stroke={C.blueM} strokeDasharray="4 3" label={{ value: 'AI Deployed', fill: C.blueM, fontSize: 9.5, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="violations" stroke={C.red} strokeWidth={2} fill="url(#violationGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dispatcher Efficiency Table */}
      <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.g1}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Dispatcher Efficiency Breakdown</div>
            <div style={{ fontSize: 12, color: C.textL, marginTop: 2 }}>Today · 06 Jun 2026</div>
          </div>
          <div style={{ fontSize: 12, color: C.textL }}>
            Team avg: <strong style={{ color: C.text }}>87.5%</strong>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.g1 }}>
              {['Dispatcher', 'Orders Today', 'Avg Assignment Time', 'Routes Confirmed', 'Violations Caught', 'Efficiency Score'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: C.textL, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {efficiencyData.map((d, i) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${C.g1}`, background: i % 2 === 0 ? C.white : '#FAFBFD' }}
                onMouseEnter={e => e.currentTarget.style.background = C.blueL}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? C.white : '#FAFBFD'}
              >
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.textL }}>Senior Dispatcher</div>
                </td>
                <td style={{ padding: '11px 16px', fontWeight: 700, fontSize: 18, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{d.ordersToday}</td>
                <td style={{ padding: '11px 16px', fontWeight: 600, color: C.text }}>{d.avgAssignmentTime}</td>
                <td style={{ padding: '11px 16px', fontWeight: 700, fontSize: 16, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{d.routesActive}</td>
                <td style={{ padding: '11px 16px', fontWeight: 700, fontSize: 16, color: C.text, fontVariantNumeric: 'tabular-nums' }}>{d.violationsCaught}</td>
                <td style={{ padding: '11px 16px' }}><ScoreBadge score={d.efficiency} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
