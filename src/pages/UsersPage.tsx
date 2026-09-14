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

const t: Record<Lang, any> = {
  en: {
    overview: 'Overview',
    localGuides: 'Local Guides',
    settings: 'Settings',
    setting: 'Setting',
    logout: 'Logout',
    search: 'Search users…',
    users: 'Users',
    usersSub: 'Manage platform users, roles and access',
    addUser: 'Add User',
    filters: 'Filters',
    all: 'All',
    admin: 'Admin',
    tourist: 'Tourist',
    local: 'Local',
    total: 'Total Users',
    admins: 'Admins',
    tourists: 'Tourists',
    locals: 'Locals',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    phone: 'Phone',
    joined: 'Joined',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    deleteTitle: 'Delete User',
    deleteConfirm: 'Are you sure you want to delete this user? This action cannot be undone.',
    noUsers: 'No users found',
    rows: 'Showing users',
    editUser: 'Edit User',
    addUserTitle: 'Add New User',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    selectRole: 'Select Role',
    phoneNumber: 'Phone Number',
    password: 'Password',
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
    search: 'Cari pengguna…',
    users: 'Pengguna',
    usersSub: 'Kelola pengguna platform, peran, dan akses',
    addUser: 'Tambah Pengguna',
    filters: 'Filter',
    all: 'Semua',
    admin: 'Admin',
    tourist: 'Turist',
    local: 'Lokal',
    total: 'Total Pengguna',
    admins: 'Admin',
    tourists: 'Turist',
    locals: 'Lokal',
    name: 'Nama',
    email: 'Email',
    role: 'Peran',
    phone: 'Telepon',
    joined: 'Bergabung',
    actions: 'Aksi',
    edit: 'Edit',
    delete: 'Hapus',
    save: 'Simpan',
    cancel: 'Batal',
    deleteTitle: 'Hapus Pengguna',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.',
    noUsers: 'Tidak ada pengguna ditemukan',
    rows: 'Menampilkan pengguna',
    editUser: 'Edit Pengguna',
    addUserTitle: 'Tambah Pengguna Baru',
    fullName: 'Nama Lengkap',
    emailAddress: 'Alamat Email',
    selectRole: 'Pilih Peran',
    phoneNumber: 'Nomor Telepon',
    password: 'Kata Sandi',
    create: 'Buat',
    close: 'Tutup',
    error: 'Terjadi kesalahan',
  },
}

type User = {
  id: number
  name: string
  email: string
  role: 'admin' | 'tourist' | 'local'
  avatar?: string
  phone?: string
  created_at: string
}

export default function UsersPage() {
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const txt = t[lang]
  const currentUser = getStoredUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'tourist' | 'local'>('all')
  const [modal, setModal] = useState<'edit' | 'add' | 'delete' | null>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'tourist', phone: '', password: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login')
      return
    }
    loadUsers()
  }, [navigate])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await api.getUsers()
      setUsers(res.users || [])
    } catch {
      setError(txt.error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter(u => u.role === 'admin').length
    const tourists = users.filter(u => u.role === 'tourist').length
    const locals = users.filter(u => u.role === 'local').length
    return { total, admins, tourists, locals }
  }, [users])

  const openEdit = (u: User) => {
    setSelected(u)
    setForm({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', password: '' })
    setModal('edit')
    setError('')
  }

  const openAdd = () => {
    setSelected(null)
    setForm({ name: '', email: '', role: 'tourist', phone: '', password: '' })
    setModal('add')
    setError('')
  }

  const openDelete = (u: User) => {
    setSelected(u)
    setModal('delete')
    setError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (modal === 'edit' && selected) {
        const payload: any = { name: form.name, email: form.email, role: form.role, phone: form.phone }
        await api.updateUser(selected.id, payload)
      } else {
        const payload = { name: form.name, email: form.email, role: form.role as 'tourist' | 'local' | 'admin', phone: form.phone, password: form.password || 'password123' }
        await api.register(payload)
      }
      await loadUsers()
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
      await api.deleteUser(selected.id)
      await loadUsers()
      setModal(null)
    } catch (err: any) {
      setError(err.message || txt.error)
    } finally {
      setSaving(false)
    }
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, any> = {
      admin: { bg: '#eef2ff', color: A },
      tourist: { bg: '#f0fdf4', color: '#16a34a' },
      local: { bg: '#fff7ed', color: '#f97316' },
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: colors[role]?.bg || '#f3f4f6', color: colors[role]?.color || MUTED }}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  const initial = (name: string) => name?.charAt(0).toUpperCase() || 'U'

  return (
    <AdminLayout>
      <div>
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: TEXT }}>{txt.users}</h1>
              <p className="text-sm" style={{ color: MUTED }}>{txt.usersSub}</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90"
              style={{ background: A, boxShadow: `0 4px 16px ${A}44` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {txt.addUser}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: txt.total, value: stats.total, color: A, bg: AL },
              { label: txt.admins, value: stats.admins, color: A, bg: AL },
              { label: txt.tourists, value: stats.tourists, color: '#16a34a', bg: '#f0fdf4' },
              { label: txt.locals, value: stats.locals, color: '#f97316', bg: '#fff7ed' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
                <p className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-medium" style={{ color: MUTED }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: SUBTLE }}>{txt.filters}:</span>
            {(['all', 'admin', 'tourist', 'local'] as const).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer transition-all"
                style={{ background: roleFilter === r ? A : '#f3f4f6', color: roleFilter === r ? 'white' : MUTED }}>
                {txt[r]}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: shadow }}>
            <table className="w-full min-w-[640px]">
              <thead>
                <tr style={{ background: BG }}>
                  {[txt.name, txt.email, txt.role, txt.phone, txt.joined, txt.actions].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-widest" style={{ color: SUBTLE }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm" style={{ color: MUTED }}>{txt.noUsers}</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: A }}>
                          {initial(u.name)}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: TEXT }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{u.email}</td>
                    <td className="px-5 py-4">{roleBadge(u.role)}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{u.phone || '-'}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                          style={{ background: AL, color: A }}>
                          {txt.edit}
                        </button>
                        <button onClick={() => openDelete(u)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-colors hover:opacity-80"
                          style={{ background: '#fef2f2', color: '#dc2626' }}>
                          {txt.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs mt-4" style={{ color: SUBTLE }}>{txt.rows}: {filtered.length}</p>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: CARD, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black" style={{ color: TEXT }}>
                {modal === 'delete' ? txt.deleteTitle : modal === 'edit' ? txt.editUser : txt.addUserTitle}
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
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.fullName}</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.emailAddress}</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.selectRole}</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                      style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }}>
                      <option value="tourist">{txt.tourist}</option>
                      <option value="local">{txt.local}</option>
                      <option value="admin">{txt.admin}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.phoneNumber}</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                </div>
                {modal === 'add' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: SUBTLE }}>{txt.password}</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#f9fafb', border: `1px solid ${BORDER}`, color: TEXT }} />
                  </div>
                )}
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
