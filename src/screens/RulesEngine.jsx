import { useState } from 'react'
import { C } from '../colors'

const sectionMeta = {
  truck:    { label: 'Truck Rules',    color: C.blue,    icon: 'TRK', description: 'Configure operational limits for each truck.' },
  route:    { label: 'Route Rules',    color: '#7C3AED', icon: 'RTE', description: 'Shared constraints applied to every planned route.' },
  driver:   { label: 'Driver Rules',   color: C.green,   icon: 'DRV', description: 'Configure duty limits and assignments per driver.' },
  compound: { label: 'Compound Rules', color: C.amber,   icon: 'CMP', description: 'Shared staging and yard-operation constraints.' },
}

const TAB_ORDER = ['truck', 'route', 'driver', 'compound']

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

export default function RulesEngine({ rules, setRules, showToast }) {
  const [activeTab, setActiveTab] = useState('truck')
  const [expanded, setExpanded] = useState(() => {
    const initial = {}
    TAB_ORDER.forEach(sectionKey => {
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
  const entities = Object.values(rules[activeTab])

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
              }}>{Object.keys(rules[sectionKey]).length}</span>
            </button>
          )
        })}
      </div>

      {/* ── Active tab content ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.textL, marginBottom: 12 }}>{meta.description}</div>

        {entities.map(entity => (
          <EntityPanel
            key={entity.id}
            entity={entity}
            color={meta.color}
            expanded={expanded[activeTab] === entity.id}
            onToggleExpand={() => toggleExpand(activeTab, entity.id)}
            onToggleRule={ruleId => toggleRule(activeTab, entity.id, ruleId)}
            onValueChange={(ruleId, value) => updateValue(activeTab, entity.id, ruleId, value)}
          />
        ))}
      </div>

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
    </div>
  )
}
