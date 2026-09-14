import { useState, useRef, useEffect } from 'react'
import { api, getStoredUser, type VideoSound } from '../lib/api'
import { useLang, type Lang } from '../hooks/useLang'

const A = '#0d9488'
const TEXT = '#111827'
const MUTED = '#6b7280'
const SUBTLE = '#9ca3af'
const BORDER = '#e5e7eb'

const MAX_BYTES = 25 * 1024 * 1024
const MAX_SECONDS = 60

const t: Record<Lang, any> = {
  en: {
    title: 'Share a moment',
    subtitle: 'Upload a short clip from your trip',
    pickFile: 'Choose a video',
    pickHint: 'MP4, MOV or WebM · max 25MB · up to 60 seconds',
    replace: 'Replace video',
    caption: 'Caption',
    captionPlaceholder: 'Describe this moment…',
    tagBusiness: 'Tag a place',
    tagNone: 'No place tagged',
    cancel: 'Cancel',
    publish: 'Publish',
    uploading: 'Uploading…',
    tooLarge: 'That file is larger than 25MB. Please pick a shorter clip.',
    tooLong: 'That clip is longer than 60 seconds. Please trim it first.',
    badType: 'Unsupported format. Please use MP4, MOV or WebM.',
    unreadable: 'Could not read that video file.',
    success: 'Your video is live!',
    addSound: 'Add music',
    noSound: 'No music',
    soundHint: 'Pick a track from our library',
  },
  id: {
    title: 'Bagikan momen',
    subtitle: 'Unggah klip singkat dari perjalananmu',
    pickFile: 'Pilih video',
    pickHint: 'MP4, MOV atau WebM · maks 25MB · hingga 60 detik',
    replace: 'Ganti video',
    caption: 'Keterangan',
    captionPlaceholder: 'Ceritakan momen ini…',
    tagBusiness: 'Tandai tempat',
    tagNone: 'Tanpa tempat',
    cancel: 'Batal',
    publish: 'Terbitkan',
    uploading: 'Mengunggah…',
    tooLarge: 'Berkas lebih dari 25MB. Pilih klip yang lebih pendek.',
    tooLong: 'Klip lebih dari 60 detik. Potong dulu.',
    badType: 'Format tidak didukung. Gunakan MP4, MOV atau WebM.',
    unreadable: 'Tidak dapat membaca berkas video.',
    success: 'Videomu sudah tayang!',
    addSound: 'Tambah musik',
    noSound: 'Tanpa musik',
    soundHint: 'Pilih dari perpustakaan kami',
  },
}

type Business = { id: number; business_name: string; city?: string }
type Props = {
  open: boolean
  onClose: () => void
  onUploaded?: () => void
}

// Grabs a frame from the loaded video to use as the feed poster image.
async function capturePoster(video: HTMLVideoElement): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  if (!canvas.width || !canvas.height) return null
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.8))
}

export default function VideoUploadModal({ open, onClose, onUploaded }: Props) {
  const { lang } = useLang()
  const txt = t[lang]

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [duration, setDuration] = useState(0)
  const [caption, setCaption] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [sounds, setSounds] = useState<VideoSound[]>([])
  const [soundId, setSoundId] = useState('')
  const [soundPlaying, setSoundPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!open) return
    const currentUser = getStoredUser()
    api.getBusinesses()
      .then((res: any) => {
        const list = res.businesses || []
        setBusinesses(list)
        // Local role: auto-tag the business if they have exactly one.
        // Tourists still pick from the full list to tag a place they visited.
        if (currentUser?.role === 'local' && list.length === 1) {
          setBusinessId(String(list[0].id))
        }
      })
      .catch(() => setBusinesses([]))
    api.getSounds()
      .then((res: any) => setSounds(res.sounds || []))
      .catch(() => setSounds([]))
  }, [open])

  // Release the object URL whenever the chosen file changes or the modal closes.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const reset = () => {
    setFile(null)
    setPreviewUrl('')
    setDuration(0)
    setCaption('')
    setBusinessId('')
    setSoundId('')
    setSoundPlaying(false)
    setError('')
    setBusy(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handleClose = () => {
    if (busy) return
    reset()
    onClose()
  }

  const selectedSound = sounds.find(s => String(s.id) === soundId)

  const handleSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setSoundId(id)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (id) {
      const sound = sounds.find(s => String(s.id) === id)
      if (sound && audioRef.current) {
        audioRef.current.src = sound.audio_url
        audioRef.current.volume = 0.7
        audioRef.current.play().then(() => setSoundPlaying(true)).catch(() => setSoundPlaying(false))
      }
    } else {
      setSoundPlaying(false)
    }
  }

  const toggleSoundPreview = () => {
    if (!audioRef.current || !selectedSound) return
    if (soundPlaying) {
      audioRef.current.pause()
      setSoundPlaying(false)
    } else {
      audioRef.current.play().then(() => setSoundPlaying(true)).catch(() => setSoundPlaying(false))
    }
  }

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return

    setError('')

    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(picked.type)) {
      setError(txt.badType)
      return
    }
    if (picked.size > MAX_BYTES) {
      setError(txt.tooLarge)
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }

  const handleMetadata = () => {
    const el = previewRef.current
    if (!el) return
    const secs = Math.round(el.duration)
    if (!Number.isFinite(secs) || secs <= 0) {
      setError(txt.unreadable)
      return
    }
    if (secs > MAX_SECONDS) {
      setError(txt.tooLong)
      return
    }
    setDuration(secs)
  }

  const handlePublish = async () => {
    if (!file || busy) return
    setBusy(true)
    setError('')
    try {
      let poster: Blob | null = null
      if (previewRef.current) {
        poster = await capturePoster(previewRef.current).catch(() => null)
      }

      const uploaded = await api.uploadVideoFile(file, poster)
      await api.createVideo({
        video_url: uploaded.video_url,
        thumbnail_url: uploaded.thumbnail_url ?? null,
        caption: caption.trim(),
        business_id: businessId ? Number(businessId) : null,
        duration_sec: duration,
        sound_id: soundId ? Number(soundId) : null,
      })

      reset()
      onUploaded?.()
      onClose()
    } catch (err: any) {
      setError(err.message || txt.unreadable)
      setBusy(false)
    }
  }

  if (!open) return null

  const canPublish = !!file && !!duration && !error && !busy

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={handleClose}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col"
        style={{ background: 'white', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black" style={{ color: TEXT, letterSpacing: '-0.02em' }}>{txt.title}</h2>
            <p className="text-xs mt-0.5" style={{ color: SUBTLE }}>{txt.subtitle}</p>
          </div>
          <button onClick={handleClose} disabled={busy}
            className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer flex-shrink-0 hover:bg-gray-100"
            style={{ background: 'transparent', color: MUTED }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-5 overflow-y-auto">
          {/* Picker / preview */}
          <input ref={inputRef} type="file" accept="video/mp4,video/quicktime,video/webm"
            className="hidden" onChange={handlePick} />

          {!previewUrl ? (
            <button onClick={() => inputRef.current?.click()}
              className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-10 cursor-pointer transition-all hover:bg-teal-50"
              style={{ border: `2px dashed ${BORDER}`, background: '#fafafa' }}>
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: A, color: 'white' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              </span>
              <span className="text-sm font-bold" style={{ color: TEXT }}>{txt.pickFile}</span>
              <span className="text-xs" style={{ color: SUBTLE }}>{txt.pickHint}</span>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden" style={{ background: '#000', aspectRatio: '9 / 16', maxHeight: 340 }}>
              <video ref={previewRef} src={previewUrl} controls playsInline preload="metadata"
                onLoadedMetadata={handleMetadata}
                className="w-full h-full object-contain" />
              <button onClick={() => inputRef.current?.click()} disabled={busy}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.92)', color: TEXT }}>
                {txt.replace}
              </button>
              {duration > 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                  {duration}s
                </span>
              )}
            </div>
          )}

          {/* Caption */}
          <div className="mt-4">
            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: SUBTLE }}>{txt.caption}</label>
            <textarea value={caption} onChange={e => setCaption(e.target.value.slice(0, 500))}
              placeholder={txt.captionPlaceholder} rows={2} disabled={busy}
              className="w-full mt-1.5 rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ border: `1px solid ${BORDER}`, color: TEXT }} />
            <p className="text-[10px] text-right" style={{ color: SUBTLE }}>{caption.length}/500</p>
          </div>

          {/* Business tag */}
          <div className="mt-2">
            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: SUBTLE }}>{txt.tagBusiness}</label>
            <select value={businessId} onChange={e => setBusinessId(e.target.value)} disabled={busy}
              className="w-full mt-1.5 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
              style={{ border: `1px solid ${BORDER}`, color: TEXT, background: 'white' }}>
              <option value="">{txt.tagNone}</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.business_name}{b.city ? ` · ${b.city}` : ''}</option>
              ))}
            </select>
          </div>

          {/* Sound picker */}
          <div className="mt-2">
            <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: SUBTLE }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
              {txt.addSound}
            </label>
            <select value={soundId} onChange={handleSoundChange} disabled={busy}
              className="w-full mt-1.5 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
              style={{ border: `1px solid ${BORDER}`, color: TEXT, background: 'white' }}>
              <option value="">{txt.noSound}</option>
              {sounds.map(s => (
                <option key={s.id} value={s.id}>{s.title} · {s.artist} ({s.duration_sec}s)</option>
              ))}
            </select>

            {/* Sound preview player */}
            {selectedSound && (
              <div className="mt-2 flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: '#f9fafb', border: `1px solid ${BORDER}` }}>
                <button onClick={toggleSoundPreview} disabled={busy}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-0 cursor-pointer flex-shrink-0 transition-transform active:scale-90"
                  style={{ background: A, color: 'white' }}>
                  {soundPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${soundPlaying ? 'spin-disc' : ''}`}
                    style={{ background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#64748b' }} />
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate" style={{ color: TEXT }}>{selectedSound.title}</p>
                    <p className="text-[10px] truncate" style={{ color: SUBTLE }}>{selectedSound.artist}</p>
                  </div>
                </div>
                {soundPlaying && (
                  <div className="flex items-end gap-0.5 h-5 flex-shrink-0">
                    {[0,1,2,3].map(i => (
                      <span key={i} className="w-0.5 rounded-full" style={{
                        background: A,
                        height: `${30 + Math.sin(Date.now()/200 + i) * 40 + Math.random() * 30}%`,
                        animation: `sound-bar 0.${4+i}s ease-in-out infinite alternate`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-[10px] mt-1" style={{ color: SUBTLE }}>{txt.soundHint}</p>
            <audio ref={audioRef} loop onPlay={() => setSoundPlaying(true)} onPause={() => setSoundPlaying(false)} />
          </div>

          {error && (
            <p className="mt-3 text-xs px-3 py-2 rounded-xl" style={{ background: '#fef2f2', color: '#dc2626' }}>{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-5">
            <button onClick={handleClose} disabled={busy}
              className="flex-1 py-3 rounded-xl text-sm font-bold border-0 cursor-pointer"
              style={{ background: '#f3f4f6', color: MUTED }}>
              {txt.cancel}
            </button>
            <button onClick={handlePublish} disabled={!canPublish}
              className="flex-1 py-3 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all"
              style={{ background: canPublish ? A : '#d1d5db', color: 'white', cursor: canPublish ? 'pointer' : 'not-allowed' }}>
              {busy ? txt.uploading : txt.publish}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
