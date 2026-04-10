'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface Investment {
  id: string
  amount: string
  submitted_at: string
  opportunity: {
    name: string
  }
  user: {
    name: string
    email: string
  }
}

export default function ApprovePage() {
  const { user, token, loading } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && user.role !== 'approver') {
      router.push('/dashboard')
      return
    }

    if (user && token) {
      void fetchInvestments()
    }
  }, [user, token, loading, router])

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const pendingInvestments = data.filter((investment: any) => investment.status === 'pending')
        setInvestments(pendingInvestments)
        setActiveId((currentId) =>
          currentId && pendingInvestments.some((investment: Investment) => investment.id === currentId)
            ? currentId
            : pendingInvestments[0]?.id ?? null
        )
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleDecision = async (id: string, decision: 'approve' | 'reject') => {
    setSubmittingId(id)

    try {
      const response = await fetch(`/api/investments/${id}/${decision}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes[id] || null }),
      })

      if (response.ok) {
        await fetchInvestments()
      }
    } catch (error) {
      console.error(`Failed to ${decision}:`, error)
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading || !user || user.role !== 'approver') {
    return null
  }

  const activeInvestment = investments.find((investment) => investment.id === activeId) ?? investments[0] ?? null
  const metrics = [
    {
      label: 'Pending requests',
      value: String(investments.length),
      description: 'Requests awaiting a decision.',
    },
    {
      label: 'Visible requestors',
      value: String(new Set(investments.map((investment) => investment.user.email)).size),
      description: 'Distinct requestors represented in queue.',
    },
    {
      label: 'Pending volume',
      value: formatCurrency(
        investments.reduce((total, investment) => total + Number.parseFloat(investment.amount), 0)
      ),
      description: 'Aggregate capital awaiting review.',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Decision queue"
        title="Approvals"
        description="Review pending requests, capture rationale, and complete approval decisions from a cleaner split layout."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {dataLoading ? null : investments.length === 0 || !activeInvestment ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No pending requests are currently waiting in the queue.
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Pending queue</CardTitle>
              <CardDescription>Compact table first, detail panel second.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requestor</TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((investment) => {
                    const active = investment.id === activeInvestment.id

                    return (
                      <TableRow
                        key={investment.id}
                        data-state={active ? 'selected' : undefined}
                        className={cn('cursor-pointer', active && 'bg-muted')}
                        onClick={() => setActiveId(investment.id)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{investment.user.name}</p>
                            <p className="text-xs text-muted-foreground">{investment.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{investment.opportunity.name}</p>
                            <p className="text-xs text-muted-foreground">{investment.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(investment.amount)}</TableCell>
                        <TableCell>{formatDate(investment.submitted_at)}</TableCell>
                        <TableCell>
                          <StatusPill value="pending" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Selected request</CardTitle>
              <CardDescription>Capture rationale before finalizing the approval outcome.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="rounded-3xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{activeInvestment.opportunity.name}</h2>
                  <StatusPill value="pending" />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Requestor</p>
                    <p className="mt-2 font-medium">{activeInvestment.user.name}</p>
                    <p className="text-sm text-muted-foreground">{activeInvestment.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Requested amount</p>
                    <p className="mt-2 text-lg font-semibold">{formatCurrency(activeInvestment.amount)}</p>
                    <p className="text-sm text-muted-foreground">Submitted {formatDate(activeInvestment.submitted_at)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="approval-notes" className="text-sm font-medium">
                  Review notes
                </label>
                <Textarea
                  id="approval-notes"
                  value={notes[activeInvestment.id] || ''}
                  onChange={(event) =>
                    setNotes({
                      ...notes,
                      [activeInvestment.id]: event.target.value,
                    })
                  }
                  placeholder="Document the rationale or conditions for this decision."
                  className="min-h-[140px] rounded-3xl"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={() => handleDecision(activeInvestment.id, 'approve')}
                  disabled={submittingId === activeInvestment.id}
                >
                  {submittingId === activeInvestment.id ? 'Processing...' : 'Approve request'}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDecision(activeInvestment.id, 'reject')}
                  disabled={submittingId === activeInvestment.id}
                >
                  {submittingId === activeInvestment.id ? 'Processing...' : 'Reject request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
