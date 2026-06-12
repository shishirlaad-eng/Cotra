import { useState } from 'react'
import { C } from '../colors'

const DEALERS = ['Zurich AMAG', 'Bern AutoZentrum', 'Basel Autohaus', 'Geneva Auto AG', 'Lucerne Motors', 'St. Gallen VW']
const STOP_COLORS = ['#1A56A0', '#1A7A4A', '#E8A020', '#7C3AED', '#DC2626']
const STOP_BG     = ['#E8F1FB', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FEE2E2']

const sectionMeta = {
  truck:    { label: 'Truck Rules',    color: C.blue,    icon: 'TRK', description: 'Configure operational limits for each truck.' },
  route:    { label: 'Route Rules',    color: '#7C3AED', icon: 'RTE', description: 'Shared constraints applied to every planned route.' },
  routes:   { label: 'Routes',         color: '#0F6E56', icon: 'MAP', description: 'Define the delivery routes available across the system. Add new routes or review predefined ones.' },
  driver:   { label: 'Driver Rules',   color: C.green,   icon: 'DRV', description: 'Configure duty limits and assignments per driver.' },
  compound: { label: 'Compound Rules', color: C.amber,   icon: 'CMP', description: 'Shared staging and yard-operation constraints.' },
}

// Rule-based tabs (entity → rules) vs. the Routes definition tab handled separately
const RULE_TABS = ['truck', 'route', 'driver', 'compound']
const TAB_ORDER = ['truck', 'route', 'routes', 'driver', 'compound']

function Toggle({ enabled, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 40, height: 22, borderRadius: 11, background: enabled ? C.green : C.g2,
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0,
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute',
        top: 2, left: enabled ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function RuleTable({ rules, onToggle, onValueChange }) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '210px 1fr 150px 70px 70px',
        background: C.g1, borderTop: `1px solid ${C.g2}`, borderBottom: `1px solid ${C.g2}`,
      }}>
        {['Parameter', 'Description', 'Value', 'Unit', 'Active'].map(label => (
          <div key={label} style={{ padding: '8px 14px', fontSize: 10.5, fontWeight: 700, color: C.textL, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {label}
          </div>
        ))}
      </div>

      {rules.map(rule => (
        <div key={rule.id} style={{
          display: 'grid', gridTemplateColumns: '210px 1fr 150px 70px 70px',
          alignItems: 'center', borderBottom: `1px solid ${C.g1}`, opacity: rule.enabled ? 1 : 0.5,
        }}>
          <div style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: C.text }}>{rule.name}</div>
          <div style={{ padding: '11px 14px', fontSize: 12, color: C.textL }}>{rule.desc}</div>
          <div style={{ padding: '8px 10px' }}>
            {rule.options ? (
              <select
                value={rule.value}
                disabled={!rule.enabled}
                onChange={event => onValueChange(rule.id, event.target.value)}
                style={{
                  width: '100%', border: `1px solid ${C.g2}`, borderRadius: 5, padding: '6px 8px',
                  fontSize: 12.5, fontWeight: 700, color: C.text,
                  background: rule.enabled ? C.white : C.g1, outline: 'none', cursor: rule.enabled ? 'pointer' : 'default',
                }}
              >
                {rule.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : rule.value ? (
              <input
                value={rule.value}
                disabled={!rule.enabled}
                onChange={event => onValueChange(rule.id, event.target.value)}
                style={{
                  width: '100%', border: `1px solid ${C.g2}`, borderRadius: 5, padding: '6px 8px',
                  fontSize: 13, fontWeight: 700, color: C.text, textAlign: 'center',
                  background: rule.enabled ? C.white : C.g1, outline: 'none',
                }}
              />
            ) : <span style={{ color: C.textL }}>-</span>}
          </div>
          <div style={{ padding: '11px 14px', fontSize: 12, color: C.textL }}>{rule.unit === '—' ? '' : rule.unit}</div>
          <div style={{ padding: '11px 14px' }}><Toggle enabled={rule.enabled} onChange={() => onToggle(rule.id)} /></div>
        </div>
      ))}
    </div>
  )
}

function EntityPanel({ entity, color, expanded, onToggleExpand, onToggleRule, onValueChange }) {
  const activeCount = entity.rules.filter(r => r.enabled).length

  return (
    <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 9, marginBottom: 10, overflow: 'hidden' }}>
      <button
        onClick={onToggleExpand}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          padding: '13px 18px', background: expanded ? C.g1 : C.white, border: 'none', cursor: 'pointer',
          textAlign: 'left', borderLeft: `4px solid ${color}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: 5, background: `${color}18`, color,
            fontSize: 11, fontWeight: 800, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
          }}>›</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{entity.label}</div>
            <div style={{ fontSize: 11.5, color: C.textL, marginTop: 1 }}>{entity.subtitle}</div>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}12`, padding: '4px 9px', borderRadius: 12, flexShrink: 0 }}>
          {activeCount} / {entity.rules.length} active
        </span>
      </button>

      {expanded && (
        <RuleTable rules={entity.rules} onToggle={onToggleRule} onValueChange={onValueChange} />
      )}
    </div>
  )
}

function RoutesManager({ routes, setRoutes, showToast }) {
  const color = sectionMeta.routes.color
  const [name, setName] = useState('')
  const [stops, setStops] = useState([{ id: 1, dealer: '' }])

  const addStop = () => setStops(s => [...s, { id: Date.now(), dealer: '' }])
  const removeStop = (id) => setStops(s => s.filter(x => x.id !== id))
  const updateStop = (id, dealer) => setStops(s => s.map(x => x.id === id ? { ...x, dealer } : x))

  const validStops = stops.filter(s => s.dealer)
  const canAdd = name.trim() && validStops.length >= 1

  const handleAdd = () => {
    if (!canAdd) return
    const builtStops = validStops.map((s, i) => ({
      stopNum: i + 1, dealer: s.dealer, city: s.dealer.split(' ')[0], eta: '—', km: '—',
    }))
    const newRoute = {
      id: `R-${Date.now()}`,
      name: name.trim(),
      description: builtStops.map(s => s.city).join(' · '),
      stops: builtStops,
      custom: true,
    }
    setRoutes(prev => [...prev, newRoute])
    setName('')
    setStops([{ id: 1, dealer: '' }])
    showToast(`Route "${newRoute.name}" added`, 'success')
  }

  const handleDelete = (routeId) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId))
    showToast('Route removed', 'info')
  }

  const inputStyle = {
    border: `1px solid ${C.g2}`, borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: C.text, fontFamily: 'Inter, sans-serif', outline: 'none', background: C.white,
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Existing routes */}
      <div style={{ flex: '1 1 380px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {routes.map(route => (
          <div key={route.id} style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 9, padding: '13px 16px', borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{route.name}</span>
                {route.custom
                  ? <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}14`, padding: '2px 8px', borderRadius: 10 }}>Custom</span>
                  : <span style={{ fontSize: 10, fontWeight: 700, color: C.textL, background: C.g1, padding: '2px 8px', borderRadius: 10 }}>Predefined</span>}
              </div>
              <button onClick={() => handleDelete(route.id)} title="Delete route" style={{ background: '#FEE2E2', border: 'none', borderRadius: 5, padding: '4px 9px', cursor: 'pointer', color: C.red, fontSize: 12 }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {route.stops.map((s, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, background: STOP_BG[i] || C.g1, color: STOP_COLORS[i] || C.textL, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                    {i + 1}. {s.dealer}
                  </span>
                  {i < route.stops.length - 1 && <span style={{ fontSize: 10, color: C.g2 }}>→</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add route form */}
      <div style={{ flex: '0 0 340px', background: C.white, border: `1px solid ${C.g2}`, borderRadius: 9, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>Add New Route</div>
        <div style={{ fontSize: 12, color: C.textL, marginBottom: 14 }}>Name the route and add dealer stops in delivery order.</div>

        <label style={{ fontSize: 11, fontWeight: 700, color: C.textL, textTransform: 'uppercase', letterSpacing: 0.4 }}>Route name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Route ZH→BE" style={{ ...inputStyle, width: '100%', margin: '6px 0 16px' }} />

        <label style={{ fontSize: 11, fontWeight: 700, color: C.textL, textTransform: 'uppercase', letterSpacing: 0.4 }}>Stops</label>
        <div style={{ margin: '8px 0' }}>
          {stops.map((stop, i) => (
            <div key={stop.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: STOP_BG[i] || C.g1, border: `2px solid ${STOP_COLORS[i] || C.g2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: STOP_COLORS[i] || C.textL, flexShrink: 0 }}>{i + 1}</div>
              <select value={stop.dealer} onChange={e => updateStop(stop.id, e.target.value)} style={{ ...inputStyle, flex: 1, padding: '7px 10px', fontSize: 12.5 }}>
                <option value="">— Select dealer —</option>
                {DEALERS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {stops.length > 1 && (
                <button onClick={() => removeStop(stop.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 5, padding: '6px 9px', cursor: 'pointer', color: C.red, fontSize: 12 }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={addStop} style={{ border: `1.5px dashed ${C.g2}`, borderRadius: 6, padding: '7px 14px', background: 'transparent', cursor: 'pointer', color: C.blueM, fontSize: 12.5, fontWeight: 600, width: '100%', marginTop: 4 }}>
            + Add Stop
          </button>
        </div>

        <button onClick={handleAdd} disabled={!canAdd} style={{
          marginTop: 8, width: '100%', background: canAdd ? color : C.g2, color: '#fff', border: 'none',
          borderRadius: 6, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: canAdd ? 'pointer' : 'default',
        }}>Add Route</button>
      </div>
    </div>
  )
}

export default function RulesEngine({ rules, setRules, routes = [], setRoutes, showToast }) {
  const [activeTab, setActiveTab] = useState('truck')
  const [expanded, setExpanded] = useState(() => {
    const initial = {}
    RULE_TABS.forEach(sectionKey => {
      const ids = Object.keys(rules[sectionKey])
      initial[sectionKey] = ids.length ? ids[0] : null
    })
    return initial
  })
  const [dirty, setDirty] = useState(false)

  const updateRule = (sectionKey, entityId, ruleId, update) => {
    setRules(previous => {
      const entity = previous[sectionKey][entityId]
      return {
        ...previous,
        [sectionKey]: {
          ...previous[sectionKey],
          [entityId]: { ...entity, rules: entity.rules.map(rule => rule.id === ruleId ? { ...rule, ...update(rule) } : rule) },
        },
      }
    })
    setDirty(true)
  }

  const toggleRule = (sectionKey, entityId, ruleId) => {
    updateRule(sectionKey, entityId, ruleId, rule => ({ enabled: !rule.enabled }))
  }

  const updateValue = (sectionKey, entityId, ruleId, value) => {
    updateRule(sectionKey, entityId, ruleId, () => ({ value }))
  }

  const toggleExpand = (sectionKey, entityId) => {
    setExpanded(previous => ({ ...previous, [sectionKey]: previous[sectionKey] === entityId ? null : entityId }))
  }

  const handleSave = () => {
    setDirty(false)
    showToast('Rules saved successfully - entity profiles updated', 'success')
  }

  const meta = sectionMeta[activeTab]
  const isRoutesTab = activeTab === 'routes'
  const entities = isRoutesTab ? [] : Object.values(rules[activeTab])

  return (
    <div style={{ padding: 24, width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Rules Engine Configuration</div>
        <div style={{ fontSize: 13, color: C.textL, marginTop: 3 }}>Configure truck and driver profiles alongside shared route and compound policies.</div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 6, borderBottom: `2px solid ${C.g2}`, marginBottom: 16 }}>
        {TAB_ORDER.map(sectionKey => {
          const tabMeta = sectionMeta[sectionKey]
          const isActive = activeTab === sectionKey
          return (
            <button
              key={sectionKey}
              onClick={() => setActiveTab(sectionKey)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '10px 18px',
                border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: `3px solid ${isActive ? tabMeta.color : 'transparent'}`,
                marginBottom: -2, fontSize: 13.5, fontWeight: 800,
                color: isActive ? tabMeta.color : C.textL, transition: 'color 0.15s',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 20, borderRadius: 5, fontSize: 10, fontWeight: 800,
                background: isActive ? `${tabMeta.color}18` : C.g1,
                color: isActive ? tabMeta.color : C.textL,
              }}>{tabMeta.icon}</span>
              {tabMeta.label}
              <span style={{
                fontSize: 10.5, fontWeight: 700, color: isActive ? tabMeta.color : C.textL,
                background: isActive ? `${tabMeta.color}12` : C.g1, padding: '2px 7px', borderRadius: 10,
              }}>{sectionKey === 'routes' ? routes.length : Object.keys(rules[sectionKey]).length}</span>
            </button>
          )
        })}
      </div>

      {/* ── Active tab content ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.textL, marginBottom: 12 }}>{meta.description}</div>

        {isRoutesTab ? (
          <RoutesManager routes={routes} setRoutes={setRoutes} showToast={showToast} />
        ) : (
          entities.map(entity => (
            <EntityPanel
              key={entity.id}
              entity={entity}
              color={meta.color}
              expanded={expanded[activeTab] === entity.id}
              onToggleExpand={() => toggleExpand(activeTab, entity.id)}
              onToggleRule={ruleId => toggleRule(activeTab, entity.id, ruleId)}
              onValueChange={(ruleId, value) => updateValue(activeTab, entity.id, ruleId, value)}
            />
          ))
        )}
      </div>

      {!isRoutesTab && (
        <div style={{
          position: 'sticky', bottom: 0, background: C.white, border: `1px solid ${C.g2}`, borderRadius: 8,
          padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: 12, color: dirty ? C.amber : C.textL, fontWeight: dirty ? 700 : 400 }}>
            {dirty ? 'Unsaved profile changes' : 'All rule profiles saved'}
          </div>
          <button onClick={handleSave} disabled={!dirty} style={{
            background: dirty ? C.blue : C.g2, color: dirty ? '#fff' : C.textL, border: 'none',
            borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: dirty ? 'pointer' : 'default',
          }}>Save Changes</button>
        </div>
      )}
    </div>
  )
}
