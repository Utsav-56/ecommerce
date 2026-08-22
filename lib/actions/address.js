'use server'
import prisma from '@/lib/prisma'
import { requireUser, actionSuccess, actionError } from '@/lib/actions/utils'
import { serializeAddress } from '@/lib/domain/serializers/address'
import { validateAddressInput } from '@/lib/domain/validation'

export async function getAddressesAction() {
  try {
    const session = await requireUser()

    const list = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    })

    return actionSuccess({ list: list.map(serializeAddress) })
  } catch (error) {
    console.error('Get addresses action error:', error)
    return actionSuccess({ list: [] })
  }
}

export async function addAddressAction(addressData) {
  try {
    const session = await requireUser()

    const validation = validateAddressInput(addressData || {})
    if (!validation.valid) {
      return actionError(validation.error)
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        ...validation.value
      }
    })

    return actionSuccess({ address: serializeAddress(address) })
  } catch (error) {
    console.error('Add address action error:', error)
    return actionError(error)
  }
}
