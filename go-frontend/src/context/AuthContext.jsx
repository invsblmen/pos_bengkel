import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '@services/api'
import {
  buildPermissionMap,
  buildPermissionMapFromList,
  hasAnyPermission,
  hasPermission,
} from '@/auth/rolePermissions'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/auth/me')
      setUser(res?.data?.user || null)
    } catch (err) {
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrentUser()
  }, [loadCurrentUser])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const token = res?.data?.token
    const me = res?.data?.user || null

    if (!token) {
      throw new Error('Token not returned by server')
    }

    localStorage.setItem('auth_token', token)
    setUser(me)
    return me
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) {
      // no-op: clear local state regardless of API response
    }
    localStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  const roles = Array.isArray(user?.roles) ? user.roles : []
  const backendPermissions = Array.isArray(user?.permissions) ? user.permissions : []
  const permissions = backendPermissions.length > 0
    ? buildPermissionMapFromList(backendPermissions)
    : buildPermissionMap(roles)

  const value = useMemo(() => ({
    user,
    roles,
    permissions,
    loading,
    isAuthenticated: Boolean(user),
    hasRole: (role) => roles.includes(role),
    hasAnyRole: (requiredRoles = []) => {
      if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) return true
      return requiredRoles.some((role) => roles.includes(role))
    },
    can: (permission) => hasPermission(permissions, permission),
    canAny: (permissionList) => hasAnyPermission(permissions, permissionList),
    login,
    logout,
    reloadUser: loadCurrentUser,
  }), [user, roles, permissions, loading, login, logout, loadCurrentUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
