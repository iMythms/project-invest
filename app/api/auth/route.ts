import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateUser, generateToken, hashPassword } from '@/lib/auth'
import { getAuthUser } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const userPayload = await authenticateUser(email, password)

    if (!userPayload) {
      await prisma.auditLog.create({
        data: {
          user_id: null,
          action: 'login_failed',
          entity_type: 'user',
          details: { email, reason: 'invalid_credentials' },
          ip_address: request.headers.get('x-forwarded-for') || null,
        },
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await prisma.auditLog.create({
      data: {
        user_id: userPayload.userId,
        action: 'login_success',
        entity_type: 'user',
        entity_id: userPayload.userId,
        details: { email },
        ip_address: request.headers.get('x-forwarded-for') || null,
      },
    })

    const token = generateToken(userPayload)

    return NextResponse.json({
      token,
      user: {
        id: userPayload.userId,
        email: userPayload.email,
        role: userPayload.role,
        familyOfficeId: userPayload.familyOfficeId,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, familyOfficeId } = body

    if (!email || !password || !name || !role || !familyOfficeId) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        role,
        family_office_id: familyOfficeId,
      },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}