'use server'
import prisma from '@/lib/prisma'
import { createSession, deleteSession, getSessionUser } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { requireAdmin, actionSuccess, actionError } from '@/lib/actions/utils'
import { ROLES, isAllowedRole } from '@/lib/constants/auth'

export async function loginAction({ email, password }) {
  try {
    if (!email || !password) {
      return actionError('Email and password are required.')
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return actionError('Invalid email or password.')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return actionError('Invalid email or password.')
    }

    await createSession(user.id, user.role)
    return actionSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    console.error('Login action error:', error)
    return actionError('An error occurred during login.')
  }
}

export async function signupAction({ name, email, password, address }) {
  try {
    if (!name || !email || !password) {
      return actionError('Name, email, and password are required.')
    }

    const cleanEmail = email.toLowerCase().trim()
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return actionError('An account with this email already exists.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Transactional creation of User and default Address
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          address: address ? address.trim() : '',
          role: ROLES.USER
        }
      })

      if (address && address.trim()) {
        await tx.address.create({
          data: {
            userId: newUser.id,
            name: name.trim(),
            email: cleanEmail,
            street: address.trim(),
            city: 'City',
            state: 'State',
            zip: '00000',
            country: 'Country',
            phone: '000-000-0000'
          }
        })
      }

      return newUser
    })

    await createSession(user.id, user.role)
    return actionSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    console.error('Signup action error:', error)
    return actionError('An error occurred during signup.')
  }
}

export async function logoutAction() {
  await deleteSession()
  return actionSuccess()
}

export async function getCurrentUserAction() {
  try {
    const session = await getSessionUser()
    if (!session) return actionSuccess({ user: null })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, address: true }
    })

    return actionSuccess({ user })
  } catch (error) {
    console.error('Get current user action error:', error)
    return actionSuccess({ user: null })
  }
}

export async function getAllUsersAction() {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = users.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString()
    }))

    return actionSuccess({ users: formatted })
  } catch (error) {
    console.error('Get all users action error:', error)
    return actionError(error)
  }
}

export async function toggleUserRoleAction(userId) {
  try {
    await requireAdmin()

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return actionError('User not found.')
    }

    if (targetUser.email === 'admin@gocart.com' && targetUser.role === ROLES.ADMIN) {
      return actionError('The seed admin account cannot be demoted.')
    }

    const newRole = targetUser.role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, role: true }
    })

    return actionSuccess({ user: updatedUser })
  } catch (error) {
    console.error('Toggle user role action error:', error)
    return actionError(error)
  }
}
