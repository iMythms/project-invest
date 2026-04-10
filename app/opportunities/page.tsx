'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase01Icon, DollarCircleIcon, TaskDaily01Icon } from '@hugeicons/core-free-icons'
import { ActivityLineChart, VolumeBarChart } from '@/components/dashboard-charts'
import { AppIcon } from '@/components/icons'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency } from '@/lib/format'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'

interface Opportunity {
  id: string
  name: string
  description: string
  minimum_investment: string
  status: string
}

interface OpportunityFormState {
  name: string
  description: string
  minimumInvestment: string
  status: 'open' | 'closed'
}

const initialCreateState: OpportunityFormState = {
  name: '',
  description: '',
  minimumInvestment: '',
  status: 'open',
}

export default function OpportunitiesPage() {
  const { user, token, loading } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [createForm, setCreateForm] = useState<OpportunityFormState>(initialCreateState)
  const [submittingCreate, setSubmittingCreate] = useState(false)
  const [createError, setCreateError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && token) {
      void fetchOpportunities()
    }
  }, [user, token, loading, router])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setOpportunities(await response.json())
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

    return (
      opportunities.reduce((sum, opportunity) => sum + Number.parseFloat(opportunity.minimum_investment), 0) /
      opportunities.length
    )
  }, [opportunities])

  const totalMinimumPipeline = opportunities.reduce(
    (sum, opportunity) => sum + Number.parseFloat(opportunity.minimum_investment),
    0
  )

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

  const sortedMinimumTrend = useMemo(() => {
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

  const metrics = [
    {
      label: 'Open opportunities',
      value: String(opportunities.length),
      description: 'Deals currently visible for review.',
      icon: Briefcase01Icon,
    },
    {
      label: 'Average minimum',
      value: formatCurrency(averageMinimum),
      description: 'Average minimum commitment across the pipeline.',
      icon: DollarCircleIcon,
    },
    {
      label: 'Pipeline threshold',
      value: formatCurrency(totalMinimumPipeline),
      description: 'Combined minimum commitment represented by visible opportunities.',
      icon: TaskDaily01Icon,
    },
  ]

  if (loading || !user) {
    return null
  }

  const canRequest = user.role === 'investor' || user.role === 'approver'
  const canManage = user.role === 'investment_manager'

  const openOpportunityDialog = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setDetailOpen(true)
  }

  const handleCreateOpportunity = async () => {
    setCreateError('')
    setSubmittingCreate(true)

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      })

      if (!response.ok) {
        const data = await response.json()
        setCreateError(data.error || 'Failed to create opportunity')
        return
      }

      setCreateOpen(false)
      setCreateForm(initialCreateState)
      await fetchOpportunities()
    } catch {
      setCreateError('Failed to create opportunity')
    } finally {
      setSubmittingCreate(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Opportunity pipeline"
          title="Opportunities"
          description="Review open mandates, scan minimum commitment requirements, and route directly into request submission or mandate creation based on your role."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground">
                {opportunities.length} open opportunit{opportunities.length === 1 ? 'y' : 'ies'}
              </div>
              {canManage && <Button onClick={() => setCreateOpen(true)}>Create opportunity</Button>}
            </div>
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

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Pipeline view</CardTitle>
            <CardDescription>Open mandates, ranked thresholds, and role-specific actions live together here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {dataLoading ? null : opportunities.length === 0 ? (
              <div className="rounded-3xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                No open opportunities are currently available.
              </div>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-3">
                  {opportunities.slice(0, 3).map((opportunity) => {
                    const CardBody = (
                      <Card key={opportunity.id} className="bg-muted/30">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">{opportunity.name}</CardTitle>
                              <CardDescription className="mt-1">
                                Minimum {formatCurrency(opportunity.minimum_investment)}
                              </CardDescription>
                            </div>
                            <StatusPill value={opportunity.status} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-6 text-muted-foreground">{opportunity.description}</p>
                        </CardContent>
                      </Card>
                    )

                    if (canRequest) {
                      return (
                        <button
                          key={opportunity.id}
                          type="button"
                          onClick={() => openOpportunityDialog(opportunity)}
                          className="text-left"
                        >
                          {CardBody}
                        </button>
                      )
                    }

                    return CardBody
                  })}
                </div>

                <section className="grid gap-4 xl:grid-cols-2">
                  <Card>
                    <CardHeader className="border-b">
                      <CardTitle>Minimum commitment ladder</CardTitle>
                      <CardDescription>Largest opportunity thresholds currently in the visible pipeline.</CardDescription>
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
                      <CardDescription>How minimum commitments step up across the current mandate set.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ActivityLineChart
                        labels={sortedMinimumTrend.labels}
                        values={sortedMinimumTrend.values}
                        label="Minimum commitment"
                      />
                    </CardContent>
                  </Card>
                </section>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Minimum commitment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opportunities.map((opportunity) => (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div className="space-y-1">
                            {canRequest ? (
                              <button
                                type="button"
                                onClick={() => openOpportunityDialog(opportunity)}
                                className="font-medium hover:text-foreground"
                              >
                                {opportunity.name}
                              </button>
                            ) : (
                              <p className="font-medium">{opportunity.name}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{opportunity.id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xl whitespace-normal text-muted-foreground">
                          {opportunity.description}
                        </TableCell>
                        <TableCell>{formatCurrency(opportunity.minimum_investment)}</TableCell>
                        <TableCell>
                          <StatusPill value={opportunity.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {canRequest ? (
                            <Button onClick={() => router.push(`/investments/new?opportunityId=${opportunity.id}`)}>
                              Submit request
                            </Button>
                          ) : canManage ? (
                            <span className="text-sm text-muted-foreground">Managed by you</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Read-only access</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {canRequest && (
          <Card>
            <CardHeader>
              <CardTitle>Move from review to execution</CardTitle>
              <CardDescription>
                Select an opportunity to start a capital request with the minimum commitment prefilled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/investments" className={buttonVariants({ variant: 'outline' })}>
                Review existing requests
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create opportunity</DialogTitle>
            <DialogDescription>
              Publish a new mandate with a minimum commitment and initial lifecycle state.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {createError ? <p className="text-sm text-destructive">{createError}</p> : null}
            <div className="grid gap-3">
              <label className="text-sm font-medium text-foreground">Opportunity name</label>
              <Input
                value={createForm.name}
                onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Late Stage Credit Fund"
              />
            </div>
            <div className="grid gap-3">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Describe the strategy, mandate, and underwriting focus."
                className="min-h-32"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-3">
                <label className="text-sm font-medium text-foreground">Minimum investment</label>
                <Input
                  type="number"
                  value={createForm.minimumInvestment}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, minimumInvestment: event.target.value }))
                  }
                  placeholder="100000"
                />
              </div>
              <div className="grid gap-3">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select
                  value={createForm.status}
                  onValueChange={(value) =>
                    setCreateForm((current) => ({
                      ...current,
                      status: (value as 'open' | 'closed') ?? 'open',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOpportunity} disabled={submittingCreate}>
              {submittingCreate ? 'Creating...' : 'Create opportunity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>{selectedOpportunity?.name ?? 'Opportunity details'}</DialogTitle>
                <DialogDescription className="mt-2">
                  Review the current mandate before moving into request submission.
                </DialogDescription>
              </div>
              {selectedOpportunity ? <StatusPill value={selectedOpportunity.status} /> : null}
            </div>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Minimum commitment</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {selectedOpportunity ? formatCurrency(selectedOpportunity.minimum_investment) : '-'}
              </p>
            </div>
            <p className="leading-7">{selectedOpportunity?.description}</p>
            <div className="rounded-xl border p-4">
              <p className="font-medium text-foreground">Why this dialog exists</p>
              <p className="mt-2 leading-7 text-muted-foreground">
                Investors can inspect the mandate in place instead of leaving the opportunity ledger every time they want more context.
              </p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
            {selectedOpportunity ? (
              <Button onClick={() => router.push(`/investments/new?opportunityId=${selectedOpportunity.id}`)}>
                Submit request
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
