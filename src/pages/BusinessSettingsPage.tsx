import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, getStoredUser, setStoredUser, clearToken } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'
import BusinessLayout from '../components/BusinessLayout'
import CancellationPolicyEditor from '../components/CancellationPolicyEditor'

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
    settingsTitle: 'Settings',
    settingsSub: 'Manage your profile and business',
    profile: 'Profile',
    business: 'Business',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    role: 'Role',
    local: 'Local Business',
    businessName: 'Business Name',
    businessType: 'Business Type',
    city: 'City',
    description: 'Description',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved successfully',
    passwordDesc: 'Leave password fields empty to keep current password',
    danger: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data. This cannot be undone.',
    error: 'Something went wrong',
    passwordMismatch: 'New passwords do not match',
    passwordRequired: 'Current password is required to change password',
    uploadAvatar: 'Upload Avatar',
  },
  id: {
    settingsTitle: 'Pengaturan',
    settingsSub: 'Kelola profil dan bisnis Anda',
    profile: 'Profil',
    business: 'Bisnis',
    fullName: 'Nama Lengkap',
    email: 'Alamat Email',
    phone: 'Nomor Telepon',
    role: 'Peran',
    local: 'Bisnis Lokal',
    businessName: 'Nama Bisnis',
    businessType: 'Jenis Bisnis',
    city: 'Kota',
    description: 'Deskripsi',
    currentPassword: 'Kata Sandi Saat Ini',
    newPassword: 'Kata Sandi Baru',
    confirmPassword: 'Konfirmasi Kata Sandi',
    saveChanges: 'Simpan Perubahan',
    saving: 'Menyimpan...',
    saved: 'Berhasil disimpan',
    passwordDesc: 'Biarkan kolom kata sandi kosong untuk mempertahankan kata sandi saat ini',
    danger: 'Zona Berbahaya',
    deleteAccount: 'Hapus Akun',
    deleteAccountDesc: 'Hapus akun dan semua data secara permanen. Tindakan ini tidak dapat dibatalkan.',
    error: 'Terjadi kesalahan',
    passwordMismatch: 'Kata sandi baru tidak cocok',
    passwordRequired: 'Kata sandi saat ini diperlukan untuk mengubah kata sandi',
    uploadAvatar: 'Unggah Avatar',
  },
}

export default function BusinessSettingsPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const txt = t[lang]
  const [currentUser] = useState(() => getStoredUser())
  const [activeTab, setActiveTab] = useState<'profile' | 'business'>('profile')
  const [userForm, setUserForm] = useState(() => {
    const u = getStoredUser()
    return { name: u?.name || '', email: u?.email || '', phone: u?.phone || '', currentPassword: '', newPassword: '', confirmPassword: '' }
  })
  const [businessForm, setBusinessForm] = useState({ business_name: '', business_type: '', city: '', phone: '', description: '' })
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getBusinesses().then(r => {
      const list = r.businesses || []
      setBusinesses(list)
      if (list[0]) {
        setBusinessForm({
          business_name: list[0].business_name || '',
          business_type: list[0].business_type || '',
          city: list[0].city || '',
          phone: list[0].phone || '',
          description: list[0].description || '',
        })
      }
    }).catch(() => {})
  }, [currentUser, navigate])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const payload: any = { name: userForm.name, email: userForm.email, phone: userForm.phone }
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
    if (userForm.newPassword && userForm.newPassword !== userForm.confirmPassword) {
      setError(txt.passwordMismatch)
      return
    }
    if (userForm.newPassword && !userForm.currentPassword) {
      setError(txt.passwordRequired)
      return
    }
    setLoading(true)
    try {
      const payload: any = { name: userForm.name, email: userForm.email, phone: userForm.phone }
      if (userForm.newPassword) {
        payload.password = userForm.newPassword
        payload.current_password = userForm.currentPassword
      }
      await api.updateUser(currentUser.id, payload)
      setUserForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      setSuccess(txt.saved)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businesses[0]) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.updateBusiness(businesses[0].id, businessForm)
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

  const initial = (name: string) => name?.charAt(0).toUpperCase() || 'L'

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
    <BusinessLayout>

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
                  { id: 'business', label: txt.business, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> },
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
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white overflow-hidden" style={{ background: A }}>
                      {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : initial(currentUser?.name || 'L')}
                    </div>
                    <div>
                      <p className="text-lg font-bold" style={{ color: TEXT }}>{currentUser?.name}</p>
                      <p className="text-sm" style={{ color: MUTED }}>{currentUser?.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: AL, color: A }}>{txt.local}</span>
                    </div>
                    <label className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer" style={{ background: AL, color: A }}>
                      {loading ? txt.saving : txt.uploadAvatar}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" disabled={loading} />
                    </label>
                  </div>
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.fullName}</label>
                        <input value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.email}</label>
                        <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.phone}</label>
                        <input value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.role}</label>
                        <input value={txt.local} disabled
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f3f4f6', border: `1px solid ${BORDER}`, color: MUTED }} />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: A }}>
                        {loading ? txt.saving : txt.saveChanges}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <h3 className="text-base font-bold mb-1" style={{ color: TEXT }}>{txt.passwordDesc}</h3>
                    <form onSubmit={handlePasswordSave} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.currentPassword}</label>
                        <input type="password" value={userForm.currentPassword} onChange={e => setUserForm({ ...userForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.newPassword}</label>
                          <input type="password" value={userForm.newPassword} onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.confirmPassword}</label>
                          <input type="password" value={userForm.confirmPassword} onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                        </div>
                      </div>
                      <div className="pt-2">
                        <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: A }}>
                          {loading ? txt.saving : txt.saveChanges}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                  <h3 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{txt.business}</h3>
                  <p className="text-sm mb-6" style={{ color: MUTED }}>{txt.settingsSub}</p>
                  <form onSubmit={handleBusinessSave} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.businessName}</label>
                      <input value={businessForm.business_name} onChange={e => setBusinessForm({ ...businessForm, business_name: e.target.value })} required
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.businessType}</label>
                        <input value={businessForm.business_type} onChange={e => setBusinessForm({ ...businessForm, business_type: e.target.value })} required
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.city}</label>
                        <input value={businessForm.city} onChange={e => setBusinessForm({ ...businessForm, city: e.target.value })} required
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.phone}</label>
                      <input value={businessForm.phone} onChange={e => setBusinessForm({ ...businessForm, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.description}</label>
                      <textarea value={businessForm.description} onChange={e => setBusinessForm({ ...businessForm, description: e.target.value })} rows={4}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: A }}>
                        {loading ? txt.saving : txt.saveChanges}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="mt-6 rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <h3 className="text-base font-bold mb-1" style={{ color: '#dc2626' }}>{txt.danger}</h3>
                <p className="text-sm mb-4" style={{ color: MUTED }}>{txt.deleteAccountDesc}</p>
                <button onClick={handleDeleteAccount} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60" style={{ background: '#dc2626' }}>{loading ? '...' : txt.deleteAccount}</button>
              </div>

              {businesses[0]?.id && (
                <div className="mt-6">
                  <CancellationPolicyEditor businessId={businesses[0].id} />
                </div>
              )}
            </div>
          </div>
        </div>

    </BusinessLayout>
  )
}
