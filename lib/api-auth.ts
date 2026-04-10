import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function requireAuth(request: NextRequest) {
  const user = getAuthUser(request)
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }
  return { user }
}

export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = requireAuth(request)
  if (authResult.error) {
    return authResult
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user: authResult.user }
}