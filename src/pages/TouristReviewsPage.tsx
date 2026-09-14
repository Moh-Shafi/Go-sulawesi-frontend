import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import TouristLayout from '../components/TouristLayout'

const A = '#0d9488'
const AL = '#f0fdfa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
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
    reviewsTitle: 'Reviews',
    loading: 'Loading reviews...',
    noReviews: 'No reviews yet',
    noReviewsDesc: 'Share your experience after visiting a destination.',
    discoverDestinations: 'Discover Destinations',
    writeReview: 'Write a Review',
    for: 'for',
    by: 'By',
  },
  id: {
    explore: 'Jelajahi',
    discover: 'Temukan',
    myTrips: 'Perjalanan Saya',
    savedPlaces: 'Tempat Tersimpan',
    bookings: 'Pemesanan',
    reviews: 'Ulasan',
    following: 'Diikuti',
    reviewsTitle: 'Ulasan',
    loading: 'Memuat ulasan...',
    noReviews: 'Belum ada ulasan',
    noReviewsDesc: 'Bagikan pengalaman Anda setelah mengunjungi destinasi.',
    discoverDestinations: 'Jelajahi Destinasi',
    writeReview: 'Tulis Ulasan',
    for: 'untuk',
    by: 'Oleh',
  },
}

export default function TouristReviewsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getReviews()
      .then((res: any) => {
        setReviews(res.reviews || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [navigate])

  const initial = (name: string) => name?.charAt(0).toUpperCase() || 'R'

  return (
    <TouristLayout title={txt.reviewsTitle}>

      <div className="p-6">
        {loading ? (
          <p className="text-sm" style={{ color: MUTED }}>{txt.loading}</p>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: AL, color: A }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <p className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.noReviews}</p>
            <p className="text-sm mb-4" style={{ color: MUTED }}>{txt.noReviewsDesc}</p>
            <Link to="/tourist" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold no-underline" style={{ background: A, color: 'white' }}>
              {txt.discoverDestinations}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: A }}>
                    {r.business_image || r.destination_image ? (
                      <img src={r.business_image || r.destination_image} alt={r.destination_name || r.business_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      initial(r.user_name || 'R')
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: TEXT }}>{r.user_name || 'Traveler'}</p>
                    <p className="text-xs" style={{ color: SUBTLE }}>{r.destination_name || r.business_name} · {new Date(r.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0" style={{ background: '#fffbeb', color: '#d97706' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span className="text-xs font-bold">{r.rating}</span>
                  </div>
                </div>
                <p className="text-sm" style={{ color: MUTED }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </TouristLayout>
  )
}
