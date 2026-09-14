import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, type Lang } from '../hooks/useLang'

const A = '#f97316'
const TEXT = '#111827'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'

function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const s = { width: size, height: size, stroke: 'currentColor', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const icons: Record<string, ReactNode> = {
    adventure: <svg viewBox="0 0 24 24" {...s}><path d="M12 22s-7-7.75-7-13c0-3.87 3.13-7 7-7s7 3.13 7 7c0 5.25-7 13-7 13z"/><circle cx="12" cy="9" r="2.5"/><path d="M7 16l3-2 2 3 3-5"/></svg>,
    culture: <svg viewBox="0 0 24 24" {...s}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M8 10s1.5 2 4 2 4-2 4-2"/><path d="M9 14h.01M15 14h.01"/></svg>,
    nature: <svg viewBox="0 0 24 24" {...s}><path d="M12 22c0-5 4-9 4-9s-4-3-4-9c0-5-4-3-4-3s4 3 4 9c0 5-4 9-4 9z"/><path d="M12 22c0-4-3-7-3-7s3-2 3-7c0-4 3-2 3-2s-3 2-3 7c0 5 3 7 3 7z"/></svg>,
    culinary: <svg viewBox="0 0 24 24" {...s}><path d="M2 12h20"/><path d="M6 12v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-6"/><path d="M9 5h6v7H9z"/></svg>,
    budget: <svg viewBox="0 0 24 24" {...s}><rect x="3" y="7" width="18" height="12" rx="3"/><path d="M7 12h.01M12 12h.01M17 12h.01"/></svg>,
    standard: <svg viewBox="0 0 24 24" {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    premium: <svg viewBox="0 0 24 24" {...s}><path d="M6 3h12l3 7-9 11-9-11z"/><path d="M12 22V10"/></svg>,
    luxury: <svg viewBox="0 0 24 24" {...s}><path d="M3 7h18l-2 11H5L3 7z"/><path d="M8 7l2-4h4l2 4"/></svg>,
    solo: <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>,
    couple: <svg viewBox="0 0 24 24" {...s}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    family: <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    group: <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    english: <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>,
    bahasa: <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 12l6-6"/></svg>,
    both: <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    local: <svg viewBox="0 0 24 24" {...s}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    sparkle: <svg viewBox="0 0 24 24" {...s}><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/></svg>,
  }
  return icons[name] || icons.sparkle
}

const getQuestions = (txt: any) => [
  {
    id: 'style',
    question: txt.styleQuestion,
    subtitle: txt.styleSubtitle,
    options: [
      { id: 'adventure', label: txt.adventure, desc: txt.adventureDesc, icon: 'adventure' },
      { id: 'culture',   label: txt.culture,  desc: txt.cultureDesc,  icon: 'culture' },
      { id: 'nature',    label: txt.nature,   desc: txt.natureDesc,   icon: 'nature' },
      { id: 'culinary',  label: txt.culinary, desc: txt.culinaryDesc, icon: 'culinary' },
    ],
  },
  {
    id: 'budget',
    question: txt.budgetQuestion,
    subtitle: txt.budgetSubtitle,
    options: [
      { id: 'budget',   label: txt.budget,   desc: txt.budgetDesc,   icon: 'budget' },
      { id: 'standard', label: txt.standard, desc: txt.standardDesc, icon: 'standard' },
      { id: 'premium',  label: txt.premium,  desc: txt.premiumDesc,  icon: 'premium' },
      { id: 'luxury',   label: txt.luxury,   desc: txt.luxuryDesc,   icon: 'luxury' },
    ],
  },
  {
    id: 'group',
    question: txt.groupQuestion,
    subtitle: txt.groupSubtitle,
    options: [
      { id: 'solo',   label: txt.solo,   desc: txt.soloDesc,   icon: 'solo' },
      { id: 'couple', label: txt.couple, desc: txt.coupleDesc, icon: 'couple' },
      { id: 'family', label: txt.family, desc: txt.familyDesc, icon: 'family' },
      { id: 'group',  label: txt.friendGroup, desc: txt.friendGroupDesc, icon: 'group' },
    ],
  },
  {
    id: 'language',
    question: txt.languageQuestion,
    subtitle: txt.languageSubtitle,
    options: [
      { id: 'english', label: txt.english, desc: txt.englishDesc, icon: 'english' },
      { id: 'bahasa',  label: txt.bahasa,  desc: txt.bahasaDesc,  icon: 'bahasa' },
      { id: 'both',    label: txt.bilingual, desc: txt.bilingualDesc, icon: 'both' },
      { id: 'local',   label: txt.localLang, desc: txt.localLangDesc, icon: 'local' },
    ],
  },
]

const t: Record<Lang, any> = {
  en: {
    step: 'Step',
    of: 'of',
    skip: 'Skip for now →',
    back: '← Back',
    next: 'Next →',
    createProfile: 'Create My Profile',
    profileReady: 'Your Profile is Ready!',
    welcome: 'Welcome, {style}. We\'ve built your personalized Sulawesi journey.',
    travelProfile: 'YOUR TRAVEL PROFILE',
    startExploring: 'Start Exploring →',
    styleQuestion: 'What kind of traveler are you?',
    styleSubtitle: 'This helps us find experiences made just for you',
    adventure: 'Adventure Seeker', adventureDesc: 'Hiking, diving, off-road exploration',
    culture: 'Culture Explorer', cultureDesc: 'Ceremonies, traditions, local wisdom',
    nature: 'Nature Lover', natureDesc: 'Lakes, waterfalls, forests, wildlife',
    culinary: 'Food Enthusiast', culinaryDesc: 'Local markets, cooking, street food',
    budgetQuestion: "What's your travel budget?",
    budgetSubtitle: 'Per person, per experience',
    budget: 'Budget Traveler', budgetDesc: 'Under Rp 500.000 per experience',
    standard: 'Standard', standardDesc: 'Rp 500rb – Rp 1.5jt per experience',
    premium: 'Premium', premiumDesc: 'Rp 1.5jt – Rp 5jt per experience',
    luxury: 'Luxury', luxuryDesc: 'Above Rp 5jt — the very best',
    groupQuestion: 'Who are you exploring with?',
    groupSubtitle: 'So we can tailor the experience perfectly',
    solo: 'Solo Explorer', soloDesc: 'Full freedom, full adventure',
    couple: 'Couple', coupleDesc: 'Romantic and intimate discoveries',
    family: 'Family', familyDesc: 'Kid-friendly, safe, and memorable',
    friendGroup: 'Friend Group', friendGroupDesc: 'The more, the merrier',
    languageQuestion: 'Which language do you prefer?',
    languageSubtitle: 'Your guide will communicate in your chosen language',
    english: 'English', englishDesc: 'Full English-speaking guide',
    bahasa: 'Bahasa Indonesia', bahasaDesc: 'Panduan berbahasa Indonesia',
    bilingual: 'Bilingual', bilingualDesc: 'English + Bahasa — no problem at all',
    localLang: 'Local Language', localLangDesc: 'Full immersion with interpreter',
    styleLabels: { adventure: 'Adventure Seeker', culture: 'Culture Explorer', nature: 'Nature Lover', culinary: 'Food Enthusiast' },
  },
  id: {
    step: 'Langkah',
    of: 'dari',
    skip: 'Lewati dulu →',
    back: '← Kembali',
    next: 'Lanjut →',
    createProfile: 'Buat Profil Saya',
    profileReady: 'Profil Anda Siap!',
    welcome: 'Selamat datang, {style}. Kami telah membangun perjalanan Sulawesi yang dipersonalisasi untuk Anda.',
    travelProfile: 'PROFIL PERJALANAN ANDA',
    startExploring: 'Mulai Jelajahi →',
    styleQuestion: 'Anda traveler seperti apa?',
    styleSubtitle: 'Ini membantu kami menemukan pengalaman yang dibuat khusus untuk Anda',
    adventure: 'Pencari Petualangan', adventureDesc: 'Hiking, menyelam, eksplorasi off-road',
    culture: 'Penjelajah Budaya', cultureDesc: 'Upacara, tradisi, kearifan lokal',
    nature: 'Pencinta Alam', natureDesc: 'Danau, air terjun, hutan, satwa liar',
    culinary: 'Pencinta Kuliner', culinaryDesc: 'Pasar lokal, memasak, makanan jalanan',
    budgetQuestion: 'Berapa anggaran perjalanan Anda?',
    budgetSubtitle: 'Per orang, per pengalaman',
    budget: 'Traveler Hemat', budgetDesc: 'Di bawah Rp 500.000 per pengalaman',
    standard: 'Standar', standardDesc: 'Rp 500rb – Rp 1.5jt per pengalaman',
    premium: 'Premium', premiumDesc: 'Rp 1.5jt – Rp 5jt per pengalaman',
    luxury: 'Mewah', luxuryDesc: 'Di atas Rp 5jt — yang terbaik',
    groupQuestion: 'Anda menjelajah bersama siapa?',
    groupSubtitle: 'Agar kami bisa menyesuaikan pengalaman dengan sempurna',
    solo: 'Penjelajah Solo', soloDesc: 'Kebebasan penuh, petualangan penuh',
    couple: 'Pasangan', coupleDesc: 'Temuan romantis dan intim',
    family: 'Keluarga', familyDesc: 'Aman, ramah anak, dan berkesan',
    friendGroup: 'Grup Teman', friendGroupDesc: 'Semakin banyak, semakin meriah',
    languageQuestion: 'Bahasa apa yang Anda preferensikan?',
    languageSubtitle: 'Pemandu Anda akan berkomunikasi dalam bahasa yang Anda pilih',
    english: 'Bahasa Inggris', englishDesc: 'Pemandu full bahasa Inggris',
    bahasa: 'Bahasa Indonesia', bahasaDesc: 'Panduan berbahasa Indonesia',
    bilingual: 'Dwi Bahasa', bilingualDesc: 'Inggris + Indonesia — tidak masalah',
    localLang: 'Bahasa Daerah', localLangDesc: 'Imersi penuh dengan penerjemah',
    styleLabels: { adventure: 'Pencari Petualangan', culture: 'Penjelajah Budaya', nature: 'Pencinta Alam', culinary: 'Pencinta Kuliner' },
  },
}

export default function OnboardingQuiz() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const questions = getQuestions(txt)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const q = questions[step]
  const selected = answers[q?.id]

  const handleSelect = (optId: string) => setAnswers(prev => ({ ...prev, [q.id]: optId }))

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(s => s + 1)
    } else {
      localStorage.setItem('gosulawesi_preferences', JSON.stringify({ ...answers, lang }))
      setDone(true)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('gosulawesi_preferences', JSON.stringify({ skipped: true, lang }))
    navigate('/tourist')
  }

  const styleLabel = (txt.styleLabels[answers.style as keyof typeof txt.styleLabels] ?? 'Explorer') as string

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)', fontFamily: 'Poppins, Inter, sans-serif' }}>
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
            style={{ background: A, color: 'white' }}>
            <Icon name="sparkle" size={48} />
          </div>
          <h1 className="text-4xl font-black mb-3" style={{ color: TEXT, letterSpacing: '-0.03em' }}>
            {txt.profileReady}
          </h1>
          <p className="text-base mb-8" style={{ color: MUTED }}>
            {txt.welcome.replace('{style}', styleLabel)}
          </p>

          <div className="rounded-3xl p-6 mb-8 text-left" style={{ background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: A }}>{txt.travelProfile}</p>
            <div className="grid grid-cols-2 gap-3">
              {questions.map(q2 => {
                const opt = q2.options.find(o => o.id === answers[q2.id])
                if (!opt) return null
                return (
                  <div key={q2.id} className="p-4 rounded-2xl" style={{ background: '#fff7ed' }}>
                    <span className="block mb-1" style={{ color: A }}><Icon name={opt.icon} size={28} /></span>
                    <p className="text-xs font-semibold" style={{ color: MUTED }}>{q2.id.charAt(0).toUpperCase() + q2.id.slice(1)}</p>
                    <p className="text-sm font-bold" style={{ color: TEXT }}>{opt.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <button onClick={() => navigate('/tourist')}
            className="w-full py-4 rounded-2xl text-white font-bold text-base cursor-pointer border-0"
            style={{ background: A, boxShadow: `0 8px 24px ${A}55` }}>
            {txt.startExploring}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 70%)', fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="max-w-2xl w-full">

        {/* Logo */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <img src="/logo/logo-64.png" alt="GoSulawesi" className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#fff7ed' }}>
              {(['en', 'id'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all"
                  style={{ background: lang === l ? A : 'transparent', color: lang === l ? 'white' : MUTED }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={handleSkip} className="text-sm cursor-pointer border-0 bg-transparent" style={{ color: MUTED }}>
              {txt.skip}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {questions.map((_, i) => (
            <div key={i} className="h-2 rounded-full flex-1 transition-all duration-500"
              style={{ background: i < step ? A : i === step ? A : BORDER, opacity: i <= step ? 1 : 0.3 }} />
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: A }}>
          {txt.step} {step + 1} {txt.of} {questions.length}
        </p>
        <h1 className="text-3xl font-black mb-2" style={{ color: TEXT, letterSpacing: '-0.02em' }}>
          {q.question}
        </h1>
        <p className="text-sm mb-8" style={{ color: MUTED }}>{q.subtitle}</p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {q.options.map(opt => (
            <button key={opt.id} onClick={() => handleSelect(opt.id)}
              className="p-5 rounded-2xl text-left cursor-pointer transition-all duration-200"
              style={{
                background: selected === opt.id ? '#fff7ed' : 'white',
                border: `2px solid ${selected === opt.id ? A : BORDER}`,
                boxShadow: selected === opt.id ? `0 4px 20px ${A}22` : '0 1px 4px rgba(0,0,0,0.06)',
                outline: 'none',
              }}>
              <span className="block mb-2" style={{ color: A }}><Icon name={opt.icon} size={28} /></span>
              <p className="text-sm font-bold mb-1" style={{ color: TEXT }}>{opt.label}</p>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{opt.desc}</p>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-6 py-3.5 rounded-xl text-sm font-semibold cursor-pointer border"
              style={{ borderColor: BORDER, color: MUTED, background: 'white', outline: 'none' }}>
              {txt.back}
            </button>
          )}
          <button onClick={handleNext} disabled={!selected}
            className="flex-1 py-3.5 rounded-xl text-sm font-bold border-0 transition-all duration-200"
            style={{
              background: selected ? A : '#e5e7eb',
              color: selected ? 'white' : MUTED,
              cursor: selected ? 'pointer' : 'not-allowed',
              boxShadow: selected ? `0 4px 16px ${A}44` : 'none',
              outline: 'none',
            }}>
            {step < questions.length - 1 ? txt.next : txt.createProfile}
          </button>
        </div>
      </div>
    </div>
  )
}
