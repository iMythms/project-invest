import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JwtPayload {
  userId: string
  email: string
  role: string
  familyOfficeId: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { familyOffice: true },
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return null
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    familyOfficeId: user.family_office_id,
  }
}