import { currentUser } from '../data/mockData'
import { readStore, writeStore, removeStore, STORAGE_KEYS } from './storage'

const DEMO_ACCOUNT = {
  email: 'andi.pratama@assetflow.id',
  password: 'assetflow123',
}

const delay = (ms = 500) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const authService = {
  demoAccount: DEMO_ACCOUNT,

  getSession() {
    return readStore(STORAGE_KEYS.session, null)
  },

  async login({ email, password, remember = true }) {
    await delay(650)
    const normalized = String(email || '').trim().toLowerCase()
    if (normalized !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
      throw new Error('Email atau kata sandi tidak sesuai. Gunakan akun demo yang tersedia.')
    }
    const session = {
      token: `demo.${btoa(normalized).replaceAll('=', '')}.${Date.now()}`,
      user: { ...currentUser, email: normalized },
      loggedInAt: new Date().toISOString(),
      remember,
    }
    if (remember) writeStore(STORAGE_KEYS.session, session)
    else window.sessionStorage.setItem('assetflow:session', JSON.stringify(session))
    return session
  },

  async forgotPassword(email) {
    await delay(700)
    if (!String(email || '').includes('@')) throw new Error('Format email tidak valid.')
    return { email, sentAt: new Date().toISOString() }
  },

  async logout() {
    await delay(150)
    removeStore(STORAGE_KEYS.session)
    window.sessionStorage.removeItem('assetflow:session')
  },

  async updateProfile(payload) {
    await delay(300)
    const session = this.getSession()
    if (!session) throw new Error('Sesi tidak ditemukan')
    const updated = { ...session, user: { ...session.user, ...payload } }
    writeStore(STORAGE_KEYS.session, updated)
    return updated
  },
}
