import { vehicleCatalogue } from './index'

// Suggested questions shown as chips when the chat opens
export const SUGGESTED_QUESTIONS = [
  'I have urgent vehicles for Basel today — what truck is the best fit?',
  'Which trucks are available right now?',
  'Show me the urgent unassigned orders',
  'Give me a summary of the queue',
]

const veh = id => vehicleCatalogue.find(v => v.id === id) || {}
const freeSlots  = t => t.slots - t.usedSlots
const freeWeight = t => t.maxWeight - t.usedWeight

// ─── Intent helpers ──────────────────────────────────────────────────────────

function availableTrucks(trucks) {
  return trucks
    .filter(t => t.status === 'Available')
    .sort((a, b) => freeSlots(b) - freeSlots(a) || freeWeight(b) - freeWeight(a))
}

function urgentUnassigned(orders) {
  const rank = { Critical: 0, High: 1, Normal: 2 }
  return orders
    .filter(o => o.status === 'Unassigned' && (o.priority === 'Critical' || o.priority === 'High'))
    .sort((a, b) => rank[a.priority] - rank[b.priority] || a.eta.localeCompare(b.eta))
}

function describeOrder(o) {
  const v = veh(o.vehicleId)
  const name = v.make ? `${v.make} ${v.model}` : o.vehicleId
  return `${o.id} · ${name} → ${o.to} (${o.priority}, ETA ${o.eta})`
}

// ─── Intent responses ────────────────────────────────────────────────────────

function bestFitReply(orders, trucks) {
  const trucksAvail = availableTrucks(trucks)
  const urgent = urgentUnassigned(orders)

  if (trucksAvail.length === 0) {
    return { text: 'No trucks are currently **Available**. The closest options are loading or en route — I’d hold the urgent cars until a truck frees up, or check the Route Planner for capacity.' }
  }

  const best = trucksAvail[0]
  const cars = urgent.slice(0, best ? freeSlots(best) : 0)
  const carLines = cars.length
    ? cars.map(o => `  • ${describeOrder(o)}`).join('\n')
    : '  • (no urgent unassigned cars in the queue right now)'

  const totalWeight = cars.reduce((s, o) => s + (veh(o.vehicleId).weight || 0), 0)

  const text =
`**Best fit: ${best.id} — ${best.driver}**
Plate ${best.plate} · ${freeSlots(best)} of ${best.slots} slots free · ${freeWeight(best).toLocaleString()} kg spare · driver has ${best.driverHrs}h available.

I’d load these ${cars.length} urgent car${cars.length !== 1 ? 's' : ''} (${totalWeight.toLocaleString()} kg total — well within capacity):
${carLines}

${trucksAvail[1] ? `Backup option: **${trucksAvail[1].id}** (${freeSlots(trucksAvail[1])} slots free).` : ''}`

  return {
    text,
    action: { label: 'Plan in Route Planner →', type: 'navigate', screen: 'planner2' },
  }
}

function urgentReply(orders) {
  const urgent = urgentUnassigned(orders)
  if (urgent.length === 0) {
    return { text: 'Good news — there are no **Critical** or **High** priority unassigned orders in the queue right now.' }
  }
  const lines = urgent.map(o => `  • ${describeOrder(o)}`).join('\n')
  return {
    text: `There ${urgent.length === 1 ? 'is' : 'are'} **${urgent.length} urgent unassigned order${urgent.length !== 1 ? 's' : ''}**:\n${lines}`,
    action: { label: 'Open Order Queue →', type: 'navigate', screen: 'orders', filters: { priority: 'Critical' } },
  }
}

function availabilityReply(trucks) {
  const avail = availableTrucks(trucks)
  if (avail.length === 0) {
    return { text: 'No trucks are **Available** at the moment. Everything is loading, en route, or in maintenance.' }
  }
  const lines = avail
    .map(t => `  • **${t.id}** (${t.driver}) — ${freeSlots(t)} slots free · ${freeWeight(t).toLocaleString()} kg spare · ${t.driverHrs}h driver hours`)
    .join('\n')
  return {
    text: `**${avail.length} truck${avail.length !== 1 ? 's' : ''} available:**\n${lines}`,
  }
}

function orderLookupReply(orders, id) {
  const o = orders.find(x => x.id.toLowerCase() === id.toLowerCase())
  if (!o) return { text: `I couldn’t find an order with ID **${id.toUpperCase()}** in the queue.` }
  const v = veh(o.vehicleId)
  const text =
`**${o.id}** — ${v.make ? `${v.make} ${v.model}` : o.vehicleId}
Status: **${o.status}** · Priority: **${o.priority}**
Route: ${o.from} → ${o.to}
ETA: ${o.eta} · Dispatcher: ${o.dispatcher || 'unassigned'}${o.truckId ? ` · Truck: ${o.truckId}` : ''}`
  return { text, action: { label: 'Open Order Queue →', type: 'navigate', screen: 'orders' } }
}

function summaryReply(orders, trucks) {
  const by = s => orders.filter(o => o.status === s).length
  const avail = availableTrucks(trucks).length
  const urgent = urgentUnassigned(orders).length
  const text =
`**Queue summary**
  • ${orders.length} orders total
  • ${by('Unassigned')} unassigned${urgent ? ` (${urgent} urgent)` : ''}
  • ${by('Assigned')} assigned · ${by('In Transit')} in transit · ${by('Delivered')} delivered
  • ${by('Violation')} with violations
  • ${avail} of ${trucks.length} trucks available`
  return {
    text,
    action: urgent ? { label: 'Plan urgent cars →', type: 'navigate', screen: 'planner2' } : undefined,
  }
}

// ─── Router ──────────────────────────────────────────────────────────────────

export function getBotReply(raw, { orders, trucks }) {
  const text = (raw || '').toLowerCase().trim()

  // Order ID lookup (e.g. "status of CH-2843")
  const idMatch = text.match(/ch-?\s?(\d{3,4})/i)
  if (idMatch) return orderLookupReply(orders, `CH-${idMatch[1]}`)

  if (/\b(hi|hello|hey|good morning|good afternoon)\b/.test(text)) {
    return {
      text: 'Hi! I’m your dispatch assistant. I can recommend the best-fit truck for urgent cars, list available trucks, surface urgent orders, look up an order, or summarise the queue. What do you need?',
    }
  }

  if (/(best fit|best truck|which truck.*(plan|assign|fit)|recommend|what should i|how should i plan|urgent.*plan|plan.*urgent)/.test(text)) {
    return bestFitReply(orders, trucks)
  }

  if (/(urgent|critical|high priority|priority order|most important)/.test(text)) {
    return urgentReply(orders)
  }

  if (/(available|free truck|which trucks|capacity|spare|fleet|open truck)/.test(text)) {
    return availabilityReply(trucks)
  }

  if (/(summary|overview|how many|status of the queue|queue status|today)/.test(text)) {
    return summaryReply(orders, trucks)
  }

  // Fallback
  return {
    text: 'I can help with dispatch planning. Try asking me things like:\n  • “Urgent cars for Basel today — what’s the best fit truck?”\n  • “Which trucks are available?”\n  • “Show urgent unassigned orders”\n  • “Status of CH-2843”\n  • “Give me a queue summary”',
  }
}
