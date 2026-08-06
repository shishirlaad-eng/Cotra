import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Toast from './components/Toast'
import Dashboard2 from './screens/Dashboard2'
import OrderQueue from './screens/OrderQueue'
import RoutePlanner2 from './screens/RoutePlanner2'
import RulesEngine from './screens/RulesEngine'
import LanePlan from './screens/LanePlan'
import ChatBot from './components/ChatBot'
import {
  initialOrders, initialTrucks, initialRules, savedRoutes,
} from './data'

const SCREEN_LABELS = {
  dashboard2:  'Dashboard 2',
  orders:      'Order Queue',
  rules:       'Rules Engine',
  planner2:    'Route Planner 2',
  laneplan:    'Lane Plan',
}

// Dev/demo URL params — let headless capture specific screens, e.g. ?screen=orders, ?demo=deck, ?demo=popup, ?demo=validate
const _params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
const DEMO = _params.get('demo') || null
const SCREEN_PARAM = _params.get('screen')
const DECK_DEMO = DEMO === 'deck' || DEMO === 'validate' || DEMO === 'lane'

export default function App() {
  const [screen, setScreen]               = useState(DECK_DEMO ? 'planner2' : (SCREEN_PARAM || 'dashboard2'))
  const [collapsed, setCollapsed]         = useState(false)
  const [orders, setOrders]               = useState(initialOrders)
  const [trucks]                          = useState(initialTrucks)
  const [rules, setRules]                 = useState(initialRules)
  const [toast, setToast]                 = useState(null)
  const [screenFilters, setScreenFilters] = useState({})
  const [activeLanePlan, setActiveLanePlan] = useState(null)
  // Route definitions (seeded with predefined routes; editable in Rules Engine → Routes tab)
  const [routes, setRoutes] = useState(savedRoutes)
  // Trucks that have been pre-planned (from AI Planner or Order Queue) → [{ truckId, route, orderId, ai }]
  const [plannedTrucks, setPlannedTrucks] = useState(DECK_DEMO ? [{ truckId: 'TRK-025', route: savedRoutes[0], orderId: 'CH-2843' }] : [])
  // Truck to auto-open on the Route Planner deck after planning from Order Queue / AI Planner
  const [focusTruckId, setFocusTruckId] = useState(DECK_DEMO ? 'TRK-025' : null)

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type, key: Date.now() })
  }, [])

  const navigate = useCallback((targetScreen, filters = {}) => {
    setScreen(targetScreen)
    if (Object.keys(filters).length) {
      setScreenFilters(prev => ({ ...prev, [targetScreen]: filters }))
    }
  }, [])

  // Called from Route Planner 2 when dispatcher confirms dispatch
  const handleDispatch = useCallback((plan) => {
    setActiveLanePlan(plan)
    setScreen('laneplan')
  }, [])

  const handleAIPlan = useCallback((plannedOrderIds) => {
    setOrders(prev => prev.map(order => plannedOrderIds.includes(order.id)
      ? { ...order, status: 'Assigned', truckId: 'TRK-025', dispatcher: 'AI Planner' }
      : order
    ))
    setPlannedTrucks(prev => [
      ...prev.filter(p => p.truckId !== 'TRK-025'),
      { truckId: 'TRK-025', route: routes[0], orderId: null, ai: true },
    ])
    setFocusTruckId('TRK-025')
    setScreen('planner2')
    showToast(`${plannedOrderIds.length} cars planned on TRK-025`, 'success')
  }, [showToast, routes])

  // Called from Order Queue when a vehicle is planned onto a truck for a route
  const handleOrderPlan = useCallback(({ orderId, truckId, route }) => {
    setOrders(prev => prev.map(order => order.id === orderId
      ? { ...order, status: 'Assigned', truckId, dispatcher: 'Roger' }
      : order
    ))
    setPlannedTrucks(prev => [
      ...prev.filter(p => p.truckId !== truckId),
      { truckId, route, orderId },
    ])
    setFocusTruckId(truckId)
    setScreen('planner2')
    showToast(`${orderId} planned on ${truckId} · ${route.name}`, 'success')
  }, [showToast])

  const screens = {
    dashboard2:  <Dashboard2 trucks={trucks} />,
    orders:      <OrderQueue orders={orders} setOrders={setOrders} rules={rules} routes={routes} filters={screenFilters.orders} showToast={showToast} onAIPlan={handleAIPlan} onOrderPlan={handleOrderPlan} demo={DEMO} />,
    rules:       <RulesEngine rules={rules} setRules={setRules} routes={routes} setRoutes={setRoutes} showToast={showToast} />,
    planner2:    <RoutePlanner2 showToast={showToast} onDispatch={handleDispatch} plannedTrucks={plannedTrucks} routes={routes} focusTruckId={focusTruckId} onFocusConsumed={() => setFocusTruckId(null)} demo={DEMO} />,
    laneplan:    <LanePlan activePlan={activeLanePlan} onNavigate={navigate} />,
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar current={screen} onNavigate={navigate} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.22s ease' }}>
        <TopBar screen={SCREEN_LABELS[screen]} />
        <main style={{ flex: 1, width: '100%', overflowY: 'auto', background: '#F7F9FC' }}>
          <div key={screen} className="fade-in" style={{ width: '100%' }}>
            {screens[screen]}
          </div>
        </main>
      </div>
      {toast && (
        <Toast
          key={toast.key}
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <ChatBot orders={orders} trucks={trucks} onNavigate={navigate} />
    </div>
  )
}
