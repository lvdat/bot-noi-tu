import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton.
 * Reuses the same instance across the application to avoid
 * creating multiple database connections.
 */
const prisma = new PrismaClient()

export default prisma
