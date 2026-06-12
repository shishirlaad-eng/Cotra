import { C } from '../colors'

const screenCrumbs = {
  'Dashboard 2':         ['Analytics', 'Dashboard 2'],
  'Order Queue':         ['Operations', 'Order Queue'],
  'Rules Engine':        ['Configuration', 'Rules Engine'],
}

export default function TopBar({ screen }) {
  const crumbs = screenCrumbs[screen] || [screen]

  return (
    <div style={{
      height: 56,
      background: C.white,
      borderBottom: `1px solid ${C.g2}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      zIndex: 10,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span style={{ color: C.g2, fontSize: 14 }}>/</span>}
            <span style={{
              fontSize: 13,
              fontWeight: i === crumbs.length - 1 ? 600 : 400,
              color: i === crumbs.length - 1 ? C.text : C.textL,
            }}>{c}</span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Date badge */}
        <div style={{
          fontSize: 12, fontWeight: 500, color: C.textL,
          background: C.g1, padding: '4px 10px', borderRadius: 4,
          border: `1px solid ${C.g2}`,
        }}>
          Dispatch Day: 06 Jun 2026
        </div>

        {/* Alert indicator */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            fontSize: 18, lineHeight: 1,
          }}>🔔</div>
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, background: C.red, borderRadius: '50%',
            border: `2px solid ${C.white}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff',
          }}>4</div>
        </div>

        {/* User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{
            width: 32, height: 32,
            background: C.navy,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>R</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>Roger</div>
            <div style={{ fontSize: 10, color: C.textL, lineHeight: 1.3 }}>Senior Dispatcher</div>
          </div>
        </div>
      </div>
    </div>
  )
}
