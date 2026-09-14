import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, getStoredUser, type CancellationRequest } from '../lib/api'
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
    bookingsTitle: 'Bookings',
    loading: 'Loading bookings...',
    noBookings: 'No bookings yet',
    noBookingsDesc: 'Browse destinations and book your next Sulawesi experience.',
    discoverDestinations: 'Discover Destinations',
    date: 'Date',
    status: 'Status',
    price: 'Price',
    guide: 'Guide',
    details: 'Details',
    statusLabels: { confirmed: 'Confirmed', completed: 'Completed', pending: 'Pending', cancelled: 'Cancelled' },
    cancelBooking: 'Request Cancellation',
    cancelReason: 'Reason for cancellation',
    cancelReasonHint: 'E.g. change of plans, weather, emergency...',
    submitCancel: 'Submit Request',
    cancelling: 'Submitting...',
    cancelSuccess: 'Cancellation request submitted',
    cancelError: 'Failed to submit cancellation request',
    cancelPending: 'Cancellation pending',
    cancelApproved: 'Cancellation approved',
    cancelRejected: 'Cancellation rejected',
    cancelAuto: 'Auto-cancelled',
    refundAmount: 'Refund',
    close: 'Close',
  },
  id: {
    explore: 'Jelajahi',
    discover: 'Temukan',
    myTrips: 'Perjalanan Saya',
    savedPlaces: 'Tempat Tersimpan',
    bookings: 'Pemesanan',
    reviews: 'Ulasan',
    following: 'Diikuti',
    bookingsTitle: 'Pemesanan',
    loading: 'Memuat pemesanan...',
    noBookings: 'Belum ada pemesanan',
    noBookingsDesc: 'Jelajahi destinasi dan pesan pengalaman Sulawesi berikutnya.',
    discoverDestinations: 'Jelajahi Destinasi',
    date: 'Tanggal',
    status: 'Status',
    price: 'Harga',
    guide: 'Pemandu',
    details: 'Detail',
    statusLabels: { confirmed: 'Terkonfirmasi', completed: 'Selesai', pending: 'Tertunda', cancelled: 'Dibatalkan' },
    cancelBooking: 'Ajukan Pembatalan',
    cancelReason: 'Alasan pembatalan',
    cancelReasonHint: 'Mis. perubahan rencana, cuaca, darurat...',
    submitCancel: 'Kirim Permintaan',
    cancelling: 'Mengirim...',
    cancelSuccess: 'Permintaan pembatalan dikirim',
    cancelError: 'Gagal mengajukan pembatalan',
    cancelPending: 'Pembatalan tertunda',
    cancelApproved: 'Pembatalan disetujui',
    cancelRejected: 'Pembatalan ditolak',
    cancelAuto: 'Dibatalkan otomatis',
    refundAmount: 'Pengembalian',
    close: 'Tutup',
  },
}

export default function TouristBookingsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelRequests, setCancelRequests] = useState<CancellationRequest[]>([])
  const [cancelModal, setCancelModal] = useState<any | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg, setCancelMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const statusStyle: Record<string, any> = {
    confirmed: { bg: '#dcfce7', color: '#15803d', label: txt.statusLabels.confirmed },
    completed: { bg: '#dbeafe', color: '#1d4ed8', label: txt.statusLabels.completed },
    pending:   { bg: '#ffedd5', color: '#c2410c', label: txt.statusLabels.pending },
    cancelled: { bg: '#fee2e2', color: '#b91c1c', label: txt.statusLabels.cancelled },
  }

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getBookings()
      .then((res: any) => {
        setBookings(res.bookings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
    api.getCancellationRequests().then((r: any) => setCancelRequests(r.requests || [])).catch(() => {})
  }, [navigate])

  const initial = (name: string) => name?.charAt(0).toUpperCase() || 'B'

  const getCancelRequest = (bookingId: number) => cancelRequests.find(r => r.booking_id === bookingId)

  const handleCancel = async () => {
    if (!cancelModal) return
    setCancelling(true)
    setCancelMsg(null)
    try {
      await api.createCancellationRequest(cancelModal.id, cancelReason)
      const r = await api.getCancellationRequests()
      setCancelRequests((r as any).requests || [])
      setCancelMsg({ type: 'ok', text: txt.cancelSuccess })
      setTimeout(() => {
        setCancelModal(null)
        setCancelReason('')
        setCancelMsg(null)
      }, 2000)
    } catch (err: any) {
      setCancelMsg({ type: 'err', text: err.message || txt.cancelError })
    } finally {
      setCancelling(false)
    }
  }

  const cancelStatusInfo = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: '#ffedd5', color: '#c2410c', label: txt.cancelPending },
      approved: { bg: '#dcfce7', color: '#15803d', label: txt.cancelApproved },
      rejected: { bg: '#fee2e2', color: '#b91c1c', label: txt.cancelRejected },
      auto: { bg: '#dbeafe', color: '#1d4ed8', label: txt.cancelAuto },
    }
    return map[status] || map.pending
  }

  return (
    <TouristLayout title={txt.bookingsTitle}>

      <div className="p-6">
        {loading ? (
          <p className="text-sm" style={{ color: MUTED }}>{txt.loading}</p>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: AL, color: A }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.noBookings}</p>
            <p className="text-sm mb-4" style={{ color: MUTED }}>{txt.noBookingsDesc}</p>
            <Link to="/tourist" className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold no-underline" style={{ background: A, color: 'white' }}>
              {txt.discoverDestinations}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b, i) => {
              const status = statusStyle[b.status] || statusStyle.pending
              return (
                <div key={i} className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: A }}>
                      {b.business_image || b.destination_image ? (
                        <img src={b.business_image || b.destination_image} alt={b.destination_name || b.business_name || ''} className="w-full h-full object-cover" />
                      ) : (
                        initial(b.destination_name || b.business_name || 'B')
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-bold truncate" style={{ color: TEXT }}>{b.destination_name || b.business_name || txt.noBookings}</p>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: MUTED }}>
                        {txt.date}: {b.booking_date ? new Date(b.booking_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: SUBTLE }}>
                        {txt.guide}: {b.guide_name || b.user_name || '-'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-base" style={{ color: TEXT }}>Rp {Number(b.total_price || 0).toLocaleString('id-ID')}</p>
                      {b.refund_amount > 0 && (
                        <p className="text-xs font-semibold" style={{ color: '#15803d' }}>
                          {txt.refundAmount}: Rp {Number(b.refund_amount).toLocaleString('id-ID')}
                        </p>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (() => {
                        const cr = getCancelRequest(b.id)
                        if (cr && cr.status === 'pending') {
                          const ci = cancelStatusInfo(cr.status)
                          return (
                            <span className="inline-block mt-2 text-xs px-3 py-1.5 rounded-xl font-bold" style={{ background: ci.bg, color: ci.color }}>
                              {ci.label}
                            </span>
                          )
                        }
                        return (
                          <button onClick={() => { setCancelModal(b); setCancelReason(''); setCancelMsg(null) }}
                            className="inline-block mt-2 text-xs font-bold px-4 py-2 rounded-xl border-0 cursor-pointer"
                            style={{ background: '#fee2e2', color: '#b91c1c' }}>
                            {txt.cancelBooking}
                          </button>
                        )
                      })()}
                      {b.status === 'cancelled' && (() => {
                        const cr = getCancelRequest(b.id)
                        if (cr) {
                          const ci = cancelStatusInfo(cr.status)
                          return (
                            <span className="inline-block mt-2 text-xs px-3 py-1.5 rounded-xl font-bold" style={{ background: ci.bg, color: ci.color }}>
                              {ci.label}
                            </span>
                          )
                        }
                        return null
                      })()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancellation modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => { setCancelModal(null); setCancelReason(''); setCancelMsg(null) }}>
          <div className="rounded-2xl p-6 max-w-md w-full mx-4" style={{ background: CARD }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.cancelBooking}</h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              {cancelModal.destination_name || cancelModal.business_name} · Rp {Number(cancelModal.total_price || 0).toLocaleString('id-ID')}
            </p>
            <label className="text-xs font-semibold" style={{ color: TEXT }}>{txt.cancelReason}</label>
            <textarea value={cancelReason} rows={3}
              onChange={e => setCancelReason(e.target.value)}
              placeholder={txt.cancelReasonHint}
              className="w-full mt-1 rounded-xl px-3 py-2 text-sm outline-none resize-none"
              style={{ border: `1px solid ${BORDER}`, color: TEXT }} />
            {cancelMsg && (
              <p className="mt-3 text-xs px-3 py-2 rounded-xl"
                style={{ background: cancelMsg.type === 'ok' ? '#dcfce7' : '#fee2e2', color: cancelMsg.type === 'ok' ? '#15803d' : '#b91c1c' }}>
                {cancelMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setCancelModal(null); setCancelReason(''); setCancelMsg(null) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer"
                style={{ background: '#f3f4f6', color: MUTED }}>
                {txt.close}
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer"
                style={{ background: cancelling ? '#d1d5db' : '#dc2626', color: 'white' }}>
                {cancelling ? txt.cancelling : txt.submitCancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </TouristLayout>
  )
}
