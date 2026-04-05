import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

let prisma;

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:prisma/dev.db' })
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.prisma) {
    const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:prisma/dev.db' })
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma;
}

export default prisma;
