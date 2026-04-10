import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const authResult = requireRole(request, ['investor', 'approver'])
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const body = await request.json()
    const { opportunityId, amount } = body

    if (!opportunityId || !amount) {
      return NextResponse.json(
        { error: 'Opportunity ID and amount required' },
        { status: 400 }
      )
    }

    const opportunity = await prisma.investmentOpportunity.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (opportunity.status === 'closed') {
      return NextResponse.json(
        { error: 'Opportunity is closed' },
        { status: 400 }
      )
    }

    if (parseFloat(amount) < parseFloat(opportunity.minimum_investment.toString())) {
      return NextResponse.json(
        { error: `Amount must be at least ${opportunity.minimum_investment}` },
        { status: 400 }
      )
    }

    const investmentRequest = await prisma.investmentRequest.create({
      data: {
        user_id: authResult.user.userId,
        opportunity_id: opportunityId,
        amount: amount,
        status: 'pending',
      },
    })

    await prisma.auditLog.create({
      data: {
        user_id: authResult.user.userId,
        action: 'submit_investment',
        entity_type: 'investment_request',
        entity_id: investmentRequest.id,
        details: { opportunityId, amount },
        ip_address: request.headers.get('x-forwarded-for') || null,
      },
    })

    return NextResponse.json(investmentRequest)
  } catch (error) {
    console.error('Create investment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const authResult = requireRole(request, ['viewer', 'investor', 'approver'])
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    let whereClause: any = {}

    if (authResult.user.role !== 'approver') {
      whereClause = { user_id: authResult.user.userId }
    }

    const investments = await prisma.investmentRequest.findMany({
      where: whereClause,
      include: {
        opportunity: true,
        user: true,
      },
      orderBy: { submitted_at: 'desc' },
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error('Get investments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}