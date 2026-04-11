'use server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export async function getAdminDashboardStatsAction() {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()
    const totalCustomers = await prisma.user.count({
      where: { role: 'USER' }
    })

    const paidOrders = await prisma.order.findMany({
      where: { isPaid: true },
      select: { total: true }
    })
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0)

    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        createdAt: true,
        total: true,
        isPaid: true,
        status: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const allOrdersFormatted = allOrders.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString()
    }))

    return {
      success: true,
      stats: {
        products: totalProducts,
        revenue: totalRevenue,
        orders: totalOrders,
        customers: totalCustomers,
        allOrders: allOrdersFormatted
      }
    }
  } catch (error) {
    console.error('Get admin stats action error:', error)
    return { success: false, error: 'Failed to fetch admin stats.' }
  }
}
