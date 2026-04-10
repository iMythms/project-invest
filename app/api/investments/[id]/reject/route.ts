import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/api-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireRole(request, ['approver'])
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { notes } = body

    const investment = await prisma.investmentRequest.findUnique({
      where: { id },
    })

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      )
    }

    if (investment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending requests can be rejected' },
        { status: 400 }
      )
    }

    const updated = await prisma.investmentRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewed_at: new Date(),
        reviewed_by: authResult.user!.userId,
        notes: notes || null,
      },
    })

    await prisma.auditLog.create({
      data: {
        user_id: authResult.user!.userId,
        action: 'reject_investment',
        entity_type: 'investment_request',
        entity_id: id,
        details: { notes },
        ip_address: request.headers.get('x-forwarded-for') || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Reject investment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
