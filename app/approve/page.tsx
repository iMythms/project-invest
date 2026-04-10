'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

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
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInvestments(data.filter((inv: any) => inv.status === 'pending'))
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/investments/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes[id] || null }),
      })

      if (response.ok) {
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/investments/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes[id] || null }),
      })

      if (response.ok) {
        fetchInvestments()
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (user.role !== 'approver') {
    return null
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Approve Investment Requests</h1>

        {dataLoading ? (
          <div className="text-center py-8">Loading pending requests...</div>
        ) : investments.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No pending requests</div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => (
              <div key={inv.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{inv.opportunity.name}</h3>
                    <p className="text-gray-600">
                      {inv.user.name} ({inv.user.email})
                    </p>
                    <p className="text-gray-500 mt-2">
                      Amount: ${parseFloat(inv.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(inv.submitted_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(inv.id)}
                      className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(inv.id)}
                      className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={notes[inv.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [inv.id]: e.target.value })}
                    placeholder="Add notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}