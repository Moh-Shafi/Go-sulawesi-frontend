import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

const STATUSES = ['all', 'pending', 'approved', 'rejected']

type Business = {
  id: number
  business_name: string
  business_type: string
  city: string
  phone?: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  image_url?: string
  owner_name?: string
  owner_email?: string
  created_at?: string
}

const t: Record<Lang, any> = {
  en: {
    pageTitle: 'Local Guides',
    pageSub: 'Manage local guides and businesses from the database',
    search: 'Search guides…',
    filters: 'Filters',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    total: 'Total',
    awaitingReview: 'Awaiting review',
    active: 'Active',
    declined: 'Declined',
    name: 'Guide / Business',
    type: 'Type',
    city: 'City',
    contact: 'Contact',
    status: 'Status',
    submitted: 'Submitted',
    actions: 'Actions',
    approve: 'Approve',
    reject: 'Reject',
    view: 'View',
    noGuides: 'No local guides found',
    rows: 'Showing guides',
    approveSuccess: 'Guide approved',
    rejectSuccess: 'Guide rejected',
    error: 'Something went wrong',
    guideDetails: 'Guide Details',
    owner: 'Owner',
    phone: 'Phone',
    description: 'Description',
    close: 'Close',
    confirmApprove: 'Approve this guide? It will become visible to tourists.',
    confirmReject: 'Reject this guide? It will not be visible to tourists.',
  },
  id: {
    pageTitle: 'Pemandu Lokal',
    pageSub: 'Kelola pemandu lokal dan bisnis dari database',
    search: 'Cari pemandu…',
    filters: 'Filter',
    all: 'Semua',
    pending: 'Tertunda',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    total: 'Total',
    awaitingReview: 'Menunggu tinjauan',
    active: 'Aktif',
    declined: 'Ditolak',
    name: 'Pemandu / Bisnis',
    type: 'Jenis',
    city: 'Kota',
    contact: 'Kontak',
    status: 'Status',
    submitted: 'Dikirim',
    actions: 'Aksi',
    approve: 'Setujui',
    reject: 'Tolak',
    view: 'Lihat',
    noGuides: 'Tidak ada pemandu lokal ditemukan',
    rows: 'Menampilkan pemandu',
    approveSuccess: 'Pemandu disetujui',
    rejectSuccess: 'Pemandu ditolak',
    error: 'Terjadi kesalahan',
    guideDetails: 'Detail Pemandu',
    owner: 'Pemilik',
    phone: 'Telepon',
    description: 'Deskripsi',
    close: 'Tutup',
    confirmApprove: 'Setujui pemandu ini? Akan terlihat oleh wisatawan.',
    confirmReject: 'Tolak pemandu ini? Tidak akan terlihat oleh wisatawan.',
  },
}

export default function AdminLocalGuidesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()

  const [guides, setGuides] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [selected, setSelected] = useState<Business | null>(null)
  const [modal, setModal] = useState<'view' | 'approve' | 'reject' | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    loadGuides()
  }, [navigate])

  useEffect(() => {
    if (statusFilter !== 'all') {
      setSearchParams({ status: statusFilter })
    } else {
      setSearchParams({})
    }
  }, [statusFilter])

  const loadGuides = async () => {
    setLoading(true)
    try {
      const res = await api.getBusinesses()
      setGuides(res.businesses || [])
    } catch {
      setError(txt.error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return guides.filter(g => {
      const matchesSearch =
        (g.business_name || '').toLowerCase().includes(s) ||
        (g.business_type || '').toLowerCase().includes(s) ||
        (g.city || '').toLowerCase().includes(s) ||
        (g.owner_name || '').toLowerCase().includes(s)
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [guides, search, statusFilter])

  const stats = useMemo(() => {
    const total = guides.length
    const pending = guides.filter(g => g.status === 'pending').length
    const approved = guides.filter(g => g.status === 'approved').length
    const rejected = guides.filter(g => g.status === 'rejected').length
    return { total, pending, approved, rejected }
  }, [guides])

  const statusBadge = (status: string) => {
    const colors: Record<string, any> = {
      pending: { bg: '#ffedd5', color: '#c2410c' },
      approved: { bg: '#dcfce7', color: '#15803d' },
      rejected: { bg: '#fee2e2', color: '#b91c1c' },
    }
    const c = colors[status] || { bg: '#f3f4f6', color: MUTED }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: c.bg, color: c.color }}>
        {txt[status] || status}
      </span>
    )
  }

  const openAction = (g: Business, action: 'view' | 'approve' | 'reject') => {
    setSelected(g)
    setModal(action)
    setError('')
  }

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      await api.updateBusiness(selected.id, { status })
      await loadGuides()
      setSuccess(status === 'approved' ? txt.approveSuccess : txt.rejectSuccess)
      setTimeout(() => setSuccess(''), 3000)
      setModal(null)
      setSelected(null)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.pageTitle}</h1>
            <p className="text-sm" style={{ color: MUTED }}>{txt.pageSub}</p>
          </div>
        </div>

        {success && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold" style={{ background: '#dcfce7', color: '#15803d', border: `1px solid #bbf7d0` }}>
            {success}
          </div>
        )}
        {error && !modal && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: `1px solid #fecaca` }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: txt.total, value: stats.total, color: A, bg: AL },
            { label: txt.awaitingReview, value: stats.pending, color: '#f97316', bg: '#fff7ed' },
            { label: txt.active, value: stats.approved, color: '#16a34a', bg: '#f0fdf4' },
            { label: txt.declined, value: stats.rejected, color: '#dc2626', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <p className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SUBTLE} strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={txt.search}
              className="w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
              style={{ background: '#f5f6fa', border: `1px solid ${BORDER}`, color: TEXT }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all capitalize"
                style={{ background: statusFilter === s ? A : '#f3f4f6', color: statusFilter === s ? 'white' : MUTED }}>
                {txt[s] || s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <table className="w-full min-w-[720px]">
            <thead>
              <tr style={{ background: BG }}>
                {[txt.name, txt.type, txt.city, txt.contact, txt.status, txt.submitted, txt.actions].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-widest" style={{ color: SUBTLE }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm" style={{ color: MUTED }}>{txt.noGuides}</td></tr>
              ) : filtered.map(g => (
                <tr key={g.id} className="hover:bg-slate-50 transition-colors" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden" style={{ background: A }}>
                        {g.image_url ? <img src={g.image_url} alt="" className="w-full h-full object-cover" /> : g.business_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: TEXT }}>{g.business_name || '-'}</p>
                        {g.owner_name && <p className="text-xs" style={{ color: SUBTLE }}>{g.owner_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{g.business_type || '-'}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{g.city || '-'}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{g.phone || '-'}</td>
                  <td className="px-5 py-4">{statusBadge(g.status)}</td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: MUTED }}>
                    {g.created_at ? new Date(g.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB') : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openAction(g, 'view')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                        style={{ background: AL, color: A }}>{txt.view}</button>
                      {g.status === 'pending' && (
                        <>
                          <button onClick={() => openAction(g, 'approve')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                            style={{ background: '#dcfce7', color: '#15803d' }}>{txt.approve}</button>
                          <button onClick={() => openAction(g, 'reject')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                            style={{ background: '#fee2e2', color: '#b91c1c' }}>{txt.reject}</button>
                        </>
                      )}
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
      {modal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: CARD, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black" style={{ color: TEXT }}>
                {modal === 'view' ? txt.guideDetails : modal === 'approve' ? txt.approve : txt.reject}
              </h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center hover:bg-gray-100" style={{ color: SUBTLE }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {modal === 'view' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 overflow-hidden" style={{ background: A }}>
                    {selected.image_url ? <img src={selected.image_url} alt="" className="w-full h-full object-cover" /> : selected.business_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: TEXT }}>{selected.business_name}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{selected.business_type} · {selected.city}</p>
                  </div>
                  <div className="ml-auto">{statusBadge(selected.status)}</div>
                </div>
                <div className="rounded-xl p-4 space-y-2" style={{ background: BG }}>
                  <p className="text-xs" style={{ color: SUBTLE }}>{txt.owner}: <span className="font-medium" style={{ color: TEXT }}>{selected.owner_name || '-'}</span></p>
                  <p className="text-xs" style={{ color: SUBTLE }}>{txt.phone}: <span className="font-medium" style={{ color: TEXT }}>{selected.phone || '-'}</span></p>
                  <p className="text-xs" style={{ color: SUBTLE }}>{txt.description}: <span className="font-medium" style={{ color: TEXT }}>{selected.description || '-'}</span></p>
                </div>
                <div className="flex gap-3">
                  {selected.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange('approved')} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90" style={{ background: '#16a34a' }}>{txt.approve}</button>
                      <button onClick={() => handleStatusChange('rejected')} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90" style={{ background: '#dc2626' }}>{txt.reject}</button>
                    </>
                  )}
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer" style={{ background: '#f3f4f6', color: TEXT }}>{txt.close}</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-6" style={{ color: MUTED }}>
                  {modal === 'approve' ? txt.confirmApprove : txt.confirmReject}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer" style={{ background: '#f3f4f6', color: TEXT }}>{txt.close}</button>
                  <button onClick={() => handleStatusChange(modal === 'approve' ? 'approved' : 'rejected')} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: modal === 'approve' ? '#16a34a' : '#dc2626' }}>
                    {saving ? '...' : modal === 'approve' ? txt.approve : txt.reject}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
