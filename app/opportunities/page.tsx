'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/ui'
import { formatCurrency, formatLabel } from '@/lib/format'

interface Opportunity {
  id: string
  name: string
  description: string
  minimum_investment: string
  status: string
}

export default function OpportunitiesPage() {
  const { user, token, loading } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && token) {
      fetchOpportunities()
    }
  }, [user, token, loading, router])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOpportunities(data)
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user) {
    return <LoadingState label="Loading opportunities..." />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Opportunity pipeline"
        title="Opportunities"
        description="Review open opportunities, validate minimum commitments, and route into investment request submission when permitted by role."
        actions={
          <div className="surface-subtle px-4 py-3 text-sm text-slate-600">
            {opportunities.length} open opportunit{opportunities.length === 1 ? 'y' : 'ies'}
          </div>
        }
      />

      {dataLoading ? (
        <LoadingState label="Loading opportunities..." />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No open opportunities"
          description="New opportunities will appear here once they are opened for review and capital allocation."
        />
      ) : (
        <div className="table-shell">
          <div className="table-container">
            <table className="data-table min-w-[860px]">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Description</th>
                  <th>Minimum commitment</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900">{opp.name}</p>
                        <p className="mono-text mt-1">{opp.id}</p>
                      </div>
                    </td>
                    <td>
                      <p className="max-w-xl leading-6 text-slate-600">{opp.description}</p>
                    </td>
                    <td className="font-medium text-slate-900">{formatCurrency(opp.minimum_investment)}</td>
                    <td>
                      <StatusBadge label={formatLabel(opp.status)} />
                    </td>
                    <td>
                      <div className="flex justify-end">
                        {user.role === 'investor' || user.role === 'approver' ? (
                          <button
                            onClick={() => router.push(`/investments/new?opportunityId=${opp.id}`)}
                            className="btn-primary"
                          >
                            Submit request
                          </button>
                        ) : (
                          <span className="text-sm text-slate-500">Read-only access</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(user.role === 'investor' || user.role === 'approver') && (
        <div className="surface-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Need to move quickly?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select any open opportunity to create a new capital request with the minimum commitment prefilled.
            </p>
          </div>
          <Link href="/investments" className="btn-secondary">
            Review existing requests
          </Link>
        </div>
      )}
    </div>
  )
}
