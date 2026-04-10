'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'

interface Opportunity {
  id: string
  name: string
  minimum_investment: string
}

export default function NewInvestmentPage() {
  const { user, token, loading } = useAuth()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const opportunityId = searchParams.get('opportunityId')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (opportunityId && token) {
      fetchOpportunity()
    }
  }, [user, token, loading, opportunityId, router])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOpportunity(data)
        setAmount(data.minimum_investment)
      }
    } catch (error) {
      console.error('Failed to fetch opportunity:', error)
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
          'Authorization': `Bearer ${token}`,
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
    } catch (error) {
      setError('Failed to submit investment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!opportunity) {
    return <div className="min-h-screen flex items-center justify-center">Loading opportunity...</div>
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Submit Investment Request</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{opportunity.name}</h2>
            <p className="text-gray-600">
              Minimum: ${parseFloat(opportunity.minimum_investment).toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={opportunity.minimum_investment}
                step="1000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}