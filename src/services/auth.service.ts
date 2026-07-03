import crypto from 'crypto'
import { isDBConfigured, env } from '@/config/env'
import { hashPassword, comparePassword } from '@/lib/password'
import { signAuthToken } from '@/lib/jwt'
import { sendMail } from '@/lib/mailer'
import { verificationEmail } from '@/emails/verification-email'
import { resetPasswordEmail } from '@/emails/reset-password-email'
import { AuthError } from '@/lib/auth-error'
import * as demo from '@/lib/demo/users'
import type { AuthUser, UserRole } from '@/types'
import { serialize } from './serialize'

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1h

async function db() {
  const [{ default: connectDB }, { default: User }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/User'),
  ])
  await connectDB()
  return User
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Narrows a Mongoose IUser (or demo user) down to the public-safe DTO —
// the one and only place passwordHash/token fields get stripped out
// before anything crosses into an API response.
function toAuthUser(u: {
  _id: unknown
  name: string
  email: string
  role: UserRole
  emailVerified: boolean
  provider: 'credentials' | 'google'
  createdAt: unknown
}): AuthUser {
  return {
    _id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerified,
    provider: u.provider,
    createdAt: new Date(u.createdAt as string).toISOString(),
  }
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase()
  if (!input.name?.trim()) throw new AuthError('Name is required', 400)
  if (!email) throw new AuthError('Email is required', 400)
  if (!input.password || input.password.length < 8) {
    throw new AuthError('Password must be at least 8 characters', 400)
  }

  const passwordHash = await hashPassword(input.password)
  const rawToken = generateRawToken()
  const emailVerificationTokenHash = hashToken(rawToken)
  const emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)

  let created: AuthUser

  if (!isDBConfigured) {
    const existing = await demo.findUserByEmail(email)
    if (existing) throw new AuthError('An account with this email already exists', 409)
    const user = await demo.createUser({
      name: input.name.trim(),
      email,
      passwordHash,
      role: 'customer',
      provider: 'credentials',
      emailVerified: false,
      emailVerificationTokenHash,
      emailVerificationExpires: emailVerificationExpires.toISOString(),
    })
    created = toAuthUser(user)
  } else {
    const User = await db()
    const existing = await User.findOne({ email })
    if (existing) throw new AuthError('An account with this email already exists', 409)
    const user = await User.create({
      name: input.name.trim(),
      email,
      passwordHash,
      role: 'customer',
      provider: 'credentials',
      emailVerified: false,
      emailVerificationTokenHash,
      emailVerificationExpires,
    })
    created = toAuthUser(serialize(user))
  }

  const verifyUrl = `${env.appUrl}/verify-email?token=${rawToken}`
  const { subject, html } = verificationEmail(created.name, verifyUrl)
  await sendMail({ to: created.email, subject, html })

  return created
}

export interface LoginInput {
  email: string
  password: string
}

export async function loginUser(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  const email = input.email.trim().toLowerCase()

  if (!isDBConfigured) {
    const user = await demo.findUserByEmail(email)
    if (!user || !user.passwordHash) throw new AuthError('Invalid email or password', 401)
    const ok = await comparePassword(input.password, user.passwordHash)
    if (!ok) throw new AuthError('Invalid email or password', 401)
    const authUser = toAuthUser(user)
    const token = signAuthToken({ sub: authUser._id, email: authUser.email, role: authUser.role })
    return { user: authUser, token }
  }

  const User = await db()
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !user.passwordHash) throw new AuthError('Invalid email or password', 401)
  const ok = await comparePassword(input.password, user.passwordHash)
  if (!ok) throw new AuthError('Invalid email or password', 401)
  const authUser = toAuthUser(serialize(user))
  const token = signAuthToken({ sub: authUser._id, email: authUser.email, role: authUser.role })
  return { user: authUser, token }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  if (!isDBConfigured) {
    const user = await demo.findUserById(id)
    return user ? toAuthUser(user) : null
  }
  const User = await db()
  const user = await User.findById(id)
  return user ? toAuthUser(serialize(user)) : null
}

// Always resolves successfully regardless of whether the email exists —
// callers must not use the return value to infer account existence
// (prevents user enumeration via the forgot-password form).
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase()
  const rawToken = generateRawToken()
  const passwordResetTokenHash = hashToken(rawToken)
  const passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS)

  if (!isDBConfigured) {
    const user = await demo.findUserByEmail(normalized)
    if (!user) return
    await demo.updateUser(user._id, {
      passwordResetTokenHash,
      passwordResetExpires: passwordResetExpires.toISOString(),
    })
    const resetUrl = `${env.appUrl}/reset-password?token=${rawToken}`
    const { subject, html } = resetPasswordEmail(user.name, resetUrl)
    await sendMail({ to: user.email, subject, html })
    return
  }

  const User = await db()
  const user = await User.findOne({ email: normalized })
  if (!user) return
  user.passwordResetTokenHash = passwordResetTokenHash
  user.passwordResetExpires = passwordResetExpires
  await user.save()
  const resetUrl = `${env.appUrl}/reset-password?token=${rawToken}`
  const { subject, html } = resetPasswordEmail(user.name, resetUrl)
  await sendMail({ to: user.email, subject, html })
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  if (!newPassword || newPassword.length < 8) {
    throw new AuthError('Password must be at least 8 characters', 400)
  }
  const tokenHash = hashToken(rawToken)
  const passwordHash = await hashPassword(newPassword)

  if (!isDBConfigured) {
    const user = await demo.findUserByResetHash(tokenHash)
    if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
      throw new AuthError('Reset link is invalid or has expired', 400)
    }
    await demo.updateUser(user._id, {
      passwordHash,
      passwordResetTokenHash: undefined,
      passwordResetExpires: undefined,
    })
    return
  }

  const User = await db()
  const user = await User.findOne({ passwordResetTokenHash: tokenHash }).select('+passwordResetTokenHash +passwordResetExpires')
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new AuthError('Reset link is invalid or has expired', 400)
  }
  user.passwordHash = passwordHash
  user.passwordResetTokenHash = undefined
  user.passwordResetExpires = undefined
  await user.save()
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken)

  if (!isDBConfigured) {
    const user = await demo.findUserByVerificationHash(tokenHash)
    if (!user || !user.emailVerificationExpires || new Date(user.emailVerificationExpires) < new Date()) {
      throw new AuthError('Verification link is invalid or has expired', 400)
    }
    await demo.updateUser(user._id, {
      emailVerified: true,
      emailVerificationTokenHash: undefined,
      emailVerificationExpires: undefined,
    })
    return
  }

  const User = await db()
  const user = await User.findOne({ emailVerificationTokenHash: tokenHash }).select(
    '+emailVerificationTokenHash +emailVerificationExpires'
  )
  if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
    throw new AuthError('Verification link is invalid or has expired', 400)
  }
  user.emailVerified = true
  user.emailVerificationTokenHash = undefined
  user.emailVerificationExpires = undefined
  await user.save()
}

// Phase 8/9 — shared profile-editing logic for both the Admin Profile
// page and the Customer Dashboard's "Edit Profile" (same User model,
// same rules — no reason to duplicate this per role).
export interface UpdateProfileInput {
  name?: string
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
  const update: Record<string, unknown> = {}
  if (input.name?.trim()) update.name = input.name.trim()

  if (!isDBConfigured) {
    const user = await demo.updateUser(userId, update)
    if (!user) throw new AuthError('User not found', 404)
    return toAuthUser(user)
  }

  const User = await db()
  const user = await User.findByIdAndUpdate(userId, update, { new: true })
  if (!user) throw new AuthError('User not found', 404)
  return toAuthUser(serialize(user))
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  if (!input.newPassword || input.newPassword.length < 8) {
    throw new AuthError('New password must be at least 8 characters', 400)
  }
  const newHash = await hashPassword(input.newPassword)

  if (!isDBConfigured) {
    const user = await demo.findUserById(userId)
    if (!user?.passwordHash) throw new AuthError('User not found', 404)
    const ok = await comparePassword(input.currentPassword, user.passwordHash)
    if (!ok) throw new AuthError('Current password is incorrect', 401)
    await demo.updateUser(userId, { passwordHash: newHash })
    return
  }

  const User = await db()
  const user = await User.findById(userId).select('+passwordHash')
  if (!user?.passwordHash) throw new AuthError('User not found', 404)
  const ok = await comparePassword(input.currentPassword, user.passwordHash)
  if (!ok) throw new AuthError('Current password is incorrect', 401)
  user.passwordHash = newHash
  await user.save()
}
