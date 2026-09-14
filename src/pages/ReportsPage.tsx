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
const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const t: Record<Lang, any> = {
  en: {
    overview: 'Overview',
    localGuides: 'Local Guides',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    reports: 'Reports',
    reportsSub: 'Platform analytics, bookings trends and user insights',
    totalRevenue: 'Total Revenue',
    totalBookings: 'Total Bookings',
    newUsers: 'New Users',
    activeListings: 'Active Listings',
    bookingsTrend: 'Bookings Trend',
    revenueTrend: 'Revenue Trend',
    byCategory: 'By Category',
    byStatus: 'By Status',
    recentActivity: 'Recent Activity',
    topDestinations: 'Top Destinations',
    topBusinesses: 'Top Businesses',
    noData: 'No data available',
    bookings: 'Bookings',
    revenue: 'Revenue',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
  },
  id: {
    overview: 'Ikhtisar',
    localGuides: 'Pemandu Lokal',
    settings: 'Pengaturan',
    setting: 'Pengaturan',
    logout: 'Keluar',
    reports: 'Laporan',
    reportsSub: 'Analitik platform, tren pemesanan, dan wawasan pengguna',
    totalRevenue: 'Total Pendapatan',
    totalBookings: 'Total Pemesanan',
    newUsers: 'Pengguna Baru',
    activeListings: 'Daftar Aktif',
    bookingsTrend: 'Tren Pemesanan',
    revenueTrend: 'Tren Pendapatan',
    byCategory: 'Berdasarkan Kategori',
    byStatus: 'Berdasarkan Status',
    recentActivity: 'Aktivitas Terbaru',
    topDestinations: 'Destinasi Teratas',
    topBusinesses: 'Bisnis Teratas',
    noData: 'Tidak ada data',
    bookings: 'Pemesanan',
    revenue: 'Pendapatan',
    today: 'Hari Ini',
    thisWeek: 'Minggu Ini',
    thisMonth: 'Bulan Ini',
    thisYear: 'Tahun Ini',
  },
}

type Booking = { id: number; total_price: number; status: string; booking_date: string; created_at: string; user_name?: string; destination_name?: string; business_name?: string }
type Destination = { id: number; name: string; city: string; category: string; rating: number; price: number; bookings_count?: number }
type Business = { id: number; business_name: string; business_type: string; city: string; rating: number; bookings_count?: number }
type User = { id: number; name: string; role: string; created_at: string }

export default function ReportsPage() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'year'>('month')

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login')
      return
    }
    loadData()
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [b, d, biz, u] = await Promise.all([
        api.getBookings(),
        api.getDestinations(),
        api.getBusinesses(),
        api.getUsers(),
      ])
      setBookings(b.bookings || [])
      setDestinations(d.destinations || [])
      setBusinesses(biz.businesses || [])
      setUsers(u.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.created_at || b.booking_date)
    const now = new Date()
    if (range === 'today') return d.toDateString() === now.toDateString()
    if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return d >= weekAgo
    }
    if (range === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return d.getFullYear() === now.getFullYear()
  })

  const totalRevenue = filteredBookings.reduce((a, b) => a + Number(b.total_price || 0), 0)
  const totalBookings = filteredBookings.length
  const newUsers = users.filter(u => {
    const d = new Date(u.created_at)
    const now = new Date()
    if (range === 'today') return d.toDateString() === now.toDateString()
    if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return d >= weekAgo
    }
    if (range === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return d.getFullYear() === now.getFullYear()
  }).length

  const statusCounts = filteredBookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryCounts = filteredBookings.reduce((acc, b) => {
    const cat = b.destination_name ? 'Destination' : b.business_name ? 'Business' : 'Other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recentBookings = [...bookings].sort((a, b) => new Date(b.created_at || b.booking_date).getTime() - new Date(a.created_at || a.booking_date).getTime()).slice(0, 5)
  const topDestinations = [...destinations].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5)
  const topBusinesses = [...businesses].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5)

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f97316',
      confirmed: '#3b82f6',
      completed: '#16a34a',
      cancelled: '#ef4444',
    }
    return colors[status] || SUBTLE
  }

  const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: SUBTLE }}>{label}</p>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
    </div>
  )

  const PieChart = ({ data }: { data: Record<string, number> }) => {
    const entries = Object.entries(data)
    const total = entries.reduce((a, [, v]) => a + v, 0) || 1
    let cumulative = 0
    const colors = ['#4f46e5', '#16a34a', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4']
    return (
      <div className="flex items-center gap-6">
        <svg width="120" height="120" viewBox="0 0 32 32" className="-rotate-90">
          {entries.map(([label, value], i) => {
            const dash = (value / total) * 32
            const offset = cumulative
            cumulative += dash
            return (
              <circle key={label} cx="16" cy="16" r="15.9" fill="none" stroke={colors[i % colors.length]} strokeWidth="8"
                strokeDasharray={`${dash} ${32 - dash}`} strokeDashoffset={-offset} />
            )
          })}
        </svg>
        <div className="space-y-2">
          {entries.map(([label, value], i) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ background: colors[i % colors.length] }} />
              <span style={{ color: MUTED }}>{label}</span>
              <span className="font-bold ml-auto" style={{ color: TEXT }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.reports}</h1>
              <p className="text-sm" style={{ color: MUTED }}>{txt.reportsSub}</p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: AL }}>
              {(['today', 'week', 'month', 'year'] as const).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className="px-3 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                  style={{ background: range === r ? 'white' : 'transparent', color: range === r ? A : MUTED, boxShadow: range === r ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {txt[r]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading...</div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label={txt.totalRevenue} value={`Rp ${totalRevenue.toLocaleString('id-ID')}`} color={A} />
                <StatCard label={txt.totalBookings} value={String(totalBookings)} color="#16a34a" />
                <StatCard label={txt.newUsers} value={String(newUsers)} color="#f97316" />
                <StatCard label={txt.activeListings} value={String(destinations.length)} color="#8b5cf6" />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: TEXT }}>{txt.byStatus}</h3>
                  {Object.keys(statusCounts).length === 0 ? <p className="text-sm" style={{ color: MUTED }}>{txt.noData}</p> : <PieChart data={statusCounts} />}
                </div>
                <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: TEXT }}>{txt.byCategory}</h3>
                  {Object.keys(categoryCounts).length === 0 ? <p className="text-sm" style={{ color: MUTED }}>{txt.noData}</p> : <PieChart data={categoryCounts} />}
                </div>
              </div>

              {/* Lists row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Recent activity */}
                <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: TEXT }}>{txt.recentActivity}</h3>
                  <div className="space-y-3">
                    {recentBookings.length === 0 ? <p className="text-sm" style={{ color: MUTED }}>{txt.noData}</p> : recentBookings.map(b => (
                      <div key={b.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor(b.status)}22` }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={statusColor(b.status)} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: TEXT }}>{b.user_name || 'Unknown'}</p>
                          <p className="text-xs truncate" style={{ color: MUTED }}>{b.destination_name || b.business_name || 'Booking'}</p>
                        </div>
                        <span className="text-xs font-bold" style={{ color: TEXT }}>Rp {Number(b.total_price || 0).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top destinations */}
                <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: TEXT }}>{txt.topDestinations}</h3>
                  <div className="space-y-3">
                    {topDestinations.length === 0 ? <p className="text-sm" style={{ color: MUTED }}>{txt.noData}</p> : topDestinations.map((d, i) => (
                      <div key={d.id} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: A }}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: TEXT }}>{d.name}</p>
                          <p className="text-xs truncate" style={{ color: MUTED }}>{d.city}</p>
                        </div>
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#f59e0b' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          {d.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top businesses */}
                <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: TEXT }}>{txt.topBusinesses}</h3>
                  <div className="space-y-3">
                    {topBusinesses.length === 0 ? <p className="text-sm" style={{ color: MUTED }}>{txt.noData}</p> : topBusinesses.map((b, i) => (
                      <div key={b.id} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#16a34a' }}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: TEXT }}>{b.business_name}</p>
                          <p className="text-xs truncate" style={{ color: MUTED }}>{b.business_type}</p>
                        </div>
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#f59e0b' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          {b.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </AdminLayout>
  )
}
