import { useEffect, useState } from 'react'
import { C } from '../colors'

const typeStyle = {
  info:    { bg: C.navy,  border: C.blueM, icon: 'ℹ️' },
  success: { bg: '#0F4D2E', border: C.green, icon: '✅' },
  warning: { bg: '#5C3A00', border: C.amber, icon: '⚠️' },
  error:   { bg: '#5C1A1A', border: C.red,   icon: '🚨' },
}

export default function Toast({ msg, type = 'info', onClose }) {
  const [visible, setVisible] = useState(false)
  const style = typeStyle[type] || typeStyle.info

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderLeft: `4px solid ${style.border}`,
      borderRadius: 8,
      padding: '12px 16px',
      maxWidth: 380,
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{style.icon}</span>
      <span style={{ fontSize: 13, color: '#fff', fontWeight: 500, lineHeight: 1.5 }}>{msg}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: 16, padding: 0, marginLeft: 8, flexShrink: 0,
          lineHeight: 1,
        }}
      >×</button>
    </div>
  )
}
