'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChartBarLineIcon, ChartRingIcon, Invoice03Icon } from '@hugeicons/core-free-icons'
import {
  ApprovalRateRadialChart,
  RequestCountLineChart,
  StatusDoughnutChart,
  VolumeBarChart,
} from '@/components/dashboard-charts'
import { AppIcon } from '@/components/icons'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency, formatDate } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

const trendFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

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

    if (user?.role === 'investment_manager') {
      router.push('/opportunities')
      return
    }

    if (user && token) {
      void fetchInvestments()
    }
  }, [user, token, loading, router])

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setInvestments(await response.json())
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

  const volumeByStatus = useMemo(() => {
    const sums = new Map<string, number>([
      ['Pending', 0],
      ['Approved', 0],
      ['Rejected', 0],
    ])

    filteredInvestments.forEach((investment) => {
      const key = investment.status.charAt(0).toUpperCase() + investment.status.slice(1)
      sums.set(key, (sums.get(key) ?? 0) + Number.parseFloat(investment.amount))
    })

    return { labels: Array.from(sums.keys()), values: Array.from(sums.values()) }
  }, [filteredInvestments])

  const requestTrend = useMemo(() => {
    const grouped = new Map<string, { label: string; count: number }>()

    filteredInvestments.forEach((investment) => {
      const date = new Date(investment.submitted_at)
      const key = date.toISOString().slice(0, 10)
      const current = grouped.get(key) ?? { label: trendFormatter.format(date), count: 0 }
      current.count += 1
      grouped.set(key, current)
    })

    const timeline = Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-8)
      .map(([, value]) => value)

    if (timeline.length === 0) {
      return { labels: ['No data'], values: [0] }
    }

    return {
      labels: timeline.map((item) => item.label),
      values: timeline.map((item) => item.count),
    }
  }, [filteredInvestments])

  const opportunityAllocation = useMemo(() => {
    const grouped = new Map<string, number>()

    filteredInvestments.forEach((investment) => {
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
  }, [filteredInvestments])

  const metrics = [
    {
      label: 'Visible requests',
      value: String(filteredInvestments.length),
      description: 'Requests under the selected filter.',
      icon: Invoice03Icon,
    },
    {
      label: 'Pending',
      value: String(pendingCount),
      description: 'Requests still waiting for a final review.',
      icon: ChartRingIcon,
    },
    {
      label: 'Visible volume',
      value: formatCurrency(totalVisibleVolume),
      description: `Approved requests: ${approvedCount}`,
      icon: ChartBarLineIcon,
    },
  ]

  if (loading || !user) {
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={user.role === 'approver' ? 'Request oversight' : 'Investment history'}
        title={user.role === 'approver' ? 'Investments' : 'My investments'}
        description={
          user.role === 'approver'
            ? 'Review the full request ledger, monitor pending approvals, and inspect final outcomes.'
            : 'Track your submitted requests and outcomes in one ledger.'
        }
        actions={
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? 'all')}>
            <SelectTrigger className="min-w-[180px] rounded-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
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
              <p className="mt-1 text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {dataLoading ? null : filteredInvestments.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No investment requests match the current filter.</p>
            {(user.role === 'investor' || user.role === 'approver') && (
              <Link href="/opportunities" className={buttonVariants({ className: 'mt-4' })}>
                Review opportunities
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Volume by status</CardTitle>
                <CardDescription>Capital volume grouped by the selected ledger filter.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <VolumeBarChart labels={volumeByStatus.labels} values={volumeByStatus.values} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle>Request cadence</CardTitle>
                <CardDescription>How many requests entered the ledger over each visible period.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <RequestCountLineChart labels={requestTrend.labels} values={requestTrend.values} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle>Allocation by opportunity</CardTitle>
                <CardDescription>Top opportunities ranked by visible requested capital.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <VolumeBarChart
                  labels={opportunityAllocation.labels}
                  values={opportunityAllocation.values}
                  label="Requested capital"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle>Request mix</CardTitle>
                <CardDescription>Status distribution across the visible request set.</CardDescription>
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
                <CardDescription>Reviewed requests approved within the current ledger view.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ApprovalRateRadialChart approved={approvedCount} rejected={rejectedCount} />
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Investment ledger</CardTitle>
              <CardDescription>Shadcn table layout for requests, outcomes, notes, and review timing.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {user.role === 'approver' && <TableHead>Requestor</TableHead>}
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Reviewed</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvestments.map((investment) => (
                    <TableRow key={investment.id}>
                      {user.role === 'approver' && (
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{investment.user?.name || 'Unknown user'}</p>
                            <p className="text-xs text-muted-foreground">{investment.user?.email || '-'}</p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{investment.opportunity.name}</p>
                          <p className="text-xs text-muted-foreground">{investment.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(investment.amount)}</TableCell>
                      <TableCell>
                        <StatusPill value={investment.status} />
                      </TableCell>
                      <TableCell>{formatDate(investment.submitted_at)}</TableCell>
                      <TableCell>{formatDate(investment.reviewed_at)}</TableCell>
                      <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                        {investment.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
