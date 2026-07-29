import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { cache } from 'react'
import * as schema from './schema'

export const getDb = cache(() => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada.')

  return drizzle(neon(connectionString), { schema })
})
