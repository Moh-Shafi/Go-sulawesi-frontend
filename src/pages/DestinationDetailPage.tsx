import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import { toggleSavedId, getSavedIds } from '../lib/saved'

const A = '#0d9488'
const AL = '#f0fdfa'
const BG = '#f5f6fa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'
const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const t: Record<Lang, any> = {
  en: {
    back: 'Back',
    bookNow: 'Book Now',
    save: 'Save',
    saved: 'Saved',
    location: 'Location',
    category: 'Category',
    rating: 'Rating',
    price: 'Price',
    reviews: 'reviews',
    notFound: 'Destination not found',
    discoverMore: 'Discover More',
  },
  id: {
    back: 'Kembali',
    bookNow: 'Pesan Sekarang',
    save: 'Simpan',
    saved: 'Tersimpan',
    location: 'Lokasi',
    category: 'Kategori',
    rating: 'Rating',
    price: 'Harga',
    reviews: 'ulasan',
    notFound: 'Destinasi tidak ditemukan',
    discoverMore: 'Jelajahi Lainnya',
  },
}

export default function DestinationDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [dest, setDest] = useState<any>(null)
  const [saved, setSaved] = useState<number[]>(getSavedIds())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getDestinations()
      .then((res: any) => {
        const all = res.destinations || []
        const found = all.find((d: any) => String(d.id) === id)
        setDest(found || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [navigate, id])

  const handleSave = () => {
    if (!dest) return
    setSaved(toggleSavedId(dest.id))
  }

  if (loading) return <p className="p-6 text-sm" style={{ color: MUTED }}>Loading...</p>
  if (!dest) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center p-8 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <p className="text-base font-bold mb-2" style={{ color: TEXT }}>{txt.notFound}</p>
          <Link to="/tourist" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold no-underline" style={{ background: A, color: 'white' }}>
            {txt.discoverMore}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="flex items-center justify-between px-6 py-4" style={{ background: CARD, borderBottom: `1px solid ${BORDER}` }}>
        <Link to="/tourist" className="text-sm font-bold no-underline flex items-center gap-1" style={{ color: A }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          {txt.back}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: AL }}>
            {(['en', 'id'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                style={{ background: lang === l ? A : 'transparent', color: lang === l ? 'white' : MUTED }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: A }}>
            {currentUser?.name?.charAt(0).toUpperCase() || 'T'}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-2xl overflow-hidden mb-6" style={{ height: 320, boxShadow: shadow }}>
          <img src={dest.image_url || '/img/Danau Tanralili.jpg'} alt={dest.name}
            className="w-full h-full object-cover" />
        </div>

        <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: A, color: 'white' }}>{dest.category?.toUpperCase()}</span>
              <h1 className="text-2xl font-black mt-2" style={{ color: TEXT, letterSpacing: '-0.02em' }}>{dest.name}</h1>
              <p className="text-sm mt-1" style={{ color: MUTED }}>{dest.city}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: '#fffbeb', color: '#d97706' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-sm font-bold">{dest.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.location}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{dest.city}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.category}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{dest.category}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.price}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>Rp {Number(dest.price || 0).toLocaleString('id-ID')}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.rating}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{dest.rating} · {dest.reviews_count ?? 0} {txt.reviews}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/itinerary" className="flex-1 text-center py-3 rounded-xl text-sm font-bold no-underline" style={{ background: A, color: 'white' }}>
              {txt.bookNow}
            </Link>
            <button onClick={handleSave}
              className="w-12 h-12 rounded-xl flex items-center justify-center border-0 cursor-pointer"
              style={{ background: saved.includes(dest.id) ? '#f43f5e' : AL }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved.includes(dest.id) ? 'white' : 'none'} stroke={saved.includes(dest.id) ? 'white' : A} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
