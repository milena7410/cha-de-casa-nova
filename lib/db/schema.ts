import { integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const gifts = pgTable('gifts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  room: text('room').notNull(),
  tier: text('tier').notNull().default('essencial'),
  note: text('note'),
  price: numeric('price', { precision: 10, scale: 2 }),
  url: text('url'),
  sortOrder: integer('sort_order').notNull().default(0),
  claimedBy: text('claimed_by'),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  giftId: integer('gift_id'),
  guestName: text('guest_name').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Gift = typeof gifts.$inferSelect
export type Message = typeof messages.$inferSelect
