import type { AccessLevel } from './types'

export function tokenKey(publicId: string) {
  return `cal_${publicId}_token`
}

export function accessKey(publicId: string) {
  return `cal_${publicId}_access`
}

export function readStoredSession(publicId: string): {
  token: string
  access: AccessLevel
} | null {
  const t = localStorage.getItem(tokenKey(publicId))
  const a = localStorage.getItem(accessKey(publicId)) as AccessLevel | null
  if (!t || !a) return null
  if (a !== 'owner' && a !== 'write' && a !== 'read') return null
  return { token: t, access: a }
}

export function writeStoredSession(
  publicId: string,
  token: string,
  access: AccessLevel,
) {
  localStorage.setItem(tokenKey(publicId), token)
  localStorage.setItem(accessKey(publicId), access)
}

export function clearStoredSession(publicId: string) {
  localStorage.removeItem(tokenKey(publicId))
  localStorage.removeItem(accessKey(publicId))
}
