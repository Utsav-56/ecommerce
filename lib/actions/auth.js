'use server'
import prisma from '@/lib/prisma'
import { createSession, deleteSession, getSessionUser } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function loginAction({ email, password }) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' }
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password.' }
    }

    await createSession(user.id, user.role)
    return { 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    }
  } catch (error) {
    console.error('Login action error:', error)
    return { success: false, error: 'An error occurred during login.' }
  }
}

export async function signupAction({ name, email, password, address }) {
  try {
    if (!name || !email || !password) {
      return { success: false, error: 'Name, email, and password are required.' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address: address || '',
        role: 'USER' // Signups are always USER by default
      }
    })

    // Create default Address record as well
    if (address) {
      await prisma.address.create({
        data: {
          userId: user.id,
          name: name,
          email: email.toLowerCase(),
          street: address,
          city: 'City',
          state: 'State',
          zip: '00000',
          country: 'Country',
          phone: '000-000-0000'
        }
      })
    }

    await createSession(user.id, user.role)
    return { 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    }
  } catch (error) {
    console.error('Signup action error:', error)
    return { success: false, error: 'An error occurred during signup.' }
  }
}

export async function logoutAction() {
  await deleteSession()
  return { success: true }
}

export async function getCurrentUserAction() {
  try {
    const session = await getSessionUser()
    if (!session) return { success: true, user: null }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, address: true }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Get current user action error:', error)
    return { success: false, user: null }
  }
}

export async function getAllUsersAction() {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, users }
  } catch (error) {
    console.error('Get all users action error:', error)
    return { success: false, error: 'Failed to fetch users.' }
  }
}

export async function toggleUserRoleAction(userId) {
  try {
    const session = await getSessionUser()
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized.' }
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return { success: false, error: 'User not found.' }
    }

    // Prevent demoting the default admin to avoid lockout
    if (targetUser.email === 'admin@gocart.com' && targetUser.role === 'ADMIN') {
      return { success: false, error: 'The seed admin account cannot be demoted.' }
    }

    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, role: true }
    })

    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Toggle user role action error:', error)
    return { success: false, error: 'Failed to update user role.' }
  }
}
