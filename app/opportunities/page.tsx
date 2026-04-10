'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase01Icon, DollarCircleIcon, TaskDaily01Icon } from '@hugeicons/core-free-icons'
import { IconTile } from '@/components/icons'
import { EmptyState, LoadingState, MetricCard, PageHeader, SectionCard, StatusBadge } from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
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

  const averageMinimum = useMemo(() => {
    if (opportunities.length === 0) {
      return 0
    }

    const total = opportunities.reduce(
      (sum, opportunity) => sum + Number.parseFloat(opportunity.minimum_investment),
      0
    )

    return total / opportunities.length
  }, [opportunities])

  const totalMinimumPipeline = opportunities.reduce(
    (sum, opportunity) => sum + Number.parseFloat(opportunity.minimum_investment),
    0
  )

  if (loading || !user) {
    return <LoadingState label="Loading opportunities..." />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Opportunity pipeline"
        title="Opportunities"
        description="Review open opportunities, scan commitment thresholds, and route directly into request submission when your role permits execution."
        actions={
          <div className="surface-subtle px-4 py-3 text-sm text-slate-600">
            {opportunities.length} open opportunit{opportunities.length === 1 ? 'y' : 'ies'}
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Open opportunities"
          value={String(opportunities.length)}
          description="Deals currently visible for review."
          tone="brand"
          icon={<IconTile icon={Briefcase01Icon} tone="brand" size={16} />}
        />
        <MetricCard
          label="Average minimum"
          value={formatCurrency(averageMinimum)}
          description="Average minimum commitment across the visible pipeline."
          icon={<IconTile icon={DollarCircleIcon} tone="default" size={16} />}
        />
        <MetricCard
          label="Pipeline threshold"
          value={formatCurrency(totalMinimumPipeline)}
          description="Combined minimum commitment represented by visible opportunities."
          icon={<IconTile icon={TaskDaily01Icon} tone="warning" size={16} />}
        />
      </section>

      <SectionCard
        title="Pipeline view"
        description="A denser, ledger-style opportunities view works better here than isolated promotional cards."
      >
        {dataLoading ? (
          <LoadingState label="Loading opportunities..." />
        ) : opportunities.length === 0 ? (
          <EmptyState
            title="No open opportunities"
            description="New opportunities will appear here once they are opened for review and capital allocation."
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              {opportunities.slice(0, 3).map((opportunity) => (
                <div key={opportunity.id} className="surface-subtle p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{opportunity.name}</p>
                    <StatusBadge label={formatLabel(opportunity.status)} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{opportunity.description}</p>
                  <p className="mt-4 text-sm font-medium text-slate-900">
                    Minimum {formatCurrency(opportunity.minimum_investment)}
                  </p>
                </div>
              ))}
            </div>

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
          </div>
        )}
      </SectionCard>

      {(user.role === 'investor' || user.role === 'approver') && (
        <div className="surface-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ready to move on a mandate?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select an opportunity to create a new capital request with the minimum commitment prefilled.
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
