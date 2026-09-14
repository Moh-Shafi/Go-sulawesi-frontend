import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BusinessLayout from '../components/BusinessLayout'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

const A = '#ea580c'
const AL = '#fff7ed'
const TEXT = '#111827'
const MUTED = '#9ca3af'
const SUBTLE = '#6b7280'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'
const BG = '#f9fafb'

const t: Record<Lang, any> = {
  en: {
    pageTitle: 'Promotions & Deals',
    pageSub: 'Create special offers to attract more tourists',
    newPromo: 'New Promotion',
    title: 'Title',
    description: 'Description',
    discountType: 'Discount Type',
    percent: 'Percentage (%)',
    fixed: 'Fixed Amount (Rp)',
    discountValue: 'Discount Value',
    originalPrice: 'Original Price (Rp, optional)',
    startDate: 'Start Date',
    endDate: 'End Date',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this promotion?',
    uploadImage: 'Upload promotional image',
    uploading: 'Uploading...',
    imageHint: 'JPG, PNG, WebP, GIF - Max 2MB',
    saved: 'Promotion saved successfully',
    error: 'Failed to save promotion',
    deleteError: 'Failed to delete promotion',
    noPromos: 'No promotions yet. Create your first promotion!',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    status: 'Status',
    off: 'OFF',
    discount: 'Discount',
    validUntil: 'Valid until',
  },
  id: {
    pageTitle: 'Promosi & Penawaran',
    pageSub: 'Buat penawaran spesial untuk menarik lebih banyak wisatawan',
    newPromo: 'Promosi Baru',
    title: 'Judul',
    description: 'Deskripsi',
    discountType: 'Jenis Diskon',
    percent: 'Persentase (%)',
    fixed: 'Nominal Tetap (Rp)',
    discountValue: 'Nilai Diskon',
    originalPrice: 'Harga Asli (Rp, opsional)',
    startDate: 'Tanggal Mulai',
    endDate: 'Tanggal Berakhir',
    save: 'Simpan',
    cancel: 'Batal',
    edit: 'Edit',
    delete: 'Hapus',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus promosi ini?',
    uploadImage: 'Unggah gambar promosi',
    uploading: 'Mengunggah...',
    imageHint: 'JPG, PNG, WebP, GIF - Maks 2MB',
    saved: 'Promosi berhasil disimpan',
    error: 'Gagal menyimpan promosi',
    deleteError: 'Gagal menghapus promosi',
    noPromos: 'Belum ada promosi. Buat promosi pertama Anda!',
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    expired: 'Kedaluwarsa',
    status: 'Status',
    off: 'OFF',
    discount: 'Diskon',
    validUntil: 'Berlaku hingga',
  },
}

interface Promotion {
  id: number
  business_id: number
  title: string
  description: string | null
  image_url: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  original_price: number | null
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  business_name?: string
  city?: string
}

export default function BusinessPromotionsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [promoImage, setPromoImage] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    original_price: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  })

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    fetchPromotions()
  }, [navigate])

  const fetchPromotions = () => {
    setLoading(true)
    api.getPromotions().then(r => {
      setPromotions(r.promotions || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      discount_type: 'percent',
      discount_value: '',
      original_price: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    })
    setEditing(null)
    setShowForm(false)
    setPromoImage(null)
    setPendingFile(null)
  }

  const startEdit = (p: Promotion) => {
    setEditing(p)
    setPromoImage(p.image_url || null)
    setForm({
      title: p.title,
      description: p.description || '',
      discount_type: p.discount_type,
      discount_value: String(p.discount_value),
      original_price: p.original_price ? String(p.original_price) : '',
      start_date: p.start_date,
      end_date: p.end_date,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const data: any = {
        title: form.title,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        start_date: form.start_date,
        end_date: form.end_date,
      }
      if (form.original_price) data.original_price = Number(form.original_price)

      if (editing) {
        await api.updatePromotion(editing.id, data)
        setSuccess(txt.saved)
        setTimeout(() => setSuccess(''), 3000)
        fetchPromotions()
        resetForm()
      } else {
        const res = await api.createPromotion(data)
        const newPromo = res.promotion
        if (newPromo?.id && pendingFile) {
          setUploading(true)
          try {
            const imgRes = await api.uploadPromotionImage(newPromo.id, pendingFile)
            newPromo.image_url = imgRes.image_url
          } catch (imgErr: any) {
            setError(txt.saved + ' but image upload failed: ' + (imgErr.message || ''))
          } finally {
            setUploading(false)
          }
        }
        setSuccess(txt.saved)
        setTimeout(() => setSuccess(''), 3000)
        fetchPromotions()
        resetForm()
      }
    } catch (err: any) {
      setError(err.message || txt.error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(txt.deleteConfirm)) return
    try {
      await api.deletePromotion(id)
      fetchPromotions()
    } catch (err: any) {
      setError(err.message || txt.deleteError)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (editing) {
      setUploading(true)
      setError('')
      try {
        const res = await api.uploadPromotionImage(editing.id, file)
        setPromoImage(res.image_url)
        fetchPromotions()
      } catch (err: any) {
        setError(err.message || txt.error)
      } finally {
        setUploading(false)
      }
    } else {
      setPendingFile(file)
      setPromoImage(URL.createObjectURL(file))
    }
  }

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
    if (p.discount_type === 'percent') {
      return `${p.discount_value}% ${txt.off}`
    }
    return `Rp ${Number(p.discount_value).toLocaleString('id-ID')} ${txt.off}`
  }

  return (
    <BusinessLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: TEXT }}>{txt.pageTitle}</h1>
            <p className="text-sm mt-1" style={{ color: SUBTLE }}>{txt.pageSub}</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90"
            style={{ background: A }}>
            + {txt.newPromo}
          </button>
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

        {showForm && (
          <div className="mb-6 rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: TEXT }}>
              {editing ? txt.edit : txt.newPromo}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.title}</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.description}</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
              </div>

              {/* Image upload - works for both new and edit */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.uploadImage}</label>
                {promoImage ? (
                  <div className="relative rounded-xl overflow-hidden mb-2" style={{ height: 160, background: BG }}>
                    <img src={promoImage} alt="promotion" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setPromoImage(null); setPendingFile(null); if (editing) fetchPromotions() }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border-0 cursor-pointer"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all"
                    style={{ height: 120, background: BG, border: `2px dashed ${BORDER}`, color: MUTED }}>
                    {uploading ? (
                      <span className="text-xs font-semibold">{txt.uploading}</span>
                    ) : (
                      <>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span className="text-xs font-semibold">{txt.uploadImage}</span>
                        <span className="text-[10px]">{txt.imageHint}</span>
                      </>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} disabled={uploading}
                      className="hidden" />
                  </label>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.discountType}</label>
                  <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value as 'percent' | 'fixed' })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }}>
                    <option value="percent">{txt.percent}</option>
                    <option value="fixed">{txt.fixed}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.discountValue}</label>
                  <input required type="number" min={form.discount_type === 'percent' ? 1 : 1} max={form.discount_type === 'percent' ? 100 : undefined}
                    value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.originalPrice}</label>
                <input type="number" min={0} value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.startDate}</label>
                  <input required type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{txt.endDate}</label>
                  <input required type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90"
                  style={{ background: A }}>{txt.save}</button>
                <button type="button" onClick={resetForm}
                  className="px-4 py-3 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
                  style={{ background: '#f3f4f6', color: MUTED }}>{txt.cancel}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading...</div>
        ) : promotions.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: MUTED }}>{txt.noPromos}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map(p => (
              <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                {p.image_url && (
                  <div className="w-full" style={{ height: 140, background: BG }}>
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold truncate" style={{ color: TEXT }}>{p.title}</h3>
                      {statusBadge(p.status)}
                    </div>
                    {p.description && <p className="text-sm" style={{ color: SUBTLE }}>{p.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-2 rounded-xl" style={{ background: AL }}>
                    <span className="text-lg font-black" style={{ color: A }}>{formatDiscount(p)}</span>
                  </div>
                  {p.original_price && (
                    <span className="text-sm line-through" style={{ color: MUTED }}>
                      Rp {Number(p.original_price).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: MUTED }}>
                    {p.start_date} → {p.end_date}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90"
                      style={{ background: A }}>{txt.edit}</button>
                    <button onClick={() => handleDelete(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90"
                      style={{ background: '#ef4444' }}>{txt.delete}</button>
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BusinessLayout>
  )
}
