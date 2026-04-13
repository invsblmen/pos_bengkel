import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ requiredRoles = [], requiredPermissions = [] }) {
  const { loading, isAuthenticated, hasAnyRole, canAny } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Checking session...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  if (!canAny(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  return <Outlet />
}
