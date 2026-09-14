import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
const BLUE = '#3b82f6'

const t: Record<Lang, any> = {
  en: {
    chat: 'Chat',
    messages: 'Messages',
    typeMessage: 'Type a message...',
    send: 'Send',
    viewFull: 'View full chat',
    noMessages: 'No messages yet. Say hello!',
    noConversations: 'No conversations yet',
    closed: 'This conversation is closed',
    newChat: 'New Chat',
    searchBusiness: 'Search business...',
    startChat: 'Start Chat',
    back: 'Back',
    suggestedQuestions: 'Suggested questions',
    sqPrice: 'What are your prices?',
    sqHours: 'What are your opening hours?',
    sqAvailability: 'Are you available today?',
    sqLocation: 'Where are you located?',
    sqBook: 'I would like to make a booking',
  },
  id: {
    chat: 'Chat',
    messages: 'Pesan',
    typeMessage: 'Ketik pesan...',
    send: 'Kirim',
    viewFull: 'Lihat chat lengkap',
    noMessages: 'Belum ada pesan. Katakan halo!',
    noConversations: 'Belum ada percakapan',
    closed: 'Percakapan ini ditutup',
    newChat: 'Chat Baru',
    searchBusiness: 'Cari bisnis...',
    startChat: 'Mulai Chat',
    back: 'Kembali',
    suggestedQuestions: 'Pertanyaan yang disarankan',
    sqPrice: 'Berapa harga Anda?',
    sqHours: 'Jam berapa Anda buka?',
    sqAvailability: 'Apakah Anda tersedia hari ini?',
    sqLocation: 'Di mana lokasi Anda?',
    sqBook: 'Saya ingin melakukan pemesanan',
  },
}

interface Message {
  id: number
  sender_id: number
  sender_role: string
  message_text: string
  is_read: number
  created_at: string
}

interface Conversation {
  id: number
  tourist_id: number
  business_id: number
  status: 'active' | 'closed'
  business_name?: string
  business_image?: string
  tourist_name?: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

export default function ChatWidget({ businessId, businessName, autoOpen, onClose }: { businessId?: number; businessName?: string; autoOpen?: boolean; onClose?: () => void }) {
  const { lang } = useLang()
  const txt = t[lang]
  const navigate = useNavigate()
  const [currentUser] = useState(() => getStoredUser())

  const isBusinessMode = !!businessId && businessId > 0
  const isTourist = currentUser?.role === 'tourist'
  const isLocal = currentUser?.role === 'local'

  const [open, setOpen] = useState(false)
  const [convId, setConvId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [closed, setClosed] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showList, setShowList] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingBusinesses, setLoadingBusinesses] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const listPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch conversations list (for dashboard mode + unread badge)
  const fetchConversations = useCallback(() => {
    api.getConversations().then((r: any) => {
      const convs = r.conversations || []
      setConversations(convs)
      const unread = convs.reduce((sum: number, c: Conversation) => sum + (c.unread_count || 0), 0)
      setTotalUnread(unread)
    }).catch(() => {})
  }, [])

  // Only poll for unread badge when popup is CLOSED (to avoid double polling with ChatPage)
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'tourist' && currentUser.role !== 'local')) return
    if (open) return // Don't poll when popup is open
    fetchConversations()
    listPollRef.current = setInterval(fetchConversations, 15000)
    return () => { if (listPollRef.current) clearInterval(listPollRef.current) }
  }, [currentUser, open, fetchConversations])

  // When widget opens: business mode (tourist) → find/create conversation; dashboard mode → show list
  useEffect(() => {
    if (!open || !currentUser) return
    if (currentUser.role !== 'tourist' && currentUser.role !== 'local') return
    // Local business always sees list; tourist in business mode opens direct chat
    if (isLocal || !isBusinessMode) {
      setShowList(true)
      return
    }
    if (convId) {
      setShowList(false)
      return
    }

    setLoading(true)
    api.getConversations().then((r: any) => {
      const existing = (r.conversations || []).find((c: any) => c.business_id === businessId)
      if (existing) {
        setConvId(existing.id)
        setClosed(existing.status === 'closed')
        setShowList(false)
      } else {
        api.startConversation(businessId!).then((r2: any) => {
          setConvId(r2.conversation?.id || null)
          setShowList(false)
        }).catch(() => {})
      }
      setLoading(false)
    }).catch(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentUser, isBusinessMode, isLocal, businessId])

  // Fetch messages + poll when conversation is active
  useEffect(() => {
    if (!open || !convId) return

    const fetchMessages = () => {
      api.getConversation(convId).then((r: any) => {
        setMessages(r.messages || [])
        setClosed(r.conversation?.status === 'closed')
      }).catch(() => {})
    }
    fetchMessages()
    pollRef.current = setInterval(fetchMessages, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [open, convId, currentUser])

  // Auto-open from parent (card click) — only runs once when autoOpen becomes true
  useEffect(() => {
    if (!autoOpen) return
    if (businessId && businessId > 0) {
      setOpen(true)
      setLoading(true)
      api.getConversations().then((r: any) => {
        const existing = (r.conversations || []).find((c: any) => c.business_id === businessId)
        if (existing) {
          setConvId(existing.id)
          setClosed(existing.status === 'closed')
          setShowList(false)
          setLoading(false)
        } else {
          api.startConversation(businessId).then((r2: any) => {
            setConvId(r2.conversation?.id || null)
            setShowList(false)
            setLoading(false)
            fetchConversations()
          }).catch(() => setLoading(false))
        }
      }).catch(() => setLoading(false))
    } else if (autoOpen) {
      setOpen(true)
      setShowList(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen])

  const handleClose = () => {
    setOpen(false)
    setConvId(null)
    setMessages([])
    setShowList(false)
    if (onClose) onClose()
  }
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !convId || sending || closed) return
    setSending(true)
    const text = input.trim()
    setInput('')
    try {
      const r = await api.sendMessage(convId, text)
      setMessages(prev => [...prev, r.message])
      fetchConversations()
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleSendWithText = async (text: string) => {
    if (!text.trim() || !convId || sending || closed) return
    setSending(true)
    setInput('')
    try {
      const r = await api.sendMessage(convId, text.trim())
      setMessages(prev => [...prev, r.message])
      fetchConversations()
    } catch {
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (msgId: number) => {
    if (!convId) return
    if (!window.confirm('Delete this message?')) return
    try {
      await api.deleteMessage(convId, msgId)
      setMessages(prev => prev.filter(m => m.id !== msgId))
    } catch {}
  }

  const handleSelectConversation = (c: Conversation) => {
    setConvId(c.id)
    setClosed(c.status === 'closed')
    setShowList(false)
  }

  const handleBackToList = () => {
    setConvId(null)
    setMessages([])
    setShowList(true)
    setShowNewChat(false)
  }

  const handleNewChat = () => {
    setShowNewChat(true)
    setShowList(false)
    if (businesses.length === 0) {
      setLoadingBusinesses(true)
      api.getBusinesses().then((r: any) => {
        setBusinesses(r.businesses || [])
        setLoadingBusinesses(false)
      }).catch(() => setLoadingBusinesses(false))
    }
  }

  const handleStartChatWithBusiness = async (bizId: number, bizName: string) => {
    setLoading(true)
    try {
      // Check if conversation already exists
      const existing = conversations.find(c => c.business_id === bizId)
      if (existing) {
        setConvId(existing.id)
        setClosed(existing.status === 'closed')
      } else {
        const r = await api.startConversation(bizId)
        setConvId(r.conversation?.id || null)
        setClosed(false)
        fetchConversations()
      }
      setShowNewChat(false)
      setShowList(false)
    } catch {
      setLoading(false)
    }
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  }

  if (currentUser?.role !== 'tourist' && currentUser?.role !== 'local') return null

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-fab fixed z-50 w-16 h-16 rounded-full flex items-center justify-center border-0 cursor-pointer"
          style={{ bottom: '88px', right: '40px', background: BLUE, color: 'white', boxShadow: '0 6px 20px rgba(59,130,246,0.45)' }}
        >
          <svg className="chat-fab-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center text-white" style={{ background: '#ef4444', boxShadow: '0 2px 8px rgba(239,68,68,0.5)' }}>
              {totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div
          className="fixed z-50 rounded-2xl flex flex-col overflow-hidden"
          style={{
            bottom: '88px',
            right: '40px',            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(520px, calc(100vh - 120px))',
            background: CARD,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: BLUE, color: 'white' }}>
            <div className="flex items-center gap-2 min-w-0">
              {!isBusinessMode && !showList && !showNewChat && convId && (
                <button onClick={handleBackToList}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-all hover:bg-white/20 flex-shrink-0"
                  style={{ background: 'transparent', color: 'white' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}
              {!isBusinessMode && showNewChat && (
                <button onClick={() => { setShowNewChat(false); setShowList(true) }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-all hover:bg-white/20 flex-shrink-0"
                  style={{ background: 'transparent', color: 'white' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                {showList || showNewChat ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ) : (
                  (isBusinessMode ? businessName : (isLocal ? conversations.find(c => c.id === convId)?.tourist_name : conversations.find(c => c.id === convId)?.business_name))?.charAt(0).toUpperCase() || 'C'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{showNewChat ? txt.newChat : showList ? txt.messages : (isBusinessMode ? businessName : (isLocal ? conversations.find(c => c.id === convId)?.tourist_name : conversations.find(c => c.id === convId)?.business_name)) || 'Chat'}</p>
                <p className="text-[10px] opacity-80">{showNewChat ? txt.searchBusiness : showList ? `${conversations.length} ${txt.messages}` : (closed ? txt.closed : txt.chat)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {showList && isTourist && (
                <button onClick={handleNewChat}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-all hover:bg-white/20"
                  style={{ background: 'transparent', color: 'white' }}
                  title={txt.newChat}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              )}
              <button
                onClick={() => { setOpen(false); navigate(isLocal ? '/business/messages' : '/tourist/messages') }}
                className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-all hover:bg-white/20"
                style={{ background: 'transparent', color: 'white' }}
                title={txt.viewFull}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-all hover:bg-white/20"
                style={{ background: 'transparent', color: 'white' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Content area */}
          {showNewChat ? (
            <div className="flex-1 flex flex-col" style={{ background: BG }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: BORDER, background: CARD }}>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={txt.searchBusiness}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {loadingBusinesses ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm" style={{ color: MUTED }}>Loading...</p>
                  </div>
                ) : (
                  (businesses.filter(b => !searchQuery || (b.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (b.city || '').toLowerCase().includes(searchQuery.toLowerCase()))).map(b => {
                    const hasConv = conversations.some(c => c.business_id === b.id)
                    return (
                      <button key={b.id} onClick={() => handleStartChatWithBusiness(b.id, b.business_name)}
                        className="w-full text-left px-4 py-3 border-b transition-all hover:bg-gray-50 border-0 cursor-pointer flex items-center gap-3"
                        style={{ borderColor: BORDER, background: CARD }}>
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden" style={{ background: A }}>
                          {b.image_url ? (
                            <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            b.business_name?.charAt(0).toUpperCase() || 'B'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: TEXT }}>{b.business_name}</p>
                          <p className="text-xs truncate" style={{ color: SUBTLE }}>{b.business_type} • {b.city}</p>
                        </div>
                        {hasConv && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: AL, color: A }}>Chat</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          ) : showList ? (
            <div className="flex-1 overflow-y-auto" style={{ background: BG }}>
              {conversations.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center px-4">
                  <p className="text-sm" style={{ color: MUTED }}>{txt.noConversations}</p>
                </div>
              ) : (
                conversations.map(c => (
                  <button key={c.id} onClick={() => handleSelectConversation(c)}
                    className="w-full text-left px-4 py-3 border-b transition-all hover:bg-gray-50 border-0 cursor-pointer flex items-center gap-3"
                    style={{ borderColor: BORDER, background: CARD }}>
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ background: A }}>
                      {isLocal ? (
                        (c.tourist_name?.charAt(0).toUpperCase() || 'T')
                      ) : c.business_image ? (
                        <img src={c.business_image} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        c.business_name?.charAt(0).toUpperCase() || 'B'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold truncate" style={{ color: TEXT }}>{isLocal ? c.tourist_name : c.business_name}</span>
                        {c.unread_count && c.unread_count > 0 ? (
                          <span className="flex-shrink-0 ml-2 px-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: '#ef4444' }}>
                            {c.unread_count}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: SUBTLE }}>{c.last_message || '...'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center" style={{ background: BG }}>
              <p className="text-sm" style={{ color: MUTED }}>Loading...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ background: BG }}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-3 py-4">
                  {isBusinessMode && businessName ? (
                    <>
                      <p className="text-sm font-bold mb-3" style={{ color: TEXT }}>{businessName}</p>
                      <p className="text-xs mb-4" style={{ color: MUTED }}>{txt.suggestedQuestions}</p>
                      <div className="flex flex-col gap-2 w-full max-w-[260px]">
                        {[
                          txt.sqPrice,
                          txt.sqHours,
                          txt.sqAvailability,
                          txt.sqLocation,
                          txt.sqBook,
                        ].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => { setInput(q); setTimeout(() => handleSendWithText(q), 0); }}
                            className="text-left text-xs px-3 py-2.5 rounded-xl border-0 cursor-pointer transition-all hover:scale-[1.02]"
                            style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: MUTED }}>{txt.noMessages}</p>
                  )}
                </div>
              ) : (
                messages.map(m => {
                  const isMe = m.sender_id === currentUser?.id
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        <div
                          className="rounded-2xl px-3 py-2"
                          style={{
                            background: isMe ? BLUE : CARD,
                            color: isMe ? 'white' : TEXT,
                            border: isMe ? 'none' : `1px solid ${BORDER}`,
                          }}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.message_text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5" style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
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
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {closed ? (
            <div className="px-4 py-3 border-t text-center" style={{ borderColor: BORDER }}>
              <p className="text-xs" style={{ color: MUTED }}>{txt.closed}</p>
            </div>
          ) : (
            <div className="px-3 py-3 border-t" style={{ borderColor: BORDER, background: CARD }}>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={txt.typeMessage}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                  style={{ background: BLUE }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
