import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import BusinessLayout from '../components/BusinessLayout'

const A = '#ea580c'
const AL = '#fff7ed'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'
const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const t: Record<Lang, any> = {
  en: {
    pageTitle: 'Earnings',
    pageSub: 'Track your revenue and bookings over time',
    totalEarnings: 'Total Earnings',
    thisMonth: 'This Month',
    thisWeek: 'This Week',
    averageOrder: 'Average Order',
    completedBookings: 'Completed Bookings',
    weeklyEarnings: 'Weekly Earnings',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No completed transactions yet',
    tourist: 'Tourist',
    destination: 'Destination',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    completed: 'Completed',
  },
  id: {
    pageTitle: 'Pendapatan',
    pageSub: 'Pantau pendapatan dan pemesanan Anda dari waktu ke waktu',
    totalEarnings: 'Total Pendapatan',
    thisMonth: 'Bulan Ini',
    thisWeek: 'Minggu Ini',
    averageOrder: 'Rata-rata Order',
    completedBookings: 'Pemesanan Selesai',
    weeklyEarnings: 'Pendapatan Mingguan',
    recentTransactions: 'Transaksi Terbaru',
    noTransactions: 'Belum ada transaksi selesai',
    tourist: 'Turis',
    destination: 'Destinasi',
    date: 'Tanggal',
    amount: 'Jumlah',
    status: 'Status',
    completed: 'Selesai',
  },
}

const barLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const barData = [18, 32, 24, 41, 28, 47, 36]

export default function BusinessEarningsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const maxBar = Math.max(...barData)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getBookings().then(r => {
      setBookings(r.bookings || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [navigate])

  const completed = useMemo(() => bookings.filter(b => b.status === 'completed'), [bookings])
  const total = useMemo(() => completed.reduce((s, b) => s + Number(b.total_price || 0), 0), [completed])
  const avg = useMemo(() => completed.length ? total / completed.length : 0, [completed, total])
  const monthTotal = useMemo(() => {
    const now = new Date()
    return completed.filter(b => new Date(b.booking_date).getMonth() === now.getMonth() && new Date(b.booking_date).getFullYear() === now.getFullYear()).reduce((s, b) => s + Number(b.total_price || 0), 0)
  }, [completed])
  const weekTotal = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return completed.filter(b => new Date(b.booking_date) >= weekAgo).reduce((s, b) => s + Number(b.total_price || 0), 0)
  }, [completed])

  return (
    <BusinessLayout>

      <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.pageTitle}</h1>
            <p className="text-sm" style={{ color: MUTED }}>{txt.pageSub}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: txt.totalEarnings, value: `Rp ${(total / 1000000).toFixed(1)}jt`, bg: A, light: AL },
              { label: txt.thisMonth, value: `Rp ${(monthTotal / 1000000).toFixed(1)}jt`, bg: '#0891b2', light: '#ecfeff' },
              { label: txt.thisWeek, value: `Rp ${(weekTotal / 1000000).toFixed(1)}jt`, bg: '#16a34a', light: '#f0fdf4' },
              { label: txt.averageOrder, value: `Rp ${Math.round(avg).toLocaleString('id-ID')}`, bg: '#d97706', light: '#fffbeb' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <p className="text-2xl font-black leading-none mb-1" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{s.value}</p>
                <p className="text-xs font-medium mb-2" style={{ color: MUTED }}>{s.label}</p>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: s.light, color: s.bg }}>↑ {txt.completed}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 mb-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold" style={{ color: TEXT }}>{txt.weeklyEarnings}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: AL, color: A }}>+18%</span>
            </div>
            <p className="text-2xl font-black mb-3" style={{ color: TEXT, letterSpacing: '-0.03em' }}>Rp 19,8jt</p>
            <div className="relative">
              {[40, 24, 8].map((label) => (
                <div key={label} className="flex items-center gap-2 absolute w-full" style={{ bottom: `${(label / 48) * 72}px` }}>
                  <span style={{ color: SUBTLE, fontSize: 9, width: 14, textAlign: 'right', flexShrink: 0 }}>{label}</span>
                  <div className="flex-1 border-t border-dashed" style={{ borderColor: '#f1f5f9' }} />
                </div>
              ))}
              <div className="flex items-end gap-1 pl-5 pb-4" style={{ height: 80 }}>
                {barData.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${(v / maxBar) * 62}px`, background: i === 5 ? A : AL, minHeight: 6 }} />
                ))}
              </div>
              <div className="flex pl-5 gap-1">
                {barLabels.map((l, i) => (
                  <div key={i} className="flex-1 text-center" style={{ color: SUBTLE, fontSize: 9 }}>{l}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden min-w-0" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: BORDER }}>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{txt.recentTransactions}</p>
            </div>
            {loading ? (
              <p className="p-4 text-sm" style={{ color: MUTED }}>Loading...</p>
            ) : completed.length === 0 ? (
              <p className="p-4 text-sm text-center" style={{ color: MUTED }}>{txt.noTransactions}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm text-left">
                  <thead style={{ background: AL }}>
                    <tr>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.tourist}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.destination}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.date}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.amount}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((b, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: A }}>
                              {(b.user_name || 'T').charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[100px] md:max-w-none" style={{ color: TEXT }}>{b.user_name || 'Tourist'}</span>
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3" style={{ color: MUTED }}>
                          <span className="truncate max-w-[100px] md:max-w-none block">{b.destination_name || b.business_name || '-'}</span>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap" style={{ color: MUTED }}>{b.booking_date ? new Date(b.booking_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB') : '-'}</td>
                        <td className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>Rp {Number(b.total_price || 0).toLocaleString('id-ID')}</td>
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ background: '#e0f2fe', color: '#0369a1' }}>{txt.completed}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

    </BusinessLayout>
  )
}
