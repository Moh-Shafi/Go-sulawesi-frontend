import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import BottomNav from './BottomNav'

const A = '#4f46e5'
const AL = '#eef2ff'
const BG = '#f5f6fa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'

const navMain = [
  { id: 'dashboard', label: { en: 'Dashboard', id: 'Dasbor' }, icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'white' : 'none'} stroke={active ? 'none' : 'currentColor'} strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>
    </svg>
  ), path: '/admin' },
  { id: 'users', label: { en: 'Users', id: 'Pengguna' }, icon: (_active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ), path: '/admin/users' },
  { id: 'listings', label: { en: 'Listings', id: 'Daftar' }, icon: (_active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ), path: '/admin/listings' },
  { id: 'businesses', label: { en: 'Businesses', id: 'Bisnis' }, icon: (_active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ), path: '/admin/businesses' },
  { id: 'promotions', label: { en: 'Promotions', id: 'Promosi' }, icon: (_active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ), path: '/admin/promotions' },
  { id: 'bookings', label: { en: 'Bookings', id: 'Pemesanan' }, icon: (_active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ), path: '/admin/bookings' },
  { id: 'reports', label: { en: 'Reports', id: 'Laporan' }, icon: (_active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ), path: '/admin/reports' },
]

const t: Record<Lang, any> = {
  en: {
    overview: 'Overview',
    localGuides: 'Local Guides',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    search: 'Search…',
    admin: 'GoSulawesi Admin',
  },
  id: {
    overview: 'Ikhtisar',
    localGuides: 'Pemandu Lokal',
    settings: 'Pengaturan',
    setting: 'Pengaturan',
    logout: 'Keluar',
    search: 'Cari…',
    admin: 'Admin GoSulawesi',
  },
}

export default function AdminLayout({ children, rightPanel }: { children: React.ReactNode, rightPanel?: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, setLang } = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentUser = getStoredUser()
  const [businesses, setBusinesses] = useState<any[]>([])

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getBusinesses().then(b => setBusinesses(b.businesses || [])).catch(() => {})
  }, [navigate])

  const activeNav = navMain.find(n => location.pathname === n.path || (n.path !== '/admin' && location.pathname.startsWith(n.path)))?.id || 'dashboard'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-56 fixed md:static z-[60]`}
        style={{ background: CARD, borderRight: `1px solid ${BORDER}` }}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-8 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-10 w-auto" />
          </Link>
          <button className="md:hidden p-1 border-0 bg-transparent cursor-pointer" style={{ color: MUTED }} onClick={() => setSidebarOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Overview nav */}
        <div className="px-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 px-1" style={{ color: SUBTLE }}>{t[lang].overview}</p>
          <div className="space-y-1">
            {navMain.map(item => {
              const isActive = activeNav === item.id
              return (
                <Link key={item.id} to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-base text-left no-underline transition-all"
                  style={{ background: isActive ? AL : 'transparent', color: isActive ? A : TEXT, fontWeight: isActive ? 700 : 400 }}>
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                    style={{ background: isActive ? A : 'transparent', color: isActive ? 'white' : MUTED }}>
                    {item.icon(isActive)}
                  </span>
                  {item.label[lang]}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Local Guides */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: SUBTLE }}>{t[lang].localGuides}</p>
            <Link to="/admin/local-guides" className="text-xs font-bold no-underline hover:opacity-80 transition-opacity" style={{ color: A }}>View all</Link>
          </div>
          <div className="space-y-1">
            {(businesses || []).slice(0, 3).map((b, i) => (
              <Link key={i} to="/admin/local-guides" className="flex items-center gap-3 px-2 py-2.5 rounded-xl no-underline hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: A, border: '2px solid #e5e7eb' }}>
                  {b.business_name?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: TEXT }}>{b.business_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: SUBTLE }}>{b.business_type}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        {/* Settings */}
        <div className="px-5 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: SUBTLE }}>{t[lang].settings}</p>
          <Link to="/admin/settings" className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-base text-left no-underline hover:bg-gray-50 transition-colors"
            style={{ color: TEXT, fontWeight: 400 }}>
            <span className="flex items-center justify-center w-8 h-8" style={{ color: MUTED }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
            {t[lang].setting}
          </Link>
          <Link to="/login"
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-base no-underline hover:bg-red-50 transition-colors"
            style={{ color: '#ef4444', fontWeight: 400 }}>
            <span className="flex items-center justify-center w-8 h-8">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {t[lang].logout}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 flex-shrink-0"
          style={{ background: CARD, borderBottom: `1px solid ${BORDER}` }}>
          <button className="md:hidden p-1 border-0 bg-transparent cursor-pointer flex-shrink-0" style={{ color: TEXT }} onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex-1 relative min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUBTLE} strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder={t[lang].search} className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
              style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: AL }}>
            {['en', 'id'].map(l => (
              <button key={l} onClick={() => setLang(l as Lang)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                style={{ background: lang === l ? 'white' : 'transparent', color: lang === l ? A : MUTED, boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer hidden sm:flex"
            style={{ color: MUTED }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer hidden sm:flex"
            style={{ color: MUTED }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: A }}>{currentUser?.name?.charAt(0) || 'A'}</div>
            <span className="hidden md:inline text-sm font-medium" style={{ color: TEXT }}>{currentUser?.name || 'Admin'}</span>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row gap-0 pb-24 md:pb-0">
          <div className="flex-1 p-4 md:p-6 min-w-0">
            {children}
          </div>
          {rightPanel && (
            <div className="w-full md:w-68 flex-shrink-0 p-4 md:p-5 overflow-y-auto space-y-4" style={{ borderLeft: `1px solid ${BORDER}` }}>
              {rightPanel}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
