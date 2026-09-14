import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getStoredUser, type CancellationRequest } from '../lib/api'
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
    pageTitle: 'Bookings',
    pageSub: 'Manage bookings from tourists',
    searchPlaceholder: 'Search bookings…',
    loading: 'Loading bookings...',
    noBookings: 'No bookings yet.',
    all: 'All',
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    tourist: 'Tourist',
    destination: 'Destination',
    date: 'Date',
    status: 'Status',
    price: 'Price',
    notes: 'Notes',
    actions: 'Actions',
    markConfirmed: 'Confirm',
    markCompleted: 'Complete',
    markCancelled: 'Cancel',
    updated: 'Booking updated',
    error: 'Failed to update booking',
    cancelRequests: 'Cancellation Requests',
    cancelPending: 'Pending',
    cancelApproved: 'Approved',
    cancelRejected: 'Rejected',
    cancelAuto: 'Auto',
    approve: 'Approve',
    reject: 'Reject',
    refund: 'Refund',
    reason: 'Reason',
    noCancelRequests: 'No cancellation requests',
    handlerNotes: 'Notes (optional)',
    cancelHandled: 'Cancellation request handled',
    cancelHandleError: 'Failed to handle request',
  },
  id: {
    pageTitle: 'Pemesanan',
    pageSub: 'Kelola pemesanan dari turis',
    searchPlaceholder: 'Cari pemesanan…',
    loading: 'Memuat pemesanan...',
    noBookings: 'Belum ada pemesanan.',
    all: 'Semua',
    confirmed: 'Terkonfirmasi',
    pending: 'Tertunda',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    tourist: 'Turis',
    destination: 'Destinasi',
    date: 'Tanggal',
    status: 'Status',
    price: 'Harga',
    notes: 'Catatan',
    actions: 'Aksi',
    markConfirmed: 'Konfirmasi',
    markCompleted: 'Selesai',
    markCancelled: 'Batalkan',
    updated: 'Pemesanan diperbarui',
    error: 'Gagal memperbarui pemesanan',
    cancelRequests: 'Permintaan Pembatalan',
    cancelPending: 'Tertunda',
    cancelApproved: 'Disetujui',
    cancelRejected: 'Ditolak',
    cancelAuto: 'Otomatis',
    approve: 'Setujui',
    reject: 'Tolak',
    refund: 'Pengembalian',
    reason: 'Alasan',
    noCancelRequests: 'Tidak ada permintaan pembatalan',
    handlerNotes: 'Catatan (opsional)',
    cancelHandled: 'Permintaan pembatalan ditangani',
    cancelHandleError: 'Gagal menangani permintaan',
  },
}

const statusColors: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#dcfce7', color: '#15803d' },
  pending: { bg: '#ffedd5', color: '#c2410c' },
  completed: { bg: '#e0f2fe', color: '#0369a1' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
}

export default function BusinessBookingsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [bookings, setBookings] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [cancelReqs, setCancelReqs] = useState<CancellationRequest[]>([])
  const [handleModal, setHandleModal] = useState<CancellationRequest | null>(null)
  const [handlerNotes, setHandlerNotes] = useState('')
  const [handling, setHandling] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    fetchBookings()
    api.getCancellationRequests().then((r: any) => setCancelReqs(r.requests || [])).catch(() => {})
  }, [navigate])

  useEffect(() => {
    let list = bookings
    if (filter !== 'all') {
      list = list.filter(b => b.status === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        (b.user_name || '').toLowerCase().includes(q) ||
        (b.destination_name || '').toLowerCase().includes(q) ||
        (b.notes || '').toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [bookings, filter, search])

  const fetchBookings = () => {
    setLoading(true)
    api.getBookings().then(r => {
      const list = r.bookings || []
      setBookings(list)
      setFiltered(list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.updateBooking(id, { status })
      fetchBookings()
      setSuccess(txt.updated)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || txt.error)
    }
  }

  const statusLabel = (s: string) => {
    return txt[s] || s
  }

  const handleCancelAction = async (action: 'approve' | 'reject') => {
    if (!handleModal) return
    setHandling(true)
    try {
      await api.handleCancellationRequest(handleModal.id, action, handlerNotes)
      const r = await api.getCancellationRequests()
      setCancelReqs((r as any).requests || [])
      fetchBookings()
      setSuccess(txt.cancelHandled)
      setTimeout(() => setSuccess(''), 3000)
      setHandleModal(null)
      setHandlerNotes('')
    } catch (err: any) {
      setError(err.message || txt.cancelHandleError)
    } finally {
      setHandling(false)
    }
  }

  const cancelStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: '#ffedd5', color: '#c2410c', label: txt.cancelPending },
      approved: { bg: '#dcfce7', color: '#15803d', label: txt.cancelApproved },
      rejected: { bg: '#fee2e2', color: '#b91c1c', label: txt.cancelRejected },
      auto: { bg: '#dbeafe', color: '#1d4ed8', label: txt.cancelAuto },
    }
    const s = map[status] || map.pending
    return <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
  }

  return (
    <BusinessLayout>

      <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.pageTitle}</h1>
            <p className="text-sm" style={{ color: MUTED }}>{txt.pageSub}</p>
          </div>

          {success && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold" style={{ background: '#dcfce7', color: '#15803d', border: `1px solid #bbf7d0` }}>
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: `1px solid #fecaca` }}>
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUBTLE} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={txt.searchPlaceholder}
                className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
                style={{ background: '#f5f6fa', border: `1px solid ${BORDER}`, color: TEXT }} />
            </div>
            <div className="flex gap-2">
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all"
                  style={{ background: filter === s ? A : '#f3f4f6', color: filter === s ? 'white' : MUTED }}>
                  {txt[s] || s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: MUTED }}>{txt.loading}</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <p className="text-sm" style={{ color: MUTED }}>{txt.noBookings}</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden min-w-0" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm text-left">
                  <thead style={{ background: AL }}>
                    <tr>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.tourist}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.destination}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.date}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.status}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.price}</th>
                      <th className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>{txt.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => (
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
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                            style={{ background: statusColors[b.status]?.bg || AL, color: statusColors[b.status]?.color || A }}>
                            {statusLabel(b.status)}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 font-bold whitespace-nowrap" style={{ color: TEXT }}>Rp {Number(b.total_price || 0).toLocaleString('id-ID')}</td>
                        <td className="px-2 md:px-4 py-2 md:py-3">
                          <div className="flex gap-1">
                            {b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled' && (
                              <button onClick={() => updateStatus(b.id, 'confirmed')}
                                className="px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold border-0 cursor-pointer transition-all hover:opacity-90"
                                style={{ background: '#dcfce7', color: '#15803d' }}>{txt.markConfirmed}</button>
                            )}
                            {b.status === 'confirmed' && (
                              <button onClick={() => updateStatus(b.id, 'completed')}
                                className="px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold border-0 cursor-pointer transition-all hover:opacity-90"
                                style={{ background: '#e0f2fe', color: '#0369a1' }}>{txt.markCompleted}</button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button onClick={() => updateStatus(b.id, 'cancelled')}
                                className="px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold border-0 cursor-pointer transition-all hover:opacity-90"
                                style={{ background: '#fee2e2', color: '#dc2626' }}>{txt.markCancelled}</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cancellation Requests */}
          {cancelReqs.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-bold mb-3" style={{ color: TEXT }}>{txt.cancelRequests}</h2>
              <div className="space-y-3">
                {cancelReqs.map((cr) => (
                  <div key={cr.id} className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold truncate" style={{ color: TEXT }}>
                            {cr.user_name || cr.destination_name || cr.business_name || 'Booking'}
                          </p>
                          {cancelStatusBadge(cr.status)}
                        </div>
                        <p className="text-xs" style={{ color: MUTED }}>
                          {txt.date}: {cr.booking_date ? new Date(cr.booking_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB') : '-'}
                          {' · '}Rp {Number(cr.total_price || 0).toLocaleString('id-ID')}
                        </p>
                        {cr.refund_percent > 0 && (
                          <p className="text-xs mt-0.5" style={{ color: '#15803d' }}>
                            {txt.refund}: {cr.refund_percent}% = Rp {Number(cr.refund_amount || 0).toLocaleString('id-ID')}
                          </p>
                        )}
                        {cr.reason && (
                          <p className="text-xs mt-1" style={{ color: SUBTLE }}>{txt.reason}: {cr.reason}</p>
                        )}
                      </div>
                      {cr.status === 'pending' && (
                        <button onClick={() => { setHandleModal(cr); setHandlerNotes('') }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border-0 cursor-pointer flex-shrink-0"
                          style={{ background: A, color: 'white' }}>
                          {txt.approve}/{txt.reject}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      {/* Handle cancellation modal */}
      {handleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => { setHandleModal(null); setHandlerNotes('') }}>
          <div className="rounded-2xl p-6 max-w-md w-full mx-4" style={{ background: CARD }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.cancelRequests}</h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              {handleModal.user_name || handleModal.destination_name || handleModal.business_name}
              {' · '}Rp {Number(handleModal.total_price || 0).toLocaleString('id-ID')}
            </p>
            {handleModal.reason && (
              <p className="text-xs mb-3 px-3 py-2 rounded-xl" style={{ background: '#f9fafb', color: MUTED }}>
                {txt.reason}: {handleModal.reason}
              </p>
            )}
            <p className="text-sm mb-3" style={{ color: TEXT }}>
              {txt.refund}: <span className="font-bold">{handleModal.refund_percent}%</span>
              {' = Rp '}<span className="font-bold">{Number(handleModal.refund_amount || 0).toLocaleString('id-ID')}</span>
            </p>
            <label className="text-xs font-semibold" style={{ color: TEXT }}>{txt.handlerNotes}</label>
            <textarea value={handlerNotes} rows={2}
              onChange={e => setHandlerNotes(e.target.value)}
              className="w-full mt-1 rounded-xl px-3 py-2 text-sm outline-none resize-none"
              style={{ border: `1px solid ${BORDER}`, color: TEXT }} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => handleCancelAction('reject')} disabled={handling}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer"
                style={{ background: handling ? '#d1d5db' : '#fee2e2', color: '#b91c1c' }}>
                {txt.reject}
              </button>
              <button onClick={() => handleCancelAction('approve')} disabled={handling}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer"
                style={{ background: handling ? '#d1d5db' : '#15803d', color: 'white' }}>
                {txt.approve}
              </button>
            </div>
          </div>
        </div>
      )}

    </BusinessLayout>
  )
}
