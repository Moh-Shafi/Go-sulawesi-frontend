import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getStoredUser, setStoredUser, clearToken } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import TouristLayout from '../components/TouristLayout'

const A = '#0d9488'
const AL = '#f0fdfa'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'
const CARD = '#ffffff'
const shadow = '0 1px 4px rgba(0,0,0,0.07)'

const t: Record<Lang, any> = {
  en: {
    discover: 'Discover',
    myTrips: 'My Trips',
    savedPlaces: 'Saved Places',
    bookings: 'Bookings',
    reviews: 'Reviews',
    following: 'Following',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    settingsTitle: 'Settings',
    settingsSub: 'Manage your profile, account preferences and language',
    profile: 'Profile',
    account: 'Account',
    appearance: 'Appearance',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    role: 'Role',
    tourist: 'Tourist',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved successfully',
    language: 'Language',
    languageDesc: 'Choose your preferred dashboard language',
    passwordDesc: 'Leave password fields empty to keep current password',
    danger: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data. This cannot be undone.',
    error: 'Something went wrong',
    passwordMismatch: 'New passwords do not match',
    passwordRequired: 'Current password is required to change password',
    uploadAvatar: 'Upload Avatar',
    searchPlaceholder: 'Search destinations, guides, experiences…',
  },
  id: {
    discover: 'Temukan',
    myTrips: 'Perjalanan Saya',
    savedPlaces: 'Tempat Tersimpan',
    bookings: 'Pemesanan',
    reviews: 'Ulasan',
    following: 'Diikuti',
    settings: 'Pengaturan',
    setting: 'Pengaturan',
    logout: 'Keluar',
    settingsTitle: 'Pengaturan',
    settingsSub: 'Kelola profil, preferensi akun, dan bahasa Anda',
    profile: 'Profil',
    account: 'Akun',
    appearance: 'Tampilan',
    fullName: 'Nama Lengkap',
    email: 'Alamat Email',
    phone: 'Nomor Telepon',
    role: 'Peran',
    tourist: 'Turis',
    currentPassword: 'Kata Sandi Saat Ini',
    newPassword: 'Kata Sandi Baru',
    confirmPassword: 'Konfirmasi Kata Sandi',
    saveChanges: 'Simpan Perubahan',
    saving: 'Menyimpan...',
    saved: 'Berhasil disimpan',
    language: 'Bahasa',
    languageDesc: 'Pilih bahasa dasbor pilihan Anda',
    passwordDesc: 'Biarkan kolom kata sandi kosong untuk mempertahankan kata sandi saat ini',
    danger: 'Zona Berbahaya',
    deleteAccount: 'Hapus Akun',
    deleteAccountDesc: 'Hapus akun dan semua data secara permanen. Tindakan ini tidak dapat dibatalkan.',
    error: 'Terjadi kesalahan',
    passwordMismatch: 'Kata sandi baru tidak cocok',
    passwordRequired: 'Kata sandi saat ini diperlukan untuk mengubah kata sandi',
    uploadAvatar: 'Unggah Avatar',
    searchPlaceholder: 'Cari destinasi, pemandu, pengalaman…',
  },
}

export default function TouristSettingsPage() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const [currentUser] = useState(() => getStoredUser())
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'appearance'>('profile')
  const [form, setForm] = useState(() => {
    const u = getStoredUser()
    return { name: u?.name || '', email: u?.email || '', phone: u?.phone || '', currentPassword: '', newPassword: '', confirmPassword: '' }
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const payload: any = { name: form.name, email: form.email, phone: form.phone }
      await api.updateUser(currentUser.id, payload)
      setStoredUser({ ...currentUser, ...payload })
      setSuccess(txt.saved)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError(txt.passwordMismatch)
      return
    }
    if (form.newPassword && !form.currentPassword) {
      setError(txt.passwordRequired)
      return
    }
    setLoading(true)
    try {
      const payload: any = { name: form.name, email: form.email, phone: form.phone }
      if (form.newPassword) {
        payload.password = form.newPassword
        payload.current_password = form.currentPassword
      }
      await api.updateUser(currentUser.id, payload)
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      setSuccess(txt.saved)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm(txt.deleteAccountDesc)) return
    setLoading(true)
    try {
      await api.deleteUser(currentUser.id)
      clearToken()
      localStorage.removeItem('gosulawesi_user')
      navigate('/login')
    } catch (err: any) {
      setError(err.message || txt.error)
      setLoading(false)
    }
  }

  const initial = (name: string) => name?.charAt(0).toUpperCase() || 'T'

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.uploadAvatar(currentUser.id, file)
      setAvatarUrl(res.avatar)
      setStoredUser({ ...currentUser, avatar: res.avatar })
      setSuccess(txt.saved)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <TouristLayout>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.settingsTitle}</h1>
          <p className="text-sm" style={{ color: MUTED }}>{txt.settingsSub}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="rounded-2xl p-2" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
              {[
                { id: 'profile', label: txt.profile, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { id: 'account', label: txt.account, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
                { id: 'appearance', label: txt.appearance, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
              ].map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setError(''); setSuccess('') }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border-0 cursor-pointer transition-all"
                  style={{ background: activeTab === tab.id ? AL : 'transparent', color: activeTab === tab.id ? A : MUTED }}>
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
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

            {activeTab === 'profile' && (
              <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white overflow-hidden flex-shrink-0" style={{ background: A }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      : initial(currentUser?.name || 'T')}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold" style={{ color: TEXT }}>{currentUser?.name}</p>
                    <p className="text-sm" style={{ color: MUTED }}>{currentUser?.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: AL, color: A }}>{txt.tourist}</span>
                  </div>
                  <label className="px-4 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer" style={{ background: AL, color: A }}>
                    {loading ? txt.saving : txt.uploadAvatar}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" disabled={loading} />
                  </label>
                </div>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.fullName}</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.email}</label>
                      <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.phone}</label>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.role}</label>
                      <input value={txt.tourist} disabled
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f3f4f6', border: `1px solid ${BORDER}`, color: MUTED }} />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: A }}>
                      {loading ? txt.saving : txt.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{txt.account}</h3>
                <p className="text-sm mb-6" style={{ color: MUTED }}>{txt.passwordDesc}</p>
                <form onSubmit={handlePasswordSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.currentPassword}</label>
                    <input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.newPassword}</label>
                      <input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.confirmPassword}</label>
                      <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: A }}>
                      {loading ? txt.saving : txt.saveChanges}
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <h3 className="text-base font-bold mb-1" style={{ color: '#dc2626' }}>{txt.danger}</h3>
                  <p className="text-sm mb-4" style={{ color: MUTED }}>{txt.deleteAccountDesc}</p>
                  <button onClick={handleDeleteAccount} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: '#dc2626' }}>{loading ? '...' : txt.deleteAccount}</button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{txt.language}</h3>
                <p className="text-sm mb-6" style={{ color: MUTED }}>{txt.languageDesc}</p>
                <div className="flex gap-3">
                  {(['en', 'id'] as const).map(l => (
                    <button key={l} onClick={() => setLang(l)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
                      style={{ background: lang === l ? A : '#f3f4f6', color: lang === l ? 'white' : MUTED, boxShadow: lang === l ? `0 4px 16px ${A}44` : 'none' }}>
                      {l === 'en' ? 'English' : 'Bahasa Indonesia'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </TouristLayout>
  )
}
