import { getSessionUser } from '@/lib/session'

export async function requireUser() {
  const session = await getSessionUser()
  if (!session || !session.userId) {
    throw new Error('Unauthorized. User session required.')
  }
  return session
}

export async function requireAdmin() {
  const session = await requireUser()
  if (session.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin role required.')
  }
  return session
}

export function actionSuccess(payload = {}) {
  return { success: true, ...payload }
}

export function actionError(error = 'An unexpected error occurred.') {
  return {
    success: false,
    error: typeof error === 'string' ? error : (error?.message || 'Action failed.')
  }
}
