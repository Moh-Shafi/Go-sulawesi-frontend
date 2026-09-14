import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

const A = '#f97316'
const AL = '#fff7ed'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const BG = '#f5f6fa'
const CARD = '#ffffff'

const t: Record<Lang, any> = {
  en: {
    back: 'Back',
    brand: 'GoSulawesi',
    itineraryBuilder: 'Itinerary Builder',
    tripLength: 'Trip length:',
    days: 'Days',
    share: 'Share',
    copied: 'Copied!',
    availableDestinations: 'Available Destinations',
    tapToAdd: 'Tap to add to your itinerary',
    yourJourney: 'Your {n}-Day Sulawesi Journey',
    experiencesPlanned: '{count} experience{plural} planned · Estimated total:',
    noPlans: 'No plans yet',
    addDestination: 'Add destination',
    tripShaping: 'Your trip is shaping up!',
    summary: '{count} destinations across {days} days · Total',
    bookAll: 'Book All',
    booking: 'Booking...',
    booked: 'Booked!',
    addToDay: 'Add to which day?',
    cancel: 'Cancel',
    day: 'Day',
    freeDay: 'Free day',
    myItinerary: 'My Sulawesi Itinerary via GoSulawesi',
    total: 'Total',
  },
  id: {
    back: 'Kembali',
    brand: 'GoSulawesi',
    itineraryBuilder: 'Pembuat Itinerary',
    tripLength: 'Lama perjalanan:',
    days: 'Hari',
    share: 'Bagikan',
    copied: 'Disalin!',
    availableDestinations: 'Destinasi Tersedia',
    tapToAdd: 'Ketuk untuk menambahkan ke itinerary',
    yourJourney: 'Perjalanan {n}-Hari Sulawesi Anda',
    experiencesPlanned: '{count} pengalaman direncanakan · Total estimasi:',
    noPlans: 'Belum ada rencana',
    addDestination: 'Tambah destinasi',
    tripShaping: 'Perjalanan Anda mulai terbentuk!',
    summary: '{count} destinasi selama {days} hari · Total',
    bookAll: 'Pesan Semua',
    booking: 'Memesan...',
    booked: 'Dipesan!',
    addToDay: 'Tambahkan ke hari keberapa?',
    cancel: 'Batal',
    day: 'Hari',
    freeDay: 'Hari bebas',
    myItinerary: 'Itinerary Sulawesi saya via GoSulawesi',
    total: 'Total',
  },
}

const dayLabel = (lang: Lang, n: number) => lang === 'id' ? `Hari ${n}` : `Day ${n}`

const FALLBACK = [
  { id: 1, name: 'Danau Tanralili', category: 'Nature', city: 'Gowa', price: 850000, rating: 4.9, image_url: '/img/Danau Tanralili.jpg' },
  { id: 2, name: 'Mappaccing Ceremony', category: 'Cultural', city: 'Makassar', price: 1200000, rating: 4.8, image_url: '/img/Mappaccing Ceremony.jpg' },
  { id: 3, name: 'Desa Bonto Manai', category: 'Village', city: 'Bantaeng', price: 600000, rating: 4.7, image_url: '/img/Desa_Bonto_Manai.jpg' },
  { id: 4, name: 'Bungung Salapang', category: 'Sacred', city: 'Jeneponto', price: 500000, rating: 4.6, image_url: '/img/Bungung Salapang.webp' },
  { id: 5, name: 'Air Terjun Depa', category: 'Nature', city: 'Maros', price: 750000, rating: 4.7, image_url: '/img/Air Terjun Depa.jpeg' },
  { id: 6, name: "Menre' ri Lontang", category: 'Cultural', city: 'Bulukumba', price: 950000, rating: 4.8, image_url: "/img/Menre' ri Lontang.jpg" },
]

type Dest = { id: number | string; name: string; category: string; city: string; price: number; rating: number; image_url: string }

export default function ItineraryBuilder() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const [allItems, setAllItems] = useState<Dest[]>(FALLBACK)
  const [numDays, setNumDays] = useState(1)
  const [plan, setPlan] = useState<Record<number, Dest[]>>({ 0: [], 1: [], 2: [], 3: [], 4: [] })
  const [selectDest, setSelectDest] = useState<Dest | null>(null)
  const [shared, setShared] = useState(false)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getDestinations(),
      api.getBusinesses(),
    ]).then(([destRes, bizRes]) => {
      const destList = (destRes.destinations || []).map((d: any) => ({
        id: d.id, name: d.name, category: d.category, city: d.city, price: Number(d.price || 0), rating: Number(d.rating || 0), image_url: d.image_url || '',
      }))
      const bizList = (bizRes.businesses || []).filter((b: any) => b.status === 'approved').map((b: any) => ({
        id: `biz-${b.id}`, name: b.business_name, category: b.business_type, city: b.city, price: Number(b.price || 0), rating: Number(b.rating || 0), image_url: b.image_url || '',
      }))
      const combined = [...destList, ...bizList]
      if (combined.length > 0) setAllItems(combined)
    }).catch(() => {})
  }, [])

  const addToDay = (dayIdx: number, dest: Dest) => {
    if (plan[dayIdx]?.find(d => d.id === dest.id)) return
    setPlan(p => ({ ...p, [dayIdx]: [...(p[dayIdx] || []), dest] }))
    setSelectDest(null)
  }

  const removeFromDay = (dayIdx: number, destId: number | string) => {
    setPlan(p => ({ ...p, [dayIdx]: p[dayIdx].filter(d => d.id !== destId) }))
  }

  const totalCost = Object.values(plan).flat().reduce((s, d) => s + Number(d.price || 0), 0)
  const totalPlaces = Object.values(plan).flat().length

  const bookAll = async () => {
    const selected = Object.values(plan).flat()
    if (selected.length === 0 || booking) return
    setBooking(true)
    try {
      const date = new Date().toISOString().split('T')[0]
      await Promise.all(selected.map(dest => {
        const isBusiness = String(dest.id).startsWith('biz-')
        const bizId = isBusiness ? Number(String(dest.id).replace('biz-', '')) : undefined
        return api.createBooking({
          destination_id: isBusiness ? undefined : dest.id,
          business_id: bizId,
          booking_date: date,
          status: 'confirmed',
          total_price: dest.price,
          notes: `Added from itinerary builder`,
        })
      }))
      setBooked(true)
      setTimeout(() => {
        navigate('/tourist')
      }, 1200)
    } catch (e) {
      setBooking(false)
    }
  }

  const shareText = () => {
    const lines = Array.from({ length: numDays }, (_, i) =>
      `${dayLabel(lang, i + 1)}: ${plan[i]?.map(d => d.name).join(', ') || txt.freeDay}`
    ).join('\n')
    return `${txt.myItinerary}\n\n${lines}\n\n${txt.total}: Rp ${totalCost.toLocaleString('id-ID')}`
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: TEXT }}>

      {/* Header */}
      <div className="sticky top-0 z-20" style={{ background: CARD, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/tourist" className="flex items-center gap-2 no-underline" style={{ color: MUTED }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span className="text-sm font-medium" style={{ color: TEXT }}>{txt.itineraryBuilder}</span>
          </div>
          <div className="flex-1" />
          {/* Language toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: AL }}>
            {(['en', 'id'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                style={{ background: lang === l ? A : 'transparent', color: lang === l ? 'white' : MUTED }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(shareText()); setShared(true); setTimeout(() => setShared(false), 2000) }}
            className="px-4 py-2 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
            style={{ background: shared ? '#22c55e' : A, color: 'white' }}>
            {shared ? '✓ ' + txt.copied : '📤 ' + txt.share}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">

        {/* Left: Available Destinations */}
        <div className="flex-shrink-0" style={{ width: 280 }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}`, position: 'sticky', top: 80 }}>
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <p className="text-sm font-black" style={{ color: TEXT }}>{txt.availableDestinations}</p>
              <p className="text-xs mt-0.5" style={{ color: SUBTLE }}>{txt.tapToAdd}</p>
            </div>
            <div className="p-3 space-y-2" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              {allItems.map(item => {
                const alreadyAdded = Object.values(plan).flat().some(d => d.id === item.id)
                return (
                  <button key={item.id}
                    onClick={() => !alreadyAdded && setSelectDest(item)}
                    className="w-full rounded-xl overflow-hidden text-left cursor-pointer transition-all"
                    style={{
                      border: `2px solid ${alreadyAdded ? '#22c55e' : BORDER}`,
                      opacity: alreadyAdded ? 0.6 : 1,
                      outline: 'none',
                      background: 'transparent',
                      padding: 0,
                    }}>
                    <div className="relative h-24">
                      <img src={item.image_url || '/img/Danau Tanralili.jpg'} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)' }} />
                      <div className="absolute top-2 left-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: A, color: 'white', fontSize: 10 }}>
                          {item.category?.toUpperCase()}
                        </span>
                      </div>
                      {alreadyAdded && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-bold leading-tight truncate">{item.name}</p>
                      </div>
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs" style={{ color: MUTED }}>{item.city}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>★ {item.rating || 'New'}</span>
                        {Number(item.price) > 0 && (
                          <span className="text-xs font-bold" style={{ color: A }}>
                            Rp {Number(item.price).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Day Planner */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black" style={{ color: TEXT, letterSpacing: '-0.03em' }}>
                {txt.yourJourney.replace('{n}', String(numDays))}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: MUTED }}>
                {txt.experiencesPlanned.replace('{count}', String(totalPlaces)).replace('{plural}', totalPlaces !== 1 ? 's' : '')} <strong style={{ color: A }}>Rp {totalCost.toLocaleString('id-ID')}</strong>
              </p>
            </div>
            {/* Day count selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: MUTED }}>{txt.tripLength}</span>
              <button onClick={() => setNumDays(n => Math.max(1, n - 1))}
                className="w-7 h-7 rounded-lg text-sm font-bold border-0 cursor-pointer transition-all flex items-center justify-center"
                style={{ background: numDays > 1 ? AL : '#f3f4f6', color: numDays > 1 ? A : SUBTLE }}>−</button>
              <span className="text-sm font-bold tabular-nums" style={{ color: TEXT, minWidth: 18, textAlign: 'center' }}>{numDays}</span>
              <button onClick={() => setNumDays(n => Math.min(14, n + 1))}
                className="w-7 h-7 rounded-lg text-sm font-bold border-0 cursor-pointer transition-all flex items-center justify-center"
                style={{ background: numDays < 14 ? AL : '#f3f4f6', color: numDays < 14 ? A : SUBTLE }}>+</button>
              <span className="text-xs" style={{ color: MUTED }}>{txt.days}</span>
            </div>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: numDays <= 3 ? `repeat(${numDays}, 1fr)` : 'repeat(3, 1fr)' }}>
            {Array.from({ length: numDays }, (_, idx) => {
              const day = dayLabel(lang, idx + 1)
              return (
              <div key={idx} className="rounded-2xl flex flex-col" style={{ background: CARD, border: `2px solid ${BORDER}`, minHeight: 220 }}>
                {/* Day header */}
                <div className="px-4 py-3 flex items-center justify-between rounded-t-2xl"
                  style={{ background: plan[idx]?.length ? AL : '#f9fafb', borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <p className="text-sm font-black" style={{ color: plan[idx]?.length ? A : TEXT }}>{day}</p>
                    <p className="text-xs" style={{ color: SUBTLE }}>
                      {plan[idx]?.length
                        ? `Rp ${plan[idx].reduce((s, d) => s + Number(d.price || 0), 0).toLocaleString('id-ID')}`
                        : txt.noPlans}
                    </p>
                  </div>
                  {plan[idx]?.length > 0 && (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: A }}>{plan[idx].length}</span>
                  )}
                </div>

                {/* Day content */}
                <div className="flex-1 p-3 space-y-2">
                  {plan[idx]?.map(dest => (
                    <div key={dest.id} className="flex items-center gap-2 p-2 rounded-xl"
                      style={{ background: AL, border: `1px solid ${A}22` }}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={dest.image_url || '/img/Danau Tanralili.jpg'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: TEXT }}>{dest.name}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{dest.city}</p>
                      </div>
                      <button onClick={() => removeFromDay(idx, dest.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center border-0 cursor-pointer flex-shrink-0"
                        style={{ background: '#fee2e2', color: '#ef4444', outline: 'none' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  <button onClick={() => setSelectDest({ id: -1 - idx, name: '', category: '', city: '', price: 0, rating: 0, image_url: '' })}
                    className="w-full py-3 rounded-xl border-2 border-dashed text-xs font-semibold cursor-pointer transition-all hover:border-orange-300"
                    style={{ borderColor: BORDER, color: SUBTLE, background: 'transparent', outline: 'none' }}>
                    + {txt.addDestination}
                  </button>
                </div>
              </div>
              )
            })}
          </div>

          {/* Summary bar */}
          {totalPlaces > 0 && (
            <div className="mt-5 p-4 rounded-2xl flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: `2px solid ${A}22` }}>
              <div className="text-3xl">🎉</div>
              <div className="flex-1">
                <p className="text-sm font-black" style={{ color: TEXT }}>{txt.tripShaping}</p>
                <p className="text-xs" style={{ color: MUTED }}>
                  {txt.summary.replace('{count}', String(totalPlaces)).replace('{days}', String(Array.from({ length: numDays }, (_, i) => i).filter(i => plan[i]?.length > 0).length))} Rp {totalCost.toLocaleString('id-ID')}
                </p>
              </div>
              <button onClick={bookAll} disabled={booking || booked || totalPlaces === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
                style={{ background: booked ? '#22c55e' : booking ? '#fbbf24' : A, color: 'white', boxShadow: `0 4px 14px ${A}44`, cursor: booking || booked ? 'default' : 'pointer' }}>
                {booked ? '✓ ' + txt.booked : booking ? txt.booking : txt.bookAll} →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Day selector modal */}
      {selectDest && selectDest.id !== -1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectDest(null)}>
          <div className="rounded-3xl p-6 w-full max-w-sm" style={{ background: CARD }}
            onClick={e => e.stopPropagation()}>
            <p className="text-base font-black mb-1" style={{ color: TEXT }}>{txt.addToDay}</p>
            <p className="text-sm mb-4" style={{ color: MUTED }}>{selectDest.name}</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Array.from({ length: numDays }, (_, idx) => {
                const day = dayLabel(lang, idx + 1)
                const already = plan[idx]?.find(d => d.id === selectDest.id)
                return (
                  <button key={idx} onClick={() => !already && addToDay(idx, selectDest)}
                    disabled={!!already}
                    className="py-3 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
                    style={{
                      background: already ? '#f0fdf4' : AL,
                      color: already ? '#16a34a' : A,
                      cursor: already ? 'default' : 'pointer',
                      outline: 'none',
                    }}>
                    {already ? '✓' : '+'} {day}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setSelectDest(null)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer"
              style={{ background: '#f3f4f6', color: MUTED, outline: 'none' }}>
              {txt.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
