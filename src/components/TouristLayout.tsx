import { useState, useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getStoredUser, clearToken } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import TouristBottomNav from './TouristBottomNav'
import ReelsNavIcon from './ReelsNavIcon'

const A = '#0d9488'
const AL = '#f0fdfa'
const BG = '#f5f6fa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'

type LayoutProps = {
  children: ReactNode
  rightPanel?: ReactNode
  hideSearch?: boolean
  title?: string
  hideRightPanel?: boolean
}

const navMain = [
  { id: 'discover', labelKey: 'discover', path: '/tourist', icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )},
  { id: 'reels', labelKey: 'reels', path: '/reels', icon: (active: boolean) => (
    <ReelsNavIcon active={active} />
  )},
  { id: 'trips', labelKey: 'myTrips', path: '/tourist/trips', icon: (_a: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  )},
  { id: 'saved', labelKey: 'savedPlaces', path: '/tourist/saved', icon: (_a: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )},
  { id: 'bookings', labelKey: 'bookings', path: '/tourist/bookings', icon: (_a: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )},
  { id: 'reviews', labelKey: 'reviews', path: '/tourist/reviews', icon: (_a: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )},
  { id: 'following', labelKey: 'following', path: '/tourist/following', icon: (_a: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { id: 'messages', labelKey: 'messages', path: '/tourist/messages', icon: (_a: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )},
]

const followingGuides = [
  { name: 'Andi Kurniawan', role: 'Nature Guide', avatar: '/img-local/1.jpg', phone: '6281234567891' },
  { name: 'Dewi Rahayu', role: 'Homestay Host', avatar: '/img-local/2.jpg', phone: '6281234567892' },
  { name: 'Budi Santoso', role: 'Culture Host', avatar: '/img-local/3.jpg', phone: '6281234567893' },
]

const t: Record<Lang, any> = {
  en: {
    explore: 'Explore',
    discover: 'Discover',
    reels: 'Reels',
    myTrips: 'My Trips',
    savedPlaces: 'Saved Places',
    bookings: 'Bookings',
    reviews: 'Reviews',
    following: 'Following',
    messages: 'Messages',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    searchPlaceholder: 'Search destinations, guides, experiences…',
  },
  id: {
    explore: 'Jelajahi',
    discover: 'Temukan',
    reels: 'Reels',
    myTrips: 'Perjalanan Saya',
    savedPlaces: 'Tempat Tersimpan',
    bookings: 'Pemesanan',
    reviews: 'Ulasan',
    following: 'Diikuti',
    messages: 'Pesan',
    settings: 'Pengaturan',
    setting: 'Pengaturan',
    logout: 'Keluar',
    searchPlaceholder: 'Cari destinasi, pemandu, pengalaman…',
  },
}

export default function TouristLayout({ children, rightPanel, hideSearch, title, hideRightPanel }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  const activeNav = navMain.find(n => location.pathname === n.path || (n.path !== '/tourist' && location.pathname.startsWith(n.path)))?.id || 'discover'

  const handleLogout = () => {
    clearToken()
    localStorage.removeItem('gosulawesi_user')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-56 fixed md:static z-[60]`}
        style={{ background: CARD, borderRight: `1px solid ${BORDER}` }}>

        <div className="px-6 pt-7 pb-8 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-10 w-auto" />
          </Link>
          <button className="md:hidden p-1 border-0 bg-transparent cursor-pointer" style={{ color: MUTED }} onClick={() => setSidebarOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 px-1" style={{ color: SUBTLE }}>{txt.explore}</p>
          <div className="space-y-1">
            {navMain.map(item => {
              const isActive = activeNav === item.id
              const isReels = item.id === 'reels'
              return (
                <Link key={item.id} to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-base text-left no-underline transition-all ${isReels && !isActive ? 'reels-nav-row' : ''}`}
                  style={{ background: isActive ? AL : 'transparent', color: isActive ? A : TEXT, fontWeight: isActive ? 700 : 400 }}>
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all relative"
                    style={{ background: isActive ? A : 'transparent', color: isActive ? 'white' : MUTED }}>
                    {item.icon(isActive)}
                  </span>
                  <span className="flex items-center gap-2">
                    {txt[item.labelKey]}
                    {isReels && !isActive && (
                      <span className="reels-badge text-[9px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: '#ef4444', letterSpacing: '0.02em' }}>NEW</span>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="px-5 mb-6">
          <Link to="/tourist/following" className="block text-xs font-semibold uppercase tracking-widest mb-4 px-1 no-underline hover:opacity-70 transition-opacity" style={{ color: SUBTLE }}>{txt.following}</Link>
          <div className="space-y-1">
            {followingGuides.map((g, i) => (
              <Link key={i} to="/tourist/following" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-2 py-2.5 rounded-xl no-underline hover:bg-gray-50 transition-colors">
                <img src={g.avatar} alt="" className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0" style={{ border: '2px solid #e5e7eb' }} />
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: TEXT }}>{g.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: SUBTLE }}>{g.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <div className="px-5 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: SUBTLE }}>{txt.settings}</p>
          <Link to="/tourist/settings" onClick={() => setSidebarOpen(false)} className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-base text-left no-underline hover:bg-gray-50 transition-colors" style={{ color: TEXT }}>
            <span className="flex items-center justify-center w-8 h-8" style={{ color: MUTED }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
            {txt.setting}
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-base text-left no-underline hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer"
            style={{ color: '#ef4444' }}>
            <span className="flex items-center justify-center w-8 h-8">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {txt.logout}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 flex-shrink-0" style={{ background: CARD, borderBottom: `1px solid ${BORDER}` }}>
          <button className="md:hidden p-1 border-0 bg-transparent cursor-pointer flex-shrink-0" style={{ color: TEXT }} onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          {title ? (
            <h1 className="text-lg font-bold" style={{ color: TEXT }}>{title}</h1>
          ) : (
            <div className="flex-1 relative min-w-0">
              {!hideSearch && (
                <>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUBTLE} strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input placeholder={txt.searchPlaceholder} className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
                    style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: AL }}>
            {(['en', 'id'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                style={{ background: lang === l ? A : 'transparent', color: lang === l ? 'white' : MUTED }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: A }}>{currentUser?.name?.charAt(0) || 'T'}</div>
            <span className="hidden md:inline text-sm font-medium" style={{ color: TEXT }}>{currentUser?.name || 'Tourist'}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">

          {/* CENTER CONTENT */}
          <div className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-4">
            {children}
          </div>

          {/* RIGHT PANEL */}
          {!hideRightPanel && rightPanel && (
            <div className="hidden md:block flex-shrink-0 overflow-y-auto pb-4" style={{ borderLeft: `1px solid ${BORDER}`, width: 272 }}>
              {rightPanel}
            </div>
          )}
        </div>
      </div>

      <TouristBottomNav />
    </div>
  )
}
