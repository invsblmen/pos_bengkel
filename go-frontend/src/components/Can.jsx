import { useAuth } from '@/context/AuthContext'

export default function Can({
  permission,
  permissions = [],
  fallback = null,
  children,
}) {
  const { can, canAny } = useAuth()

  if (permission && !can(permission)) {
    return fallback
  }

  if (Array.isArray(permissions) && permissions.length > 0 && !canAny(permissions)) {
    return fallback
  }

  return children
}
