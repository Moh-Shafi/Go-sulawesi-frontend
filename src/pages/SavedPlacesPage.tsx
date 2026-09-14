import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import { getSavedIds, toggleSavedId } from '../lib/saved'
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
    savedPlacesTitle: 'Saved Places',
    loading: 'Loading saved places...',
    noSaved: 'No saved places yet',
    noSavedDesc: 'Discover destinations you love and save them here.',
    discoverDestinations: 'Discover Destinations',
    remove: 'Remove',
    viewDetails: 'View Details',
  },
  id: {
    explore: 'Jelajahi',
    discover: 'Temukan',
    myTrips: 'Perjalanan Saya',
    savedPlaces: 'Tempat Tersimpan',
    bookings: 'Pemesanan',
    reviews: 'Ulasan',
    following: 'Diikuti',
    savedPlacesTitle: 'Tempat Tersimpan',
    loading: 'Memuat tempat tersimpan...',
    noSaved: 'Belum ada tempat tersimpan',
    noSavedDesc: 'Temukan destinasi yang Anda sukai dan simpan di sini.',
    discoverDestinations: 'Jelajahi Destinasi',
    remove: 'Hapus',
    viewDetails: 'Lihat Detail',
  },
}

export default function SavedPlacesPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [saved, setSaved] = useState<number[]>(getSavedIds())
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getDestinations()
      .then((res: any) => {
        const all = res.destinations || []
        const savedSet = new Set(saved)
        setDestinations(all.filter((d: any) => savedSet.has(d.id)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [navigate, saved])

  const handleToggle = (id: number) => {
    const next = toggleSavedId(id)
    setSaved(next)
    const savedSet = new Set(next)
    setDestinations(prev => prev.filter(d => savedSet.has(d.id)))
  }

  return (
    <TouristLayout title={txt.savedPlacesTitle}>

      <div className="p-6">
        {loading ? (
          <p className="text-sm" style={{ color: MUTED }}>{txt.loading}</p>
        ) : destinations.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: AL, color: A }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.noSaved}</p>
            <p className="text-sm mb-4" style={{ color: MUTED }}>{txt.noSavedDesc}</p>
            <Link to="/tourist" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold no-underline" style={{ background: A, color: 'white' }}>
              {txt.discoverDestinations}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d, i) => (
              <div key={i} className="rounded-2xl overflow-hidden cursor-pointer group relative" style={{ height: 200 }}
                onClick={() => navigate(`/destination/${d.id}`)}>
                <img src={d.image_url || '/img/Danau Tanralili.jpg'} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)' }} />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: A, color: 'white' }}>{d.category?.toUpperCase()}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleToggle(d.id) }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer"
                  style={{ background: '#f43f5e' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-base leading-tight mb-1">{d.name}</p>
                  <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{d.city}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#fbbf24' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {d.rating}
                    </span>
                    <span className="text-xs font-bold text-white px-2 py-1 rounded-full" style={{ background: A }}>
                      Rp {Number(d.price || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </TouristLayout>
  )
}
