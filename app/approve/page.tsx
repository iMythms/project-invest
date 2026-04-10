'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { EmptyState, LoadingState, MetricCard, PageHeader, SectionCard, StatusBadge } from '@/components/ui'
import { formatCurrency, formatDate, formatLabel } from '@/lib/format'

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
      fetchInvestments()
    }
  }, [user, token, loading, router])

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments?status=pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const handleApprove = async (id: string) => {
    setSubmittingId(id)

    try {
      const response = await fetch(`/api/investments/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes[id] || null }),
      })

      if (response.ok) {
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setSubmittingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setSubmittingId(id)

    try {
      const response = await fetch(`/api/investments/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes[id] || null }),
      })

      if (response.ok) {
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading || !user) {
    return <LoadingState label="Loading approvals..." />
  }

  if (user.role !== 'approver') {
    return null
  }

  const activeInvestment = investments.find((investment) => investment.id === activeId) ?? investments[0] ?? null

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Decision queue"
        title="Approvals"
        description="Review pending requests, capture approval notes, and complete decisions with full request context visible."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Pending requests"
          value={String(investments.length)}
          description="Requests awaiting an approval decision."
          tone="warning"
        />
        <MetricCard
          label="Visible requestors"
          value={String(new Set(investments.map((investment) => investment.user.email)).size)}
          description="Distinct requestors currently represented in the queue."
          tone="brand"
        />
        <MetricCard
          label="Pending volume"
          value={formatCurrency(
            investments.reduce((total, investment) => total + Number.parseFloat(investment.amount), 0)
          )}
          description="Aggregate capital volume awaiting review."
        />
      </section>

      {dataLoading ? (
        <LoadingState label="Loading pending requests..." />
      ) : investments.length === 0 || !activeInvestment ? (
        <EmptyState
          title="No pending requests"
          description="The approval queue is currently clear. New requests will appear here as soon as they are submitted."
        />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
          <div className="table-shell">
            <div className="table-container">
              <table className="data-table min-w-[760px] xl:min-w-0">
                <thead>
                  <tr>
                    <th>Requestor</th>
                    <th>Opportunity</th>
                    <th>Amount</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => {
                    const active = inv.id === activeInvestment.id

                    return (
                      <tr
                        key={inv.id}
                        className={active ? 'bg-blue-50/70' : undefined}
                        onClick={() => setActiveId(inv.id)}
                      >
                        <td>
                          <div>
                            <p className="font-medium text-slate-900">{inv.user.name}</p>
                            <p className="mt-1 text-slate-500">{inv.user.email}</p>
                          </div>
                        </td>
                        <td>
                          <p className="font-medium text-slate-900">{inv.opportunity.name}</p>
                          <p className="mono-text mt-1">{inv.id}</p>
                        </td>
                        <td className="font-medium text-slate-900">{formatCurrency(inv.amount)}</td>
                        <td>{formatDate(inv.submitted_at)}</td>
                        <td>
                          <StatusBadge label={formatLabel('pending')} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <SectionCard
            title="Selected request"
            description="Capture rationale before finalizing the approval outcome."
          >
            <div className="space-y-6">
              <div className="surface-subtle p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">{activeInvestment.opportunity.name}</h2>
                  <StatusBadge label={formatLabel('pending')} tone="warning" />
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Requestor</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{activeInvestment.user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{activeInvestment.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Requested amount</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatCurrency(activeInvestment.amount)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Submitted {formatDate(activeInvestment.submitted_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="approval-notes" className="block text-sm font-medium text-slate-700">
                  Review notes
                </label>
                <textarea
                  id="approval-notes"
                  value={notes[activeInvestment.id] || ''}
                  onChange={(e) =>
                    setNotes({
                      ...notes,
                      [activeInvestment.id]: e.target.value,
                    })
                  }
                  placeholder="Document the reasoning or follow-up conditions for this decision."
                  className="textarea-field"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => handleApprove(activeInvestment.id)}
                  disabled={submittingId === activeInvestment.id}
                  className="btn-primary flex-1"
                >
                  {submittingId === activeInvestment.id ? 'Processing...' : 'Approve request'}
                </button>
                <button
                  onClick={() => handleReject(activeInvestment.id)}
                  disabled={submittingId === activeInvestment.id}
                  className="btn-destructive flex-1"
                >
                  {submittingId === activeInvestment.id ? 'Processing...' : 'Reject request'}
                </button>
              </div>
            </div>
          </SectionCard>
        </section>
      )}
    </div>
  )
}
