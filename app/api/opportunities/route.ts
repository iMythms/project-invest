import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/api-auth'

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

export async function POST(request: NextRequest) {
  const authResult = requireRole(request, ['investment_manager'])
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const body = await request.json()
    const { name, description, minimumInvestment, status } = body

    if (!name || !description || !minimumInvestment) {
      return NextResponse.json(
        { error: 'Name, description, and minimum investment are required' },
        { status: 400 }
      )
    }

    const minimum = Number.parseFloat(String(minimumInvestment))

    if (Number.isNaN(minimum) || minimum <= 0) {
      return NextResponse.json(
        { error: 'Minimum investment must be a valid positive number' },
        { status: 400 }
      )
    }

    const opportunity = await prisma.investmentOpportunity.create({
      data: {
        name: String(name).trim(),
        description: String(description).trim(),
        minimum_investment: minimum,
        status: status === 'closed' ? 'closed' : 'open',
      },
    })

    await prisma.auditLog.create({
      data: {
        user_id: authResult.user!.userId,
        action: 'create_opportunity',
        entity_type: 'investment_opportunity',
        entity_id: opportunity.id,
        details: {
          name: opportunity.name,
          minimumInvestment: minimum,
          status: opportunity.status,
        },
        ip_address: request.headers.get('x-forwarded-for') || null,
      },
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error('Create opportunity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
