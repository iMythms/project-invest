import { PrismaClient, UserRole, OpportunityStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const passwordHash = await bcrypt.hash('password123', 10)

  const familyOffice = await prisma.familyOffice.create({
    data: {
      name: 'Test Family Office',
    },
  })

  console.log('Created family office:', familyOffice.id)

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@test.com',
      password_hash: passwordHash,
      name: 'Viewer User',
      role: UserRole.viewer,
      family_office_id: familyOffice.id,
    },
  })

  const investor = await prisma.user.create({
    data: {
      email: 'investor@test.com',
      password_hash: passwordHash,
      name: 'Investor User',
      role: UserRole.investor,
      family_office_id: familyOffice.id,
    },
  })

  const approver = await prisma.user.create({
    data: {
      email: 'approver@test.com',
      password_hash: passwordHash,
      name: 'Approver User',
      role: UserRole.approver,
      family_office_id: familyOffice.id,
    },
  })

  console.log('Created users:', viewer.id, investor.id, approver.id)

  const opportunity1 = await prisma.investmentOpportunity.create({
    data: {
      name: 'Tanami Growth Fund',
      description: 'A diversified growth fund focusing on emerging markets with strong fundamentals and sustainable business practices.',
      minimum_investment: 100000,
      status: OpportunityStatus.open,
    },
  })

  const opportunity2 = await prisma.investmentOpportunity.create({
    data: {
      name: 'Tech Innovation Fund',
      description: 'Investment fund targeting innovative technology companies in AI, blockchain, and clean energy sectors.',
      minimum_investment: 50000,
      status: OpportunityStatus.open,
    },
  })

  const opportunity3 = await prisma.investmentOpportunity.create({
    data: {
      name: 'Real Estate Opportunity Fund',
      description: 'Real estate investment fund focusing on commercial properties in major metropolitan areas.',
      minimum_investment: 250000,
      status: OpportunityStatus.closed,
    },
  })

  console.log('Created opportunities:', opportunity1.id, opportunity2.id, opportunity3.id)

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