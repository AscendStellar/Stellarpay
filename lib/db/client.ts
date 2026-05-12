/**
 * lib/db/client.ts
 * Prisma client singleton — avoids creating multiple connections in development.
 */

import { PrismaClient } from '@prisma/client'

declare global {
  // Allow global caching in dev to prevent hot-reload connection leaks
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const db = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}
