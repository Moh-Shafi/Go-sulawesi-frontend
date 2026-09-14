import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import AdminLayout from '../components/AdminLayout'

const A = '#4f46e5'
const AL = '#eef2ff'
const BG = '#f5f6fa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'

const defaultBarData = [22, 38, 28, 45, 31, 50, 42]
const defaultBarLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const t: Record<Lang, any> = {
  en: {
    overview: 'Overview',
    localGuides: 'Local Guides',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    search: 'Search destinations, users, bookings…',
    admin: 'GoSulawesi Admin',
    heroTitle: "Manage Sulawesi's\nHidden Gems",
    viewListings: 'View All Listings',
    pending: 'Pending Businesses',
    totalUsers: 'Total Users',
    activeListings: 'Active Listings',
    needAction: 'Need action',
    allMembers: 'All members',
    liveDestinations: 'Live destinations',
    featured: 'Featured Destinations',
    seeAll: 'See all',
    recentBookings: 'Recent Bookings',
    tableHeaders: ['Tourist', 'Destination', 'Date', 'Amount', 'Status'],
    statistic: 'Statistic',
    greeting: 'Good Morning, Admin',
    greetingSub: 'Keep the platform running smoothly!',
    weekly: 'Weekly Bookings',
    pendingBusinesses: 'Pending Businesses',
    noPending: 'No pending businesses',
    review: 'Review',
    barLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  id: {
    overview: 'Ikhtisar',
    localGuides: 'Pemandu Lokal',
    settings: 'Pengaturan',
    setting: 'Pengaturan',
    logout: 'Keluar',
    search: 'Cari destinasi, pengguna, pemesanan…',
    admin: 'Admin GoSulawesi',
    heroTitle: 'Kelola Permata\nTersembunyi Sulawesi',
    viewListings: 'Lihat Semua Daftar',
    pending: 'Bisnis Tertunda',
    totalUsers: 'Total Pengguna',
    activeListings: 'Daftar Aktif',
    needAction: 'Perlu tindakan',
    allMembers: 'Semua anggota',
    liveDestinations: 'Destinasi aktif',
    featured: 'Destinasi Unggulan',
    seeAll: 'Lihat semua',
    recentBookings: 'Pemesanan Terbaru',
    tableHeaders: ['TURIS', 'DESTINASI', 'TANGGAL', 'JUMLAH', 'STATUS'],
    statistic: 'Statistik',
    greeting: 'Selamat Pagi, Admin',
    greetingSub: 'Jaga platform tetap berjalan lancar!',
    weekly: 'Pemesanan Mingguan',
    pendingBusinesses: 'Bisnis Tertunda',
    noPending: 'Tidak ada bisnis tertunda',
    review: 'Tinjau',
    barLabels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
  },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const currentUser = getStoredUser()
  const [stats, setStats] = useState<any>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const barData = stats?.weekly_bookings || defaultBarData
  const barLabels = stats?.weekly_labels || t[lang].barLabels
  const maxBar = Math.max(...barData)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    Promise.all([
      api.getDashboard(),
      api.getDestinations(),
      api.getBusinesses(),
    ]).then(([dash, dests, biz]) => {
      setStats(dash)
      setRecentUsers(dash.recent_users || [])
      setRecentBookings(dash.recent_bookings || [])
      setDestinations(dests.destinations || [])
      setBusinesses(biz.businesses || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [navigate])

  const rightPanel = (
    <>
      <div className="rounded-2xl p-5 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: TEXT }}>{t[lang].statistic}</p>
          <button className="border-0 bg-transparent cursor-pointer" style={{ color: SUBTLE }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
        </div>
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="#f5f0ff" stroke="#e8e0ff" strokeWidth="1"/>
            <circle cx="50" cy="50" r="36" fill="none" stroke="#e8e0ff" strokeWidth="7" strokeLinecap="round"/>
            <circle cx="50" cy="50" r="36" fill="none" stroke={A} strokeWidth="7"
              strokeDasharray="226" strokeDashoffset="154"
              strokeLinecap="round" transform="rotate(-90 50 50)"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-white"
              style={{ background: `linear-gradient(135deg, ${A}, #7c3aed)` }}>{currentUser?.name?.charAt(0) || 'A'}</div>
          </div>
          <span className="absolute top-1 right-1 text-xs font-bold text-white px-1.5 py-0.5 rounded-full"
            style={{ background: A, fontSize: 10 }}>32%</span>
        </div>
        <p className="text-sm font-bold mb-1" style={{ color: TEXT }}>{t[lang].greeting}</p>
        <p className="text-xs" style={{ color: MUTED }}>{t[lang].greetingSub}</p>
      </div>

      <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
        <p className="text-sm font-bold mb-4" style={{ color: TEXT }}>{t[lang].weekly}</p>
        <div className="relative">
          {[60, 40, 20].map((label) => (
            <div key={label} className="flex items-center gap-2 absolute w-full" style={{ bottom: `${(label / 70) * 88}px` }}>
              <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: SUBTLE, fontSize: 10 }}>{label}</span>
              <div className="flex-1 border-t border-dashed" style={{ borderColor: '#e5e7eb' }} />
            </div>
          ))}
          <div className="flex items-end gap-1 pl-7 pb-5" style={{ height: 96 }}>
            {barData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all"
                  style={{ height: `${(v / 60) * 76}px`, background: i === 5 ? A : AL, minHeight: 8 }} />
              </div>
            ))}
          </div>
          <div className="flex pl-7 gap-1">
            {t[lang].barLabels.map((l: string, i: number) => (
              <div key={i} className="flex-1 text-center" style={{ color: SUBTLE, fontSize: 9 }}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: TEXT }}>{t[lang].pendingBusinesses}</p>
          <button onClick={() => navigate('/admin/businesses?status=pending')} className="w-7 h-7 rounded-full border flex items-center justify-center text-sm border-0 cursor-pointer"
            style={{ border: `1.5px solid ${BORDER}`, color: MUTED, background: 'transparent' }}>+</button>
        </div>
        <div>
          {(businesses || []).filter(b => b.status === 'pending').slice(0, 3).map((g, i, arr) => (
            <div key={i}>
              <div className="flex items-center gap-3 py-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: A }}>{g.business_name?.charAt(0) || 'B'}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#f59e0b', border: '2px solid white' }}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: TEXT }}>{g.business_name}</p>
                  <p className="text-xs" style={{ color: SUBTLE }}>{g.city} · {g.business_type}</p>
                </div>
                <button onClick={() => navigate('/admin/businesses?status=pending')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border-0 cursor-pointer font-medium transition-colors hover:opacity-80"
                  style={{ background: AL, color: A }}>
                  {t[lang].review}
                </button>
              </div>
              {i < arr.length - 1 && <div style={{ borderTop: `1px solid ${BORDER}` }} />}
            </div>
          ))}
          {(!businesses || businesses.filter(b => b.status === 'pending').length === 0) && (
            <p className="text-xs text-center py-4" style={{ color: SUBTLE }}>{t[lang].noPending}</p>
          )}
        </div>
        <button onClick={() => navigate('/admin/businesses')} className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
          style={{ background: AL, color: A }}>
          {t[lang].seeAll}
        </button>
      </div>
    </>
  )

  return (
    <AdminLayout rightPanel={rightPanel}>
      {/* Hero Banner */}
      <div className="rounded-2xl p-7 mb-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)', minHeight: 140 }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <svg width="140" height="140" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{t[lang].admin}</p>
        <h2 className="text-2xl font-bold text-white mb-4" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {t[lang].heroTitle.split('\n').map((line: string, i: number) => (
            <span key={i}>{line}{i === 0 && <br/>}</span>
          ))}
        </h2>
        <button onClick={() => navigate('/admin/listings')} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer"
          style={{ background: 'white', color: A }}>
          {t[lang].viewListings}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: t[lang].pending, value: stats?.pending_businesses ?? 0, sub: t[lang].needAction, color: '#f97316', bg: '#fff7ed' },
          { label: t[lang].totalUsers, value: stats?.total_users ?? 0, sub: t[lang].allMembers, color: A, bg: AL },
          { label: t[lang].activeListings, value: stats?.total_destinations ?? 0, sub: t[lang].liveDestinations, color: '#16a34a', bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.sub}</span>
            </div>
            <p className="text-2xl font-bold mb-0.5" style={{ color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            <p className="text-xs" style={{ color: MUTED }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Featured Listings */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: TEXT }}>{t[lang].featured}</h3>
          <button className="text-xs border-0 bg-transparent cursor-pointer" style={{ color: A }}>{t[lang].seeAll}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(destinations || []).slice(0, 3).map((l, i) => (
            <div key={i} className="rounded-xl overflow-hidden cursor-pointer group" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <div className="relative h-28 overflow-hidden">
                <img src={l.image_url || '/img/Danau Tanralili.jpg'} alt={l.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: A, color: 'white' }}>{l.category}</span>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold mb-1" style={{ color: TEXT }}>{l.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: A, fontSize: 8 }}>{l.city?.charAt(0) || 'S'}</div>
                  <p className="text-xs" style={{ color: MUTED }}>{l.city}</p>
                  <span className="ml-auto text-xs" style={{ color: SUBTLE }}>★ {l.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
        <div className="flex items-center justify-between px-4 md:px-6 py-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <h3 className="text-base font-bold" style={{ color: TEXT }}>{t[lang].recentBookings}</h3>
          <button className="text-sm font-medium border-0 bg-transparent cursor-pointer hover:underline" style={{ color: A }}>{t[lang].seeAll}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr style={{ background: BG }}>
                {t[lang].tableHeaders.map((h: string) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-widest" style={{ color: SUBTLE }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentBookings || []).map((b, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer"
                  style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: A, border: '2px solid #e5e7eb' }}>
                        {b.user_name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-bold" style={{ color: TEXT }}>{b.user_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: MUTED }}>{b.destination_name || b.business_name || '-'}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: MUTED }}>{b.booking_date}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold block" style={{ color: TEXT }}>Rp {Number(b.total_price || 0).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                      style={{
                        background: b.status === 'confirmed' ? '#dcfce7' : b.status === 'completed' ? '#dbeafe' : '#ffedd5',
                        color: b.status === 'confirmed' ? '#15803d' : b.status === 'completed' ? '#1d4ed8' : '#c2410c',
                      }}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
