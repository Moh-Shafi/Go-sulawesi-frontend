import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, getStoredUser, type CancellationPolicy } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import { toggleSavedId, getSavedIds } from '../lib/saved'
import { formatBusinessHours } from '../components/BusinessHoursEditor'
import ChatWidget from '../components/ChatWidget'

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
    bookingSuccess: 'Booking confirmed! Check your trips.',
    bookingError: 'Failed to book. Please try again.',
    booking: 'Booking...',
    selectDate: 'Select Date',
    confirmBooking: 'Confirm Booking',
    location: 'Location',
    category: 'Category',
    phone: 'Phone',
    description: 'Description',
    businessHours: 'Business Hours',
    owner: 'Owner',
    price: 'Price',
    rating: 'Rating',
    reviews: 'reviews',
    notFound: 'Business not found',
    contactWhatsApp: 'Contact via WhatsApp',
    chat: 'Chat with Business',
    promotions: 'Special Offers',
    off: 'OFF',
    validUntil: 'Valid until',
    noPromotions: 'No active promotions',
    cancellationPolicy: 'Cancellation Policy',
    cancelBefore: 'Cancel {h}+ hours before',
    cancelWithin: 'Cancel within {h} hours',
    refund: 'refund',
    noRefund: 'No refund',
    approvalRequired: 'Approval required',
    autoApproved: 'Auto-approved',
  },
  id: {
    back: 'Kembali',
    bookNow: 'Pesan Sekarang',
    bookingSuccess: 'Pemesanan dikonfirmasi! Periksa perjalanan Anda.',
    bookingError: 'Gagal memesan. Silakan coba lagi.',
    booking: 'Memesan...',
    selectDate: 'Pilih Tanggal',
    confirmBooking: 'Konfirmasi Pemesanan',
    location: 'Lokasi',
    category: 'Kategori',
    phone: 'Telepon',
    description: 'Deskripsi',
    businessHours: 'Jam Operasional',
    owner: 'Pemilik',
    price: 'Harga',
    rating: 'Rating',
    reviews: 'ulasan',
    notFound: 'Bisnis tidak ditemukan',
    contactWhatsApp: 'Hubungi via WhatsApp',
    chat: 'Chat dengan Bisnis',
    promotions: 'Penawaran Spesial',
    off: 'OFF',
    validUntil: 'Berlaku hingga',
    noPromotions: 'Tidak ada promosi aktif',
    cancellationPolicy: 'Kebijakan Pembatalan',
    cancelBefore: 'Batalkan {h}+ jam sebelumnya',
    cancelWithin: 'Batalkan dalam {h} jam',
    refund: 'pengembalian',
    noRefund: 'Tidak ada pengembalian',
    approvalRequired: 'Perlu persetujuan',
    autoApproved: 'Disetujui otomatis',
  },
}

export default function BusinessDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [biz, setBiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<number[]>(getSavedIds())
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [showBooking, setShowBooking] = useState(false)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [promotions, setPromotions] = useState<any[]>([])
  const [cancelPolicy, setCancelPolicy] = useState<CancellationPolicy | null>(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getBusiness(Number(id))
      .then((res: any) => {
        setBiz(res.business || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    api.getPromotions().then((r: any) => {
      const all = r.promotions || []
      setPromotions(all.filter((p: any) => p.business_id === Number(id) && p.status === 'approved'))
    }).catch(() => {})
    api.getCancellationPolicy(Number(id)).then((r: any) => setCancelPolicy(r.policy)).catch(() => {})
  }, [navigate, id])

  const handleSave = () => {
    if (!biz) return
    setSaved(toggleSavedId(biz.id))
  }

  const handleStartChat = async () => {
    if (!biz) return
    try {
      await api.startConversation(biz.id)
      navigate('/tourist/messages')
    } catch {
      navigate('/tourist/messages')
    }
  }

  const handleBooking = async () => {
    if (!biz || booking || booked) return
    setBooking(true)
    setBookingError('')
    try {
      await api.createBooking({
        business_id: biz.id,
        booking_date: bookingDate,
        status: 'confirmed',
        total_price: Number(biz.price || 0),
        notes: `Booking for ${biz.business_name}`,
      })
      setBooked(true)
      setBooking(false)
      setTimeout(() => {
        navigate('/tourist')
      }, 1500)
    } catch (err: any) {
      setBookingError(err.message || txt.bookingError)
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <p className="text-sm" style={{ color: MUTED }}>Loading...</p>
      </div>
    )
  }

  if (!biz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center p-8 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <p className="text-sm font-bold" style={{ color: TEXT }}>{txt.notFound}</p>
          <button onClick={() => navigate('/tourist')} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold border-0 cursor-pointer" style={{ background: A, color: 'white' }}>{txt.back}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto p-6">
        <Link to="/tourist" className="flex items-center gap-2 text-sm font-semibold mb-6 no-underline transition-colors hover:opacity-80" style={{ color: A }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          {txt.back}
        </Link>

        <div className="rounded-2xl overflow-hidden mb-6" style={{ height: 320, boxShadow: shadow }}>
          <img src={biz.image_url || '/img/Desa_Bonto_Manai.jpg'} alt={biz.business_name} className="w-full h-full object-cover" />
        </div>

        <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: A, color: 'white' }}>{biz.business_type?.toUpperCase()}</span>
              <h1 className="text-2xl font-black mt-2" style={{ color: TEXT, letterSpacing: '-0.02em' }}>{biz.business_name}</h1>
              <p className="text-sm mt-1" style={{ color: MUTED }}>{biz.city}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: '#fffbeb', color: '#d97706' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-sm font-bold">{biz.rating || '4.5'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.location}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{biz.city || '-'}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.category}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{biz.business_type || '-'}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.price}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{Number(biz.price || 0) > 0 ? `Rp ${Number(biz.price).toLocaleString('id-ID')}` : '-'}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: AL }}>
              <p className="text-xs" style={{ color: SUBTLE }}>{txt.rating}</p>
              <p className="text-sm font-bold" style={{ color: TEXT }}>{biz.rating || '4.5'} · 0 {txt.reviews}</p>
            </div>
          </div>

          {biz.description && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: SUBTLE }}>{txt.description}</p>
              <p className="text-sm leading-relaxed" style={{ color: TEXT }}>{biz.description}</p>
            </div>
          )}

          {biz.business_hours && (() => {
            const days = formatBusinessHours(biz.business_hours, lang)
            const hasHours = days.some(d => !d.closed)
            if (!hasHours) return null
            return (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: SUBTLE }}>{txt.businessHours}</p>
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                  {days.map((d, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5" style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: i < days.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                      <span className="text-sm font-semibold" style={{ color: TEXT }}>{d.day}</span>
                      {d.closed ? (
                        <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>Closed</span>
                      ) : (
                        <span className="text-sm" style={{ color: MUTED }}>
                          {d.shifts.map(s => `${s.open} - ${s.close}`).join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Cancellation Policy */}
          {cancelPolicy && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: SUBTLE }}>{txt.cancellationPolicy}</p>
              <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: `1px solid ${BORDER}` }}>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[140px] rounded-lg p-3" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      <p className="text-xs font-bold" style={{ color: TEXT }}>
                        {txt.cancelBefore.replace('{h}', String(cancelPolicy.deadline_hours))}
                      </p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: cancelPolicy.refund_before_deadline > 0 ? '#15803d' : '#b91c1c' }}>
                      {cancelPolicy.refund_before_deadline}% {txt.refund}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[140px] rounded-lg p-3" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <p className="text-xs font-bold" style={{ color: TEXT }}>
                        {txt.cancelWithin.replace('{h}', String(cancelPolicy.deadline_hours))}
                      </p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: cancelPolicy.refund_after_deadline > 0 ? '#15803d' : '#b91c1c' }}>
                      {cancelPolicy.refund_after_deadline > 0 ? `${cancelPolicy.refund_after_deadline}% ${txt.refund}` : txt.noRefund}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[140px] rounded-lg p-3" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.24"/></svg>
                      <p className="text-xs font-bold" style={{ color: TEXT }}>{cancelPolicy.requires_approval ? txt.approvalRequired : txt.autoApproved}</p>
                    </div>
                  </div>
                </div>
                {cancelPolicy.notes && (
                  <p className="text-xs mt-3 pt-3" style={{ color: MUTED, borderTop: `1px solid ${BORDER}` }}>{cancelPolicy.notes}</p>
                )}
              </div>
            </div>
          )}

          {promotions.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: SUBTLE }}>{txt.promotions}</p>
              <div className="space-y-3">
                {promotions.map((p, i) => (
                  <div key={i} className="rounded-xl overflow-hidden flex items-center gap-4" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                    {p.image_url && (
                      <div className="flex-shrink-0 w-20 h-20" style={{ background: '#fed7aa' }}>
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: '#ea580c' }}>
                      {p.discount_type === 'percent' ? `${p.discount_value}%` : 'Rp'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: '#c2410c' }}>{p.title}</p>
                      {p.description && <p className="text-xs mt-0.5" style={{ color: '#9a3412' }}>{p.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {p.original_price && (
                          <span className="text-xs line-through" style={{ color: SUBTLE }}>Rp {Number(p.original_price).toLocaleString('id-ID')}</span>
                        )}
                        <span className="text-xs font-semibold" style={{ color: '#c2410c' }}>{txt.validUntil} {p.end_date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {biz.owner_name && (
            <div className="rounded-xl p-3 flex items-center gap-3 mb-6" style={{ background: AL }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: A }}>
                {biz.owner_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: SUBTLE }}>{txt.owner}</p>
                <p className="text-sm font-bold" style={{ color: TEXT }}>{biz.owner_name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
              <Link to="/itinerary" className="flex-1 text-center py-3 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all hover:opacity-90 no-underline"
                style={{ background: booked ? '#22c55e' : A, color: 'white' }}>
                {booked ? '✓ ' + txt.bookingSuccess : txt.bookNow}
              </Link>
              <button onClick={handleSave}
                className="w-12 h-12 rounded-xl flex items-center justify-center border-0 cursor-pointer transition-all"
                style={{ background: saved.includes(biz.id) ? '#f43f5e' : AL }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={saved.includes(biz.id) ? 'white' : 'none'} stroke={saved.includes(biz.id) ? 'white' : '#f43f5e'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

          <a href={`https://wa.me/${(biz.phone || '').replace(/[^0-9]/g, '')}?text=Hello! I'm interested in ${encodeURIComponent(biz.business_name || '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold no-underline"
            style={{ background: '#25d366', color: 'white' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            {txt.contactWhatsApp}
          </a>
        </div>
      </div>

      <ChatWidget businessId={biz.id} businessName={biz.business_name} />
    </div>
  )
}
