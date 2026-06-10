import { C } from '../colors'

const statusMap = {
  'Unassigned': { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  'Assigned':   { bg: C.blueL,  text: C.blue,    border: '#93C5FD' },
  'In Transit': { bg: '#D1FAE5', text: C.green,   border: '#6EE7B7' },
  'Delivered':  { bg: C.g1,     text: C.textL,   border: C.g2      },
  'Violation':  { bg: '#FEE2E2', text: C.red,     border: '#FCA5A5' },
}

export default function StatusBadge({ status, small }) {
  const s = statusMap[status] || statusMap['Delivered']
  const isTransit = status === 'In Transit'
  const isViolation = status === 'Violation'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: 20,
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      color: s.text,
      whiteSpace: 'nowrap',
      letterSpacing: 0.2,
    }}>
      {isTransit && (
        <span className="pulse-dot" style={{
          width: 6, height: 6, borderRadius: '50%',
          background: C.green, flexShrink: 0,
        }} />
      )}
      {isViolation && <span style={{ fontSize: 10 }}>⚠</span>}
      {status}
    </span>
  )
}
