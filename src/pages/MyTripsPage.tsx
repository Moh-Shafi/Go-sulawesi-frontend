import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import TouristLayout from '../components/TouristLayout'

const A = '#0d9488'
const AL = '#f0fdfa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'
const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const t: Record<Lang, any> = {
  en: {
    explore: 'Explore',
    discover: 'Discover',
    myTrips: 'My Trips',
    savedPlaces: 'Saved Places',
    bookings: 'Bookings',
    reviews: 'Reviews',
    following: 'Following',
    loading: 'Loading trips...',
    noTrips: 'No trips yet',
    noTripsDesc: 'Start exploring and book your first Sulawesi adventure.',
    discoverDestinations: 'Discover Destinations',
    unnamedTrip: 'Unnamed Trip',
    localGuide: 'Local Guide',
    viewDetails: 'View Details',
    statusLabels: { confirmed: 'Confirmed', completed: 'Completed', pending: 'Pending', cancelled: 'Cancelled' },
  },
  id: {
    explore: 'Jelajahi',
    discover: 'Temukan',
    myTrips: 'Perjalanan Saya',
    savedPlaces: 'Tempat Tersimpan',
    bookings: 'Pemesanan',
    reviews: 'Ulasan',
    following: 'Diikuti',
    loading: 'Memuat perjalanan...',
    noTrips: 'Belum ada perjalanan',
    noTripsDesc: 'Mulai jelajahi dan pesan petualangan Sulawesi pertama Anda.',
    discoverDestinations: 'Jelajahi Destinasi',
    unnamedTrip: 'Perjalanan Tanpa Nama',
    localGuide: 'Pemandu Lokal',
    viewDetails: 'Lihat Detail',
    statusLabels: { confirmed: 'Terkonfirmasi', completed: 'Selesai', pending: 'Tertunda', cancelled: 'Dibatalkan' },
  },
}

export default function MyTripsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()

  const statusStyle: Record<string, any> = {
    confirmed: { bg: '#dcfce7', color: '#15803d', label: txt.statusLabels.confirmed },
    completed: { bg: '#dbeafe', color: '#1d4ed8', label: txt.statusLabels.completed },
    pending:   { bg: '#ffedd5', color: '#c2410c', label: txt.statusLabels.pending },
    cancelled: { bg: '#fee2e2', color: '#b91c1c', label: txt.statusLabels.cancelled },
  }
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getBookings()
      .then((res: any) => {
        setTrips(res.bookings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [navigate])

  const initial = (name: string) => name?.charAt(0).toUpperCase() || 'T'

  return (
    <TouristLayout title={txt.myTrips}>

      <div className="p-6">
        {loading ? (
          <p className="text-sm" style={{ color: MUTED }}>{txt.loading}</p>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: AL, color: A }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <p className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.noTrips}</p>
            <p className="text-sm mb-4" style={{ color: MUTED }}>{txt.noTripsDesc}</p>
            <Link to="/tourist" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold no-underline" style={{ background: A, color: 'white' }}>
              {txt.discoverDestinations}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {trips.map((t, i) => {
              const status = statusStyle[t.status] || statusStyle.pending
              return (
                <div key={i} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: A }}>
                    {t.business_image || t.destination_image ? (
                      <img src={t.business_image || t.destination_image} alt={t.destination_name || t.business_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      initial(t.destination_name || t.business_name || txt.unnamedTrip)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-bold truncate" style={{ color: TEXT }}>{t.destination_name || t.business_name || txt.unnamedTrip}</p>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: MUTED }}>
                      {t.booking_date ? new Date(t.booking_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} · {t.guide_name || t.user_name || txt.localGuide}
                    </p>
                    <p className="text-xs font-bold mt-1" style={{ color: A }}>
                      Rp {Number(t.total_price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Link to="/tourist" className="text-xs font-bold px-4 py-2 rounded-xl no-underline flex-shrink-0" style={{ background: AL, color: A }}>
                    {txt.viewDetails}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </TouristLayout>
  )
}
