import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request)
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const opportunities = await prisma.investmentOpportunity.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Get opportunities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}