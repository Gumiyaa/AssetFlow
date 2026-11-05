import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

function readInitialSession() {
  const persistent = authService.getSession()
  if (persistent) return persistent
  try {
    const raw = window.sessionStorage.getItem('assetflow:session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readInitialSession)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const next = await authService.login(credentials)
      setSession(next)
      return next
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setSession(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const next = await authService.updateProfile(payload)
    setSession(next)
    return next
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isAuthenticated: Boolean(session),
      loading,
      login,
      logout,
      updateProfile,
    }),
    [session, loading, login, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
