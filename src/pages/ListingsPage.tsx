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

const CATEGORIES = ['Diving', 'Cultural', 'Nature', 'Waterfall', 'Village', 'Beach', 'Temple', 'Other']

const t: Record<Lang, any> = {
  en: {
    overview: 'Overview',
    localGuides: 'Local Guides',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    search: 'Search listings…',
    listings: 'Listings',
    listingsSub: 'Manage destinations, prices, categories and visibility',
    addListing: 'Add Listing',
    filters: 'Filters',
    all: 'All',
    total: 'Total Listings',
    categories: 'Categories',
    avgRating: 'Avg Rating',
    name: 'Name',
    city: 'City',
    category: 'Category',
    price: 'Price',
    rating: 'Rating',
    description: 'Description',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    deleteTitle: 'Delete Listing',
    deleteConfirm: 'Are you sure you want to delete this listing? This action cannot be undone.',
    noListings: 'No listings found',
    rows: 'Showing listings',
    editListing: 'Edit Listing',
    addListingTitle: 'Add New Listing',
    listingName: 'Listing Name',
    cityName: 'City',
    selectCategory: 'Category',
    imageUrl: 'Image URL',
    priceValue: 'Price (Rp)',
    ratingValue: 'Rating',
    shortDescription: 'Description',
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
    search: 'Cari daftar…',
    listings: 'Daftar',
    listingsSub: 'Kelola destinasi, harga, kategori, dan visibilitas',
    addListing: 'Tambah Daftar',
    filters: 'Filter',
    all: 'Semua',
    total: 'Total Daftar',
    categories: 'Kategori',
    avgRating: 'Rating Rata-rata',
    name: 'Nama',
    city: 'Kota',
    category: 'Kategori',
    price: 'Harga',
    rating: 'Rating',
    description: 'Deskripsi',
    actions: 'Aksi',
    edit: 'Edit',
    delete: 'Hapus',
    save: 'Simpan',
    cancel: 'Batal',
    deleteTitle: 'Hapus Daftar',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus daftar ini? Tindakan ini tidak dapat dibatalkan.',
    noListings: 'Tidak ada daftar ditemukan',
    rows: 'Menampilkan daftar',
    editListing: 'Edit Daftar',
    addListingTitle: 'Tambah Daftar Baru',
    listingName: 'Nama Daftar',
    cityName: 'Kota',
    selectCategory: 'Kategori',
    imageUrl: 'URL Gambar',
    priceValue: 'Harga (Rp)',
    ratingValue: 'Rating',
    shortDescription: 'Deskripsi',
    create: 'Buat',
    close: 'Tutup',
    error: 'Terjadi kesalahan',
  },
}

type Listing = {
  id: number
  name: string
  city: string
  category: string
  description: string
  image_url: string
  rating: number
  price: number
}

export default function ListingsPage() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modal, setModal] = useState<'edit' | 'add' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Listing | null>(null)
  const [form, setForm] = useState({ name: '', city: '', category: CATEGORIES[0], description: '', image_url: '', price: '', rating: '4.5' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login')
      return
    }
    loadListings()
  }, [navigate])

  const loadListings = async () => {
    setLoading(true)
    try {
      const res = await api.getDestinations()
      setListings(res.destinations || [])
    } catch {
      setError(txt.error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return listings.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(s) || l.city.toLowerCase().includes(s)
      const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [listings, search, categoryFilter])

  const stats = useMemo(() => {
    const total = listings.length
    const categories = new Set(listings.map(l => l.category)).size
    const avg = listings.length ? (listings.reduce((a, l) => a + Number(l.rating), 0) / listings.length).toFixed(1) : '0.0'
    return { total, categories, avg }
  }, [listings])

  const openEdit = (l: Listing) => {
    setSelected(l)
    setForm({
      name: l.name,
      city: l.city,
      category: l.category,
      description: l.description || '',
      image_url: l.image_url || '',
      price: String(l.price || 0),
      rating: String(l.rating || 0),
    })
    setModal('edit')
    setError('')
  }

  const openAdd = () => {
    setSelected(null)
    setForm({ name: '', city: '', category: CATEGORIES[0], description: '', image_url: '', price: '', rating: '4.5' })
    setModal('add')
    setError('')
  }

  const openDelete = (l: Listing) => {
    setSelected(l)
    setModal('delete')
    setError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        city: form.city,
        category: form.category,
        description: form.description,
        image_url: form.image_url,
        price: Number(form.price) || 0,
        rating: Number(form.rating) || 0,
      }
      if (modal === 'edit' && selected) {
        await api.updateDestination(selected.id, payload)
      } else {
        await api.createDestination(payload)
      }
      await loadListings()
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
      await api.deleteDestination(selected.id)
      await loadListings()
      setModal(null)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setSaving(false)
    }
  }

  const categoryBadge = (cat: string) => {
    const colors: Record<string, any> = {
      Diving: { bg: '#dbeafe', color: '#1d4ed8' },
      Cultural: { bg: '#fef3c7', color: '#b45309' },
      Nature: { bg: '#dcfce7', color: '#15803d' },
      Waterfall: { bg: '#e0f2fe', color: '#0284c7' },
      Village: { bg: '#f3e8ff', color: '#7c3aed' },
      Beach: { bg: '#ffedd5', color: '#c2410c' },
      Temple: { bg: '#fce7f3', color: '#be185d' },
    }
    const c = colors[cat] || { bg: '#f3f4f6', color: MUTED }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.color }}>
        {cat}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.listings}</h1>
              <p className="text-sm" style={{ color: MUTED }}>{txt.listingsSub}</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90"
              style={{ background: A, boxShadow: `0 4px 16px ${A}44` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {txt.addListing}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: txt.total, value: stats.total, color: A, bg: AL },
              { label: txt.categories, value: stats.categories, color: '#16a34a', bg: '#f0fdf4' },
              { label: txt.avgRating, value: stats.avg, color: '#f97316', bg: '#fff7ed' },
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
            <button onClick={() => setCategoryFilter('all')} className="px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer transition-all" style={{ background: categoryFilter === 'all' ? A : '#f3f4f6', color: categoryFilter === 'all' ? 'white' : MUTED }}>
              {txt.all}
            </button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer transition-all"
                style={{ background: categoryFilter === c ? A : '#f3f4f6', color: categoryFilter === c ? 'white' : MUTED }}>
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: MUTED }}>{txt.noListings}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(l => (
                <div key={l.id} className="rounded-2xl overflow-hidden group" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <div className="relative h-44 overflow-hidden">
                    <img src={l.image_url || '/img/Danau Tanralili.jpg'} alt={l.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
                    <div className="absolute top-3 left-3">{categoryBadge(l.category)}</div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <p className="text-white font-bold text-lg leading-tight">{l.name}</p>
                        <p className="text-white/80 text-xs flex items-center gap-1 mt-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                          {l.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-white text-sm font-bold">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        {l.rating}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: MUTED }}>{l.description || '-'}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold" style={{ color: TEXT }}>Rp {Number(l.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(l)} className="flex-1 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-colors hover:opacity-80" style={{ background: AL, color: A }}>{txt.edit}</button>
                      <button onClick={() => openDelete(l)} className="flex-1 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-colors hover:opacity-80" style={{ background: '#fef2f2', color: '#dc2626' }}>{txt.delete}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs mt-4" style={{ color: SUBTLE }}>{txt.rows}: {filtered.length}</p>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: CARD, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black" style={{ color: TEXT }}>
                {modal === 'delete' ? txt.deleteTitle : modal === 'edit' ? txt.editListing : txt.addListingTitle}
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
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.listingName}</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.cityName}</label>
                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.selectCategory}</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.imageUrl}</label>
                  <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.priceValue}</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.ratingValue}</label>
                    <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.shortDescription}</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
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
