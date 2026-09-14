import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getStoredUser } from '../lib/api'
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
    pageTitle: 'Reviews',
    pageSub: 'Feedback from tourists',
    searchPlaceholder: 'Search reviews…',
    loading: 'Loading reviews...',
    noReviews: 'No reviews yet.',
    all: 'All',
    fiveStars: '5 Stars',
    fourStars: '4 Stars',
    threeStars: '3 Stars',
    averageRating: 'Average Rating',
    totalReviews: 'Total Reviews',
    fromTourist: 'From',
    destination: 'Destination',
    reply: 'Reply',
    replyPlaceholder: 'Write a reply…',
    submitReply: 'Submit Reply',
    replied: 'Reply submitted',
    error: 'Failed to submit reply',
  },
  id: {
    pageTitle: 'Ulasan',
    pageSub: 'Umpan balik dari turis',
    searchPlaceholder: 'Cari ulasan…',
    loading: 'Memuat ulasan...',
    noReviews: 'Belum ada ulasan.',
    all: 'Semua',
    fiveStars: '5 Bintang',
    fourStars: '4 Bintang',
    threeStars: '3 Bintang',
    averageRating: 'Rating Rata-rata',
    totalReviews: 'Total Ulasan',
    fromTourist: 'Dari',
    destination: 'Destinasi',
    reply: 'Balas',
    replyPlaceholder: 'Tulis balasan…',
    submitReply: 'Kirim Balasan',
    replied: 'Balasan dikirim',
    error: 'Gagal mengirim balasan',
  },
}

export default function BusinessReviewsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [reviews, setReviews] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [replying, setReplying] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getReviews().then(r => {
      const list = r.reviews || []
      setReviews(list)
      setFiltered(list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    let list = reviews
    if (filter === '5') list = list.filter(r => r.rating === 5)
    if (filter === '4') list = list.filter(r => r.rating === 4)
    if (filter === '3') list = list.filter(r => r.rating === 3)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        (r.user_name || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q) ||
        (r.destination_name || '').toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [reviews, filter, search])

  const avg = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0'

  const submitReply = async (reviewId: number) => {
    if (!replyText.trim()) return
    try {
      // In a real app, you would send reply to backend
      setSuccess(txt.replied)
      setReplying(null)
      setReplyText('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || txt.error)
    }
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

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: AL, color: A }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-black leading-none" style={{ color: TEXT }}>{avg}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{txt.averageRating}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: AL, color: A }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-black leading-none" style={{ color: TEXT }}>{reviews.length}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{txt.totalReviews}</p>
                </div>
              </div>
            </div>
          </div>

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
              {['all', '5', '4', '3'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border-0 cursor-pointer transition-all"
                  style={{ background: filter === s ? A : '#f3f4f6', color: filter === s ? 'white' : MUTED }}>
                  {txt[s === '5' ? 'fiveStars' : s === '4' ? 'fourStars' : s === '3' ? 'threeStars' : 'all']}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: MUTED }}>{txt.loading}</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              <p className="text-sm" style={{ color: MUTED }}>{txt.noReviews}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: A }}>
                      {(r.user_name || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm" style={{ color: TEXT }}>{r.user_name || 'Tourist'}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {[...Array(5)].map((_, si) => (
                            <svg key={si} width="12" height="12" viewBox="0 0 24 24" fill={si < r.rating ? '#fbbf24' : 'none'} stroke={si < r.rating ? 'none' : '#d1d5db'} strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs" style={{ color: SUBTLE }}>{txt.fromTourist} · {r.destination_name || r.business_name || '-'}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: MUTED }}>{r.comment}</p>
                  {replying === r.id ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={txt.replyPlaceholder}
                        className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: '#f5f6fa', border: `1px solid ${BORDER}`, color: TEXT }} />
                      <button onClick={() => submitReply(r.id)} className="px-4 py-2 rounded-xl text-sm font-bold text-white border-0 cursor-pointer" style={{ background: A }}>{txt.submitReply}</button>
                    </div>
                  ) : (
                    <button onClick={() => setReplying(r.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer" style={{ background: AL, color: A }}>{txt.reply}</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

    </BusinessLayout>
  )
}
