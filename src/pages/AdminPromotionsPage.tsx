import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

const A = '#4f46e5'
const AL = '#eef2ff'
const TEXT = '#111827'
const MUTED = '#9ca3af'
const SUBTLE = '#6b7280'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'

const t: Record<Lang, any> = {
  en: {
    pageTitle: 'Promotions',
    pageSub: 'Review and approve local business promotions',
    search: 'Search promotions…',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    business: 'Business',
    title: 'Title',
    discount: 'Discount',
    period: 'Period',
    status: 'Status',
    actions: 'Actions',
    approve: 'Approve',
    reject: 'Reject',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this promotion?',
    approveSuccess: 'Promotion approved',
    rejectSuccess: 'Promotion rejected',
    deleteSuccess: 'Promotion deleted',
    error: 'Something went wrong',
    noPromotions: 'No promotions found',
    off: 'OFF',
    confirmApprove: 'Approve this promotion? It will be visible to tourists.',
    confirmReject: 'Reject this promotion?',
  },
  id: {
    pageTitle: 'Promosi',
    pageSub: 'Tinjau dan setujui promosi bisnis lokal',
    search: 'Cari promosi…',
    all: 'Semua',
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    expired: 'Kedaluwarsa',
    business: 'Bisnis',
    title: 'Judul',
    discount: 'Diskon',
    period: 'Periode',
    status: 'Status',
    actions: 'Aksi',
    approve: 'Setujui',
    reject: 'Tolak',
    delete: 'Hapus',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus promosi ini?',
    approveSuccess: 'Promosi disetujui',
    rejectSuccess: 'Promosi ditolak',
    deleteSuccess: 'Promosi dihapus',
    error: 'Terjadi kesalahan',
    noPromotions: 'Tidak ada promosi ditemukan',
    off: 'OFF',
    confirmApprove: 'Setujui promosi ini? Akan terlihat oleh wisatawan.',
    confirmReject: 'Tolak promosi ini?',
  },
}

interface Promotion {
  id: number
  business_id: number
  title: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  original_price: number | null
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  business_name?: string
  city?: string
}

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'expired']

export default function AdminPromotionsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    loadPromotions()
  }, [navigate])

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const res = await api.getPromotions()
      setPromotions(res.promotions || [])
    } catch {
      setError(txt.error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    const confirmMsg = status === 'approved' ? txt.confirmApprove : txt.confirmReject
    if (!window.confirm(confirmMsg)) return
    try {
      await api.updatePromotion(id, { status })
      await loadPromotions()
      setSuccess(status === 'approved' ? txt.approveSuccess : txt.rejectSuccess)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || txt.error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(txt.deleteConfirm)) return
    try {
      await api.deletePromotion(id)
      await loadPromotions()
      setSuccess(txt.deleteSuccess)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || txt.error)
    }
  }

  const filtered = promotions.filter(p => {
    const s = search.toLowerCase()
    const matchSearch = !s || p.title?.toLowerCase().includes(s) || p.business_name?.toLowerCase().includes(s)
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: '#ffedd5', color: '#c2410c', label: txt.pending },
      approved: { bg: '#dcfce7', color: '#15803d', label: txt.approved },
      rejected: { bg: '#fee2e2', color: '#b91c1c', label: txt.rejected },
      expired: { bg: '#f3f4f6', color: '#6b7280', label: txt.expired },
    }
    const s = styles[status] || styles.pending
    return (
      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>
        {s.label}
      </span>
    )
  }

  const formatDiscount = (p: Promotion) => {
    if (p.discount_type === 'percent') return `${p.discount_value}% ${txt.off}`
    return `Rp ${Number(p.discount_value).toLocaleString('id-ID')} ${txt.off}`
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: TEXT }}>{txt.pageTitle}</h1>
          <p className="text-sm mt-1" style={{ color: SUBTLE }}>{txt.pageSub}</p>
        </div>

        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: '#dcfce7', color: '#15803d' }}>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={txt.search}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT }}
          />
          <div className="flex gap-1.5">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all"
                style={{
                  background: statusFilter === s ? A : CARD,
                  color: statusFilter === s ? 'white' : SUBTLE,
                  border: `1px solid ${statusFilter === s ? A : BORDER}`,
                }}>
                {txt[s] || s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: MUTED }}>{txt.noPromotions}</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {[txt.business, txt.title, txt.discount, txt.period, txt.status, txt.actions].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-widest" style={{ color: SUBTLE }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td className="px-5 py-4 text-sm font-semibold whitespace-nowrap" style={{ color: TEXT }}>
                      {p.business_name || '-'}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: TEXT }}>
                      <p className="font-semibold">{p.title}</p>
                      {p.description && <p className="text-xs mt-0.5" style={{ color: MUTED }}>{p.description}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold whitespace-nowrap" style={{ color: A }}>
                      {formatDiscount(p)}
                    </td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: MUTED }}>
                      {p.start_date} → {p.end_date}
                    </td>
                    <td className="px-5 py-4">{statusBadge(p.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusChange(p.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                              style={{ background: '#dcfce7', color: '#15803d' }}>{txt.approve}</button>
                            <button onClick={() => handleStatusChange(p.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                              style={{ background: '#fee2e2', color: '#b91c1c' }}>{txt.reject}</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(p.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                          style={{ background: '#fee2e2', color: '#b91c1c' }}>{txt.delete}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
