const KEY = 'gosulawesi_saved'

export function getSavedIds(): number[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSavedIds(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

export function toggleSavedId(id: number): number[] {
  const current = getSavedIds()
  const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
  saveSavedIds(next)
  return next
}
