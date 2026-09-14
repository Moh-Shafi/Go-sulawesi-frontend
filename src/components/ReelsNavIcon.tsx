import { useState, useEffect, useRef } from 'react'

type Heart = { id: number; dx: number; color: string; delay: number }
type Pop = { id: number }

const HEART_COLORS = ['#ef4444', '#ec4899', '#f97316', '#0d9488', '#8b5cf6']

/**
 * Animated reels nav icon: periodically shoots out floating hearts
 * and a popping video-icon to attract tourist attention.
 */
export default function ReelsNavIcon({ active }: { active: boolean }) {
  const [hearts, setHearts] = useState<Heart[]>([])
  const [pops, setPops] = useState<Pop[]>([])
  const idRef = useRef(0)
  const cycleRef = useRef(0)

  useEffect(() => {
    let mounted = true

    const spawnHearts = () => {
      if (!mounted) return
      const count = 2 + Math.floor(Math.random() * 2) // 2-3 hearts
      const newHearts: Heart[] = []
      for (let i = 0; i < count; i++) {
        newHearts.push({
          id: idRef.current++,
          dx: (Math.random() - 0.5) * 24,
          color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
          delay: i * 120,
        })
      }
      setHearts(prev => [...prev, ...newHearts])

      // cleanup after animation
      setTimeout(() => {
        if (!mounted) return
        setHearts(prev => prev.filter(h => !newHearts.includes(h)))
      }, 2800 + count * 120)
    }

    const spawnPop = () => {
      if (!mounted) return
      const popId = idRef.current++
      setPops(prev => [...prev, { id: popId }])
      setTimeout(() => {
        if (!mounted) return
        setPops(prev => prev.filter(p => p.id !== popId))
      }, 2600)
    }

    const interval = setInterval(() => {
      cycleRef.current++
      // Hearts every cycle, pop every 3rd cycle
      spawnHearts()
      if (cycleRef.current % 3 === 0) spawnPop()
    }, 3500)

    // Initial burst shortly after mount
    const initial = setTimeout(spawnHearts, 800)

    return () => {
      mounted = false
      clearInterval(interval)
      clearTimeout(initial)
    }
  }, [])

  return (
    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl" style={{ position: 'relative' }}>
      {/* Base icon — video play */}
      <div className={active ? '' : 'reels-nav-icon'} style={{ borderRadius: 10, padding: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="4"/>
          <path d="M10 9l5 3-5 3V9z" fill="currentColor"/>
        </svg>
      </div>

      {/* Floating hearts */}
      {hearts.map(h => (
        <svg
          key={h.id}
          className="reels-heart"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={h.color}
          style={{
            ['--dx' as any]: `${h.dx}px`,
            animationDelay: `${h.delay}ms`,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
          }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ))}

      {/* Popping video icon */}
      {pops.map(p => (
        <svg
          key={p.id}
          className="reels-video-pop"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0d9488"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(13,148,136,0.3))' }}
        >
          <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
      ))}
    </div>
  )
}
