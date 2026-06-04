import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from "prisma/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables manually for Prisma CLI context
try {
  const envPath = path.join(__dirname, '.env');
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
} catch (e) {
  console.warn('Prisma config env parse warning:', e);
}

const getAbsoluteDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || 'file:prisma/dev.db';
  if (url.startsWith('file:')) {
    const filePath = url.slice(5);
    if (path.isAbsolute(filePath)) return url;
    // Resolve relative to the directory containing prisma.config.js (project root)
    return `file:${path.resolve(__dirname, filePath)}`;
  }
  return url;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getAbsoluteDatabaseUrl(),
  },
  migrations: {
    seed: "node prisma/seed.js",
  },
});
