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

const t: Record<Lang, any> = {
  en: {
    welcome: 'Welcome Back',
    subtitle: "Let's explore hidden Sulawesi — sign in to continue",
    google: 'Continue with Google',
    or: 'Or',
    email: 'Email',
    emailHint: 'you@example.com',
    password: 'Password',
    passwordHint: '••••••••',
    remember: 'Remember me',
    forgot: 'Forgot Password?',
    demo: 'Demo accounts:',
    login: 'Login',
    loggingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    rightTag: 'Explore Indonesia',
    rightTitle: 'Discover Hidden\nGems of Sulawesi',
    rightStats: [['500+', 'Destinations'], ['50K+', 'Travelers'], ['4.9★', 'Rating']],
    rightQuote: '"Amazing hidden spots in Sulawesi!"',
    rightAuthor: '— Andi R., Jakarta',
    rightBadge: '4.9 Rated',
  },
  id: {
    welcome: 'Selamat Datang Kembali',
    subtitle: 'Mari jelajahi Sulawesi tersembunyi — masuk untuk melanjutkan',
    google: 'Lanjutkan dengan Google',
    or: 'Atau',
    email: 'Email',
    emailHint: 'anda@contoh.com',
    password: 'Kata Sandi',
    passwordHint: '••••••••',
    remember: 'Ingat saya',
    forgot: 'Lupa Kata Sandi?',
    demo: 'Akun demo:',
    login: 'Masuk',
    loggingIn: 'Sedang masuk...',
    noAccount: 'Belum punya akun?',
    signUp: 'Daftar',
    rightTag: 'Jelajahi Indonesia',
    rightTitle: 'Temukan Permata\nTersembunyi Sulawesi',
    rightStats: [['500+', 'Destinasi'], ['50K+', 'Traveler'], ['4.9★', 'Rating']],
    rightQuote: '"Tempat tersembunyi yang menakjubkan di Sulawesi!"',
    rightAuthor: '— Andi R., Jakarta',
    rightBadge: 'Rating 4.9',
  },
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

const DEMO_ACCOUNTS = import.meta.env.DEV ? [
  { email: 'admin@gosulawesi.id',   password: 'admin123',   redirect: '/admin',   role: 'Admin' },
  { email: 'tourist@gosulawesi.id', password: 'tourist123', redirect: '/tourist', role: 'Tourist' },
  { email: 'local@gosulawesi.id',   password: 'local123',   redirect: '/business', role: 'Local' },
] : []

export default function LoginPage() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(email.toLowerCase().trim(), password)
      setToken(res.token)
      setStoredUser(res.user)
      const role = res.user.role
      if (role === 'tourist' && !localStorage.getItem('gosulawesi_preferences')) {
        navigate('/quiz')
      } else {
        navigate(role === 'admin' ? '/admin' : role === 'local' ? '/business' : '/tourist')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field: string) => ({
    background: INPUT_BG,
    border: `1.5px solid ${focusedField === field ? A : BORDER}`,
    outline: 'none',
    color: TEXT,
    transition: 'border-color 0.2s',
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8" style={{ background: '#f8fafc', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden" style={{ background: 'white', boxShadow: '0 8px 60px rgba(0,0,0,0.12)', minHeight: 620 }}>

        {/* ── LEFT: Form ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10 lg:px-14">

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

          <h2 className="text-3xl font-black mb-1" style={{ color: TEXT, letterSpacing: '-0.03em' }}>{txt.welcome}</h2>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={txt.emailHint} required
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                style={inputStyle('email')}
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.password}</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={txt.passwordHint} required
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  style={inputStyle('password')}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: SUBTLE }}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded" style={{ accentColor: A }} />
                <span className="text-sm" style={{ color: MUTED }}>{txt.remember}</span>
              </label>
              <button type="button" className="text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: TEXT, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                {txt.forgot}
              </button>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-2.5 text-xs font-medium"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{error}</div>
            )}

            {/* Test accounts hint — dev only */}
            {DEMO_ACCOUNTS.length > 0 && (
            <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: AL, border: `1px solid ${A}22` }}>
              <p className="font-semibold mb-1" style={{ color: A }}>{txt.demo}</p>
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.email} type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); setError('') }}
                  className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-orange-100 transition-colors border-0 bg-transparent cursor-pointer text-left">
                  <span style={{ color: MUTED }}>{acc.email}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                    style={{ background: A, color: 'white' }}>{acc.role}</span>
                </button>
              ))}
            </div>
            )}

            {/* Login btn */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
              style={{ background: A, boxShadow: `0 4px 16px ${A}44` }}>
              {loading ? txt.loggingIn : txt.login}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: MUTED }}>
            {txt.noAccount}{' '}
            <Link to="/signup" className="font-bold no-underline" style={{ color: A }}>{txt.signUp}</Link>
          </p>
        </div>

        {/* ── RIGHT: Premium image panel ── */}
        <div className="hidden lg:flex flex-col relative m-4" style={{ width: 420, flexShrink: 0 }}>
          <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ minHeight: 560 }}>

            {/* Base image */}
            <img src="/img-local/login.webp" alt="" className="w-full h-full object-cover" />

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
            <div className="absolute top-5 left-5" style={{ maxWidth: 220 }}>
              <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                <div className="flex items-center gap-2.5">
                  <img src="/avatar/2.jpg" alt="" className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0 border-2 border-white" />
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
