import { PrismaClient, UserRole, OpportunityStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const passwordHash = await bcrypt.hash('password123', 10)

  const familyOffice =
    (await prisma.familyOffice.findFirst({
      where: { name: 'Test Family Office' },
    })) ??
    (await prisma.familyOffice.create({
      data: {
        name: 'Test Family Office',
      },
    }))

  console.log('Using family office:', familyOffice.id)

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@test.com' },
    update: {
      password_hash: passwordHash,
      name: 'Viewer User',
      role: UserRole.viewer,
      family_office_id: familyOffice.id,
    },
    create: {
      email: 'viewer@test.com',
      password_hash: passwordHash,
      name: 'Viewer User',
      role: UserRole.viewer,
      family_office_id: familyOffice.id,
    },
  })

  const investor = await prisma.user.upsert({
    where: { email: 'investor@test.com' },
    update: {
      password_hash: passwordHash,
      name: 'Investor User',
      role: UserRole.investor,
      family_office_id: familyOffice.id,
    },
    create: {
      email: 'investor@test.com',
      password_hash: passwordHash,
      name: 'Investor User',
      role: UserRole.investor,
      family_office_id: familyOffice.id,
    },
  })

  const investmentManager = await prisma.user.upsert({
    where: { email: 'manager@test.com' },
    update: {
      password_hash: passwordHash,
      name: 'Investment Manager User',
      role: UserRole.investment_manager,
      family_office_id: familyOffice.id,
    },
    create: {
      email: 'manager@test.com',
      password_hash: passwordHash,
      name: 'Investment Manager User',
      role: UserRole.investment_manager,
      family_office_id: familyOffice.id,
    },
  })

  const approver = await prisma.user.upsert({
    where: { email: 'approver@test.com' },
    update: {
      password_hash: passwordHash,
      name: 'Approver User',
      role: UserRole.approver,
      family_office_id: familyOffice.id,
    },
    create: {
      email: 'approver@test.com',
      password_hash: passwordHash,
      name: 'Approver User',
      role: UserRole.approver,
      family_office_id: familyOffice.id,
    },
  })

  console.log('Ensured users:', viewer.id, investor.id, investmentManager.id, approver.id)

  const existingOpportunities = await prisma.investmentOpportunity.findMany({
    where: {
      name: {
        in: ['Tanami Growth Fund', 'Tech Innovation Fund', 'Real Estate Opportunity Fund'],
      },
    },
    select: { name: true },
  })

  const existingNames = new Set(existingOpportunities.map((opportunity) => opportunity.name))

  if (!existingNames.has('Tanami Growth Fund')) {
    await prisma.investmentOpportunity.create({
      data: {
        name: 'Tanami Growth Fund',
        description:
          'A diversified growth fund focusing on emerging markets with strong fundamentals and sustainable business practices.',
        minimum_investment: 100000,
        status: OpportunityStatus.open,
      },
    })
  }

  if (!existingNames.has('Tech Innovation Fund')) {
    await prisma.investmentOpportunity.create({
      data: {
        name: 'Tech Innovation Fund',
        description:
          'Investment fund targeting innovative technology companies in AI, blockchain, and clean energy sectors.',
        minimum_investment: 50000,
        status: OpportunityStatus.open,
      },
    })
  }

  if (!existingNames.has('Real Estate Opportunity Fund')) {
    await prisma.investmentOpportunity.create({
      data: {
        name: 'Real Estate Opportunity Fund',
        description:
          'Real estate investment fund focusing on commercial properties in major metropolitan areas.',
        minimum_investment: 250000,
        status: OpportunityStatus.closed,
      },
    })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
