import bcrypt from 'bcryptjs'

// bcryptjs (already a dependency, pure-JS so no native build step) —
// 10 rounds is the widely-recommended default balance of cost vs latency.
const SALT_ROUNDS = 10

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
