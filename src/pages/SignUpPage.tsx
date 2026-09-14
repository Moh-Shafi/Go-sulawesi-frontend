import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, setToken, setStoredUser } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

const A  = '#f97316'
const AL = '#fff7ed'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const INPUT_BG = '#f9fafb'

type Role = 'tourist' | 'local' | null

const BUSINESS_TYPES = [
  'Restaurant & Cafe',
  'Hotel & Homestay',
  'Tour Guide',
  'Dive & Water Sports',
  'Craft & Souvenir Shop',
  'Transportation',
  'Cultural Experience',
  'Other',
]

const CITIES = [
  'Makassar', 'Manado', 'Kendari', 'Palu', 'Gorontalo',
  'Bitung', 'Tomohon', 'Palopo', 'Parepare', 'Luwuk',
  'Tondano', 'Kotamobagu', 'Ternate', 'Other',
]

const t: Record<Lang, any> = {
  en: {
    title: 'Create Account',
    subtitle: 'Join thousands of travelers & local guides',
    google: 'Sign up with Google',
    or: 'Or',
    fullName: 'Full Name',
    fullNameHint: 'Your full name',
    email: 'Email',
    emailHint: 'you@example.com',
    password: 'Password',
    confirm: 'Confirm',
    accountType: 'Account Type',
    tourist: 'Tourist',
    touristDesc: 'I\'m visiting Sulawesi to explore',
    local: 'Local Indonesian',
    localDesc: 'I live here & offer services',
    businessDetails: 'Business Details',
    businessName: 'Business Name *',
    businessType: 'Business Type *',
    city: 'City *',
    phone: 'Phone Number +62...',
    terms: 'I agree to the',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    create: 'Create Account',
    creating: 'Creating account...',
    hasAccount: 'Already have an account?',
    signIn: 'Sign In',
    rightTag: 'Join GoSulawesi',
    rightTitle: 'Your Journey\nStarts Here',
    rightStats: [['500+', 'Destinations'], ['50K+', 'Travelers'], ['4.9★', 'Rating']],
    rightQuote: '"Best travel platform for locals!"',
    rightAuthor: '— Sari W., Makassar',
    rightBadge: '4.9 Rated',
  },
  id: {
    title: 'Buat Akun',
    subtitle: 'Bergabung dengan ribuan traveler & pemandu lokal',
    google: 'Daftar dengan Google',
    or: 'Atau',
    fullName: 'Nama Lengkap',
    fullNameHint: 'Nama lengkap Anda',
    email: 'Email',
    emailHint: 'anda@contoh.com',
    password: 'Kata Sandi',
    confirm: 'Konfirmasi',
    accountType: 'Jenis Akun',
    tourist: 'Turist',
    touristDesc: 'Saya berkunjung ke Sulawesi untuk menjelajah',
    local: 'Warga Lokal Indonesia',
    localDesc: 'Saya tinggal di sini & menawarkan layanan',
    businessDetails: 'Detail Bisnis',
    businessName: 'Nama Bisnis *',
    businessType: 'Jenis Bisnis *',
    city: 'Kota *',
    phone: 'Nomor Telepon +62...',
    terms: 'Saya menyetujui',
    termsLink: 'Ketentuan Layanan',
    and: 'dan',
    privacyLink: 'Kebijakan Privasi',
    create: 'Buat Akun',
    creating: 'Membuat akun...',
    hasAccount: 'Sudah punya akun?',
    signIn: 'Masuk',
    rightTag: 'Bergabung dengan GoSulawesi',
    rightTitle: 'Perjalanan Anda\nDimulai di Sini',
    rightStats: [['500+', 'Destinasi'], ['50K+', 'Traveler'], ['4.9★', 'Rating']],
    rightQuote: '"Platform perjalanan terbaik untuk penduduk lokal!"',
    rightAuthor: '— Sari W., Makassar',
    rightBadge: 'Rating 4.9',
  },
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [role, setRole] = useState<Role>(null)
  const [agreed, setAgreed] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showCPw, setShowCPw] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [biz, setBiz] = useState({
    businessName: '',
    businessType: '',
    city: '',
    phone: '',
    description: '',
    nib: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const setBizField = (k: keyof typeof biz) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setBiz(prev => ({ ...prev, [k]: e.target.value }))

  const selectStyle = (field: string) => ({
    background: INPUT_BG,
    border: `1.5px solid ${focusedField === field ? A : BORDER}`,
    outline: 'none',
    color: biz[field as keyof typeof biz] ? TEXT : SUBTLE,
    transition: 'border-color 0.2s',
  })

  const inputStyle = (field: string) => ({
    background: INPUT_BG,
    border: `1.5px solid ${focusedField === field ? A : BORDER}`,
    outline: 'none',
    color: TEXT,
    transition: 'border-color 0.2s',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const bizComplete = role !== 'local' || (
    biz.businessName && biz.businessType && biz.city && biz.phone
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role || !bizComplete) return
    setError('')
    setLoading(true)
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      }
      if (role === 'local') {
        payload.business = {
          businessName: biz.businessName,
          businessType: biz.businessType,
          city: biz.city,
          phone: biz.phone,
          description: biz.description,
          nib: biz.nib,
        }
      }
      const res = await api.register(payload)
      setToken(res.token)
      setStoredUser(res.user)
      navigate(role === 'tourist' ? '/tourist' : '/business')
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const roles: { id: Role; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'tourist',
      title: txt.tourist,
      desc: txt.touristDesc,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      id: 'local',
      title: txt.local,
      desc: txt.localDesc,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex items-start justify-center p-4 lg:p-8 py-8" style={{ background: '#f8fafc', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="w-full max-w-6xl flex rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 8px 60px rgba(0,0,0,0.12)' }}>

        {/* ── LEFT: Form ── */}
        <div className="flex-1 flex flex-col justify-start px-10 py-10 lg:px-14 overflow-y-auto">

          {/* Logo + language */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-9 w-auto" />
            </Link>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: AL }}>
              {['en', 'id'].map(l => (
                <button key={l} onClick={() => setLang(l as Lang)}
                  className="px-3 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                  style={{ background: lang === l ? 'white' : 'transparent', color: lang === l ? A : MUTED, boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-3xl font-black mb-1" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{txt.title}</h2>
          <p className="text-sm mb-7" style={{ color: MUTED }}>{txt.subtitle}</p>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium mb-3 transition-all hover:bg-gray-50"
            style={{ border: `1.5px solid ${BORDER}`, color: TEXT }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {txt.google}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: BORDER }} />
            <span className="text-xs font-medium px-2" style={{ color: SUBTLE }}>{txt.or}</span>
            <div className="flex-1 h-px" style={{ background: BORDER }} />
          </div>

        <div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.fullName}</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder={txt.fullNameHint} required
                onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                style={inputStyle('name')} className="w-full px-4 py-3 rounded-xl text-sm" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.email}</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder={txt.emailHint} required
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                style={inputStyle('email')} className="w-full px-4 py-3 rounded-xl text-sm" />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.password}</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder={txt.passwordHint} required
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    style={inputStyle('password')} className="w-full px-4 py-3 pr-10 rounded-xl text-sm" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: SUBTLE, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <EyeToggle show={showPw} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.confirm}</label>
                <div className="relative">
                  <input type={showCPw ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder={txt.passwordHint} required
                    onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                    style={inputStyle('confirm')} className="w-full px-4 py-3 pr-10 rounded-xl text-sm" />
                  <button type="button" onClick={() => setShowCPw(!showCPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: SUBTLE, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <EyeToggle show={showCPw} />
                  </button>
                </div>
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: SUBTLE }}>{txt.accountType}</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(r => {
                  const selected = role === r.id
                  return (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
                      style={{
                        background: selected ? AL : INPUT_BG,
                        border: `1.5px solid ${selected ? A : BORDER}`,
                      }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: selected ? A : BORDER, color: selected ? 'white' : SUBTLE }}>
                        {r.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: selected ? A : TEXT }}>{r.title}</div>
                        <div className="text-xs" style={{ color: SUBTLE }}>{r.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Local Business Fields */}
            {role === 'local' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: BORDER }} />
                  <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: A }}>{txt.businessDetails}</span>
                  <div className="flex-1 h-px" style={{ background: BORDER }} />
                </div>
                <input type="text" value={biz.businessName} onChange={setBizField('businessName')}
                  placeholder={txt.businessName} required
                  onFocus={() => setFocusedField('businessName')} onBlur={() => setFocusedField(null)}
                  style={inputStyle('businessName')} className="w-full px-4 py-3 rounded-xl text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={biz.businessType} onChange={setBizField('businessType')} required
                    onFocus={() => setFocusedField('businessType')} onBlur={() => setFocusedField(null)}
                    style={selectStyle('businessType')} className="w-full px-4 py-3 rounded-xl text-sm appearance-none">
                    <option value="" disabled>{txt.businessType}</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={biz.city} onChange={setBizField('city')} required
                    onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)}
                    style={selectStyle('city')} className="w-full px-4 py-3 rounded-xl text-sm appearance-none">
                    <option value="" disabled>{txt.city}</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input type="tel" value={biz.phone} onChange={setBizField('phone')}
                  placeholder={txt.phone} required
                  onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                  style={inputStyle('phone')} className="w-full px-4 py-3 rounded-xl text-sm" />
              </div>
            )}

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required
                className="w-4 h-4 mt-0.5 rounded flex-shrink-0" style={{ accentColor: A }} />
              <span className="text-sm leading-relaxed" style={{ color: MUTED }}>
                {txt.terms}{' '}
                <span className="font-semibold cursor-pointer" style={{ color: A }}>{txt.termsLink}</span>
                {' '}{txt.and}{' '}
                <span className="font-semibold cursor-pointer" style={{ color: A }}>{txt.privacyLink}</span>
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="rounded-lg px-4 py-2.5 text-xs font-medium"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{error}</div>
            )}

            {/* Submit */}
            <button type="submit" disabled={!role || !agreed || loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200"
              style={{
                background: role && agreed ? A : '#e5e7eb',
                boxShadow: role && agreed ? `0 4px 16px ${A}44` : 'none',
                color: role && agreed ? '#fff' : SUBTLE,
                cursor: role && agreed && !loading ? 'pointer' : 'not-allowed',
              }}>
              {loading ? txt.creating : txt.create}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: MUTED }}>
            {txt.hasAccount}{' '}
            <Link to="/login" className="font-bold no-underline" style={{ color: A }}>{txt.signIn}</Link>
          </p>
        </div>
        </div>

        {/* ── RIGHT: Premium image panel ── */}
        <div className="hidden lg:flex flex-col relative m-4" style={{ width: 460, flexShrink: 0 }}>
          <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ minHeight: 600 }}>

            {/* Base image — zoomed in slightly */}
            <img src="/img-local/login.webp" alt="" className="w-full h-full object-cover"
              style={{ transform: 'scale(1.03)', transformOrigin: 'center center' }} />

            {/* Layered gradient: orange brand top, dark bottom */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(160deg, rgba(249,115,22,0.55) 0%, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.75) 100%)'
            }} />

            {/* Rating badge — top right */}
            <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: A, color: 'white', boxShadow: `0 4px 16px ${A}66` }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {txt.rightBadge}
            </div>

            {/* Testimonial card — top left */}
            <div className="absolute top-5 left-5" style={{ maxWidth: 210 }}>
              <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                <div className="flex items-center gap-2.5">
                  <img src="/avatar/3.jpg" alt="" className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0 border-2 border-white" />
                  <div>
                    <p className="text-white text-xs font-semibold leading-snug">{txt.rightQuote}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{txt.rightAuthor}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(249,115,22,0.9)' }}>{txt.rightTag}</p>
              <h3 className="text-white text-2xl font-black leading-tight mb-4" style={{ letterSpacing: '-0.03em' }}>
                {txt.rightTitle.split('\n').map((line: string, i: number) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </h3>

              {/* Stats row */}
              <div className="flex gap-2.5">
                {txt.rightStats.map(([v, l]: [string, string]) => (
                  <div key={l} className="flex-1 text-center py-2.5 px-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <p className="text-white font-black text-base leading-none">{v}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

function EyeToggle({ show }: { show: boolean }) {
  return show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
