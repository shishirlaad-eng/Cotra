import { useState, useRef, useEffect } from 'react'
import { C } from '../colors'
import { getBotReply, SUGGESTED_QUESTIONS } from '../data/chatbot'

// Render simple **bold** + newlines from the bot's markdown-ish text
function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={j}>{p.slice(2, -2)}</strong>
        : <span key={j}>{p}</span>
    )
    return <div key={i} style={{ minHeight: line === '' ? 6 : undefined }}>{parts}</div>
  })
}

function Bubble({ msg, onAction }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{ maxWidth: '82%' }}>
        <div style={{
          background: isUser ? C.blue : C.white,
          color: isUser ? '#fff' : C.text,
          border: isUser ? 'none' : `1px solid ${C.g2}`,
          borderTopLeftRadius: isUser ? 12 : 3,
          borderTopRightRadius: isUser ? 3 : 12,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          padding: '9px 13px', fontSize: 12.5, lineHeight: 1.5,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {renderText(msg.text)}
        </div>
        {msg.action && (
          <button
            onClick={() => onAction(msg.action)}
            style={{
              marginTop: 6, background: C.navy, color: '#fff', border: 'none',
              borderRadius: 7, padding: '6px 12px', fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >{msg.action.label}</button>
        )}
      </div>
    </div>
  )
}

export default function ChatBot({ orders, trucks, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi 👋 I’m your dispatch assistant. Ask me to find the best-fit truck for urgent cars, check availability, or look up an order.' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  const send = (text) => {
    const q = (text ?? input).trim()
    if (!q || typing) return
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = getBotReply(q, { orders, trucks })
      setMessages(prev => [...prev, { role: 'bot', ...reply }])
      setTyping(false)
    }, 650)
  }

  const handleAction = (action) => {
    if (action.type === 'navigate') {
      onNavigate?.(action.screen, action.filters || {})
      setOpen(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Dispatch AI assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 300,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: C.navy, color: '#fff', fontSize: 24,
          boxShadow: '0 6px 20px rgba(13,31,60,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fade-in" style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 300,
          width: 380, height: 540, maxHeight: 'calc(100vh - 120px)',
          background: C.offW, borderRadius: 14, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          border: `1px solid ${C.g2}`, boxShadow: '0 20px 60px rgba(13,31,60,0.3)',
          fontFamily: 'Inter, sans-serif',
        }}>
          {/* Header */}
          <div style={{ background: C.navy, color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Dispatch Assistant</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                Online · reads live queue
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 6px' }}>
            {messages.map((m, i) => <Bubble key={i} msg={m} onAction={handleAction} />)}
            {typing && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
                <div style={{ background: C.white, border: `1px solid ${C.g2}`, borderRadius: 12, borderTopLeftRadius: 3, padding: '11px 14px' }}>
                  <span className="chat-dot" />
                  <span className="chat-dot" style={{ animationDelay: '0.18s' }} />
                  <span className="chat-dot" style={{ animationDelay: '0.36s' }} />
                </div>
              </div>
            )}

            {/* Suggestion chips — only before first user message */}
            {messages.filter(m => m.role === 'user').length === 0 && !typing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => send(q)} style={{
                    textAlign: 'left', background: C.white, border: `1px solid ${C.g2}`,
                    borderRadius: 9, padding: '8px 11px', fontSize: 11.5, color: C.blue,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', lineHeight: 1.4,
                  }}>💬 {q}</button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: `1px solid ${C.g2}`, background: C.white, display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder="Ask about trucks, orders, planning…"
              style={{
                flex: 1, border: `1px solid ${C.g2}`, borderRadius: 8, padding: '9px 12px',
                fontSize: 12.5, color: C.text, background: C.offW, outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              style={{
                background: input.trim() && !typing ? C.blue : C.g2,
                color: '#fff', border: 'none', borderRadius: 8, width: 40,
                cursor: input.trim() && !typing ? 'pointer' : 'default', fontSize: 16,
              }}
            >➤</button>
          </div>
        </div>
      )}
    </>
  )
}
