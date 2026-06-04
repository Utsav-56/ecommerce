const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse .env manually
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
} catch (e) {}

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

async function run() {
  try {
    console.log('Checking database schema status...');
    
    // 1. Run prisma db push to ensure database file and tables exist
    execSync('pnpx prisma db push', { stdio: 'inherit' });
    
    // 2. Query to see if any user records exist
    const rawUrl = process.env.DATABASE_URL || 'file:prisma/dev.db';
    let dbUrl = rawUrl;
    if (rawUrl.startsWith('file:')) {
      const filePath = rawUrl.slice(5);
      if (!path.isAbsolute(filePath)) {
        dbUrl = `file:${path.resolve(__dirname, '..', filePath)}`;
      }
    }
    const adapter = new PrismaLibSql({
      url: dbUrl
    });
    const prisma = new PrismaClient({ adapter });
    
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    
    if (userCount === 0) {
      console.log('No user records found. Seeding initial accounts and coupons...');
      execSync('pnpx prisma db seed', { stdio: 'inherit' });
    } else {
      console.log('Database already has data. Skipping seed.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

run();
