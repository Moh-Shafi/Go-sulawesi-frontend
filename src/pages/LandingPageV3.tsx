import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

const A = '#f97316'
const AL = '#fff7ed'
const TEXT = '#1d1d1f'
const MUTED = '#6e6e73'
const SUBTLE = '#86868b'
const GOLD = '#f59e0b'

const GLASS = 'rgba(255,255,255,0.55)'
const GLASS_STRONG = 'rgba(255,255,255,0.72)'
const GLASS_BORDER = 'rgba(255,255,255,0.6)'
const GLASS_SHADOW = '0 8px 32px rgba(0,0,0,0.06)'
const GLASS_SHADOW_LG = '0 24px 80px rgba(0,0,0,0.10)'
const BLUR = 'blur(40px) saturate(180%)'

const destinations = [
  { name: 'Danau Tanralili', tag: 'Hidden Lake', city: 'Gowa', price: 'Rp 850rb', img: '/img/Danau Tanralili.jpg' },
  { name: 'Desa Bonto Manai', tag: 'Village Life', city: 'Bantaeng', price: 'Rp 600rb', img: '/img/Desa_Bonto_Manai.jpg' },
  { name: 'Bungung Salapang', tag: 'Sacred Wells', city: 'Jeneponto', price: 'Rp 500rb', img: '/img/Bungung Salapang.webp' },
  { name: 'Air Terjun Depa', tag: 'Waterfall Trek', city: 'Maros', price: 'Rp 750rb', img: '/img/Air Terjun Depa.jpeg' },
  { name: 'Mappaccing Ceremony', tag: 'Cultural Night', city: 'Makassar', price: 'Rp 1,2jt', img: '/img/Mappaccing Ceremony.jpg' },
  { name: "Menre' ri Lontang", tag: 'Ancient Ritual', city: 'Bugis Village', price: 'Rp 950rb', img: "/img/Menre' ri Lontang.jpg" },
]

const testimonials = [
  { name: 'Sarah Mitchell', from: 'New York, USA', avatar: '/avatar/5.jpg', rating: 5, text: "GoSulawesi took me to a forest with literally zero internet presence. The elder guide spoke no English — that was the point. Most profound day of my life." },
  { name: 'Marco Bianchi', from: 'Rome, Italy', avatar: '/avatar/2.jpg', rating: 5, text: "I was invited to witness a Mappaccing ceremony at a local family's home. I was the first foreigner they had ever hosted. This is not tourism — it's human connection." },
  { name: 'Aiko Tanaka', from: 'Tokyo, Japan', avatar: '/avatar/4.jpg', rating: 5, text: "Danau Tanralili. No signboard, no trail, no other tourists. Just me, a local fisherman, and the most beautiful lake I have ever seen." },
]

function CountUp({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let cur = 0
    const steps = 60
    const inc = target / steps
    const timer = setInterval(() => {
      cur += inc
      if (cur >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(cur))
    }, 1800 / steps)
    return () => clearInterval(timer)
  }, [started, target])
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

const translations: Record<string, any> = {
  en: {
    signIn: 'Sign In', bookNow: 'Book Now',
    heroChip: 'Explore the World',
    heroTitle1: 'Discover the',
    heroTitle2: 'hidden Sulawesi',
    heroText: "Journey beyond the map. Experience authentic destinations curated by local insiders — places no algorithm will ever show you.",
    getStarted: 'Get Started',
    happy: 'happy travelers',
    aboutLabel: 'About',
    aboutTitle: 'Destinations that exist nowhere else',
    aboutText: 'GoSulawesi hand-picks hidden destinations that no tourist has ever rated online. Every month, new places open up — always off the map, always authentic.',
    aboutCta: 'Explore Now',
    featuresTitle: 'Why travelers choose us',
    features: ['Lots of Choices', 'Best Local Guides', 'Easy Booking', 'Top Rated'],
    featuresDesc: [
      'Hundreds of hidden destinations across all six provinces of Sulawesi.',
      'Real local insiders — elders, fishermen, and noble Bugis families as your personal guides.',
      'Book in seconds. Local guides confirmed instantly. No hidden fees, no middlemen.',
      'Every listing reviewed by real travelers. 4.9 stars average across 500+ experiences.'
    ],
    destinationsLabel: 'Top Destinations',
    destinationsTitle: "Explore your dream destination",
    destinationsSub: "Discover Sulawesi's most extraordinary hidden places, personally curated by local guides who know every trail.",
    seeAll: 'See All Destinations',
    testimonialsLabel: 'What They Say',
    testimonialsTitle: 'Stories from real travelers',
    impactTitle: 'Real Impact — Real Community',
    impactLabels: ['Local Businesses', 'Tourists Connected', 'Revenue for Communities', 'Destinations Discovered'],
    howItWorksLabel: 'How It Works',
    howItWorksTitle: 'Your perfect trip in 3 steps',
    howItWorksSub: 'We bridge the gap between you and authentic local experiences — in minutes.',
    howItWorksSteps: [
      { title: 'Tell Us Your Style', desc: 'Take a quick 4-question quiz and we build your personalized Sulawesi travel profile.' },
      { title: 'Get Matched to Locals', desc: 'We connect you directly with verified local guides and SMEs that fit your preferences.' },
      { title: 'Book & Explore', desc: 'One-tap booking. Direct WhatsApp with your guide. Zero middlemen. 100% local revenue.' },
    ],
    ctaTitle: "Don't miss the 50% discount",
    ctaSub: 'For a limited time, first-time explorers get 50% off their first hidden experience. Join thousands of travelers who\'ve discovered Sulawesi\'s best-kept secrets.',
    ctaBtn: 'Get Started Now',
    footer: 'Hidden gems of South Sulawesi, curated by local insiders. Real experiences, zero tourists.',
  },
  id: {
    signIn: 'Masuk', bookNow: 'Pesan Sekarang',
    heroChip: 'Jelajahi Dunia',
    heroTitle1: 'Temukan',
    heroTitle2: 'Sulawesi tersembunyi',
    heroText: 'Menjelajah melampaui peta. Rasakan destinasi autentik yang dikurasi oleh penduduk lokal — tempat yang tidak akan pernah ditampilkan algoritma.',
    getStarted: 'Mulai Sekarang',
    happy: 'traveler bahagia',
    aboutLabel: 'Tentang',
    aboutTitle: 'Destinasi yang tak ada di tempat lain',
    aboutText: 'GoSulawesi memilih destinasi tersembunyi yang belum pernah diulas turis online. Setiap bulan, tempat baru terbuka — selalu di luar peta, selalu autentik.',
    aboutCta: 'Jelajahi Sekarang',
    featuresTitle: 'Mengapa traveler memilih kami',
    features: ['Banyak Pilihan', 'Pemandu Terbaik', 'Pemesanan Mudah', 'Rating Tertinggi'],
    featuresDesc: [
      'Ratusan destinasi tersembunyi di seluruh enam provinsi Sulawesi.',
      'Penduduk lokal asli — tetua, nelayan, dan keluarga bangsawan Bugis sebagai pemandu pribadi Anda.',
      'Pesan dalam detik. Pemandu lokal langsung dikonfirmasi. Tanpa biaya tersembunyi, tanpa perantara.',
      'Setiap daftar diulas oleh traveler nyata. Rata-rata 4.9 bintang dari 500+ pengalaman.'
    ],
    destinationsLabel: 'Destinasi Teratas',
    destinationsTitle: 'Jelajahi destinasi impian Anda',
    destinationsSub: 'Temukan tempat tersembunyi paling luar biasa di Sulawesi, dikurasi oleh pemandu lokal yang mengenal setiap jejak.',
    seeAll: 'Lihat Semua Destinasi',
    testimonialsLabel: 'Apa Kata Mereka',
    testimonialsTitle: 'Cerita dari traveler nyata',
    impactTitle: 'Dampak Nyata — Komunitas Nyata',
    impactLabels: ['Usaha Lokal', 'Turist Terhubung', 'Pendapatan untuk Komunitas', 'Destinasi Ditemukan'],
    howItWorksLabel: 'Cara Kerja',
    howItWorksTitle: 'Perjalanan sempurna Anda dalam 3 langkah',
    howItWorksSub: 'Kami menjembatani kesenjangan antara Anda dan pengalaman lokal yang autentik — dalam hitungan menit.',
    howItWorksSteps: [
      { title: 'Ceritakan Gaya Anda', desc: 'Ikuti kuis singkat 4 pertanyaan dan kami buat profil perjalanan Sulawesi yang dipersonalisasi untuk Anda.' },
      { title: 'Dapatkan Pemandu Lokal', desc: 'Kami menghubungkan Anda langsung dengan pemandu lokal dan UMKM terverifikasi yang sesuai preferensi Anda.' },
      { title: 'Pesan & Jelajahi', desc: 'Pemesanan satu ketuk. WhatsApp langsung dengan pemandu. Tanpa perantara. 100% pendapatan lokal.' },
    ],
    ctaTitle: 'Jangan lewatkan diskon 50%',
    ctaSub: 'Untuk waktu terbatas, penjelajah pertama mendapatkan diskon 50% untuk pengalaman tersembunyi pertama mereka. Bergabung dengan ribuan traveler yang telah menemukan rahasia terbaik Sulawesi.',
    ctaBtn: 'Mulai Sekarang',
    footer: 'Permata tersembunyi Sulawesi Selatan, dikurasi oleh penduduk lokal. Pengalaman nyata, tanpa turis ramai.',
  },
}

export default function LandingPageV3() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { lang, setLang } = useLang()
  const [liveStats, setLiveStats] = useState({ local_businesses: 12, tourists_connected: 48, revenue_generated: 12400000, destinations: 24 })
  const t = translations[lang]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    api.getStats().then(s => setLiveStats(s)).catch(() => {})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{
      background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 25%, #ffffff 75%, #fff7ed 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", Poppins, sans-serif',
      color: TEXT,
      minHeight: '100vh',
    }}>
      {/* ══════════ AMBIENT BACKGROUND ══════════ */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-25" style={{ background: `radial-gradient(circle, ${A}, transparent 70%)` }} />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-15" style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)` }} />
        <div className="absolute bottom-[20%] left-[30%] w-[450px] h-[450px] rounded-full blur-[140px] opacity-10" style={{ background: `radial-gradient(circle, ${A}, transparent 70%)` }} />
      </div>

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
          backdropFilter: BLUR,
          WebkitBackdropFilter: BLUR,
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
        }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {['Tours', 'About', 'Destinations', 'Blog', 'Stay'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium no-underline transition-colors"
                style={{ color: MUTED }}
                onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>{item}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
              {['en', 'id'].map(l => (
                <button key={l} onClick={() => setLang(l as 'en' | 'id')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                  style={{ background: lang === l ? 'white' : 'transparent', color: lang === l ? A : MUTED, boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>
                  {l === 'en' ? 'EN' : 'ID'}
                </button>
              ))}
            </div>
            <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-semibold no-underline"
              style={{ color: TEXT, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)' }}>{t.signIn}</Link>
            <Link to="/signup" className="px-5 py-2 rounded-xl text-sm font-bold text-white no-underline transition-all hover:scale-105"
              style={{ background: A, boxShadow: `0 4px 20px ${A}44` }}>{t.bookNow}</Link>
          </div>

          <button className="md:hidden p-2" style={{ color: MUTED }} onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-5 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.5)' }}>
            {['Tours', 'About', 'Destinations', 'Blog', 'Stay'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium no-underline" style={{ color: MUTED }}>{item}</a>
            ))}
            <div className="flex items-center gap-2 pt-1">
              {['en', 'id'].map(l => (
                <button key={l} onClick={() => setLang(l as 'en' | 'id')}
                  className="px-3 py-2 rounded-xl text-xs font-bold border-0 flex-1 cursor-pointer"
                  style={{ background: lang === l ? A : '#f3f4f6', color: lang === l ? 'white' : MUTED }}>
                  {l === 'en' ? 'English' : 'Bahasa'}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold no-underline" style={{ background: 'rgba(255,255,255,0.6)', color: TEXT }}>{t.signIn}</Link>
              <Link to="/signup" className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white no-underline" style={{ background: A }}>{t.bookNow}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="pt-32 pb-24 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', color: A }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="5 12 10 17 20 7"/></svg>
            {t.heroChip}
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-[1.05] mb-6" style={{ color: TEXT, letterSpacing: '-0.04em' }}>
            {t.heroTitle1}<br />
            <span style={{ background: `linear-gradient(135deg, ${A} 0%, ${GOLD} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t.heroTitle2}
            </span>
          </h1>

          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto font-light" style={{ color: MUTED }}>
            {t.heroText}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup" className="px-8 py-4 rounded-2xl text-base font-bold text-white no-underline transition-all hover:scale-105"
              style={{ background: A, boxShadow: `0 8px 30px ${A}44` }}>
              {t.getStarted}
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-2xl text-base font-semibold no-underline transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', color: TEXT }}>
              {t.signIn}
            </Link>
          </div>

          {/* Trust bar */}
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)' }}>
            <div className="flex -space-x-2">
              {[1,2,3,4].map(n => (
                <img key={n} src={`/avatar/${n}.jpg`} alt="" className="w-8 h-8 rounded-full object-cover object-top border-2 border-white" />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={GOLD} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
              <span className="text-xs font-bold ml-1" style={{ color: TEXT }}>4.9</span>
            </div>
            <span className="text-xs" style={{ color: SUBTLE }}>50,000+ {t.happy}</span>
          </div>
        </div>

        {/* Hero image showcase */}
        <div className="max-w-6xl mx-auto mt-16 relative" style={{ height: 380 }}>
          <div className="absolute top-0 left-[8%] w-64 h-80 rounded-[2rem] overflow-hidden" style={{ boxShadow: GLASS_SHADOW_LG, border: `2px solid ${GLASS_BORDER}` }}>
            <img src="/img/Danau Tanralili.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-8 right-[8%] w-72 h-72 rounded-[2rem] overflow-hidden" style={{ boxShadow: GLASS_SHADOW_LG, border: `2px solid ${GLASS_BORDER}` }}>
            <img src="/img/Mappaccing Ceremony.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-64 rounded-[2rem] overflow-hidden" style={{ boxShadow: GLASS_SHADOW_LG, border: `2px solid ${GLASS_BORDER}` }}>
            <img src="/img/Air Terjun Depa.jpeg" alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ══════════ IMPACT COUNTER ══════════ */}
      <section className="py-16 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[2.5rem] p-10 relative overflow-hidden"
            style={{ background: A, boxShadow: `0 24px 80px ${A}33` }}>
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full blur-[100px] opacity-25" style={{ background: 'white' }} />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-[80px] opacity-20" style={{ background: GOLD }} />
            <p className="text-center text-sm font-bold uppercase tracking-widest mb-8 opacity-80 relative" style={{ color: 'white' }}>{t.impactTitle}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center relative">
              {[
                { label: t.impactLabels[0], value: liveStats.local_businesses, suffix: '+', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                { label: t.impactLabels[1], value: liveStats.tourists_connected, suffix: '+', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { label: t.impactLabels[2], value: Math.round(liveStats.revenue_generated / 1000000), prefix: 'Rp ', suffix: 'M+', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                { label: t.impactLabels[3], value: liveStats.destinations, suffix: '+', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg> },
              ].map(s => (
                <div key={s.label} className="p-6 rounded-3xl"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255,255,255,0.15)' }}>{s.icon}</div>
                  <div className="text-4xl font-black text-white mb-1" style={{ letterSpacing: '-0.03em' }}>
                    <CountUp target={s.value} suffix={s.suffix} prefix={s.prefix ?? ''} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-24 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-bold mb-3" style={{ color: A }}>{t.howItWorksLabel}</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{t.howItWorksTitle}</h2>
          <p className="text-base max-w-md mx-auto mb-16 font-light" style={{ color: MUTED }}>{t.howItWorksSub}</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: t.howItWorksSteps[0].title, desc: t.howItWorksSteps[0].desc, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
              { step: '02', title: t.howItWorksSteps[1].title, desc: t.howItWorksSteps[1].desc, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { step: '03', title: t.howItWorksSteps[2].title, desc: t.howItWorksSteps[2].desc, icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-[2rem] text-left transition-all duration-500 hover:scale-[1.02]"
                style={{ background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${GLASS_BORDER}`, boxShadow: GLASS_SHADOW }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.7)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                    {item.icon}
                  </div>
                  <span className="text-5xl font-black opacity-10" style={{ color: A }}>{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: TEXT }}>{item.title}</h3>
                <p className="text-sm leading-relaxed font-light" style={{ color: MUTED }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="py-24 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative hidden lg:block" style={{ height: 420 }}>
            <div className="absolute top-0 left-0 w-48 h-56 rounded-[2rem] overflow-hidden" style={{ boxShadow: GLASS_SHADOW_LG, border: `2px solid ${GLASS_BORDER}` }}>
              <img src="/img/Bungung Salapang.webp" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-12 right-0 w-56 h-64 rounded-[2rem] overflow-hidden" style={{ boxShadow: GLASS_SHADOW_LG, border: `2px solid ${GLASS_BORDER}` }}>
              <img src="/img/Mappaccing Ceremony.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-12 w-52 h-48 rounded-[2rem] overflow-hidden" style={{ boxShadow: GLASS_SHADOW, border: `2px solid ${GLASS_BORDER}` }}>
              <img src="/img/Desa_Bonto_Manai.jpg" alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold mb-3" style={{ color: A }}>{t.aboutLabel}</p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6" style={{ color: TEXT, letterSpacing: '-0.03em' }}>
              {t.aboutTitle}
            </h2>
            <p className="text-base leading-relaxed mb-8 font-light" style={{ color: MUTED }}>
              {t.aboutText}
            </p>
            <div className="flex gap-10 mb-8">
              {[
                { val: '2000+', label: lang === 'id' ? 'Tamu Bahagia' : 'Happy Guests' },
                { val: '100+', label: lang === 'id' ? 'Destinasi' : 'Destinations' },
                { val: '20+', label: lang === 'id' ? 'Pengalaman Lokal' : 'Local Experiences' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-3xl font-black" style={{ color: A }}>{s.val}</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>{s.label}</p>
                </div>
              ))}
            </div>
            <Link to="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white no-underline transition-all hover:scale-105"
              style={{ background: A, boxShadow: `0 8px 30px ${A}44` }}>
              {t.aboutCta}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="py-24 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold mb-3" style={{ color: A }}>What We Give</p>
            <h2 className="text-4xl md:text-5xl font-black" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{t.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>, title: t.features[0], desc: t.featuresDesc[0] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: t.features[1], desc: t.featuresDesc[1] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: t.features[2], desc: t.featuresDesc[2] },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title: t.features[3], desc: t.featuresDesc[3] },
            ].map((f, i) => (
              <div key={i} className="p-7 rounded-[1.5rem] transition-all duration-500 hover:scale-[1.05]"
                style={{ background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${GLASS_BORDER}`, boxShadow: GLASS_SHADOW }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(255,255,255,0.7)', color: A, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: TEXT }}>{f.title}</h3>
                <p className="text-xs leading-relaxed font-light" style={{ color: MUTED }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ DESTINATIONS ══════════ */}
      <section className="py-24 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold mb-3" style={{ color: A }}>{t.destinationsLabel}</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{t.destinationsTitle}</h2>
            <p className="text-base max-w-lg mx-auto font-light" style={{ color: MUTED }}>{t.destinationsSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((d, i) => (
              <div key={i} className="rounded-[2rem] overflow-hidden cursor-pointer group relative transition-all duration-500 hover:scale-[1.02]"
                style={{ height: 320, boxShadow: GLASS_SHADOW_LG, border: `2px solid ${GLASS_BORDER}` }}>
                <img src={d.img} alt={d.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                <div className="absolute top-4 left-4">
                  <span className="text-xs px-3 py-1.5 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: A, border: '1px solid rgba(255,255,255,0.5)' }}>{d.tag}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-3 py-1.5 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: TEXT, border: '1px solid rgba(255,255,255,0.5)' }}>{d.price}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-bold text-lg">{d.name}</p>
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    {d.city}, Sulawesi
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white no-underline transition-all hover:scale-105"
              style={{ background: A, boxShadow: `0 8px 30px ${A}44` }}>
              {t.seeAll}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-24 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold mb-3" style={{ color: A }}>{t.testimonialsLabel}</p>
            <h2 className="text-4xl md:text-5xl font-black" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{t.testimonialsTitle}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => (
              <div key={i} className="p-8 rounded-[2rem] flex flex-col"
                style={{ background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${GLASS_BORDER}`, boxShadow: GLASS_SHADOW }}>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={GOLD} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                </div>
                <p className="text-sm leading-relaxed mb-6 flex-1 font-light" style={{ color: MUTED }}>"{tm.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={tm.avatar} alt={tm.name} className="w-12 h-12 rounded-full object-cover object-top border-2" style={{ borderColor: 'rgba(255,255,255,0.6)' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: TEXT }}>{tm.name}</p>
                    <p className="text-xs" style={{ color: SUBTLE }}>{tm.from}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-16 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto rounded-[2.5rem] p-16 text-center relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${GLASS_BORDER}`, boxShadow: GLASS_SHADOW_LG }}>
          <div className="absolute top-[-40px] left-[-40px] w-64 h-64 rounded-full blur-[100px] opacity-30" style={{ background: A }} />
          <div className="absolute bottom-[-40px] right-[-40px] w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background: GOLD }} />
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: A }}>Limited Offer</p>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ color: TEXT, letterSpacing: '-0.03em' }}>
              {t.ctaTitle}
            </h2>
            <p className="max-w-lg mx-auto mb-10 text-base font-light" style={{ color: MUTED }}>
              {t.ctaSub}
            </p>
            <Link to="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white text-lg no-underline transition-all hover:scale-105"
              style={{ background: A, boxShadow: `0 12px 40px ${A}55` }}>
              {t.ctaBtn}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="pt-20 pb-10 px-6 relative" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-9 w-auto" />
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-5 font-light" style={{ color: MUTED }}>
                {t.footer}
              </p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', color: TEXT }} />
                <button className="px-4 py-2.5 rounded-xl text-white text-sm font-bold border-0 cursor-pointer"
                  style={{ background: A }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

            {[
              { title: 'About', links: ['Our Story', 'Team', 'Blog', 'Careers'] },
              { title: 'Company', links: ['Partners', 'Guides', 'Press', 'Investors'] },
              { title: 'Support', links: ['Help', 'Contact', 'Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: SUBTLE }}>{col.title}</p>
                <div className="flex flex-col gap-3">
                  {col.links.map(l => (
                    <a key={l} href="#" className="text-sm no-underline transition-colors"
                      style={{ color: MUTED }}
                      onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                      onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-xs" style={{ color: SUBTLE }}>© 2025 GoSulawesi. All rights reserved. Made with ♥ for Indonesia.</p>
            <div className="flex items-center gap-3">
              {['instagram', 'twitter', 'facebook'].map(s => (
                <a key={s} href="#" className="w-9 h-9 rounded-full flex items-center justify-center no-underline transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', color: A }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    {s === 'instagram' && <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>}
                    {s === 'twitter' && <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>}
                    {s === 'facebook' && <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
