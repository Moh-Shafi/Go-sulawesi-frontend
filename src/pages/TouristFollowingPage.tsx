import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStoredUser } from '../lib/api'
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
    followingTitle: 'Following',
    message: 'Message',
    noFollowing: 'You are not following anyone yet',
    noFollowingDesc: 'Follow guides and hosts to stay updated on their trips.',
    discoverGuides: 'Discover Guides',
  },
  id: {
    explore: 'Jelajahi',
    discover: 'Temukan',
    myTrips: 'Perjalanan Saya',
    savedPlaces: 'Tempat Tersimpan',
    bookings: 'Pemesanan',
    reviews: 'Ulasan',
    following: 'Diikuti',
    followingTitle: 'Diikuti',
    message: 'Pesan',
    noFollowing: 'Anda belum mengikuti siapa pun',
    noFollowingDesc: 'Ikuti pemandu dan tuan rumah untuk mendapatkan pembaruan perjalanan mereka.',
    discoverGuides: 'Temukan Pemandu',
  },
}

const followingGuides = [
  { name: 'Andi Kurniawan', role: 'Nature Guide', avatar: '/img-local/1.jpg', phone: '6281234567891' },
  { name: 'Dewi Rahayu', role: 'Homestay Host', avatar: '/img-local/2.jpg', phone: '6281234567892' },
  { name: 'Budi Santoso', role: 'Culture Host', avatar: '/img-local/3.jpg', phone: '6281234567893' },
]

export default function TouristFollowingPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [navigate])

  return (
    <TouristLayout title={txt.followingTitle}>

      <div className="p-6">
        {followingGuides.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: AL, color: A }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.noFollowing}</p>
            <p className="text-sm mb-4" style={{ color: MUTED }}>{txt.noFollowingDesc}</p>
            <Link to="/tourist" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold no-underline" style={{ background: A, color: 'white' }}>
              {txt.discoverGuides}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {followingGuides.map((g, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <img src={g.avatar} alt="" className="w-14 h-14 rounded-full object-cover object-top flex-shrink-0" style={{ border: '2px solid #e5e7eb' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold truncate" style={{ color: TEXT }}>{g.name}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{g.role}</p>
                </div>
                <a href={`https://wa.me/${g.phone}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold px-4 py-2 rounded-xl no-underline flex items-center gap-1 flex-shrink-0"
                  style={{ background: AL, color: A }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  {txt.message}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

    </TouristLayout>
  )
}
