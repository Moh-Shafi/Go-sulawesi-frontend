import { useState, useEffect, useRef, useCallback } from 'react'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

const A = '#0d9488'
const AL = '#f0fdfa'
const BG = '#f5f6fa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'
const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const t: Record<Lang, any> = {
  en: {
    messages: 'Messages',
    noConversations: 'No conversations yet',
    noMessages: 'Select a conversation to start chatting',
    typeMessage: 'Type a message...',
    send: 'Send',
    close: 'Close Conversation',
    closed: 'Closed',
    active: 'Active',
    startChat: 'Start Chat',
  },
  id: {
    messages: 'Pesan',
    noConversations: 'Belum ada percakapan',
    noMessages: 'Pilih percakapan untuk mulai mengobrol',
    typeMessage: 'Ketik pesan...',
    send: 'Kirim',
    close: 'Tutup Percakapan',
    closed: 'Ditutup',
    active: 'Aktif',
    startChat: 'Mulai Obrolan',
  },
}

interface Conversation {
  id: number
  tourist_id: number
  business_id: number
  status: 'active' | 'closed'
  business_name?: string
  business_image?: string
  tourist_name?: string
  city?: string
  unread_count?: number
  last_message?: string
  last_message_time?: string
}

interface Message {
  id: number
  conversation_id: number
  sender_id: number
  sender_role: string
  message_text: string
  is_read: number
  created_at: string
}

export default function ChatPage({ role }: { role: 'tourist' | 'local' }) {
  const { lang } = useLang()
  const txt = t[lang]
  const [currentUser] = useState(() => getStoredUser())
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [convInfo, setConvInfo] = useState<Conversation | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchConversations = useCallback(() => {
    api.getConversations().then((r: any) => {
      setConversations(r.conversations || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Poll conversations for unread updates (only when no conversation is selected)
  useEffect(() => {
    if (selectedId) return // Don't poll list when viewing a conversation
    pollRef.current = setInterval(fetchConversations, 10000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchConversations, selectedId])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedId) return
    const fetchMessages = () => {
      api.getConversation(selectedId).then((r: any) => {
        setMessages(r.messages || [])
        setConvInfo(r.conversation || null)
      }).catch(() => {})
    }
    fetchMessages()

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [selectedId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedId || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const r = await api.sendMessage(selectedId, text)
      setMessages(prev => [...prev, r.message])
      fetchConversations()
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleClose = async () => {
    if (!selectedId || !window.confirm(txt.close + '?')) return
    try {
      await api.closeConversation(selectedId)
      setConvInfo(prev => prev ? { ...prev, status: 'closed' } : null)
      fetchConversations()
    } catch {}
  }

  const handleDeleteMessage = async (msgId: number) => {
    if (!selectedId) return
    if (!window.confirm('Delete this message?')) return
    try {
      await api.deleteMessage(selectedId, msgId)
      setMessages(prev => prev.filter(m => m.id !== msgId))
    } catch {}
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    if (diff < 604800000) return d.toLocaleDateString('id-ID', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  }

  const displayName = (c: Conversation) => {
    if (role === 'tourist') return c.business_name || 'Business'
    return c.tourist_name || 'Tourist'
  }

  const displayImage = (c: Conversation) => {
    if (role === 'tourist') return c.business_image
    return undefined
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 80px)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Conversation list */}
      <div className="w-full sm:w-80 flex-shrink-0 border-r flex flex-col" style={{ borderColor: BORDER, background: CARD }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: BORDER }}>
          <h2 className="text-sm font-black" style={{ color: TEXT }}>{txt.messages}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm" style={{ color: MUTED }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: MUTED }}>{txt.noConversations}</div>
          ) : (
            conversations.map(c => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className="w-full text-left px-4 py-3 border-b transition-all hover:bg-gray-50 border-0 cursor-pointer"
                style={{
                  borderColor: BORDER,
                  background: selectedId === c.id ? AL : 'transparent',
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ background: A }}>
                    {displayImage(c) ? (
                      <img src={displayImage(c)} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      displayName(c)?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold truncate" style={{ color: TEXT }}>{displayName(c)}</span>
                      {c.unread_count && c.unread_count > 0 ? (
                        <span className="flex-shrink-0 ml-2 px-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: '#ef4444' }}>
                          {c.unread_count}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: SUBTLE }}>{c.last_message || '...'}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col" style={{ background: BG }}>
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={SUBTLE} strokeWidth="1.5" className="mx-auto mb-3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-sm" style={{ color: MUTED }}>{txt.noMessages}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: BORDER, background: CARD }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: A }}>
                  {convInfo ? (role === 'tourist' ? (convInfo.business_image ? <img src={convInfo.business_image} alt="" className="w-full h-full rounded-full object-cover" /> : (convInfo.business_name?.charAt(0) || 'B')) : (convInfo.tourist_name?.charAt(0) || 'T')) : ''}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: TEXT }}>
                    {convInfo ? displayName(convInfo) : '...'}
                  </p>
                  <span className="text-xs font-semibold" style={{ color: convInfo?.status === 'closed' ? '#dc2626' : '#16a34a' }}>
                    {convInfo?.status === 'closed' ? txt.closed : txt.active}
                  </span>
                </div>
              </div>
              {convInfo?.status === 'active' && (
                <button onClick={handleClose}
                  className="text-xs font-semibold border-0 bg-transparent cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100"
                  style={{ color: '#dc2626' }}>
                  {txt.close}
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map(m => {
                const isMe = m.sender_id === currentUser?.id
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      <div className="rounded-2xl px-4 py-2.5"
                        style={{
                          background: isMe ? A : CARD,
                          color: isMe ? 'white' : TEXT,
                          border: isMe ? 'none' : `1px solid ${BORDER}`,
                          boxShadow: shadow,
                        }}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.message_text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1" style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <p className="text-[10px]" style={{ color: SUBTLE }}>
                          {formatTime(m.created_at)}
                        </p>
                        {isMe && (
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="border-0 bg-transparent cursor-pointer p-0 ml-1"
                            title="Delete"
                            style={{ color: '#ef4444', lineHeight: 0, display: 'flex', alignItems: 'center' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {convInfo?.status === 'closed' ? (
              <div className="px-4 py-3 border-t text-center" style={{ borderColor: BORDER, background: CARD }}>
                <p className="text-sm" style={{ color: MUTED }}>{txt.closed}</p>
              </div>
            ) : (
              <div className="px-4 py-3 border-t" style={{ borderColor: BORDER, background: CARD }}>
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder={txt.typeMessage}
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }}
                  />
                  <button onClick={handleSend} disabled={!input.trim() || sending}
                    className="w-11 h-11 rounded-xl flex items-center justify-center border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: A }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
