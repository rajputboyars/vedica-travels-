// Demo-mode user store (no MONGODB_URI configured) — mirrors
// lib/demo/{tours,bookings,gallery}.ts so the new auth system is testable
// without a database, same as every other feature in this app.
import { hashPassword } from '@/lib/password'

export interface DemoUser {
  _id: string
  name: string
  email: string
  passwordHash?: string
  role: 'admin' | 'customer'
  provider: 'credentials' | 'google'
  providerId?: string
  emailVerified: boolean
  emailVerificationTokenHash?: string
  emailVerificationExpires?: string
  passwordResetTokenHash?: string
  passwordResetExpires?: string
  createdAt: string
  updatedAt: string
}

type Store = { users: DemoUser[]; seeded: boolean }

const g = global as unknown as { __demoUserStore?: Store }

if (!g.__demoUserStore) {
  g.__demoUserStore = { users: [], seeded: false }
}

const store = g.__demoUserStore

async function seed() {
  if (store.seeded) return
  store.seeded = true
  store.users = [
    {
      _id: 'demo-user-1',
      name: 'Demo Customer',
      email: 'customer@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'customer',
      provider: 'credentials',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

export async function findUserByEmail(email: string): Promise<DemoUser | undefined> {
  await seed()
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export async function findUserById(id: string): Promise<DemoUser | undefined> {
  await seed()
  return store.users.find((u) => u._id === id)
}

export async function createUser(data: Partial<DemoUser>): Promise<DemoUser> {
  await seed()
  const now = new Date().toISOString()
  const user: DemoUser = {
    _id: 'u-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    name: data.name || '',
    email: (data.email || '').toLowerCase(),
    passwordHash: data.passwordHash,
    role: data.role || 'customer',
    provider: data.provider || 'credentials',
    providerId: data.providerId,
    emailVerified: data.emailVerified ?? false,
    emailVerificationTokenHash: data.emailVerificationTokenHash,
    emailVerificationExpires: data.emailVerificationExpires,
    createdAt: now,
    updatedAt: now,
  }
  store.users.push(user)
  return user
}

export async function updateUser(id: string, data: Partial<DemoUser>): Promise<DemoUser | undefined> {
  await seed()
  const user = store.users.find((u) => u._id === id)
  if (!user) return undefined
  Object.assign(user, data, { updatedAt: new Date().toISOString() })
  return user
}

export async function findUserByVerificationHash(hash: string): Promise<DemoUser | undefined> {
  await seed()
  return store.users.find((u) => u.emailVerificationTokenHash === hash)
}

export async function findUserByResetHash(hash: string): Promise<DemoUser | undefined> {
  await seed()
  return store.users.find((u) => u.passwordResetTokenHash === hash)
}
