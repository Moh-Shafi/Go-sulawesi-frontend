const API_BASE = '/api'

// Token stored in memory (primary) + localStorage (for page refresh persistence).
// Backend also sets an httpOnly cookie for production same-origin XSS resistance.
// verify_token() checks cookie first, then Authorization header.
let authToken: string | null = localStorage.getItem('gosulawesi_token')

export function setToken(token: string) {
  authToken = token
  localStorage.setItem('gosulawesi_token', token)
}

export function clearToken() {
  authToken = null
  localStorage.removeItem('gosulawesi_token')
  // Clear the httpOnly cookie via backend endpoint (best-effort, fire-and-forget)
  fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
}

export function getStoredUser() {
  const raw = localStorage.getItem('gosulawesi_user')
  return raw ? JSON.parse(raw) : null
}

export function setStoredUser(user: any) {
  localStorage.setItem('gosulawesi_user', JSON.stringify(user))
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  // Send token as Authorization header (works through Vite proxy in dev)
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  console.log(`[API] ${options.method || 'GET'} ${path}`)
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // also send httpOnly cookie (production same-origin)
  })

  const data = await res.json().catch(() => ({}))
  console.log(`[API] ${options.method || 'GET'} ${path} -> ${res.status}`, data)

  if (!res.ok) {
    throw new Error((data as any).error || `HTTP ${res.status}`)
  }

  return data as T
}

// ── Auth API ──
export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string
    email: string
    password: string
    role: 'tourist' | 'local' | 'admin'
    phone?: string
    business?: {
      businessName: string
      businessType: string
      city: string
      phone: string
      description?: string
      nib?: string
    }
  }) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request('/auth/me'),

  // ── Users ──
  getUsers: () => request('/users'),
  getUser: (id: number) => request(`/users/${id}`),
  updateUser: (id: number, data: any) =>
    request(`/users/${id}/update`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: number) =>
    request(`/users/${id}/delete`, { method: 'DELETE' }),
  uploadAvatar: async (id: number, file: File): Promise<{ message: string; avatar: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await fetch(`${API_BASE}/users/${id}/avatar`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      credentials: 'include',
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    console.log(`[API] POST /users/${id}/avatar -> ${res.status}`, data)
    if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`)
    return data as { message: string; avatar: string }
  },

  // ── Businesses ──
  getBusinesses: () => request('/businesses'),
  getBusiness: (id: number) => request(`/businesses/${id}`),
  createBusiness: (data: any) =>
    request('/businesses', { method: 'POST', body: JSON.stringify(data) }),
  updateBusiness: (id: number, data: any) =>
    request(`/businesses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBusiness: (id: number) =>
    request(`/businesses/${id}`, { method: 'DELETE' }),
  uploadBusinessImage: async (id: number, file: File): Promise<{ message: string; image_url: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${API_BASE}/businesses/${id}/image`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      credentials: 'include',
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    console.log(`[API] POST /businesses/${id}/image -> ${res.status}`, data)
    if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`)
    return data as { message: string; image_url: string }
  },

  // ── Destinations ──
  getDestinations: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/destinations${qs}`)
  },
  getDestination: (id: number) => request(`/destinations/${id}`),
  createDestination: (data: any) =>
    request('/destinations', { method: 'POST', body: JSON.stringify(data) }),
  updateDestination: (id: number, data: any) =>
    request(`/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDestination: (id: number) =>
    request(`/destinations/${id}`, { method: 'DELETE' }),

  // ── Bookings ──
  getBookings: () => request('/bookings'),
  createBooking: (data: any) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id: number, data: any) =>
    request(`/bookings/${id}/update`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBooking: (id: number) =>
    request(`/bookings/${id}/delete`, { method: 'DELETE' }),

  // ── Cancellation ──
  getCancellationPolicy: (businessId: number) =>
    request(`/cancellations/policy?business_id=${businessId}`),
  saveCancellationPolicy: (data: Partial<CancellationPolicy>) =>
    request('/cancellations/policy', { method: 'POST', body: JSON.stringify(data) }),
  getCancellationRequests: () =>
    request('/cancellations/requests'),
  createCancellationRequest: (bookingId: number, reason: string) =>
    request('/cancellations/requests', { method: 'POST', body: JSON.stringify({ booking_id: bookingId, reason }) }),
  handleCancellationRequest: (id: number, action: 'approve' | 'reject', notes?: string) =>
    request(`/cancellations/requests/${id}`, { method: 'PUT', body: JSON.stringify({ action, notes }) }),

  // ── Reviews ──
  getReviews: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/reviews${qs}`)
  },
  createReview: (data: any) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // ── Promotions ──
  getPromotions: () => request('/promotions'),
  getPromotion: (id: number) => request(`/promotions/${id}`),
  createPromotion: (data: any) =>
    request('/promotions', { method: 'POST', body: JSON.stringify(data) }),
  updatePromotion: (id: number, data: any) =>
    request(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePromotion: (id: number) =>
    request(`/promotions/${id}`, { method: 'DELETE' }),
  uploadPromotionImage: async (id: number, file: File): Promise<{ message: string; image_url: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${API_BASE}/promotions/${id}/image`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      credentials: 'include',
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    console.log(`[API] POST /promotions/${id}/image -> ${res.status}`, data)
    if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`)
    return data as { message: string; image_url: string }
  },

  // ── Chat ──
  getConversations: () => request('/chat'),
  getConversation: (id: number) => request(`/chat/${id}`),
  startConversation: (businessId: number) =>
    request('/chat', { method: 'POST', body: JSON.stringify({ business_id: businessId }) }),
  sendMessage: (convId: number, text: string) =>
    request(`/chat/${convId}`, { method: 'POST', body: JSON.stringify({ message_text: text }) }),
  closeConversation: (convId: number) =>
    request(`/chat/${convId}`, { method: 'PUT', body: JSON.stringify({ status: 'closed' }) }),
  deleteMessage: (convId: number, msgId: number) =>
    request(`/chat/${convId}`, { method: 'DELETE', body: JSON.stringify({ message_id: msgId }) }),

  // ── Dashboard ──
  getDashboard: () => request('/dashboard'),

  // ── Public Stats ──
  getStats: () => request('/stats'),

  // ── Social Videos ──
  getVideos: (params?: { mine?: boolean; saved?: boolean; following?: boolean; sound_id?: number }) => {
    const qs = new URLSearchParams()
    if (params?.mine) qs.set('mine', '1')
    if (params?.saved) qs.set('saved', '1')
    if (params?.following) qs.set('following', '1')
    if (params?.sound_id) qs.set('sound_id', String(params.sound_id))
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return request<{ videos: FeedVideo[] }>(`/videos${suffix}`)
  },
  getVideo: (id: number) => request<{ video: FeedVideo }>(`/videos/${id}`),
  createVideo: (data: {
    video_url: string
    thumbnail_url?: string | null
    caption?: string
    business_id?: number | null
    destination_id?: number | null
    city?: string | null
    duration_sec?: number
    sound_id?: number | null
  }) => request<{ video: FeedVideo }>('/videos', { method: 'POST', body: JSON.stringify(data) }),
  deleteVideo: (id: number) => request(`/videos/${id}`, { method: 'DELETE' }),
  toggleVideoLike: (id: number) =>
    request<{ liked: boolean; likes: number }>(`/videos/${id}/like`, { method: 'POST' }),
  toggleVideoSave: (id: number) =>
    request<{ is_saved: boolean }>(`/videos/${id}/save`, { method: 'POST' }),
  getVideoComments: (id: number) =>
    request<{ comments: VideoComment[] }>(`/videos/${id}/comments`),
  addVideoComment: (id: number, text: string) =>
    request<{ comment: VideoComment }>(`/videos/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment_text: text }),
    }),
  deleteVideoComment: (videoId: number, commentId: number) =>
    request(`/videos/${videoId}/comments?comment_id=${commentId}`, { method: 'DELETE' }),
  countVideoView: (id: number) => request(`/videos/${id}/view`, { method: 'POST' }),
  shareVideo: (id: number) => request(`/videos/${id}/share`, { method: 'POST' }),
  reportVideo: (videoId: number, reason: string) =>
    request(`/videos/report`, { method: 'POST', body: JSON.stringify({ video_id: videoId, reason }) }),
  getVideosBySound: (soundId: number) =>
    request<{ videos: FeedVideo[] }>(`/videos?sound_id=${soundId}`),
  followUser: (followingId: number) =>
    request<{ following: boolean }>('/follow', { method: 'POST', body: JSON.stringify({ following_id: followingId }) }),
  unfollowUser: (followingId: number) =>
    request<{ following: boolean }>('/follow?action=unfollow', { method: 'POST', body: JSON.stringify({ following_id: followingId }) }),
  checkFollowing: (followingId: number) =>
    request<{ following: boolean }>(`/follow?following_id=${followingId}`),
  getFollowingList: (followerId: number) =>
    request<{ following: any[] }>(`/follow?follower_id=${followerId}`),
  getSounds: () => request<{ sounds: VideoSound[] }>('/videos/sounds'),
  getVideoStats: (videoId: number) => request<{ video_id: number; totals: VideoStatsTotals; daily: VideoDailyStat[] }>(`/videos/stats?video_id=${videoId}`),
  getMyVideoStats: () => request<{ aggregate: VideoStatsTotals & { total_videos: number }; top_videos: VideoTopVideo[]; daily: VideoDailyStat[] }>(`/videos/stats?mine=1`),
  uploadVideoFile: async (
    file: File,
    thumbnail?: Blob | null
  ): Promise<{ message: string; video_url: string; thumbnail_url?: string }> => {
    const formData = new FormData()
    formData.append('video', file)
    if (thumbnail) formData.append('thumbnail', thumbnail, 'poster.jpg')
    const res = await fetch(`${API_BASE}/videos/upload`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      credentials: 'include',
      body: formData,
    })
    const raw = await res.text()
    let data: any = {}
    try { data = JSON.parse(raw) } catch {
      console.error('[API] POST /videos/upload -> non-JSON response:', raw.substring(0, 200))
      throw new Error('Server returned an error (possibly the file is too large or a server misconfiguration). Check console for details.')
    }
    console.log(`[API] POST /videos/upload -> ${res.status}`, data)
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    if (!data.video_url) throw new Error(data.error || 'Upload failed: server did not return a video URL.')
    return data as { message: string; video_url: string; thumbnail_url?: string }
  },
}

export type FeedVideo = {
  id: number
  video_url: string
  thumbnail_url: string | null
  caption: string | null
  city: string | null
  business_id: number | null
  destination_id: number | null
  duration_sec: number
  views: number
  shares: number
  created_at: string
  user_id: number
  user_name: string
  user_avatar: string | null
  user_role?: string | null
  business_name: string | null
  business_type?: string | null
  destination_name: string | null
  sound_title: string | null
  sound_artist: string | null
  sound_url: string | null
  likes: number
  comments: number
  liked: boolean
  is_saved: boolean
}

export type VideoComment = {
  id: number
  comment_text: string
  created_at: string
  user_id: number
  user_name: string
  user_avatar: string | null
}

export type VideoSound = {
  id: number
  title: string
  artist: string
  audio_url: string
  duration_sec: number
  category: string
  usage_count: number
}

export type VideoStatsTotals = {
  views: number
  likes: number
  comments: number
  shares: number
}

export type VideoDailyStat = {
  stat_date: string
  views: number
  likes: number
  comments: number
  shares: number
}

export type VideoTopVideo = {
  id: number
  caption: string | null
  thumbnail_url: string | null
  views: number
  likes: number
  comments: number
  shares: number
  created_at: string
}

// ── Cancellation ──
export type CancellationPolicy = {
  id?: number
  business_id: number
  deadline_hours: number
  refund_before_deadline: number
  refund_after_deadline: number
  requires_approval: number
  notes: string | null
  is_default?: boolean
}

export type CancellationRequest = {
  id: number
  booking_id: number
  user_id: number
  reason: string | null
  status: 'pending' | 'approved' | 'rejected' | 'auto'
  refund_percent: number
  refund_amount: number
  handled_by: number | null
  handler_notes: string | null
  created_at: string
  handled_at: string | null
  booking_date?: string
  total_price?: number
  booking_status?: string
  user_name?: string
  business_name?: string
  destination_name?: string
}
