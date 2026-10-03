import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { jwtDecode } from 'jwt-decode'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  tenantId?: number
  isSuperAdmin: boolean
  permissions: string[]
}

interface DecodedToken {
  sub: string
  email: string
  fullName: string
  role: string
  tenantId?: string
  isSuperAdmin?: string
  permission?: string | string[]
  exp: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<User | null>
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      // Normalize: older stored sessions may not have the permissions array
      if (!Array.isArray(parsed.permissions)) parsed.permissions = []
      return parsed as User
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  )

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me')
      if (data?.token) {
        const decoded = jwtDecode<DecodedToken>(data.token)
        let permissions: string[] = []
        if (decoded.permission) {
          permissions = Array.isArray(decoded.permission) ? decoded.permission : [decoded.permission]
        }

        const u: User = { 
          id: decoded.sub, 
          email: decoded.email, 
          fullName: decoded.fullName, 
          role: decoded.role,
          tenantId: decoded.tenantId ? parseInt(decoded.tenantId, 10) : undefined,
          isSuperAdmin: decoded.isSuperAdmin === 'true',
          permissions
        }

        setToken(data.token)
        setUser(u)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(u))
        return u
      }
    } catch (err: any) {
      // If unauthorized on refresh, session has expired
      if (err.response?.status === 401) {
        logout()
      }
    }
    return null
  }, [])

  // Auto-refresh profile on app initialization to pick up latest permissions
  React.useEffect(() => {
    if (localStorage.getItem('token')) {
      refreshUser()
    }
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    const tokenStr = data.token
    
    // Decode JWT to extract claims
    const decoded = jwtDecode<DecodedToken>(tokenStr)
    
    // Normalize permissions to an array (JWT might output a single string if there's only 1 permission claim)
    let permissions: string[] = []
    if (decoded.permission) {
      permissions = Array.isArray(decoded.permission) ? decoded.permission : [decoded.permission]
    }

    const u: User = { 
      id: decoded.sub, 
      email: decoded.email, 
      fullName: decoded.fullName, 
      role: decoded.role,
      tenantId: decoded.tenantId ? parseInt(decoded.tenantId, 10) : undefined,
      isSuperAdmin: decoded.isSuperAdmin === 'true',
      permissions
    }

    setToken(tokenStr)
    setUser(u)
    localStorage.setItem('token', tokenStr)
    localStorage.setItem('user', JSON.stringify(u))
    
    return u
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false
    if (user.isSuperAdmin) return true // SuperAdmins bypass all permission checks
    const perms = Array.isArray(user.permissions) ? user.permissions : []
    return perms.includes(permission)
  }, [user])

  const contextValue = useMemo(() => ({
    user,
    token,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!token,
    hasPermission
  }), [user, token, login, logout, refreshUser, hasPermission])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
