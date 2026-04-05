import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_SECRET = process.env.SESSION_SECRET || 'e9a9d20c5d5e2ba7e8bb657bf5c31622b7c6c49e798f4bbd05cf52bd7aefce3d'
const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

// Helper to get 32-byte key from secret
function getKey() {
  if (SESSION_SECRET.length === 64) {
    return Buffer.from(SESSION_SECRET, 'hex')
  }
  // Fallback / pad key to 32 bytes
  return crypto.createHash('sha256').update(SESSION_SECRET).digest()
}

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = getKey()
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decrypt(text) {
  try {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const key = getKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (e) {
    return null
  }
}

export async function createSession(userId, role) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const sessionData = JSON.stringify({ userId, role, exp: expiresAt.getTime() })
  const encrypted = encrypt(sessionData)
  
  const cookieStore = await cookies()
  cookieStore.set('session', encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/'
  })
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  
  const decrypted = decrypt(sessionCookie)
  if (!decrypted) return null
  
  try {
    const data = JSON.parse(decrypted)
    if (Date.now() > data.exp) {
      await deleteSession()
      return null
    }
    return data
  } catch (e) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
