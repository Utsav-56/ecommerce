const fs = require('fs')
const path = require('path')

// Parse .env manually
try {
  const envPath = path.join(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
} catch (e) {}

const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')

console.log("Runtime process.env.DATABASE_URL:", process.env.DATABASE_URL)

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Executing Prisma query...")
  const users = await prisma.user.findMany()
  console.log("Users in DB:", users)
}

main().catch(err => {
  console.error("Test execution failed:", err)
})
