import { api } from './api'
import { readStore, writeStore, removeStore, STORAGE_KEYS } from './storage'

const DEMO_ACCOUNT = {
  email: 'andi.pratama@assetflow.id',
  password: 'assetflow123',
}

const SESSION_STORAGE_KEY = 'assetflow:session'

const delay = (ms = 500) => new Promise((resolve) => window.setTimeout(resolve, ms))

function readSession() {
  const persistent = readStore(STORAGE_KEYS.session, null)
  if (persistent) return persistent
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistSession(session, remember) {
  if (remember) {
    writeStore(STORAGE_KEYS.session, session)
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } else {
    removeStore(STORAGE_KEYS.session)
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }
}

function toApiProfile(payload = {}) {
  const mapping = {
    name: 'name',
    email: 'email',
    username: 'username',
    phone: 'phone',
    position: 'position',
    department: 'department',
    initials: 'initials',
    avatarColor: 'avatar_color',
  }

  return Object.entries(mapping).reduce((result, [from, to]) => {
    if (payload[from] !== undefined) result[to] = payload[from]
    return result
  }, {})
}

export const authService = {
  demoAccount: DEMO_ACCOUNT,

  getSession() {
    return readSession()
  },

  async login({ email, password, remember = true }) {
    const { data } = await api.post('/auth/login', {
      email: String(email || '').trim().toLowerCase(),
      password,
      device_name: 'AssetFlow Web',
    })

    const session = {
      token: data.token,
      user: data.user,
      loggedInAt: new Date().toISOString(),
      remember,
    }

    persistSession(session, remember)
    return session
  },

  async forgotPassword(email) {
    await delay(700)
    if (!String(email || '').includes('@')) throw new Error('Format email tidak valid.')
    return { email, sentAt: new Date().toISOString() }
  },

  async logout() {
    const session = readSession()
    if (session?.token) {
      try {
        await api.post('/auth/logout')
      } catch {
        /* token may already be expired — clear the local session regardless */
      }
    }
    removeStore(STORAGE_KEYS.session)
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  },

  async updateProfile(payload) {
    const session = readSession()
    if (!session) throw new Error('Sesi tidak ditemukan')

    const { data } = await api.put('/auth/profile', toApiProfile(payload))
    const updated = { ...session, user: data.user }
    persistSession(updated, session.remember !== false)
    return updated
  },

  async refreshUser() {
    const session = readSession()
    if (!session?.token) return null

    const { data } = await api.get('/auth/me')
    const updated = { ...session, user: data.user }
    persistSession(updated, session.remember !== false)
    return updated
  },
}
