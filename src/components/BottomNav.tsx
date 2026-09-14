import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../hooks/useLang'

const A = '#4f46e5'
const MUTED = '#9ca3af'
const ACTIVE = '#111827'

const navItems = [
  { id: 'dashboard', to: '/admin', label: { en: 'Home', id: 'Beranda' }, icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? A : 'none'} stroke={active ? 'none' : MUTED} strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>
    </svg>
  )},
  { id: 'users', to: '/admin/users', label: { en: 'Users', id: 'Pengguna' }, icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? A : MUTED} strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { id: 'listings', to: '/admin/listings', label: { en: 'Listings', id: 'Daftar' }, icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? A : MUTED} strokeWidth="1.8">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  )},
  { id: 'bookings', to: '/admin/bookings', label: { en: 'Bookings', id: 'Pesan' }, icon: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? A : MUTED} strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )},
]

export default function BottomNav() {
  const { lang } = useLang()
  const location = useLocation()
  const path = location.pathname

  const isActive = (to: string) => {
    if (to === '/admin') return path === '/admin' || path === '/admin/'
    return path.startsWith(to)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
        @keyframes float-center { 0%,100% { transform: translateY(-2px) } 50% { transform: translateY(-6px) } }
        .animate-float-center { animation: float-center 3s ease-in-out infinite }
      `}</style>

      <div className="relative mx-0 mb-0">
        {/* SVG curved background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 72" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0 -4px 20px rgba(0,0,0,0.08))' }}>
          <path d="M0,24 C0,10.745 10.745,0 24,0 L136,0 C144,0 150,4 156,14 C164,28 176,36 180,36 C184,36 196,28 204,14 C210,4 216,0 224,0 L336,0 C349.255,0 360,10.745 360,24 L360,72 L0,72 Z" fill="white" />
        </svg>

        {/* Nav items */}
        <div className="relative flex items-end justify-between px-6 pb-2 pt-3">
          {navItems.slice(0, 2).map(item => {
            const active = isActive(item.to)
            return (
              <Link key={item.id} to={item.to} className="flex flex-col items-center gap-1 py-1 no-underline min-w-[52px]" style={{ color: active ? A : MUTED }}>
                {item.icon(active)}
                <span className="text-[10px] font-medium">{item.label[lang]}</span>
                <span className="w-1 h-1 rounded-full transition-all" style={{ background: active ? A : 'transparent', marginTop: 2 }} />
              </Link>
            )
          })}

          {/* Center FAB */}
          <Link to="/admin/listings" className="flex flex-col items-center no-underline animate-float-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 8px 24px rgba(79,70,229,0.4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
          </Link>

          {navItems.slice(2).map(item => {
            const active = isActive(item.to)
            return (
              <Link key={item.id} to={item.to} className="flex flex-col items-center gap-1 py-1 no-underline min-w-[52px]" style={{ color: active ? A : MUTED }}>
                {item.icon(active)}
                <span className="text-[10px] font-medium">{item.label[lang]}</span>
                <span className="w-1 h-1 rounded-full transition-all" style={{ background: active ? A : 'transparent', marginTop: 2 }} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
