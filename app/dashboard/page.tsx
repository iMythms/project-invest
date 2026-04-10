'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight01Icon,
  Briefcase01Icon,
  ChartLineData01Icon,
  Invoice03Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { ActivityLineChart, StatusDoughnutChart } from '@/components/dashboard-charts'
import { AppIcon, IconTile } from '@/components/icons'
import { EmptyState, LoadingState, MetricCard, PageHeader, SectionCard, StatusBadge } from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
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

const trendFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

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

  const pendingCount = investments.filter((investment) => investment.status === 'pending').length
  const approvedCount = investments.filter((investment) => investment.status === 'approved').length
  const rejectedCount = investments.filter((investment) => investment.status === 'rejected').length
  const totalVolume = investments.reduce((total, investment) => total + Number.parseFloat(investment.amount), 0)
  const recentInvestments = investments.slice(0, 5)

  const requestTrend = useMemo(() => {
    const sorted = [...investments]
      .sort((left, right) => new Date(left.submitted_at).getTime() - new Date(right.submitted_at).getTime())
      .slice(-6)

    if (sorted.length === 0) {
      return {
        labels: ['No data'],
        values: [0],
      }
    }

    return {
      labels: sorted.map((investment) => trendFormatter.format(new Date(investment.submitted_at))),
      values: sorted.map((investment) => Number.parseFloat(investment.amount)),
    }
  }, [investments])

  const statusMix = useMemo(
    () => ({
      labels: ['Pending', 'Approved', 'Rejected'],
      values: [pendingCount, approvedCount, rejectedCount],
    }),
    [approvedCount, pendingCount, rejectedCount]
  )

  const topOpportunities = useMemo(() => {
    return opportunities
      .slice()
      .sort(
        (left, right) =>
          Number.parseFloat(right.minimum_investment) - Number.parseFloat(left.minimum_investment)
      )
      .slice(0, 4)
  }, [opportunities])

  if (loading || !user) {
    return <LoadingState label="Loading workspace..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace overview"
        title="Dashboard"
        description={`Signed in as ${user.email}. The workspace emphasizes live queue pressure, visible capital, and the next operational action for the ${user.role} role.`}
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
          <section className="grid gap-4 xl:grid-cols-[1.55fr_0.9fr]">
            <div className="surface-card overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">Operating summary</p>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                      A lighter control surface for approvals, pipeline visibility, and capital flow.
                    </h2>
                    <p className="text-sm leading-6 text-slate-500">
                      The dashboard should feel closer to a calm document workspace than a promotional hero, with compact summary blocks and a primary chart surface.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[280px]">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Visible volume</p>
                      <p className="mt-1.5 text-xl font-semibold text-slate-900">{formatCurrency(totalVolume)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Requests in motion</p>
                      <p className="mt-1.5 text-xl font-semibold text-slate-900">{pendingCount + approvedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.45fr_0.82fr] sm:px-5">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Recent request volume</p>
                      <p className="mt-1 text-[13px] text-slate-500">Latest submitted requests mapped by visible amount.</p>
                    </div>
                    <StatusBadge label={`${recentInvestments.length} recent`} tone="brand" />
                  </div>
                  <ActivityLineChart labels={requestTrend.labels} values={requestTrend.values} />
                </div>

                <div className="surface-subtle p-3.5">
                  <div className="flex items-center gap-3">
                    <IconTile icon={Invoice03Icon} tone="brand" size={16} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Status distribution</p>
                      <p className="mt-1 text-[13px] text-slate-500">Current workflow split across all visible requests.</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <StatusDoughnutChart labels={statusMix.labels} values={statusMix.values} />
                  </div>
                </div>
              </div>
            </div>

            <SectionCard title="Execution notes" description="What matters most right now for this role.">
              <div className="space-y-3">
                <div className="surface-subtle flex items-start gap-3 p-4">
                  <IconTile icon={Invoice03Icon} tone="warning" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {pendingCount > 0
                        ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} need a next decision.`
                        : 'No pending requests are waiting in the queue.'}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Approvals should remain the fastest surface in the product, with supporting context adjacent rather than hidden.
                    </p>
                  </div>
                </div>
                <div className="surface-subtle flex items-start gap-3 p-4">
                  <IconTile icon={Briefcase01Icon} tone="brand" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {opportunities.length} open opportunit{opportunities.length === 1 ? 'y' : 'ies'} are available for intake.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Opportunity review should stay operational and scannable, not card-heavy or marketing-like.
                    </p>
                  </div>
                </div>
                <div className="surface-subtle flex items-start gap-3 p-4">
                  <IconTile icon={Tick02Icon} tone="success" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {approvedCount} request{approvedCount === 1 ? '' : 's'} already cleared the workflow.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Cleared capital should be visible immediately so approvers and investors share the same ledger view.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Open opportunities"
              value={String(opportunities.length)}
              description="Currently available investment opportunities."
              tone="brand"
              icon={<IconTile icon={Briefcase01Icon} tone="brand" size={16} />}
            />
            <MetricCard
              label={user.role === 'approver' ? 'Pending approvals' : 'Pending requests'}
              value={String(pendingCount)}
              description="Requests waiting for an approval decision."
              tone="warning"
              icon={<IconTile icon={Invoice03Icon} tone="warning" size={16} />}
            />
            <MetricCard
              label="Approved requests"
              value={String(approvedCount)}
              description="Requests cleared through the workflow."
              tone="success"
              icon={<IconTile icon={Tick02Icon} tone="success" size={16} />}
            />
            <MetricCard
              label="Requested volume"
              value={formatCurrency(totalVolume)}
              description="Aggregate volume across visible requests."
              icon={<IconTile icon={ChartLineData01Icon} tone="default" size={16} />}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr]">
            <SectionCard
              title={user.role === 'approver' ? 'Review queue' : 'Recent investment activity'}
              description={
                user.role === 'approver'
                  ? 'Latest capital requests surfaced as an operating list instead of isolated cards.'
                  : 'Track recent requests and jump back into the full ledger.'
              }
              actions={
                <Link href={user.role === 'approver' ? '/approve' : '/investments'} className="btn-secondary">
                  Open {user.role === 'approver' ? 'approvals' : 'ledger'}
                </Link>
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
                <div className="space-y-2.5">
                  {recentInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="surface-subtle flex flex-col gap-3 p-3.5 sm:flex-row sm:items-start sm:justify-between"
                    >
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
                        <span className="inline-flex items-center gap-2">
                          Open
                          <AppIcon icon={ArrowRight01Icon} size={16} />
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Opportunity snapshot" description="Largest visible minimum commitments in the current pipeline.">
                <div className="space-y-3">
                  {topOpportunities.length === 0 ? (
                    <p className="text-sm text-slate-500">No opportunity data is available.</p>
                  ) : (
                    topOpportunities.map((opportunity) => (
                      <div key={opportunity.id} className="surface-subtle flex items-center justify-between gap-4 p-4">
                        <div>
                          <p className="font-medium text-slate-900">{opportunity.name}</p>
                          <p className="mt-1 text-sm text-slate-500">Minimum {formatCurrency(opportunity.minimum_investment)}</p>
                        </div>
                        <StatusBadge label={formatLabel(opportunity.status)} tone="brand" />
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>

              {user.role === 'approver' && (
                <SectionCard title="Recent audit events" description="Latest governance events pulled from the audit trail.">
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
