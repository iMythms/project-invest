'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight01Icon,
  Briefcase01Icon,
  ChartLineData01Icon,
  DollarCircleIcon,
  Invoice03Icon,
  TaskDaily01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import {
  ActivityLineChart,
  ApprovalRateRadialChart,
  RequestCountLineChart,
  StatusDoughnutChart,
  VolumeBarChart,
} from '@/components/dashboard-charts'
import { AppIcon } from '@/components/icons'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency, formatDateTime, formatLabel } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
      void fetchDashboardData()
    }
  }, [user, token, loading, router])

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const opportunitiesResponse = await fetch('/api/opportunities', { headers })

      if (opportunitiesResponse.ok) {
        setOpportunities(await opportunitiesResponse.json())
      }

      if (user?.role === 'investment_manager') {
        setInvestments([])
        setAuditLogs([])
        return
      }

      const requests = [fetch('/api/investments', { headers })]

      if (user?.role === 'approver') {
        requests.push(fetch('/api/audit-logs?limit=5', { headers }))
      }

      const [investmentsResponse, auditResponse] = await Promise.all(requests)

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

  const averageMinimum = useMemo(() => {
    if (opportunities.length === 0) {
      return 0
    }

    return (
      opportunities.reduce((sum, opportunity) => sum + Number.parseFloat(opportunity.minimum_investment), 0) /
      opportunities.length
    )
  }, [opportunities])

  const totalMinimumPipeline = opportunities.reduce(
    (sum, opportunity) => sum + Number.parseFloat(opportunity.minimum_investment),
    0
  )

  const highestMinimum = useMemo(() => {
    return opportunities.reduce((highest, opportunity) => {
      return Math.max(highest, Number.parseFloat(opportunity.minimum_investment))
    }, 0)
  }, [opportunities])

  const pendingCount = investments.filter((investment) => investment.status === 'pending').length
  const approvedCount = investments.filter((investment) => investment.status === 'approved').length
  const rejectedCount = investments.filter((investment) => investment.status === 'rejected').length
  const totalVolume = investments.reduce((total, investment) => total + Number.parseFloat(investment.amount), 0)
  const recentInvestments = investments.slice(0, 5)

  const requestTrend = useMemo(() => {
    const grouped = new Map<string, { label: string; volume: number; count: number }>()

    investments.forEach((investment) => {
      const date = new Date(investment.submitted_at)
      const key = date.toISOString().slice(0, 10)
      const current = grouped.get(key) ?? {
        label: trendFormatter.format(date),
        volume: 0,
        count: 0,
      }

      current.volume += Number.parseFloat(investment.amount)
      current.count += 1
      grouped.set(key, current)
    })

    const timeline = Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-8)
      .map(([, value]) => value)

    if (timeline.length === 0) {
      return { labels: ['No data'], volumes: [0], counts: [0] }
    }

    return {
      labels: timeline.map((item) => item.label),
      volumes: timeline.map((item) => item.volume),
      counts: timeline.map((item) => item.count),
    }
  }, [investments])

  const volumeByOpportunity = useMemo(() => {
    const grouped = new Map<string, number>()

    investments.forEach((investment) => {
      const current = grouped.get(investment.opportunity.name) ?? 0
      grouped.set(investment.opportunity.name, current + Number.parseFloat(investment.amount))
    })

    const ranked = Array.from(grouped.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)

    if (ranked.length === 0) {
      return { labels: ['No data'], values: [0] }
    }

    return {
      labels: ranked.map(([label]) => label),
      values: ranked.map(([, value]) => value),
    }
  }, [investments])

  const minimumCommitmentChart = useMemo(() => {
    const ranked = opportunities
      .slice()
      .sort(
        (left, right) =>
          Number.parseFloat(right.minimum_investment) - Number.parseFloat(left.minimum_investment)
      )
      .slice(0, 6)

    if (ranked.length === 0) {
      return { labels: ['No data'], values: [0] }
    }

    return {
      labels: ranked.map((opportunity) => opportunity.name),
      values: ranked.map((opportunity) => Number.parseFloat(opportunity.minimum_investment)),
    }
  }, [opportunities])

  const minimumSpread = useMemo(() => {
    const sorted = opportunities
      .slice()
      .sort(
        (left, right) =>
          Number.parseFloat(left.minimum_investment) - Number.parseFloat(right.minimum_investment)
      )
      .slice(0, 8)

    if (sorted.length === 0) {
      return { labels: ['No data'], values: [0] }
    }

    return {
      labels: sorted.map((opportunity) => opportunity.name),
      values: sorted.map((opportunity) => Number.parseFloat(opportunity.minimum_investment)),
    }
  }, [opportunities])

  const topOpportunities = useMemo(
    () =>
      opportunities
        .slice()
        .sort(
          (left, right) =>
            Number.parseFloat(right.minimum_investment) - Number.parseFloat(left.minimum_investment)
        )
        .slice(0, 4),
    [opportunities]
  )

  if (loading || !user) {
    return null
  }

  const isManager = user.role === 'investment_manager'

  const metrics = isManager
    ? [
        { label: 'Open opportunities', value: String(opportunities.length), icon: Briefcase01Icon },
        { label: 'Average minimum', value: formatCurrency(averageMinimum), icon: DollarCircleIcon },
        { label: 'Highest minimum', value: formatCurrency(highestMinimum), icon: TaskDaily01Icon },
        { label: 'Pipeline threshold', value: formatCurrency(totalMinimumPipeline), icon: ChartLineData01Icon },
      ]
    : [
        { label: 'Open opportunities', value: String(opportunities.length), icon: Briefcase01Icon },
        { label: 'Pending requests', value: String(pendingCount), icon: Invoice03Icon },
        { label: 'Approved requests', value: String(approvedCount), icon: Tick02Icon },
        { label: 'Visible volume', value: formatCurrency(totalVolume), icon: ChartLineData01Icon },
      ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace overview"
        title="Dashboard"
        description={
          isManager
            ? `Signed in as ${user.email}. Track active mandates, minimum commitment distribution, and pipeline sizing from one cleaner opportunity workspace.`
            : `Signed in as ${user.email}. The dashboard is now structured like a clean operating workspace: compact cards first, then charts, then queue and activity detail.`
        }
        actions={
          <>
            <Link href="/opportunities" className={buttonVariants({ variant: 'outline' })}>
              Review opportunities
            </Link>
            {!isManager && (user.role === 'investor' || user.role === 'approver') && (
              <Link href="/investments" className={buttonVariants()}>
                Open investments
              </Link>
            )}
          </>
        }
      />

      {dataLoading ? null : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{metric.label}</CardDescription>
                  <div className="flex size-8 items-center justify-center rounded-2xl bg-muted">
                    <AppIcon icon={metric.icon} size={16} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
                </CardContent>
              </Card>
            ))}
          </section>

          {isManager ? (
            <>
              <section className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Minimum commitment ladder</CardTitle>
                    <CardDescription>Largest mandate thresholds currently open in the pipeline.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <VolumeBarChart
                      labels={minimumCommitmentChart.labels}
                      values={minimumCommitmentChart.values}
                      label="Minimum commitment"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Commitment spread</CardTitle>
                    <CardDescription>How minimum commitments step up across the mandate set.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ActivityLineChart
                      labels={minimumSpread.labels}
                      values={minimumSpread.values}
                      label="Minimum commitment"
                    />
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Opportunity snapshot</CardTitle>
                    <CardDescription>Largest visible minimum commitments in the active pipeline.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    {topOpportunities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No opportunities are currently visible.</p>
                    ) : (
                      topOpportunities.map((opportunity) => (
                        <div key={opportunity.id} className="flex items-center justify-between rounded-3xl border p-3">
                          <div>
                            <p className="font-medium">{opportunity.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Minimum {formatCurrency(opportunity.minimum_investment)}
                            </p>
                          </div>
                          <StatusPill value={opportunity.status} />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Manager workflow</CardTitle>
                    <CardDescription>Create and publish new opportunities directly from the pipeline page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
                    <p>
                      Investment managers own mandate intake. Use the opportunities page to open a creation dialog, define the minimum commitment, and publish the new mandate into the visible pipeline.
                    </p>
                    <Link href="/opportunities" className={buttonVariants({ variant: 'outline' })}>
                      Open opportunity manager
                    </Link>
                  </CardContent>
                </Card>
              </section>
            </>
          ) : (
            <>
              <section className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Capital request volume</CardTitle>
                    <CardDescription>Requested capital over time across the visible ledger.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ActivityLineChart labels={requestTrend.labels} values={requestTrend.volumes} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Submission cadence</CardTitle>
                    <CardDescription>How many requests entered the workflow on each visible period.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <RequestCountLineChart labels={requestTrend.labels} values={requestTrend.counts} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Demand by opportunity</CardTitle>
                    <CardDescription>Top opportunities ranked by requested capital volume.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <VolumeBarChart labels={volumeByOpportunity.labels} values={volumeByOpportunity.values} label="Requested capital" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Status mix</CardTitle>
                    <CardDescription>Current distribution across pending, approved, and rejected requests.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <StatusDoughnutChart
                      labels={['Pending', 'Approved', 'Rejected']}
                      values={[pendingCount, approvedCount, rejectedCount]}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Approval rate</CardTitle>
                    <CardDescription>Share of reviewed requests that were approved.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ApprovalRateRadialChart approved={approvedCount} rejected={rejectedCount} />
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>{user.role === 'approver' ? 'Review queue' : 'Recent requests'}</CardTitle>
                        <CardDescription>
                          Immediate activity should remain close to the charts, not buried below oversized sections.
                        </CardDescription>
                      </div>
                      <Link
                        href={user.role === 'approver' ? '/approve' : '/investments'}
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        Open
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Opportunity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="hidden md:table-cell">Submitted</TableHead>
                          <TableHead className="w-[80px] text-right">Open</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentInvestments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                              No recent requests yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentInvestments.map((investment) => (
                            <TableRow key={investment.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">{investment.opportunity.name}</p>
                                  {investment.user ? (
                                    <p className="text-xs text-muted-foreground">{investment.user.email}</p>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusPill value={investment.status} />
                              </TableCell>
                              <TableCell>{formatCurrency(investment.amount)}</TableCell>
                              <TableCell className="hidden md:table-cell">{formatDateTime(investment.submitted_at)}</TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={user.role === 'approver' ? '/approve' : '/investments'}
                                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                                >
                                  <AppIcon icon={ArrowRight01Icon} size={14} />
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="grid gap-4">
                  <Card>
                    <CardHeader className="border-b">
                      <CardTitle>Opportunity snapshot</CardTitle>
                      <CardDescription>Largest visible minimum commitments in the active pipeline.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {topOpportunities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No opportunities are currently visible.</p>
                      ) : (
                        topOpportunities.map((opportunity) => (
                          <div key={opportunity.id} className="flex items-center justify-between rounded-3xl border p-3">
                            <div>
                              <p className="font-medium">{opportunity.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Minimum {formatCurrency(opportunity.minimum_investment)}
                              </p>
                            </div>
                            <StatusPill value={opportunity.status} />
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {user.role === 'approver' && (
                    <Card>
                      <CardHeader className="border-b">
                        <CardTitle>Recent audit events</CardTitle>
                        <CardDescription>Latest governance activity from the audit trail.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        {auditLogs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No recent audit events available.</p>
                        ) : (
                          auditLogs.map((log) => (
                            <div key={log.id} className="rounded-3xl border p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusPill value={formatLabel(log.action)} />
                                <span className="text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</span>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {log.user ? `${log.user.name} (${log.user.email})` : 'System event'}
                              </p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}
