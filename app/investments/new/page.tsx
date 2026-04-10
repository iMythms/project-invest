import NewInvestmentClientPage from './page-client'

interface NewInvestmentPageProps {
  searchParams: Promise<{
    opportunityId?: string
  }>
}

export default async function NewInvestmentPage({ searchParams }: NewInvestmentPageProps) {
  const { opportunityId } = await searchParams

  return (
    <NewInvestmentClientPage
      opportunityId={typeof opportunityId === 'string' ? opportunityId : undefined}
    />
  )
}
