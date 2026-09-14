import { type Lang } from '../hooks/useLang'

const A = '#f97316'
const AL = '#fff7ed'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'

type Shift = { open: string; close: string }
type Hours = Record<string, Shift[]>

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

const DAY_LABELS: Record<Lang, Record<string, string>> = {
  en: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
  id: { mon: 'Senin', tue: 'Selasa', wed: 'Rabu', thu: 'Kamis', fri: 'Jumat', sat: 'Sabtu', sun: 'Minggu' },
}

const T: Record<Lang, any> = {
  en: { businessHours: 'Business Hours', addShift: 'Add shift', closed: 'Closed', open: 'Open', close: 'Close', removeShift: 'Remove', hint: 'Click "Closed" to open a day and set hours' },
  id: { businessHours: 'Jam Operasional', addShift: 'Tambah jadwal', closed: 'Tutup', open: 'Buka', close: 'Tutup', removeShift: 'Hapus', hint: 'Klik "Tutup" untuk membuka hari dan mengatur jam' },
}

function parseHours(raw: any): Hours {
  if (!raw) return {}
  let parsed = raw
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw) } catch { return {} }
  }
  // Normalize: convert ['08:00','17:00'] format to [{open:'08:00',close:'17:00'}]
  const result: Hours = {}
  for (const key of Object.keys(parsed)) {
    const val = parsed[key]
    if (Array.isArray(val)) {
      if (val.length === 0) {
        result[key] = []
      } else if (typeof val[0] === 'string') {
        // ['08:00','17:00'] format → convert to single shift
        result[key] = [{ open: val[0], close: val[1] || val[0] }]
      } else {
        result[key] = val
      }
    } else if (val && typeof val === 'object' && val.open !== undefined) {
      result[key] = [val]
    } else {
      result[key] = []
    }
  }
  return result
}

export function getBusinessHours(raw: any): Hours {
  return parseHours(raw)
}

export function formatBusinessHours(raw: any, lang: Lang): { day: string; shifts: Shift[]; closed: boolean }[] {
  const hours = parseHours(raw)
  const labels = DAY_LABELS[lang]
  return DAY_KEYS.map(key => ({
    day: labels[key],
    shifts: hours[key] || [],
    closed: !hours[key] || hours[key].length === 0,
  }))
}

export function compactHours(raw: any, lang: Lang): string {
  const hours = parseHours(raw)
  const days = DAY_KEYS.map(key => ({
    key,
    shifts: hours[key] || [],
    closed: !hours[key] || hours[key].length === 0,
  }))
  const openDays = days.filter(d => !d.closed)
  if (openDays.length === 0) return lang === 'id' ? 'Tutup' : 'Closed'
  if (openDays.length === 7) {
    const allSame = openDays.every(d => JSON.stringify(d.shifts) === JSON.stringify(openDays[0].shifts))
    if (allSame) {
      const s = openDays[0].shifts.map(sh => `${sh.open}-${sh.close}`).join(', ')
      return `${lang === 'id' ? 'Setiap hari' : 'Daily'} ${s}`
    }
  }
  const first = openDays[0]
  const last = openDays[openDays.length - 1]
  const s = first.shifts.map(sh => `${sh.open}-${sh.close}`).join(', ')
  if (openDays.length > 1) {
    return `${first.key.slice(0,3).toUpperCase()}-${last.key.slice(0,3).toUpperCase()} ${s}`
  }
  return `${first.key.slice(0,3).toUpperCase()} ${s}`
}

export function defaultBusinessHours(): Hours {
  return {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  }
}

export default function BusinessHoursEditor({ value, onChange, lang }: { value: any; onChange: (h: Hours) => void; lang: Lang }) {
  const txt = T[lang]
  const labels = DAY_LABELS[lang]
  const hours = parseHours(value)

  const updateDay = (day: string, shifts: Shift[]) => {
    onChange({ ...hours, [day]: shifts })
  }

  const addShift = (day: string) => {
    const current = hours[day] || []
    updateDay(day, [...current, { open: '09:00', close: '17:00' }])
  }

  const removeShift = (day: string, idx: number) => {
    const current = hours[day] || []
    updateDay(day, current.filter((_, i) => i !== idx))
  }

  const updateShift = (day: string, idx: number, field: 'open' | 'close', val: string) => {
    const current = hours[day] || []
    const updated = current.map((s, i) => i === idx ? { ...s, [field]: val } : s)
    updateDay(day, updated)
  }

  const toggleClosed = (day: string) => {
    const current = hours[day] || []
    if (current.length === 0) {
      updateDay(day, [{ open: '09:00', close: '17:00' }])
    } else {
      updateDay(day, [])
    }
  }

  return (
    <div>
      <p className="text-sm font-black mb-3" style={{ color: TEXT }}>{txt.businessHours}</p>
      <div className="space-y-2">
        {DAY_KEYS.map(day => {
          const shifts = hours[day] || []
          const isClosed = shifts.length === 0
          return (
            <div key={day} className="rounded-xl p-3" style={{ background: AL, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: TEXT }}>{labels[day]}</span>
                  <button type="button" onClick={() => toggleClosed(day)}
                    className="text-xs px-2 py-0.5 rounded-full font-semibold border-0 cursor-pointer"
                    style={{ background: isClosed ? '#fee2e2' : '#dcfce7', color: isClosed ? '#b91c1c' : '#15803d' }}>
                    {isClosed ? txt.closed : txt.open}
                  </button>
                  {isClosed && <span className="text-xs" style={{ color: SUBTLE }}>{txt.hint}</span>}
                </div>
                {!isClosed && (
                  <button type="button" onClick={() => addShift(day)}
                    className="text-xs font-semibold border-0 bg-transparent cursor-pointer"
                    style={{ color: A }}>+ {txt.addShift}</button>
                )}
              </div>
              {!isClosed && shifts.map((shift, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1.5">
                  <input type="time" value={shift.open} onChange={e => updateShift(day, idx, 'open', e.target.value)}
                    className="px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: '#fff', border: `1px solid ${BORDER}`, color: TEXT }} />
                  <span className="text-xs" style={{ color: SUBTLE }}>—</span>
                  <input type="time" value={shift.close} onChange={e => updateShift(day, idx, 'close', e.target.value)}
                    className="px-2 py-1.5 rounded-lg text-xs outline-none" style={{ background: '#fff', border: `1px solid ${BORDER}`, color: TEXT }} />
                  <button type="button" onClick={() => removeShift(day, idx)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center border-0 cursor-pointer"
                    style={{ background: '#fee2e2', color: '#ef4444' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
