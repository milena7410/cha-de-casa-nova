'use server'

import { db } from '@/lib/db'
import { gifts, messages } from '@/lib/db/schema'
import { demoGifts, demoMessages } from '@/lib/demo-data'
import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getGifts() {
  if (process.env.PREVIEW_DATA === '1') return demoGifts
  return db.select().from(gifts).orderBy(asc(gifts.sortOrder), asc(gifts.id))
}

export async function getMessages() {
  if (process.env.PREVIEW_DATA === '1') return demoMessages
  return db.select().from(messages).orderBy(desc(messages.createdAt)).limit(60)
}

type ClaimResult = { ok: true } | { ok: false; error: string }

export async function claimGift(input: {
  giftId: number
  guestName: string
  message?: string
}): Promise<ClaimResult> {
  const guestName = input.guestName.trim()
  const note = (input.message ?? '').trim()

  if (guestName.length < 2) {
    return { ok: false, error: 'Escreve seu nome pra gente saber quem é você.' }
  }
  if (guestName.length > 60) {
    return { ok: false, error: 'Esse nome ficou comprido demais.' }
  }
  if (note.length > 500) {
    return { ok: false, error: 'A mensagem passou de 500 caracteres.' }
  }
  if (!Number.isInteger(input.giftId) || input.giftId <= 0) {
    return { ok: false, error: 'Presente inválido.' }
  }

  const updated = await db
    .update(gifts)
    .set({ claimedBy: guestName, claimedAt: new Date() })
    .where(and(eq(gifts.id, input.giftId), isNull(gifts.claimedBy)))
    .returning({ id: gifts.id })

  if (updated.length === 0) {
    return { ok: false, error: 'Ops! Alguém escolheu esse presente antes de você.' }
  }

  if (note.length > 0) {
    await db.insert(messages).values({
      giftId: input.giftId,
      guestName,
      body: note,
    })
  }

  revalidatePath('/')
  return { ok: true }
}

export async function releaseGift(input: {
  giftId: number
  guestName: string
}): Promise<ClaimResult> {
  const guestName = input.guestName.trim().toLowerCase()

  const [gift] = await db
    .select({ id: gifts.id, claimedBy: gifts.claimedBy })
    .from(gifts)
    .where(eq(gifts.id, input.giftId))

  if (!gift?.claimedBy) {
    return { ok: false, error: 'Esse presente não está reservado.' }
  }
  if (gift.claimedBy.trim().toLowerCase() !== guestName) {
    return { ok: false, error: 'Só quem reservou pode liberar o presente.' }
  }

  await db
    .update(gifts)
    .set({ claimedBy: null, claimedAt: null })
    .where(eq(gifts.id, input.giftId))

  revalidatePath('/')
  return { ok: true }
}

export async function postMessage(input: {
  guestName: string
  message: string
}): Promise<ClaimResult> {
  const guestName = input.guestName.trim()
  const body = input.message.trim()

  if (guestName.length < 2) {
    return { ok: false, error: 'Escreve seu nome pra gente saber quem é você.' }
  }
  if (body.length < 2) {
    return { ok: false, error: 'Escreve um recadinho antes de enviar.' }
  }
  if (guestName.length > 60 || body.length > 500) {
    return { ok: false, error: 'Texto muito longo, resume um pouquinho.' }
  }

  await db.insert(messages).values({ guestName, body })
  revalidatePath('/')
  return { ok: true }
}
