import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = requireAuth(request)
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const investment = await prisma.investmentRequest.findUnique({
      where: { id: params.id },
      include: {
        opportunity: true,
        user: true,
      },
    })

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      )
    }

    if (authResult.user.role !== 'approver' && investment.user_id !== authResult.user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Get investment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}