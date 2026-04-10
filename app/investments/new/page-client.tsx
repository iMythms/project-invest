'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingState, PageHeader, StatusBadge } from '@/components/ui'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency, formatLabel } from '@/lib/format'

interface Opportunity {
  id: string
  name: string
  minimum_investment: string
}

interface NewInvestmentClientPageProps {
  opportunityId?: string
}

export default function NewInvestmentClientPage({ opportunityId }: NewInvestmentClientPageProps) {
  const { user, token, loading } = useAuth()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (opportunityId && token) {
      fetchOpportunity()
      return
    }

    if (!opportunityId) {
      setError('Select an opportunity before submitting a request.')
    }
  }, [user, token, loading, opportunityId, router])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOpportunity(data)
        setAmount(data.minimum_investment)
        return
      }

      setError('Unable to load the selected opportunity.')
    } catch (fetchError) {
      console.error('Failed to fetch opportunity:', fetchError)
      setError('Unable to load the selected opportunity.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          opportunityId,
          amount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to submit investment')
        return
      }

      router.push('/investments')
    } catch {
      setError('Failed to submit investment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user) {
    return <LoadingState label="Loading request form..." />
  }

  if (!opportunity) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          eyebrow="Capital request"
          title="Submit investment request"
          description="Confirm the opportunity and amount before routing this request into the approval workflow."
        />

        <div className="surface-card p-6 sm:p-8">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || 'Loading opportunity...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Capital request"
        title="Submit investment request"
        description="Confirm the opportunity and amount before routing this request into the approval workflow."
      />

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="surface-card p-6">
          <p className="text-sm font-medium text-slate-500">Selected opportunity</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">{opportunity.name}</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="surface-subtle p-4">
              <p className="text-xs font-medium text-slate-500">Minimum commitment</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {formatCurrency(opportunity.minimum_investment)}
              </p>
            </div>
            <div className="surface-subtle p-4">
              <p className="text-xs font-medium text-slate-500">Workflow status</p>
              <div className="mt-2">
                <StatusBadge label={formatLabel('pending review')} tone="warning" />
              </div>
              <p className="mt-2 leading-6">
                New requests enter the approval queue immediately after submission.
              </p>
            </div>
          </div>
        </aside>

        <section className="surface-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                Investment amount
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={opportunity.minimum_investment}
                step="1000"
                required
                className="input-field"
              />
              <p className="text-sm text-slate-500">
                Minimum allowed amount is {formatCurrency(opportunity.minimum_investment)}.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
