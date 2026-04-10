'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'

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

export default function InvestmentsPage() {
  const { user, token, loading } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && token) {
      fetchInvestments()
    }
  }, [user, token, loading, router])

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInvestments(data)
      }
    } catch (error) {
      console.error('Failed to fetch investments:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const filteredInvestments = investments.filter((inv) => {
    if (statusFilter === 'all') return true
    return inv.status === statusFilter
  })

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {user.role === 'approver' ? 'All Investment Requests' : 'My Investments'}
          </h1>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {dataLoading ? (
          <div className="text-center py-8">Loading investments...</div>
        ) : filteredInvestments.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No investment requests found</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {user.role === 'approver' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opportunity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvestments.map((inv) => (
                  <tr key={inv.id}>
                    {user.role === 'approver' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inv.user?.name} ({inv.user?.email})
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inv.opportunity.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(inv.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        inv.status === 'approved' ? 'bg-green-100 text-green-700' :
                        inv.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inv.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inv.reviewed_at ? new Date(inv.reviewed_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}