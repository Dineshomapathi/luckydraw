// src/lib/db.ts
import { PrismaClient } from '@prisma/client'
import { Winner } from './types'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function saveWinners(winners: Omit<Winner, 'id' | 'timestamp'>[]) {
  return await prisma.winner.createMany({
    data: winners
  });
}

export async function getWinnersByRound(round: string) {
  return await prisma.winner.findMany({
    where: { round },
    orderBy: { orderNumber: 'asc' }
  });
}

export async function getWinnersByRounds(rounds: string[]) {
  return await prisma.winner.findMany({
    where: {
      round: {
        in: rounds
      }
    },
    orderBy: [
      { round: 'asc' },
      { orderNumber: 'asc' }
    ]
  });
}

export async function getAllWinners() {
  return await prisma.winner.findMany({
    orderBy: [
      { round: 'asc' },
      { orderNumber: 'asc' }
    ]
  });
}