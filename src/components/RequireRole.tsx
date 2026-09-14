import { Navigate } from 'react-router-dom'
import { getStoredUser } from '../lib/api'

export default function RequireRole({ role, children }: { role: string | string[], children: React.ReactNode }) {
  const user = getStoredUser()
  if (!user) return <Navigate to="/login" replace />
  const roles = Array.isArray(role) ? role : [role]
  if (!roles.includes(user.role)) return <Navigate to="/login" replace />
  return <>{children}</>
}
