'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChartBarLineIcon, ChartRingIcon, Invoice03Icon } from '@hugeicons/core-free-icons'
import { StatusDoughnutChart, VolumeBarChart } from '@/components/dashboard-charts'
import { IconTile } from '@/components/icons'
import { EmptyState, LoadingState, MetricCard, PageHeader, SectionCard, StatusBadge } from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency, formatDate, formatLabel } from '@/lib/format'

interface Investment {
  id: string
  amount: string
  status: string
  submitted_at: string
  reviewed_at: string | null
  notes: string | null
  opportunity: {
    name: string
  }
  user?: {
    email: string
    name: string
  }
}

export default function InvestmentsPage() {
  const { user, token, loading } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && token) {
      fetchInvestments()
    }
  }, [user, token, loading, router])

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInvestments(data)
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const filteredInvestments = investments.filter((investment) => {
    if (statusFilter === 'all') {
      return true
    }

    return investment.status === statusFilter
  })

  const pendingCount = investments.filter((investment) => investment.status === 'pending').length
  const approvedCount = investments.filter((investment) => investment.status === 'approved').length
  const rejectedCount = investments.filter((investment) => investment.status === 'rejected').length
  const totalVisibleVolume = filteredInvestments.reduce(
    (total, investment) => total + Number.parseFloat(investment.amount),
    0
  )

  const statusChart = {
    labels: ['Pending', 'Approved', 'Rejected'],
    values: [pendingCount, approvedCount, rejectedCount],
  }

  const volumeByStatus = useMemo(() => {
    const sums = new Map<string, number>([
      ['Pending', 0],
      ['Approved', 0],
      ['Rejected', 0],
    ])

    filteredInvestments.forEach((investment) => {
      const key = formatLabel(investment.status)
      sums.set(key, (sums.get(key) ?? 0) + Number.parseFloat(investment.amount))
    })

    return {
      labels: Array.from(sums.keys()),
      values: Array.from(sums.values()),
    }
  }, [filteredInvestments])

  if (loading || !user) {
    return <LoadingState label="Loading investments..." />
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={user.role === 'approver' ? 'Request oversight' : 'Investment history'}
        title={user.role === 'approver' ? 'Investments' : 'My investments'}
        description={
          user.role === 'approver'
            ? 'Review the full request ledger, monitor pending approvals, and inspect final outcomes.'
            : 'Track your submitted requests, current statuses, and review timing in one operating ledger.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-500" htmlFor="statusFilter">
              Status filter
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field min-w-[180px]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Visible requests"
          value={String(filteredInvestments.length)}
          description="Requests currently returned under the selected filter."
          tone="brand"
          icon={<IconTile icon={Invoice03Icon} tone="brand" size={16} />}
        />
        <MetricCard
          label="Pending"
          value={String(pendingCount)}
          description="Requests still waiting for a final review outcome."
          tone="warning"
          icon={<IconTile icon={ChartRingIcon} tone="warning" size={16} />}
        />
        <MetricCard
          label="Visible volume"
          value={formatCurrency(totalVisibleVolume)}
          description={`Approved requests: ${approvedCount}`}
          icon={<IconTile icon={ChartBarLineIcon} tone="default" size={16} />}
        />
      </section>

      {dataLoading ? (
        <LoadingState label="Loading investments..." />
      ) : filteredInvestments.length === 0 ? (
        <EmptyState
          title="No investment requests found"
          description="Adjust the current filter or create a new investment request from an open opportunity."
          action={
            (user.role === 'investor' || user.role === 'approver') && (
              <Link href="/opportunities" className="btn-primary">
                Review opportunities
              </Link>
            )
          }
        />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard
              title="Volume by status"
              description="The selected ledger filter still keeps status totals and volume legible."
            >
              <VolumeBarChart labels={volumeByStatus.labels} values={volumeByStatus.values} />
            </SectionCard>

            <SectionCard title="Request mix" description="Status split across all visible requests in the workspace.">
              <StatusDoughnutChart labels={statusChart.labels} values={statusChart.values} />
            </SectionCard>
          </section>

          <div className="table-shell">
            <div className="table-container">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    {user.role === 'approver' && <th>Requestor</th>}
                    <th>Opportunity</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Reviewed</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.map((inv) => (
                    <tr key={inv.id}>
                      {user.role === 'approver' && (
                        <td>
                          <div>
                            <p className="font-medium text-slate-900">{inv.user?.name || 'Unknown user'}</p>
                            <p className="mt-1 text-slate-500">{inv.user?.email || '-'}</p>
                          </div>
                        </td>
                      )}
                      <td>
                        <div>
                          <p className="font-medium text-slate-900">{inv.opportunity.name}</p>
                          <p className="mono-text mt-1">{inv.id}</p>
                        </div>
                      </td>
                      <td className="font-medium text-slate-900">{formatCurrency(inv.amount)}</td>
                      <td>
                        <StatusBadge label={formatLabel(inv.status)} />
                      </td>
                      <td>{formatDate(inv.submitted_at)}</td>
                      <td>{formatDate(inv.reviewed_at)}</td>
                      <td>
                        <p className="max-w-xs leading-6 text-slate-500">{inv.notes || '-'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
