import { useState, useEffect } from 'react'
import { api, type CancellationPolicy } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

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
    title: 'Cancellation Policy',
    subtitle: 'Set rules for booking cancellations and refunds',
    deadline: 'Cancellation Deadline (hours before booking)',
    deadlineHint: 'If cancelled before this many hours, full refund applies',
    refundBefore: 'Refund % (before deadline)',
    refundAfter: 'Refund % (after deadline)',
    requiresApproval: 'Require my approval for cancellations',
    requiresApprovalHint: 'If off, cancellations are auto-approved based on refund rules',
    policyNotes: 'Additional Notes (shown to customers)',
    policyNotesHint: 'E.g. "No refunds for same-day cancellations"',
    save: 'Save Policy',
    saving: 'Saving...',
    saved: 'Policy saved successfully',
    error: 'Could not save policy',
    preview: 'Policy Preview',
    previewBefore: 'Cancel 72+ hours before',
    previewAfter: 'Cancel within 72 hours',
    refund: 'refund',
    noRefund: 'No refund',
    autoApprove: 'Auto-approved',
    manualApprove: 'Requires approval',
  },
  id: {
    title: 'Kebijakan Pembatalan',
    subtitle: 'Atur aturan untuk pembatalan dan pengembalian dana',
    deadline: 'Batas Pembatalan (jam sebelum booking)',
    deadlineHint: 'Jika dibatalkan sebelum jam ini, pengembalian penuh berlaku',
    refundBefore: 'Pengembalian % (sebelum batas)',
    refundAfter: 'Pengembalian % (setelah batas)',
    requiresApproval: 'Memerlukan persetujuan saya untuk pembatalan',
    requiresApprovalHint: 'Jika mati, pembatalan disetujui otomatis berdasarkan aturan',
    policyNotes: 'Catatan Tambahan (ditampilkan ke pelanggan)',
    policyNotesHint: 'Mis. "Tidak ada pengembalian untuk pembatalan hari yang sama"',
    save: 'Simpan Kebijakan',
    saving: 'Menyimpan...',
    saved: 'Kebijakan berhasil disimpan',
    error: 'Tidak dapat menyimpan kebijakan',
    preview: 'Pratinjau Kebijakan',
    previewBefore: 'Batalkan 72+ jam sebelumnya',
    previewAfter: 'Batalkan dalam 72 jam',
    refund: 'pengembalian',
    noRefund: 'Tidak ada pengembalian',
    autoApprove: 'Disetujui otomatis',
    manualApprove: 'Memerlukan persetujuan',
  },
}

export default function CancellationPolicyEditor({ businessId }: { businessId: number }) {
  const { lang } = useLang()
  const txt = t[lang]

  const [policy, setPolicy] = useState<CancellationPolicy | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!businessId) return
    api.getCancellationPolicy(businessId)
      .then((res: any) => setPolicy(res.policy))
      .catch(() => setPolicy(null))
  }, [businessId])

  const update = (field: keyof CancellationPolicy, value: any) => {
    setPolicy(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const handleSave = async () => {
    if (!policy) return
    setSaving(true)
    setMsg(null)
    try {
      const res = await api.saveCancellationPolicy({
        business_id: businessId,
        deadline_hours: policy.deadline_hours,
        refund_before_deadline: policy.refund_before_deadline,
        refund_after_deadline: policy.refund_after_deadline,
        requires_approval: policy.requires_approval ? 1 : 0,
        notes: policy.notes,
      })
      setPolicy((res as any).policy)
      setMsg({ type: 'ok', text: txt.saved })
    } catch (err: any) {
      setMsg({ type: 'err', text: err.message || txt.error })
    } finally {
      setSaving(false)
    }
  }

  if (!policy) return null

  return (
    <div className="rounded-2xl p-5" style={{ background: CARD, boxShadow: shadow, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center gap-2 mb-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
        </svg>
        <h3 className="text-base font-bold" style={{ color: TEXT }}>{txt.title}</h3>
      </div>
      <p className="text-xs mb-4" style={{ color: MUTED }}>{txt.subtitle}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold" style={{ color: TEXT }}>{txt.deadline}</label>
          <input type="number" min={1} value={policy.deadline_hours}
            onChange={e => update('deadline_hours', Math.max(1, Number(e.target.value)))}
            className="w-full mt-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: `1px solid ${BORDER}`, color: TEXT }} />
          <p className="text-[10px] mt-1" style={{ color: SUBTLE }}>{txt.deadlineHint}</p>
        </div>

        <div>
          <label className="text-xs font-semibold" style={{ color: TEXT }}>{txt.refundBefore}</label>
          <input type="number" min={0} max={100} value={policy.refund_before_deadline}
            onChange={e => update('refund_before_deadline', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-full mt-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: `1px solid ${BORDER}`, color: TEXT }} />
        </div>

        <div>
          <label className="text-xs font-semibold" style={{ color: TEXT }}>{txt.refundAfter}</label>
          <input type="number" min={0} max={100} value={policy.refund_after_deadline}
            onChange={e => update('refund_after_deadline', Math.max(0, Math.min(100, Number(e.target.value))))}
            className="w-full mt-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: `1px solid ${BORDER}`, color: TEXT }} />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!policy.requires_approval}
              onChange={e => update('requires_approval', e.target.checked ? 1 : 0)}
              className="w-4 h-4 rounded" style={{ accentColor: A }} />
            <span className="text-xs font-semibold" style={{ color: TEXT }}>{txt.requiresApproval}</span>
          </label>
        </div>
      </div>
      <p className="text-[10px] mt-1" style={{ color: SUBTLE }}>{txt.requiresApprovalHint}</p>

      <div className="mt-3">
        <label className="text-xs font-semibold" style={{ color: TEXT }}>{txt.policyNotes}</label>
        <textarea value={policy.notes || ''} rows={2}
          onChange={e => update('notes', e.target.value)}
          placeholder={txt.policyNotesHint}
          className="w-full mt-1 rounded-xl px-3 py-2 text-sm outline-none resize-none"
          style={{ border: `1px solid ${BORDER}`, color: TEXT }} />
      </div>

      {/* Preview */}
      <div className="mt-4 rounded-xl p-3" style={{ background: AL, border: `1px solid ${A}33` }}>
        <p className="text-xs font-bold mb-2" style={{ color: A }}>{txt.preview}</p>
        <div className="flex gap-3 text-xs">
          <div className="flex-1 rounded-lg p-2" style={{ background: 'white' }}>
            <p className="font-semibold" style={{ color: TEXT }}>
              {txt.previewBefore.replace('72', String(policy.deadline_hours))}+
            </p>
            <p style={{ color: policy.refund_before_deadline > 0 ? '#15803d' : '#b91c1c' }}>
              {policy.refund_before_deadline}% {txt.refund}
            </p>
          </div>
          <div className="flex-1 rounded-lg p-2" style={{ background: 'white' }}>
            <p className="font-semibold" style={{ color: TEXT }}>
              {txt.previewAfter.replace('72', String(policy.deadline_hours))}
            </p>
            <p style={{ color: policy.refund_after_deadline > 0 ? '#15803d' : '#b91c1c' }}>
              {policy.refund_after_deadline > 0 ? `${policy.refund_after_deadline}% ${txt.refund}` : txt.noRefund}
            </p>
          </div>
          <div className="flex-1 rounded-lg p-2" style={{ background: 'white' }}>
            <p className="font-semibold" style={{ color: TEXT }}>{txt.manualApprove}</p>
            <p style={{ color: policy.requires_approval ? A : '#15803d' }}>
              {policy.requires_approval ? txt.manualApprove : txt.autoApprove}
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <p className="mt-3 text-xs px-3 py-2 rounded-xl"
          style={{ background: msg.type === 'ok' ? '#dcfce7' : '#fee2e2', color: msg.type === 'ok' ? '#15803d' : '#b91c1c' }}>
          {msg.text}
        </p>
      )}

      <button onClick={handleSave} disabled={saving}
        className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
        style={{ background: saving ? '#d1d5db' : A, color: 'white' }}>
        {saving ? txt.saving : txt.save}
      </button>
    </div>
  )
}
