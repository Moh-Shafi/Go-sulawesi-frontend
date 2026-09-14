import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import AdminLayout from '../components/AdminLayout'

const A = '#4f46e5'
const AL = '#eef2ff'
const BG = '#f5f6fa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'
const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

const t: Record<Lang, any> = {
  en: {
    overview: 'Overview',
    localGuides: 'Local Guides',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    search: 'Search bookings…',
    bookings: 'Bookings',
    bookingsSub: 'Manage reservations, statuses and payments',
    addBooking: 'Add Booking',
    filters: 'Filters',
    all: 'All',
    total: 'Total Bookings',
    revenue: 'Revenue',
    confirmed: 'Confirmed',
    tourist: 'Tourist',
    item: 'Item',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    notes: 'Notes',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    deleteTitle: 'Delete Booking',
    deleteConfirm: 'Are you sure you want to delete this booking? This action cannot be undone.',
    noBookings: 'No bookings found',
    rows: 'Showing bookings',
    editBooking: 'Edit Booking',
    addBookingTitle: 'Add New Booking',
    selectStatus: 'Status',
    totalPrice: 'Total Price (Rp)',
    bookingDate: 'Booking Date',
    bookingNotes: 'Notes',
    create: 'Create',
    close: 'Close',
    error: 'Something went wrong',
  },
  id: {
    overview: 'Ikhtisar',
    localGuides: 'Pemandu Lokal',
    settings: 'Pengaturan',
    setting: 'Pengaturan',
    logout: 'Keluar',
    search: 'Cari pemesanan…',
    bookings: 'Pemesanan',
    bookingsSub: 'Kelola reservasi, status, dan pembayaran',
    addBooking: 'Tambah Pemesanan',
    filters: 'Filter',
    all: 'Semua',
    total: 'Total Pemesanan',
    revenue: 'Pendapatan',
    confirmed: 'Terkonfirmasi',
    tourist: 'Turist',
    item: 'Item',
    date: 'Tanggal',
    amount: 'Jumlah',
    status: 'Status',
    notes: 'Catatan',
    actions: 'Aksi',
    edit: 'Edit',
    delete: 'Hapus',
    save: 'Simpan',
    cancel: 'Batal',
    deleteTitle: 'Hapus Pemesanan',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus pemesanan ini? Tindakan ini tidak dapat dibatalkan.',
    noBookings: 'Tidak ada pemesanan ditemukan',
    rows: 'Menampilkan pemesanan',
    editBooking: 'Edit Pemesanan',
    addBookingTitle: 'Tambah Pemesanan Baru',
    selectStatus: 'Status',
    totalPrice: 'Total Harga (Rp)',
    bookingDate: 'Tanggal Pemesanan',
    bookingNotes: 'Catatan',
    create: 'Buat',
    close: 'Tutup',
    error: 'Terjadi kesalahan',
  },
}

type Booking = {
  id: number
  user_name: string
  destination_name?: string
  business_name?: string
  booking_date: string
  status: string
  total_price: number
  notes?: string
  user_id: number
  destination_id?: number
  business_id?: number
}

export default function BookingsPage() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState<'edit' | 'add' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [form, setForm] = useState({ status: 'pending', total_price: '', booking_date: '', notes: '', destination_id: '', business_id: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login')
      return
    }
    loadBookings()
  }, [navigate])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await api.getBookings()
      setBookings(res.bookings || [])
    } catch {
      setError(txt.error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return bookings.filter(b => {
      const item = b.destination_name || b.business_name || ''
      const matchesSearch = b.user_name?.toLowerCase().includes(s) || item.toLowerCase().includes(s)
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  const stats = useMemo(() => {
    const total = bookings.length
    const revenue = bookings.reduce((a, b) => a + Number(b.total_price || 0), 0)
    const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length
    return { total, revenue, confirmed }
  }, [bookings])

  const openEdit = (b: Booking) => {
    setSelected(b)
    setForm({
      status: b.status,
      total_price: String(b.total_price || 0),
      booking_date: b.booking_date,
      notes: b.notes || '',
      destination_id: b.destination_id ? String(b.destination_id) : '',
      business_id: b.business_id ? String(b.business_id) : '',
    })
    setModal('edit')
    setError('')
  }

  const openAdd = () => {
    setSelected(null)
    setForm({ status: 'pending', total_price: '', booking_date: new Date().toISOString().split('T')[0], notes: '', destination_id: '', business_id: '' })
    setModal('add')
    setError('')
  }

  const openDelete = (b: Booking) => {
    setSelected(b)
    setModal('delete')
    setError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload: any = {
        status: form.status,
        total_price: Number(form.total_price) || 0,
        booking_date: form.booking_date,
        notes: form.notes,
      }
      if (form.destination_id) payload.destination_id = Number(form.destination_id)
      if (form.business_id) payload.business_id = Number(form.business_id)

      if (modal === 'edit' && selected) {
        await api.updateBooking(selected.id, payload)
      } else {
        await api.createBooking(payload)
      }
      await loadBookings()
      setModal(null)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await api.deleteBooking(selected.id)
      await loadBookings()
      setModal(null)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, any> = {
      pending: { bg: '#ffedd5', color: '#c2410c' },
      confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
      completed: { bg: '#dcfce7', color: '#15803d' },
      cancelled: { bg: '#fee2e2', color: '#b91c1c' },
    }
    const c = colors[status] || { bg: '#f3f4f6', color: MUTED }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: c.bg, color: c.color }}>
        {status}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.bookings}</h1>
              <p className="text-sm" style={{ color: MUTED }}>{txt.bookingsSub}</p>
            </div>
            <button onClick={openAdd}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 whitespace-nowrap flex-shrink-0"
              style={{ background: A, boxShadow: `0 4px 16px ${A}44` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="flex-shrink-0"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="whitespace-nowrap">{txt.addBooking}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: txt.total, value: stats.total, color: A, bg: AL },
              { label: txt.revenue, value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, color: '#16a34a', bg: '#f0fdf4' },
              { label: txt.confirmed, value: stats.confirmed, color: '#f97316', bg: '#fff7ed' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <p className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-medium" style={{ color: MUTED }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: SUBTLE }}>{txt.filters}:</span>
            <button onClick={() => setStatusFilter('all')} className="px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer transition-all" style={{ background: statusFilter === 'all' ? A : '#f3f4f6', color: statusFilter === 'all' ? 'white' : MUTED }}>
              {txt.all}
            </button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer transition-all capitalize"
                style={{ background: statusFilter === s ? A : '#f3f4f6', color: statusFilter === s ? 'white' : MUTED }}>
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <table className="w-full min-w-[720px]">
              <thead>
                <tr style={{ background: BG }}>
                  {[txt.tourist, txt.item, txt.date, txt.amount, txt.status, txt.notes, txt.actions].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-widest" style={{ color: SUBTLE }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: MUTED }}>{txt.noBookings}</td></tr>
                ) : filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: A }}>
                          {b.user_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: TEXT }}>{b.user_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{b.destination_name || b.business_name || '-'}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{b.booking_date}</td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: TEXT }}>Rp {Number(b.total_price || 0).toLocaleString('id-ID')}</td>
                    <td className="px-5 py-4">{statusBadge(b.status)}</td>
                    <td className="px-5 py-4 text-sm max-w-xs truncate" style={{ color: MUTED }}>{b.notes || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(b)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80" style={{ background: AL, color: A }}>{txt.edit}</button>
                        <button onClick={() => openDelete(b)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80" style={{ background: '#fef2f2', color: '#dc2626' }}>{txt.delete}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs mt-4" style={{ color: SUBTLE }}>{txt.rows}: {filtered.length}</p>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: CARD, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black" style={{ color: TEXT }}>
                {modal === 'delete' ? txt.deleteTitle : modal === 'edit' ? txt.editBooking : txt.addBookingTitle}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center hover:bg-gray-100" style={{ color: SUBTLE }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {modal === 'delete' ? (
              <div>
                <p className="text-sm mb-6" style={{ color: MUTED }}>{txt.deleteConfirm}</p>
                {error && <p className="text-xs mb-4" style={{ color: '#dc2626' }}>{error}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer" style={{ background: '#f3f4f6', color: TEXT }}>{txt.cancel}</button>
                  <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: '#dc2626' }}>
                    {saving ? '...' : txt.delete}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.selectStatus}</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none capitalize" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.totalPrice}</label>
                    <input type="number" value={form.total_price} onChange={e => setForm({ ...form, total_price: e.target.value })} required
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.bookingDate}</label>
                  <input type="date" value={form.booking_date} onChange={e => setForm({ ...form, booking_date: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>Destination ID</label>
                    <input type="number" value={form.destination_id} onChange={e => setForm({ ...form, destination_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>Business ID</label>
                    <input type="number" value={form.business_id} onChange={e => setForm({ ...form, business_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.bookingNotes}</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
                {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer" style={{ background: '#f3f4f6', color: TEXT }}>{txt.cancel}</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: A }}>
                    {saving ? '...' : modal === 'edit' ? txt.save : txt.create}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
