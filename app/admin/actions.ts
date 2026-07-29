'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  clearAdminSession,
  createAdminSession,
  hasAdminSession,
  isAdminConfigured,
  validAdminPassword,
} from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { gifts } from '@/lib/db/schema'

type ActionResult = { ok: true } | { ok: false; error: string }

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim()
}

function parsePrice(rawValue: string) {
  if (!rawValue) return null
  const normalized = rawValue.includes(',')
    ? rawValue.replace(/\./g, '').replace(',', '.')
    : rawValue
  const price = Number(normalized)
  if (!Number.isFinite(price) || price < 0 || price > 999999.99) return undefined
  return price.toFixed(2)
}

function validUrl(rawValue: string) {
  if (!rawValue) return null
  try {
    const url = new URL(rawValue)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

async function authorized() {
  return hasAdminSession()
}

export async function loginAdmin(
  _previousState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  if (!isAdminConfigured()) {
    return { error: 'Defina ADMIN_PASSWORD nas variáveis de ambiente antes de entrar.' }
  }

  if (!validAdminPassword(value(formData, 'password'))) {
    return { error: 'Senha incorreta. Tente novamente.' }
  }

  await createAdminSession()
  redirect('/admin')
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect('/admin')
}

export async function saveGift(formData: FormData): Promise<ActionResult> {
  if (!(await authorized())) return { ok: false, error: 'Sua sessão expirou. Entre novamente.' }

  const rawId = value(formData, 'id')
  const name = value(formData, 'name')
  const room = value(formData, 'room')
  const tier = value(formData, 'tier') === 'especial' ? 'especial' : 'essencial'
  const note = value(formData, 'note')
  const price = parsePrice(value(formData, 'price'))
  const url = validUrl(value(formData, 'url'))
  const sortOrder = Number.parseInt(value(formData, 'sortOrder') || '0', 10)

  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: 'O nome precisa ter entre 2 e 120 caracteres.' }
  }
  if (room.length < 2 || room.length > 60) {
    return { ok: false, error: 'Informe um cômodo válido.' }
  }
  if (note.length > 300) {
    return { ok: false, error: 'A observação pode ter no máximo 300 caracteres.' }
  }
  if (price === undefined) {
    return { ok: false, error: 'Informe um preço válido.' }
  }
  if (url === undefined) {
    return { ok: false, error: 'O link precisa começar com http:// ou https://.' }
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
    return { ok: false, error: 'A ordem precisa ser um número entre 0 e 9999.' }
  }

  const fields = {
    name,
    room,
    tier,
    note: note || null,
    price,
    url,
    sortOrder,
  }

  if (rawId) {
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, error: 'Presente inválido.' }
    }
    const updated = await db.update(gifts).set(fields).where(eq(gifts.id, id)).returning({ id: gifts.id })
    if (updated.length === 0) return { ok: false, error: 'Esse presente não existe mais.' }
  } else {
    await db.insert(gifts).values(fields)
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return { ok: true }
}

export async function deleteGift(id: number): Promise<ActionResult> {
  if (!(await authorized())) return { ok: false, error: 'Sua sessão expirou. Entre novamente.' }
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'Presente inválido.' }

  const removed = await db.delete(gifts).where(eq(gifts.id, id)).returning({ id: gifts.id })
  if (removed.length === 0) return { ok: false, error: 'Esse presente não existe mais.' }

  revalidatePath('/')
  revalidatePath('/admin')
  return { ok: true }
}
