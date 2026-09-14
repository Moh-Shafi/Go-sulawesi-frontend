import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useLang } from '../hooks/useLang'

const A = '#f97316'
const A2 = '#ea580c'
const AL = '#fff7ed'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#f3f4f6'
const GOLD = '#f59e0b'

const destinations = [
  { name: 'Danau Tanralili', tag: 'Hidden Lake', city: 'Gowa', price: 'Rp 850rb', img: '/img/Danau Tanralili.jpg' },
  { name: 'Desa Bonto Manai', tag: 'Village Life', city: 'Bantaeng', price: 'Rp 600rb', img: '/img/Desa_Bonto_Manai.jpg' },
  { name: 'Bungung Salapang', tag: 'Sacred Wells', city: 'Jeneponto', price: 'Rp 500rb', img: '/img/Bungung Salapang.webp' },
  { name: 'Air Terjun Depa', tag: 'Waterfall Trek', city: 'Maros', price: 'Rp 750rb', img: '/img/Air Terjun Depa.jpeg' },
  { name: 'Mappaccing Ceremony', tag: 'Cultural Night', city: 'Makassar', price: 'Rp 1,2jt', img: '/img/Mappaccing Ceremony.jpg' },
  { name: "Menre' ri Lontang", tag: 'Ancient Ritual', city: 'Bugis Village', price: 'Rp 950rb', img: "/img/Menre' ri Lontang.jpg" },
]

const testimonials = [
  { name: 'Sarah Mitchell', from: 'New York, USA', avatar: '/avatar/5.jpg', text: "GoSulawesi took me to a forest with literally zero internet presence. The elder guide spoke no English — that was the point." },
  { name: 'Marco Bianchi', from: 'Rome, Italy', avatar: '/avatar/2.jpg', text: "I was invited to a Mappaccing ceremony at a local family's home. This is not tourism — it's human connection." },
  { name: 'Aiko Tanaka', from: 'Tokyo, Japan', avatar: '/avatar/4.jpg', text: "Danau Tanralili. No signboard, no trail, no other tourists. Just me and the most beautiful lake I have ever seen." },
]

const translations: Record<string, any> = {
  en: {
    nav: ['Tours', 'About', 'Destinasi', 'Blog', 'Stay'], signIn: 'Sign In', bookNow: 'Book Now',
    heroChip: 'Explore the Unseen',
    heroTitle: ['Discover The', 'Best Destinations', 'In The World'],
    heroText: "Let GoSulawesi take you on an adventure you'll never forget. Experience the hidden gems of South Sulawesi with a trusted local guide.",
    getStarted: 'Get Started', happy: 'happy travelers', rating: 'Average Rating', reviews: 'reviews',
    aboutLabel: '— About', aboutTitle: 'Beautiful Hidden Destinations Every Month', aboutText: 'Hand-picked hidden places no tourist has ever rated online. Always off the map, always authentic.',
    aboutCta: 'Explore Now',
    featuresTitle: 'Best Features For You', features: ['Lots of Choices', 'Best Local Guide', 'Easy Booking', 'Top Rated'],
    featuresDesc: ['Hundreds of hidden destinations across Sulawesi.', 'Real local insiders as your personal guides.', 'Book in seconds with no hidden fees.', '4.9 stars average across 500+ experiences.'],
    destinationsLabel: 'Top Destinations', destinationsTitle: "Explore Your Dream Destination", destinationsSub: "Sulawesi's most extraordinary hidden places, curated by local guides.", seeAll: 'See All',
    testimonialsLabel: 'What They Say', testimonialsTitle: 'Traveler Stories',
    impactTitle: 'Real Impact', impactLabels: ['Local Businesses', 'Tourists', 'Revenue', 'Destinations'],
    howTitle: '3 Steps to Your Perfect Trip', howSub: 'Quick, personal, and 100% local.',
    howSteps: ['Take the Quiz', 'Meet Your Guide', 'Book & Go'],
    howDesc: ['Build your travel profile in 30 seconds.', 'We match you with verified local guides.', 'One-tap booking. Direct WhatsApp contact.'],
    ctaTitle: 'Get 50% Off Your First Hidden Experience', ctaSub: 'Join thousands of travelers discovering Sulawesi.', ctaBtn: 'Get Started',
    footer: 'Hidden gems of South Sulawesi, curated by local insiders.',
  },
  id: {
    nav: ['Tur', 'Tentang', 'Destinasi', 'Blog', 'Menginap'], signIn: 'Masuk', bookNow: 'Pesan Sekarang',
    heroChip: 'Jelajahi yang Tersembunyi',
    heroTitle: ['Temukan', 'Destinasi Terbaik', 'Di Dunia'],
    heroText: 'Biarkan GoSulawesi membawa Anda dalam petualangan tak terlupakan. Nikmati permata tersembunyi Sulawesi Selatan bersama pemandu lokal.',
    getStarted: 'Mulai Sekarang', happy: 'traveler bahagia', rating: 'Rating Rata-rata', reviews: 'ulasan',
    aboutLabel: '— Tentang', aboutTitle: 'Destinasi Indah Tersembunyi Setiap Bulan', aboutText: 'Tempat tersembunyi pilihan yang belum pernah diulas turis online. Selalu autentik.',
    aboutCta: 'Jelajahi Sekarang',
    featuresTitle: 'Fitur Terbaik', features: ['Banyak Pilihan', 'Pemandu Lokal', 'Pemesanan Mudah', 'Rating Tinggi'],
    featuresDesc: ['Ratusan destinasi tersembunyi di Sulawesi.', 'Penduduk lokal asli sebagai pemandu pribadi.', 'Pesan dalam detik tanpa biaya tersembunyi.', 'Rata-rata 4.9 bintang dari 500+ pengalaman.'],
    destinationsLabel: 'Destinasi Teratas', destinationsTitle: 'Jelajahi Destinasi Impian', destinationsSub: 'Tempat luar biasa di Sulawesi, dikurasi pemandu lokal.', seeAll: 'Lihat Semua',
    testimonialsLabel: 'Apa Kata Mereka', testimonialsTitle: 'Cerita Traveler',
    impactTitle: 'Dampak Nyata', impactLabels: ['Usaha Lokal', 'Turist', 'Pendapatan', 'Destinasi'],
    howTitle: '3 Langkah untuk Perjalanan Sempurna', howSub: 'Cepat, personal, dan 100% lokal.',
    howSteps: ['Ikuti Kuis', 'Temui Pemandu', 'Pesan & Berangkat'],
    howDesc: ['Buat profil perjalanan Anda dalam 30 detik.', 'Kami cocokkan dengan pemandu lokal terverifikasi.', 'Pemesanan satu ketuk. Kontak WhatsApp langsung.'],
    ctaTitle: 'Diskon 50% untuk Pengalaman Pertama', ctaSub: 'Bergabung dengan ribuan traveler yang menemukan Sulawesi.', ctaBtn: 'Mulai Sekarang',
    footer: 'Permata tersembunyi Sulawesi Selatan, dikurasi penduduk lokal.',
  },
}

export default function LandingPageV2() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTesti, setActiveTesti] = useState(0)
  const { lang, setLang } = useLang()
  const [liveStats, setLiveStats] = useState({ local_businesses: 12, tourists_connected: 48, revenue_generated: 12400000, destinations: 24 })
  const t = translations[lang]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    api.getStats().then(s => setLiveStats(s)).catch(() => {})
    const interval = setInterval(() => setActiveTesti(i => (i + 1) % testimonials.length), 5000)
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(interval) }
  }, [])

  return (
    <div style={{ fontFamily: 'Poppins, Inter, sans-serif', color: TEXT, overflowX: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes floatSlow { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-20px) rotate(2deg) } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.2) } 50% { box-shadow: 0 0 24px 8px rgba(249,115,22,0.12) } }
        @keyframes gradient-shift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
        .animate-float { animation: float 5s ease-in-out infinite }
        .animate-float-slow { animation: floatSlow 7s ease-in-out infinite }
        .animate-pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 7s ease infinite }
        .animate-fade-up { animation: fade-up 0.8s ease-out both }
        .hover-lift { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease }
        .hover-lift:hover { transform: translateY(-10px); box-shadow: 0 24px 48px rgba(0,0,0,0.12) }
        .link-underline { position: relative }
        .link-underline::after { content: ''; position: absolute; left: 0; bottom: -4px; width: 0; height: 2px; border-radius: 2px; background: ${A}; transition: width 0.3s ease }
        .link-underline:hover::after { width: 100% }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: `1px solid ${scrolled ? BORDER : 'transparent'}`, boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.04)' : 'none' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {t.nav.map((item: string) => <a key={item} href="#" className="text-sm font-medium no-underline link-underline" style={{ color: MUTED }}>{item}</a>)}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl mr-2" style={{ background: AL }}>
              {['en', 'id'].map(l => (
                <button key={l} onClick={() => setLang(l as any)} className="px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                  style={{ background: lang === l ? 'white' : 'transparent', color: lang === l ? A : MUTED, boxShadow: lang === l ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>{l === 'en' ? 'EN' : 'ID'}</button>
              ))}
            </div>
            <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-semibold no-underline transition-all hover:shadow-md" style={{ color: TEXT, border: `1.5px solid ${BORDER}`, background: 'white' }}>{t.signIn}</Link>
            <Link to="/signup" className="px-5 py-2 rounded-xl text-sm font-bold text-white no-underline transition-all hover:opacity-90 animate-pulse-glow" style={{ background: `linear-gradient(135deg, ${A} 0%, ${A2} 100%)` }}>{t.bookNow}</Link>
          </div>
          <button className="md:hidden p-2" style={{ color: TEXT }} onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}</svg>
          </button>
        </div>
        {menuOpen && <div className="md:hidden px-6 pb-5 flex flex-col gap-4 border-t" style={{ borderColor: BORDER, background: 'white' }}>
          {t.nav.map((item: string) => <a key={item} href="#" className="text-sm font-medium no-underline" style={{ color: MUTED }}>{item}</a>)}
          <div className="flex gap-2 pt-1">
            {['en', 'id'].map(l => <button key={l} onClick={() => setLang(l as any)} className="px-3 py-2 rounded-xl text-xs font-bold border-0 flex-1 cursor-pointer" style={{ background: lang === l ? A : '#f3f4f6', color: lang === l ? 'white' : MUTED }}>{l === 'en' ? 'English' : 'Bahasa'}</button>)}
          </div>
          <div className="flex gap-3 pt-1">
            <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold no-underline border" style={{ borderColor: BORDER, color: TEXT }}>{t.signIn}</Link>
            <Link to="/signup" className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white no-underline" style={{ background: A }}>{t.bookNow}</Link>
          </div>
        </div>}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden" style={{ background: `linear-gradient(135deg, #fff7ed 0%, #ffffff 55%, #fff7ed 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 animate-float-slow" style={{ background: `radial-gradient(circle, ${A} 0%, transparent 70%)` }} />
          <div className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full opacity-15 animate-float-slow" style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, animationDelay: '2s' }} />
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-bold animate-pulse-glow" style={{ background: AL, color: A, border: `1px solid ${A}22` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="5 12 10 17 20 7"/></svg>
              {t.heroChip}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] mb-6" style={{ letterSpacing: '-0.03em' }}>
              {t.heroTitle[0]}<br />{t.heroTitle[1]}<br />
              <span className="bg-clip-text text-transparent animate-gradient" style={{ backgroundImage: `linear-gradient(90deg, ${A}, ${A2}, ${GOLD}, ${A})` }}>{t.heroTitle[2]}</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: MUTED }}>{t.heroText}</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-8 p-3 rounded-2xl hover-lift" style={{ background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 flex-1 px-3 py-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                <div><p className="text-xs font-bold">Lokasi</p><p className="text-xs" style={{ color: SUBTLE }}>{t.happy.split(' ')[0]}</p></div>
              </div>
              <div className="w-px self-stretch" style={{ background: BORDER }} />
              <div className="flex items-center gap-2 flex-1 px-3 py-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div><p className="text-xs font-bold">Tanggal</p><p className="text-xs" style={{ color: SUBTLE }}>Add date</p></div>
              </div>
              <Link to="/signup" className="px-6 py-3 rounded-xl text-sm font-bold text-white no-underline flex-shrink-0 flex items-center transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${A} 0%, ${A2} 100%)`, boxShadow: `0 4px 16px ${A}44` }}>{t.getStarted}</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(n => <img key={n} src={`/avatar/${n}.jpg`} alt="" className="w-9 h-9 rounded-full object-cover object-top border-2 border-white shadow-sm" />)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={GOLD}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  <span className="text-xs font-bold ml-1">4.9</span>
                </div>
                <p className="text-xs" style={{ color: SUBTLE }}>50,000+ {t.happy}</p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block" style={{ height: 560 }}>
            <div className="absolute top-0 left-0 z-10 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl animate-float" style={{ background: 'rgba(255,255,255,0.95)', border: `1px solid ${BORDER}`, backdropFilter: 'blur(12px)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: AL }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2"><polyline points="5 12 10 17 20 7"/></svg></div>
              <div><p className="text-xs font-black">100%</p><p className="text-xs" style={{ color: SUBTLE }}>Satisfied</p></div>
            </div>
            <div className="absolute top-8 right-0 w-[340px] h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl animate-float" style={{ animationDuration: '6s' }}>
              <img src="/img/Danau Tanralili.jpg" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 40%)' }} />
            </div>
            <div className="absolute bottom-0 left-8 w-56 h-56 rounded-[2rem] overflow-hidden shadow-xl animate-float border-4 border-white" style={{ animationDelay: '1s', animationDuration: '7s' }}>
              <img src="/img/Mappaccing Ceremony.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-20 left-10 w-40 h-40 rounded-[1.5rem] overflow-hidden shadow-lg animate-float border-4 border-white" style={{ animationDelay: '0.5s', animationDuration: '5.5s' }}>
              <img src="/img/Air Terjun Depa.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-24 right-8 w-48 h-44 rounded-[1.5rem] overflow-hidden shadow-lg animate-float border-4 border-white" style={{ animationDelay: '2s', animationDuration: '6.5s' }}>
              <img src="/img/Desa_Bonto_Manai.jpg" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 px-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${A} 0%, ${A2} 100%)` }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-bold uppercase tracking-widest mb-10 opacity-90" style={{ color: 'white' }}>{t.impactTitle}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: t.impactLabels[0], value: liveStats.local_businesses, suffix: '+' },
              { label: t.impactLabels[1], value: liveStats.tourists_connected, suffix: '+' },
              { label: t.impactLabels[2], value: Math.round(liveStats.revenue_generated / 1000000), prefix: 'Rp ', suffix: 'M+' },
              { label: t.impactLabels[3], value: liveStats.destinations, suffix: '+' },
            ].map((s, i) => (
              <div key={s.label} className="p-6 rounded-3xl text-center hover-lift" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)' }}>
                <div className="text-4xl font-black text-white mb-1" style={{ letterSpacing: '-0.03em' }}>{s.prefix}{s.value.toLocaleString()}{s.suffix}</div>
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6" style={{ background: '#fafafa' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: A }}>{t.howTitle.split(' ').slice(0, 2).join(' ')}</p>
          <h2 className="text-4xl font-black mb-4" style={{ letterSpacing: '-0.02em' }}>{t.howTitle}</h2>
          <p className="text-sm max-w-md mx-auto mb-16" style={{ color: MUTED }}>{t.howSub}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {t.howSteps.map((step: string, i: number) => (
              <div key={i} className="relative flex flex-col items-center p-8 rounded-3xl hover-lift group" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: AL }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r={6 - i * 2}/></svg>
                </div>
                <span className="text-xs font-black mb-3 px-4 py-1 rounded-full" style={{ background: `${A}15`, color: A }}>0{i + 1}</span>
                <h3 className="text-lg font-black mb-3">{step}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{t.howDesc[i]}</p>
                {i === 2 && <Link to="/signup" className="mt-5 inline-flex items-center gap-1 text-sm font-bold no-underline group/link" style={{ color: A }}>Start now <svg className="transition-transform duration-300 group-hover/link:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></Link>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative hidden lg:flex gap-4">
            <div className="flex flex-col gap-4 mt-12">
              <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-lg hover-lift"><img src="/img/Bungung Salapang.webp" alt="" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" /></div>
              <div className="w-48 h-32 rounded-3xl overflow-hidden shadow-lg hover-lift"><img src="/img/Desa_Bonto_Manai.jpg" alt="" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" /></div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-52 h-60 rounded-3xl overflow-hidden shadow-xl hover-lift"><img src="/img/Mappaccing Ceremony.jpg" alt="" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" /></div>
              <div className="w-52 h-32 rounded-3xl overflow-hidden shadow-lg hover-lift"><img src="/img/Air Terjun Depa.jpeg" alt="" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" /></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-xl animate-float" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: A }}>4.9</div>
                <div><p className="text-xs font-black">{t.rating}</p><p className="text-xs" style={{ color: SUBTLE }}>500+ {t.reviews}</p></div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: A }}>{t.aboutLabel}</p>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>{t.aboutTitle}</h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: MUTED }}>{t.aboutText}</p>
            <div className="flex gap-10 mb-8">
              {['2000+', '100+', '20+'].map((val, i) => (
                <div key={i}>
                  <p className="text-3xl font-black" style={{ color: A }}>{val}</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>{[lang === 'id' ? 'Tamu Bahagia' : 'Happy Guests', lang === 'id' ? 'Destinasi' : 'Destinations', lang === 'id' ? 'Pengalaman Lokal' : 'Local Experiences'][i]}</p>
                </div>
              ))}
            </div>
            <Link to="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white no-underline transition-all hover:scale-105 hover:shadow-lg" style={{ background: `linear-gradient(135deg, ${A} 0%, ${A2} 100%)`, boxShadow: `0 4px 20px ${A}55` }}>
              {t.aboutCta}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" style={{ background: '#fafafa' }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: A }}>What We Give</p>
          <h2 className="text-4xl font-black text-center mb-12" style={{ letterSpacing: '-0.02em' }}>{t.featuresTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {t.features.map((title: string, i: number) => (
              <div key={i} className="p-6 rounded-2xl hover-lift group" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110" style={{ background: AL, color: A }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r={5 - i}/></svg>
                </div>
                <h3 className="text-sm font-bold mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{t.featuresDesc[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: A }}>{t.destinationsLabel}</p>
          <h2 className="text-4xl font-black text-center mb-3" style={{ letterSpacing: '-0.02em' }}>{t.destinationsTitle}</h2>
          <p className="text-sm text-center mb-12 max-w-lg mx-auto" style={{ color: MUTED }}>{t.destinationsSub}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {destinations.map((d, i) => (
              <div key={i} className="rounded-2xl overflow-hidden cursor-pointer group relative hover-lift" style={{ height: 260, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <img src={d.img} alt={d.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                <div className="absolute top-3 left-3"><span className="text-xs px-2.5 py-1 rounded-full font-bold text-white" style={{ background: A }}>{d.tag}</span></div>
                <div className="absolute top-3 right-3"><span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: 'white', color: A }}>{d.price}</span></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <p className="text-white font-bold text-base">{d.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{d.city}, Sulawesi</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white no-underline transition-all hover:scale-105 hover:shadow-lg" style={{ background: `linear-gradient(135deg, ${A} 0%, ${A2} 100%)`, boxShadow: `0 4px 16px ${A}44` }}>{t.seeAll}</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6" style={{ background: '#fafafa' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: A }}>{t.testimonialsLabel}</p>
          <h2 className="text-4xl font-black text-center mb-12" style={{ letterSpacing: '-0.02em' }}>{t.testimonialsTitle}</h2>
          <div className="relative p-8 rounded-3xl" style={{ background: 'white', border: `1px solid ${BORDER}`, boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={GOLD}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
            </div>
            <p className="text-lg leading-relaxed mb-6 min-h-[80px]" style={{ color: MUTED }}>"{testimonials[activeTesti].text}"</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={testimonials[activeTesti].avatar} alt="" className="w-12 h-12 rounded-full object-cover object-top border-2" style={{ borderColor: AL }} />
                <div><p className="text-sm font-bold">{testimonials[activeTesti].name}</p><p className="text-xs" style={{ color: SUBTLE }}>{testimonials[activeTesti].from}</p></div>
              </div>
              <div className="flex gap-2">
                {testimonials.map((_, i) => <button key={i} onClick={() => setActiveTesti(i)} className="w-2.5 h-2.5 rounded-full border-0 cursor-pointer transition-all" style={{ background: i === activeTesti ? A : BORDER, transform: i === activeTesti ? 'scale(1.3)' : 'scale(1)' }} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 px-6">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] p-14 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)`, border: `2px solid ${A}22` }}>
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 rounded-full blur-[90px] opacity-30 animate-float-slow" style={{ background: A }} />
          <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 rounded-full blur-[90px] opacity-20 animate-float-slow" style={{ background: GOLD, animationDelay: '2s' }} />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: A }}>Limited Offer</p>
            <h2 className="text-3xl lg:text-5xl font-black mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>{t.ctaTitle}</h2>
            <p className="max-w-lg mx-auto mb-8 text-sm" style={{ color: MUTED }}>{t.ctaSub}</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base no-underline transition-all hover:scale-105 hover:shadow-xl animate-pulse-glow" style={{ background: `linear-gradient(135deg, ${A} 0%, ${A2} 100%)`, boxShadow: `0 8px 32px ${A}55` }}>
              {t.ctaBtn}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-14 pt-14 pb-8 px-6" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-9 w-auto" />
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-5" style={{ color: MUTED }}>{t.footer}</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${BORDER}`, color: TEXT }} />
                <button className="px-4 py-2.5 rounded-xl text-white text-sm font-bold border-0 cursor-pointer transition-all hover:scale-105" style={{ background: A }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
            {['About', 'Company', 'Support'].map(col => (
              <div key={col}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: SUBTLE }}>{col}</p>
                <div className="flex flex-col gap-2.5">
                  {(['About', 'Company', 'Support'].indexOf(col) === 0 ? ['Our Story', 'Team', 'Blog', 'Careers'] : ['About', 'Company', 'Support'].indexOf(col) === 1 ? ['Partners', 'Guides', 'Press', 'Investors'] : ['Help', 'Contact', 'Privacy', 'Terms']).map(l => <a key={l} href="#" className="text-sm no-underline transition-colors hover:text-orange-600" style={{ color: MUTED }}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p className="text-xs" style={{ color: SUBTLE }}>© 2025 GoSulawesi. All rights reserved.</p>
            <div className="flex items-center gap-3">
              {['instagram', 'twitter', 'facebook'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-full flex items-center justify-center no-underline transition-transform hover:scale-110" style={{ background: AL, color: A }}>
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
