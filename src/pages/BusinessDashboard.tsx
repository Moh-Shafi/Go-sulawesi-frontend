import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import ChatWidget from '../components/ChatWidget'
import BusinessLayout from '../components/BusinessLayout'
import BusinessHoursEditor, { defaultBusinessHours, compactHours } from '../components/BusinessHoursEditor'

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
    myListings: 'My Listings',
    bookings: 'Bookings',
    earnings: 'Earnings',
    reviews: 'Reviews',
    addNewListing: '+ Add New Listing',
    editListing: 'Edit Listing',
    revenue: 'Revenue',
    thisMonth: 'this month',
    served: 'served',
    businesses: 'Businesses',
    published: 'published',
    fromClients: 'from clients',
    active: 'active',
    pendingReview: 'pending review',
    noListings: 'No listings yet',
    createFirstListing: 'Create your first listing',
    newListing: '+ New Listing',
    recentBookings: 'Recent Bookings',
    confirmed: 'confirmed',
    pending: 'pending',
    viewAll: 'View all →',
    noBookings: 'No bookings yet',
    weeklyEarnings: 'Weekly Earnings',
    total: 'total',
    live: 'live',
    meetTheGuide: 'Meet the Guide',
    yearsExp: 'yrs exp',
    certifications: 'Certifications',
    english: 'English',
    bilingual: 'Bilingual',
    padiCertified: 'PADI Certified',
    contactWhatsApp: 'Contact via WhatsApp',
    noClients: 'No clients yet',
    noReviewsYet: 'No reviews yet',
    createListingTitle: 'Create New Listing',
    editListingTitle: 'Edit Listing',
    notifications: 'Notifications',
    messages: 'Messages',
    noNotifications: 'No notifications',
    noMessages: 'No messages',
    markAllRead: 'Mark all as read',
    recentReviews: 'Recent Reviews',
    seeAllReviews: 'See All Reviews',
    businessName: 'Business Name',
    businessType: 'Business Type',
    city: 'City',
    phone: 'Phone',
    description: 'Description',
    price: 'Price (Rp)',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Listing saved successfully',
    error: 'Failed to save listing',
    uploadImage: 'Upload Business Image',
    imageHint: 'JPG, PNG, WebP or GIF. Max 2MB.',
    uploading: 'Uploading image...',
    imageUploaded: 'Image uploaded successfully',
    imageError: 'Failed to upload image',
  },
  id: {
    myListings: 'Daftar Saya',
    bookings: 'Pemesanan',
    earnings: 'Pendapatan',
    reviews: 'Ulasan',
    addNewListing: '+ Tambah Daftar Baru',
    editListing: 'Edit Daftar',
    revenue: 'Pendapatan',
    thisMonth: 'bulan ini',
    served: 'dilayani',
    businesses: 'Bisnis',
    published: 'dipublikasi',
    fromClients: 'dari klien',
    active: 'aktif',
    pendingReview: 'menunggu review',
    noListings: 'Belum ada daftar',
    createFirstListing: 'Buat daftar pertama Anda',
    newListing: '+ Daftar Baru',
    recentBookings: 'Pemesanan Terbaru',
    confirmed: 'terkonfirmasi',
    pending: 'tertunda',
    viewAll: 'Lihat semua →',
    noBookings: 'Belum ada pemesanan',
    weeklyEarnings: 'Pendapatan Mingguan',
    total: 'total',
    live: 'aktif',
    meetTheGuide: 'Kenali Pemandu',
    yearsExp: 'thn pengalaman',
    certifications: 'Sertifikasi',
    english: 'Bahasa Inggris',
    bilingual: 'Bilingual',
    padiCertified: 'Sertifikasi PADI',
    contactWhatsApp: 'Hubungi via WhatsApp',
    noClients: 'Belum ada klien',
    noReviewsYet: 'Belum ada ulasan',
    createListingTitle: 'Buat Daftar Baru',
    editListingTitle: 'Edit Daftar',
    notifications: 'Notifikasi',
    messages: 'Pesan',
    noNotifications: 'Tidak ada notifikasi',
    noMessages: 'Tidak ada pesan',
    markAllRead: 'Tandai semua sudah dibaca',
    recentReviews: 'Ulasan Terbaru',
    seeAllReviews: 'Lihat Semua Ulasan',
    businessName: 'Nama Bisnis',
    businessType: 'Jenis Bisnis',
    city: 'Kota',
    phone: 'Telepon',
    description: 'Deskripsi',
    price: 'Harga (Rp)',
    cancel: 'Batal',
    save: 'Simpan',
    saving: 'Menyimpan...',
    saved: 'Daftar berhasil disimpan',
    error: 'Gagal menyimpan daftar',
    uploadImage: 'Unggah Gambar Bisnis',
    imageHint: 'JPG, PNG, WebP atau GIF. Maks 2MB.',
    uploading: 'Mengunggah gambar...',
    imageUploaded: 'Gambar berhasil diunggah',
    imageError: 'Gagal mengunggah gambar',
  },
}

const recentTourists = [
  { name: 'Sarah Mitchell', origin: 'New York, USA', avatar: '/avatar/5.jpg' },
  { name: 'Marco Bianchi', origin: 'Milan, Italy', avatar: '/avatar/3.jpg' },
  { name: 'Aiko Tanaka', origin: 'Tokyo, Japan', avatar: '/avatar/4.jpg' },
]

const myListings = [
  { name: 'Danau Tanralili Trek', tag: 'NATURE', loc: 'Gowa', img: '/img/Danau Tanralili.jpg', bookings: 14, status: 'active' },
  { name: 'Mappaccing Ceremony', tag: 'CULTURE', loc: 'Makassar', img: '/img/Mappaccing Ceremony.jpg', bookings: 7, status: 'active' },
  { name: 'Desa Bonto Manai', tag: 'VILLAGE', loc: 'Bantaeng', img: '/img/Desa_Bonto_Manai.jpg', bookings: 3, status: 'pending' },
]

const recentBookings = [
  { tourist: 'Sarah Mitchell', avatar: '/avatar/5.jpg', dest: 'Danau Tanralili Trek', date: 'May 18', amount: 'Rp 1.360.000', status: 'confirmed' },
  { tourist: 'Marco Bianchi', avatar: '/avatar/3.jpg', dest: 'Mappaccing Ceremony', date: 'May 20', amount: 'Rp 1.920.000', status: 'confirmed' },
  { tourist: 'Aiko Tanaka', avatar: '/avatar/4.jpg', dest: 'Desa Bonto Manai', date: 'May 22', amount: 'Rp 960.000', status: 'pending' },
  { tourist: 'Lucas Meyer', avatar: '/avatar/2.jpg', dest: 'Danau Tanralili Trek', date: 'May 24', amount: 'Rp 1.360.000', status: 'pending' },
]

const reviewsList = [
  { name: 'Sarah M.', avatar: '/avatar/5.jpg', rating: 5, text: 'Absolutely magical experience, Andi was the perfect guide!', dest: 'Danau Tanralili' },
  { name: 'Marco B.', avatar: '/avatar/3.jpg', rating: 4, text: 'Incredible culture, very authentic ceremony.', dest: 'Mappaccing Ceremony' },
  { name: 'Aiko T.', avatar: '/avatar/4.jpg', rating: 5, text: 'Hidden gem! Will definitely come back.', dest: 'Desa Bonto Manai' },
]

const barData = [18, 32, 24, 41, 28, 47, 36]
const barLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const descEN = [
  'Professional diving tours and snorkeling adventures in the world-famous Bunaken Marine Park. 15 years of experience, certified PADI instructor.',
  'Authentic traditional ceremonies and cultural nights led by a Bugis noble family. Experience real Makassar heritage.',
  'Village homestay with a warm family in Bantaeng. Local cooking classes, rice field walks, and traditional crafts.',
]
const descID = [
  'Tur menyelam profesional dan snorkeling di Taman Laut Bunaken yang terkenal di dunia. 15 tahun pengalaman, instruktur PADI bersertifikat.',
  'Upacara adat dan malam budaya otentik yang dipimpin oleh keluarga bangsawan Bugis. Rasakan warisan Makassar yang sesungguhnya.',
  'Homestay desa bersama keluarga ramah di Bantaeng. Kelas memasak lokal, jalan-jalan di sawah, dan kerajinan tradisional.',
]

export default function BusinessDashboard() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const txt = t[lang]
  const maxBar = Math.max(...barData)
  const currentUser = getStoredUser()
  const [stats, setStats] = useState<any>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<any>(null)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [form, setForm] = useState({ business_name: '', business_type: '', city: '', phone: '', description: '', price: '', status: 'pending' })
  const [businessHours, setBusinessHours] = useState<any>(defaultBusinessHours())
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [savedBusinessId, setSavedBusinessId] = useState<number | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [msgOpen, setMsgOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New booking from Sarah Mitchell', time: '2 min ago', read: false },
    { id: 2, text: 'Your listing was approved', time: '1 hour ago', read: false },
    { id: 3, text: 'New review from Marco Bianchi', time: '3 hours ago', read: true },
  ])
  const [messages, setMessages] = useState([
    { id: 1, name: 'Sarah Mitchell', text: 'Hi, can we reschedule for tomorrow?', time: '10 min ago', unread: true },
    { id: 2, name: 'Aiko Tanaka', text: 'Thank you for the great experience!', time: '1 hour ago', unread: true },
    { id: 3, name: 'Marco Bianchi', text: 'Is diving available next weekend?', time: '2 hours ago', unread: false },
  ])

  const openCreate = () => {
    setEditingBusiness(null)
    setForm({ business_name: '', business_type: '', city: '', phone: '', description: '', price: '', status: 'pending' })
    setBusinessHours(defaultBusinessHours())
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setSavedBusinessId(null)
    setFormError('')
    setFormSuccess('')
    setShowModal(true)
  }

  const openEdit = () => {
    const b = businesses[0]
    if (!b) return
    setEditingBusiness(b)
    setForm({
      business_name: b.business_name || '',
      business_type: b.business_type || '',
      city: b.city || '',
      phone: b.phone || '',
      description: b.description || '',
      price: b.price != null ? String(b.price) : '',
      status: b.status || 'pending',
    })
    setBusinessHours(b.business_hours || defaultBusinessHours())
    setImageFile(null)
    setImagePreview(b.image_url || '')
    setImageError('')
    setSavedBusinessId(b.id)
    setFormError('')
    setFormSuccess('')
    setShowModal(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setImageError('')
  }

  const handleUploadImage = async (businessId: number) => {
    if (!imageFile) return
    setImageUploading(true)
    setImageError('')
    try {
      await api.uploadBusinessImage(businessId, imageFile)
      setFormSuccess(txt.imageUploaded)
      setImageFile(null)
      const r = await api.getBusinesses()
      setBusinesses(r.businesses || [])
    } catch (err: any) {
      setImageError(err.message || txt.imageError)
    } finally {
      setImageUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSaving(true)
    setFormError('')
    setFormSuccess('')
    try {
      let bizId = editingBusiness?.id
      const payload = { ...form, price: Number(form.price) || 0, business_hours: businessHours }
      if (editingBusiness) {
        await api.updateBusiness(editingBusiness.id, payload)
      } else {
        const res = await api.createBusiness(payload)
        bizId = res.business?.id
        setSavedBusinessId(bizId ?? null)
      }
      if (imageFile && bizId) {
        await handleUploadImage(bizId)
      }
      setFormSuccess(txt.saved)
      const r = await api.getBusinesses()
      setBusinesses(r.businesses || [])
      setTimeout(() => {
        setShowModal(false)
        setFormSuccess('')
      }, 1200)
    } catch (err: any) {
      setFormError(err.message || txt.error)
    } finally {
      setFormSaving(false)
    }
  }

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    Promise.all([
      api.getDashboard(),
      api.getBusinesses(),
      api.getBookings(),
      api.getReviews(),
    ]).then(([dash, biz, bkgs, revs]) => {
      setStats(dash)
      setBusinesses(biz.businesses || [])
      setBookings(dash.recent_bookings || bkgs.bookings || [])
      setReviews(revs.reviews || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreate()
      setSearchParams({}, { replace: true })
    }
  }, [searchParams])

  return (
    <BusinessLayout rightPanel={(
      <>
      {/* ── Guide Profile Card ── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${A} 0%, #dc2626 100%)`, padding: '20px 20px 0' }}>
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
              style={{ border: '3px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)' }}>
              {currentUser?.name?.charAt(0) || 'L'}
            </div>
            <span className="absolute -bottom-1 -right-1 text-sm">&#x1F525;</span>
          </div>
          <div>
            <p className="text-white font-black text-base leading-tight">{currentUser?.name || 'Local Business'}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{businesses[0]?.business_type || 'Business'} · {businesses[0]?.status || 'pending'}</p>
          </div>
        </div>
        <div className="flex" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, paddingBottom: 16 }}>
          {[{ v: `Rp ${(bookings.reduce((s:number, b:any) => s + Number(b.total_price||0), 0) / 1000000).toFixed(1)}jt`, l: txt.revenue }, { v: bookings.length, l: txt.bookings }, { v: businesses.length, l: txt.myListings }].map((s, i, arr) => (
            <div key={s.l} className="flex-1 text-center" style={{ borderRight: i < arr.length-1 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <p className="font-black text-white text-sm">{s.v}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* ── Earnings Chart ── */}
        <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold" style={{ color: TEXT }}>{txt.weeklyEarnings}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: AL, color: A }}>+18%</span>
          </div>
          <p className="text-2xl font-black mb-3" style={{ color: TEXT, letterSpacing: '-0.03em' }}>Rp 19,8jt</p>
          <div className="relative">
            {[40, 24, 8].map((label) => (
              <div key={label} className="flex items-center gap-2 absolute w-full" style={{ bottom: `${(label / 48) * 72}px` }}>
                <span style={{ color: SUBTLE, fontSize: 9, width: 14, textAlign: 'right', flexShrink: 0 }}>{label}</span>
                <div className="flex-1 border-t border-dashed" style={{ borderColor: '#f1f5f9' }} />
              </div>
            ))}
            <div className="flex items-end gap-1 pl-5 pb-4" style={{ height: 80 }}>
              {barData.map((v, i) => (
                <div key={i} className="flex-1 rounded-t-lg"
                  style={{ height: `${(v / maxBar) * 62}px`, background: i === 5 ? A : AL, minHeight: 6 }} />
              ))}
            </div>
            <div className="flex pl-5 gap-1">
              {barLabels.map((l, i) => (
                <div key={i} className="flex-1 text-center" style={{ color: SUBTLE, fontSize: 9 }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── About the Guide ── */}
        <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: A }}>{txt.meetTheGuide}</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
              style={{ background: A }}>{currentUser?.name?.charAt(0) || 'G'}</div>
            <div>
              <p className="text-sm font-black" style={{ color: TEXT }}>{currentUser?.name || 'Local Guide'}</p>
              <p className="text-xs" style={{ color: MUTED }}>{businesses[0]?.city || 'Sulawesi'} · 15 {txt.yearsExp}</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: MUTED }}>
            {lang === 'en'
              ? (descEN[0])
              : (descID[0])}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(lang === 'en' ? ['🇬🇧 ' + txt.english, '🌍 ' + txt.bilingual, txt.padiCertified] : ['🇮🇩 Bahasa', '🌍 ' + txt.bilingual, txt.padiCertified]).map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: AL, color: A }}>{t}</span>
            ))}
          </div>
          <a href={`https://wa.me/628123456789?text=${encodeURIComponent(lang === 'en' ? 'Hello! I found your profile on GoSulawesi and would like to book an experience.' : 'Halo! Saya menemukan profil Anda di GoSulawesi dan ingin memesan pengalaman.')}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white no-underline"
            style={{ background: '#25d366' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            {txt.contactWhatsApp}
          </a>
        </div>

        {/* ── Next Booking ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <div className="relative h-20 overflow-hidden">
            <img src="/img/Mappaccing Ceremony.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.2))' }} />
            <div className="absolute inset-0 flex items-center px-4 gap-3">
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Sarah Mitchell</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>May 18 · Mappaccing</p>
              </div>
              <div className="text-center bg-white rounded-xl px-3 py-2">
                <p className="font-black text-xl leading-none" style={{ color: A }}>6</p>
                <p style={{ color: SUBTLE, fontSize: 10 }}>days</p>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-2">
            <img src="/avatar/5.jpg" alt="" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs flex-1" style={{ color: MUTED }}>New York, USA · Tourist</span>
            <span className="text-xs font-bold" style={{ color: '#15803d' }}>Rp 1,92jt</span>
          </div>
        </div>

        {/* ── Recent Reviews ── */}
        <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: TEXT }}>{txt.recentReviews}</p>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#fffbeb' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#d97706" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-xs font-black" style={{ color: '#d97706' }}>{reviews.length > 0 ? (reviews.reduce((s:number, r:any) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
            </div>
          </div>
          <div>
            {reviews.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: SUBTLE }}>{txt.noReviewsYet}</p>
            )}
            {reviews.slice(0, 3).map((r, i, arr) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: A, border: '2px solid #e5e7eb' }}>
                    {r.user_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold" style={{ color: TEXT }}>{r.user_name || 'Anonymous'}</p>
                      <div className="flex">
                        {Array.from({ length: r.rating }).map((_, si) => (
                          <svg key={si} width="9" height="9" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{r.comment || 'No comment'}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <div style={{ borderTop: `1px solid ${BORDER}` }} />}
              </div>
            ))}
          </div>
          {reviews.length > 0 && (
          <button onClick={() => navigate('/business/reviews')} className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold border-0 cursor-pointer hover:opacity-80"
            style={{ background: AL, color: A }}>{txt.seeAllReviews}</button>
          )}
        </div>
      </div>
      </>
    )}>

    {/* ── Hero Full Bleed ── */}
    <div className="relative overflow-hidden cursor-pointer group" style={{ height: 240 }}>
      <img src={(businesses[0]?.image_url) || '/img/Mappaccing Ceremony.jpg'} alt="hero"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%)'
      }} />
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(8px)' }}>
          ✦ {businesses[0]?.business_name || 'Your Business'}
        </span>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span className="text-white text-xs font-bold">{businesses[0]?.rating || '0.0'}</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>· {businesses[0]?.status || 'pending'}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{businesses[0]?.city || ''} · {businesses[0]?.business_type || ''}</p>
        <h2 className="text-2xl font-black text-white mb-4" style={{ letterSpacing: '-0.03em' }}>{businesses[0]?.business_name || 'Your Business'}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-0 cursor-pointer"
            style={{ background: A, color: 'white', boxShadow: `0 4px 14px ${A}66` }}>
            {txt.addNewListing}
          </button>
          <button onClick={openEdit} className="px-5 py-2.5 rounded-full text-sm font-bold border-0 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(8px)' }}>
            {txt.editListing}
          </button>
        </div>
      </div>
    </div>

    <div className="p-6">

      {/* ── Earnings Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            ), label: txt.revenue, value: `Rp ${(bookings.reduce((s:number, b:any) => s + Number(b.total_price||0), 0) / 1000000).toFixed(1)}jt`, trend: txt.total, sub: txt.thisMonth, bg: A, light: AL },
          { icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            ), label: txt.bookings, value: bookings.length, trend: txt.total, sub: txt.served, bg: '#0891b2', light: '#ecfeff' },
          { icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
              </svg>
            ), label: txt.businesses, value: businesses.length, trend: businesses.filter((b:any) => b.status === 'approved').length + ' ' + txt.live, sub: txt.published, bg: '#16a34a', light: '#f0fdf4' },
          { icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ), label: txt.reviews, value: reviews.length, trend: txt.total, sub: txt.fromClients, bg: '#d97706', light: '#fffbeb' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <p className="text-2xl font-black leading-none mb-1" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{s.value}</p>
            <p className="text-xs font-medium mb-2" style={{ color: MUTED }}>{s.label}</p>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: s.light, color: s.bg }}>↑ {s.trend}</span>
          </div>
        ))}
      </div>

      {/* ── My Listings — Magazine Layout ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-base" style={{ color: TEXT, letterSpacing: '-0.02em' }}>{txt.myListings}</h3>
            <p className="text-xs mt-0.5" style={{ color: SUBTLE }}>{businesses.filter((b:any) => b.status === 'approved').length} {txt.active} · {businesses.filter((b:any) => b.status === 'pending').length} {txt.pendingReview}</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer hover:opacity-80"
            style={{ background: AL, color: A }}>{txt.newListing}</button>
        </div>
        {businesses.length === 0 && (
          <div className="text-center py-12 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-sm mb-2" style={{ color: SUBTLE }}>{txt.noListings}</p>
            <button onClick={openCreate} className="text-xs font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer" style={{ background: A, color: 'white' }}>{txt.createFirstListing}</button>
          </div>
        )}
        {businesses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:grid-rows-[170px_170px]">
          {/* Big listing card */}
          <div className="rounded-2xl overflow-hidden cursor-pointer group relative h-[180px] md:h-auto md:row-span-2">
            <img src={businesses[0]?.image_url || '/img/Danau Tanralili.jpg'} alt="" className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%)' }} />
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: A, color: 'white' }}>{businesses[0]?.business_type || 'BUSINESS'}</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: businesses[0]?.status === 'approved' ? '#dcfce7' : '#ffedd5', color: businesses[0]?.status === 'approved' ? '#15803d' : '#c2410c' }}>{businesses[0]?.status || 'pending'}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-black text-base leading-tight mb-1">{businesses[0]?.business_name}</p>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>{businesses[0]?.city}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full truncate max-w-[140px]" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
                  {businesses[0]?.phone || 'No phone'}
                </span>
                <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>★ {businesses[0]?.rating || '0.0'}</span>
                {businesses[0]?.business_hours && (
                  <span className="text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {compactHours(businesses[0].business_hours, lang)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Two smaller cards */}
          {businesses.slice(1, 3).map((l, i) => (
            <div key={i} className="rounded-2xl overflow-hidden cursor-pointer group relative h-[160px] md:h-auto">
              <img src={l.image_url || '/img/Desa_Bonto_Manai.jpg'} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 55%)' }} />
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: A, color: 'white', fontSize: 10 }}>{l.business_type}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: l.status==='approved'?'#dcfce7':'#ffedd5', color: l.status==='approved'?'#15803d':'#c2410c', fontSize: 10 }}>{l.status}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-tight">{l.business_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{l.city}</span>
                  {l.business_hours && (
                    <span className="text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {compactHours(l.business_hours, lang)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* ── Recent Bookings — Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-base" style={{ color: TEXT, letterSpacing: '-0.02em' }}>{txt.recentBookings}</h3>
            <p className="text-xs mt-0.5" style={{ color: SUBTLE }}>{bookings.filter((b:any) => b.status==='confirmed').length} {txt.confirmed} · {bookings.filter((b:any) => b.status==='pending').length} {txt.pending}</p>
          </div>
          <button onClick={() => navigate('/business/bookings')} className="text-xs font-semibold border-0 bg-transparent cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100" style={{ color: A }}>{txt.viewAll}</button>
        </div>
        <div className="space-y-3">
          {bookings.length === 0 && (
            <div className="text-center py-8 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <p className="text-sm" style={{ color: SUBTLE }}>{txt.noBookings}</p>
            </div>
          )}
          {bookings.map((b, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: A }}>
                  {b.tourist_name?.charAt(0) || b.user_name?.charAt(0) || 'C'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  style={{ background: b.status==='confirmed' ? '#22c55e' : '#f59e0b' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: TEXT }}>{b.tourist_name || b.user_name || 'Client'}</p>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>{b.destination_name || b.business_name || '-'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-xs" style={{ color: SUBTLE }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {b.booking_date}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: b.status==='confirmed'?'#dcfce7':'#ffedd5', color: b.status==='confirmed'?'#15803d':'#c2410c' }}>
                    {b.status}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-sm" style={{ color: TEXT }}>Rp {Number(b.total_price || 0).toLocaleString('id-ID')}</p>
                <button className="mt-2 text-xs px-3 py-1 rounded-full font-semibold border-0 cursor-pointer"
                  style={{ background: AL, color: A }}>Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
        <div className="rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: CARD }} onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-4" style={{ color: TEXT }}>{editingBusiness ? txt.editListingTitle : txt.createListingTitle}</h3>
          {formError && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold" style={{ background: '#fef2f2', color: '#dc2626', border: `1px solid #fecaca` }}>{formError}</div>
          )}
          {formSuccess && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold" style={{ background: '#dcfce7', color: '#15803d', border: `1px solid #bbf7d0` }}>{formSuccess}</div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.businessName}</label>
              <input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.businessType}</label>
                <input value={form.business_type} onChange={e => setForm({ ...form, business_type: e.target.value })} required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.city}</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.phone}</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.price}</label>
              <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.description}</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.uploadImage}</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ background: '#f9fafb', border: `1px solid ${BORDER}` }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={SUBTLE} strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all hover:opacity-90"
                    style={{ background: AL, color: A }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    {imageFile ? 'Change' : 'Choose'} Image
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange}
                      className="hidden" />
                  </label>
                  <p className="text-xs mt-1.5" style={{ color: SUBTLE }}>{txt.imageHint}</p>
                </div>
              </div>
              {imageError && (
                <p className="text-xs mt-2" style={{ color: '#dc2626' }}>{imageError}</p>
              )}
              {imageUploading && (
                <p className="text-xs mt-2" style={{ color: A }}>{txt.uploading}</p>
              )}
            </div>
            <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} lang={lang} />
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={formSaving} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: A }}>
                {formSaving ? txt.saving : txt.save}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-3 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all" style={{ background: '#f3f4f6', color: MUTED }}>
                {txt.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    <ChatWidget />
    </BusinessLayout>
  )
}
