'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { EmptyState, LoadingState, MetricCard, PageHeader, SectionCard, StatusBadge } from '@/components/ui'
import { formatCurrency, formatDateTime, formatLabel } from '@/lib/format'

interface Opportunity {
  id: string
  name: string
  minimum_investment: string
  status: string
}

interface Investment {
  id: string
  amount: string
  status: string
  submitted_at: string
  opportunity: {
    name: string
  }
  user?: {
    name: string
    email: string
  }
}

interface AuditLog {
  id: string
  action: string
  timestamp: string
  user: {
    name: string
    email: string
  } | null
}

export default function DashboardPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && token) {
      fetchDashboardData()
    }
  }, [user, token, loading, router])

  const fetchDashboardData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const requests = [
        fetch('/api/opportunities', { headers }),
        fetch('/api/investments', { headers }),
      ]

      if (user?.role === 'approver') {
        requests.push(fetch('/api/audit-logs?limit=5', { headers }))
      }

      const responses = await Promise.all(requests)
      const [opportunitiesResponse, investmentsResponse, auditResponse] = responses

      if (opportunitiesResponse.ok) {
        setOpportunities(await opportunitiesResponse.json())
      }

      if (investmentsResponse.ok) {
        setInvestments(await investmentsResponse.json())
      }

      if (auditResponse?.ok) {
        const data = await auditResponse.json()
        setAuditLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user) {
    return <LoadingState label="Loading workspace..." />
  }

  const pendingCount = investments.filter((investment) => investment.status === 'pending').length
  const approvedCount = investments.filter((investment) => investment.status === 'approved').length
  const rejectedCount = investments.filter((investment) => investment.status === 'rejected').length
  const totalVolume = investments.reduce((total, investment) => total + Number.parseFloat(investment.amount), 0)
  const recentInvestments = investments.slice(0, 5)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace overview"
        title="Dashboard"
        description={`Signed in as ${user.email}. The dashboard prioritizes current investment flow, approval pressure, and recent activity for the ${user.role} role.`}
        actions={
          <>
            <Link href="/opportunities" className="btn-secondary">
              Review opportunities
            </Link>
            {(user.role === 'investor' || user.role === 'approver') && (
              <Link href="/investments" className="btn-primary">
                Open investments
              </Link>
            )}
          </>
        }
      />

      {dataLoading ? (
        <LoadingState label="Loading dashboard data..." />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Open opportunities"
              value={String(opportunities.length)}
              description="Currently available investment opportunities."
              tone="brand"
            />
            <MetricCard
              label={user.role === 'approver' ? 'Pending approvals' : 'Pending requests'}
              value={String(pendingCount)}
              description="Requests waiting for an approval decision."
              tone="warning"
            />
            <MetricCard
              label="Approved requests"
              value={String(approvedCount)}
              description="Requests cleared through the workflow."
              tone="success"
            />
            <MetricCard
              label="Requested volume"
              value={formatCurrency(totalVolume)}
              description="Aggregate volume across visible requests."
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <SectionCard
              title={user.role === 'approver' ? 'Review queue' : 'Recent investment activity'}
              description={
                user.role === 'approver'
                  ? 'Recent capital requests sorted by submission time.'
                  : 'Track the most recent status changes across your requests.'
              }
            >
              {recentInvestments.length === 0 ? (
                <EmptyState
                  title="No investment activity yet"
                  description="Once requests are submitted, the latest activity will appear here for quick review."
                  action={
                    (user.role === 'investor' || user.role === 'approver') && (
                      <Link href="/opportunities" className="btn-primary">
                        Review open opportunities
                      </Link>
                    )
                  }
                />
              ) : (
                <div className="space-y-3">
                  {recentInvestments.map((investment) => (
                    <div key={investment.id} className="surface-subtle flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-medium text-slate-900">{investment.opportunity.name}</p>
                          <StatusBadge label={formatLabel(investment.status)} />
                        </div>
                        <p className="text-sm text-slate-600">
                          {formatCurrency(investment.amount)} submitted {formatDateTime(investment.submitted_at)}
                        </p>
                        {investment.user ? (
                          <p className="text-sm text-slate-500">
                            Requestor: {investment.user.name} ({investment.user.email})
                          </p>
                        ) : null}
                      </div>
                      <Link href={user.role === 'approver' ? '/approve' : '/investments'} className="btn-secondary">
                        {user.role === 'approver' ? 'Review request' : 'Open history'}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard
                title="Role context"
                description="Each role inherits one design language with different operational emphasis."
              >
                <div className="space-y-3 text-sm leading-6 text-slate-600">
                  <div className="surface-subtle p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">Current role</p>
                      <StatusBadge label={user.role} tone="brand" />
                    </div>
                    <p className="mt-2">
                      {user.role === 'viewer'
                        ? 'Read-only access to opportunities and investment visibility.'
                        : user.role === 'investor'
                          ? 'Focused on opportunity review and capital request submission.'
                          : 'Focused on decision queue speed, request oversight, and governance visibility.'}
                    </p>
                  </div>
                  <div className="surface-subtle p-4">
                    <p className="font-medium text-slate-900">Current pressure points</p>
                    <p className="mt-2">
                      {pendingCount > 0
                        ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} currently need attention.`
                        : 'No requests are currently waiting on the next workflow step.'}
                    </p>
                    <p className="mt-2">
                      {rejectedCount > 0
                        ? `${rejectedCount} request${rejectedCount === 1 ? '' : 's'} ended in rejection and may need follow-up.`
                        : 'No rejected requests are visible in this workspace.'}
                    </p>
                  </div>
                </div>
              </SectionCard>

              {user.role === 'approver' && (
                <SectionCard
                  title="Recent audit events"
                  description="Latest governance events pulled from the audit trail."
                >
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-slate-500">No recent audit events available.</p>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="surface-subtle p-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <StatusBadge label={formatLabel(log.action)} tone="brand" />
                            <p className="text-sm text-slate-500">{formatDateTime(log.timestamp)}</p>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {log.user ? `${log.user.name} (${log.user.email})` : 'System event'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
