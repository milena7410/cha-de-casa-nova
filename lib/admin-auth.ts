import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'casa-nova-admin'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7

function adminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? ''
}

function sessionSecret() {
  return process.env.ADMIN_SECRET?.trim() || adminPassword()
}

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

function safeEqual(first: string, second: string) {
  return timingSafeEqual(digest(first), digest(second))
}

function sign(expiresAt: string) {
  return createHmac('sha256', sessionSecret()).update(expiresAt).digest('base64url')
}

export function isAdminConfigured() {
  return adminPassword().length >= 8
}

export function validAdminPassword(value: string) {
  const expected = adminPassword()
  return expected.length >= 8 && safeEqual(value, expected)
}

export async function createAdminSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS)
  const token = `${expiresAt}.${sign(expiresAt)}`
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}

export async function hasAdminSession() {
  if (!isAdminConfigured() || !sessionSecret()) return false

  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return false

  const [expiresAt, signature, extra] = token.split('.')
  if (!expiresAt || !signature || extra) return false

  const expiration = Number(expiresAt)
  if (!Number.isFinite(expiration) || expiration <= Math.floor(Date.now() / 1000)) return false

  return safeEqual(signature, sign(expiresAt))
}
