const PREFIX = 'assetflow'

export function readStore(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${key}`)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  try {
    window.localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStore(key) {
  try {
    window.localStorage.removeItem(`${PREFIX}:${key}`)
  } catch {
    /* storage unavailable */
  }
}

export const STORAGE_KEYS = {
  db: 'db:v1',
  session: 'session:v1',
  settings: 'settings:v1',
  preferences: 'preferences:v1',
  master: 'master:v1',
}
