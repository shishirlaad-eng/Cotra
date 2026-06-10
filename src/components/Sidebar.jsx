import { useState, useEffect } from 'react'
import { C } from '../colors'

const NAV = [
  { id: 'dashboard2',  icon: '📊', label: 'Dashboard 2'          },
  { id: 'rules',       icon: '⚙️', label: 'Rules Engine'        },
  { id: 'orders',      icon: '🗂',  label: 'Order Queue'         },
  { id: 'planner2',    icon: '🗺',  label: 'Route Planner 2'    },
  { id: 'laneplan',    icon: '🏗',  label: 'Lane Plan'           },
]

export default function Sidebar({ current, onNavigate, collapsed, setCollapsed }) {
  const [time, setTime]       = useState(new Date())
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmtTime = d => d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const fmtDate = d => d.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: 'short' })

  const W = collapsed ? 56 : 240

  return (
    /* Wrapper — positions the sidebar + the edge toggle button together */
    <div style={{ position: 'relative', flexShrink: 0, zIndex: 30 }}>

      {/* ─── Sidebar panel ─── */}
      <div style={{
        width: W,
        background: C.navy,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 0.22s ease',
      }}>

        {/* Logo */}
        <div style={{
          padding: collapsed ? '16px 0' : '18px 16px 16px',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflow: 'hidden',
          flexShrink: 0,
          transition: 'padding 0.22s ease',
        }}>
          <div style={{
            width: 32, height: 32, background: C.blueM, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0,
            marginLeft: collapsed ? 'auto' : 0,
            marginRight: collapsed ? 'auto' : 0,
          }}>C</div>

          <div style={{
            overflow: 'hidden',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 160,
            transition: 'opacity 0.15s ease, max-width 0.22s ease',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>COTRA</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Dispatch Platform
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(item => {
            const active  = current === item.id
            const tooltip = collapsed && hovered === item.id

            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => onNavigate(item.id)}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 10,
                    width: '100%',
                    padding: collapsed ? '11px 0' : '9px 16px 9px 18px',
                    background: active ? 'rgba(74,144,217,0.15)' : 'transparent',
                    borderLeft: active ? `3px solid ${C.blueM}` : '3px solid transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: active ? C.blueM : 'rgba(255,255,255,0.6)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 400,
                    textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s, padding 0.22s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  onMouseOver={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
                    }
                  }}
                  onMouseOut={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    }
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' }}>
                    {item.icon}
                  </span>
                  <span style={{
                    overflow: 'hidden',
                    opacity: collapsed ? 0 : 1,
                    maxWidth: collapsed ? 0 : 160,
                    transition: 'opacity 0.15s ease, max-width 0.22s ease',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                </button>

                {/* Tooltip (collapsed mode only) */}
                {tooltip && (
                  <div style={{
                    position: 'absolute',
                    left: 62,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#1A2B4A',
                    color: '#fff',
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: `1px solid rgba(255,255,255,0.15)`,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer — clock & version */}
        <div style={{
          borderTop: `1px solid rgba(255,255,255,0.08)`,
          overflow: 'hidden',
          maxHeight: collapsed ? 0 : 80,
          opacity: collapsed ? 0 : 1,
          transition: 'max-height 0.22s ease, opacity 0.18s ease',
          padding: collapsed ? '0 16px' : '12px 16px 14px',
          flexShrink: 0,
        }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3, marginBottom: 2 }}>
            {fmtTime(time)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 }}>
            {fmtDate(time)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 500, letterSpacing: 0.5 }}>
            COTRA Dispatch · v1.0
          </div>
        </div>
      </div>

      {/* ─── Edge toggle button — always visible on the right border ─── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          top: 22,
          right: -14,               /* half-outside the sidebar edge */
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: C.white,
          border: `2px solid ${C.g2}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
          zIndex: 40,
          transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          padding: 0,
          outline: 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = C.navy
          e.currentTarget.style.borderColor = C.navy
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.22)'
          e.currentTarget.querySelector('svg').style.stroke = '#fff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = C.white
          e.currentTarget.style.borderColor = C.g2
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.14)'
          e.currentTarget.querySelector('svg').style.stroke = C.textL
        }}
      >
        {/* Chevron icon — rotates based on state */}
        <svg
          width="12" height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            stroke: C.textL,
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            transition: 'transform 0.22s ease, stroke 0.15s',
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          <polyline points="4,2 8,6 4,10" />
        </svg>
      </button>

    </div>
  )
}
