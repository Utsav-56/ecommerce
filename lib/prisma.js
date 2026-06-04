import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

function getAbsoluteDatabaseUrl() {
  const url = process.env.DATABASE_URL || 'file:prisma/dev.db';
  if (url.startsWith('file:')) {
    const filePath = url.slice(5);
    if (path.isAbsolute(filePath)) {
      return url;
    }
    // In Next.js, process.cwd() is always the project root
    return `file:${path.resolve(process.cwd(), filePath)}`;
  }
  return url;
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaLibSql({ url: getAbsoluteDatabaseUrl() })
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.prisma) {
    const adapter = new PrismaLibSql({ url: getAbsoluteDatabaseUrl() })
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma;
}

export default prisma;
