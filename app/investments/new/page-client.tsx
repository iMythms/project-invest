'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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
      void fetchOpportunity()
      return
    }

    if (!opportunityId) {
      setError('Select an opportunity before submitting a request.')
    }
  }, [user, token, loading, opportunityId, router])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ opportunityId, amount }),
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
    return null
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Capital request"
        title="Submit investment request"
        description="Confirm the selected opportunity and requested amount before routing the request into approval."
      />

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Selected opportunity</CardTitle>
            <CardDescription>Context for the request you are about to submit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunity ? (
              <>
                <div>
                  <p className="text-lg font-semibold">{opportunity.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Minimum commitment {formatCurrency(opportunity.minimum_investment)}
                  </p>
                </div>
                <StatusPill value="pending review" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Submitted requests move directly into the approval queue and remain visible in the investment ledger.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{error || 'Loading selected opportunity...'}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request details</CardTitle>
            <CardDescription>Use a clean form surface instead of custom field wrappers.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error ? (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Investment amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  min={opportunity?.minimum_investment}
                  step="1000"
                  required
                  className="rounded-full"
                />
                {opportunity ? (
                  <p className="text-sm text-muted-foreground">
                    Minimum allowed amount is {formatCurrency(opportunity.minimum_investment)}.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting || !opportunity}>
                  {submitting ? 'Submitting...' : 'Submit request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
