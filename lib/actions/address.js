'use server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function getAddressesAction() {
  try {
    const session = await getSessionUser()
    if (!session) return { success: true, list: [] }

    const list = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, list }
  } catch (error) {
    console.error('Get addresses action error:', error)
    return { success: false, list: [] }
  }
}

export async function addAddressAction(addressData) {
  try {
    const session = await getSessionUser()
    if (!session) return { success: false, error: 'User not logged in.' }

    const { name, email, street, city, state, zip, country, phone } = addressData

    if (!name || !email || !street || !city || !state || !zip || !country || !phone) {
      return { success: false, error: 'All address fields are required.' }
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        name,
        email,
        street,
        city,
        state,
        zip,
        country,
        phone
      }
    })

    return { success: true, address }
  } catch (error) {
    console.error('Add address action error:', error)
    return { success: false, error: 'Failed to add address.' }
  }
}
