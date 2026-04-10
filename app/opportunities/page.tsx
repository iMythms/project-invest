'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

interface Opportunity {
  id: string
  name: string
  description: string
  minimum_investment: string
  status: string
}

export default function OpportunitiesPage() {
  const { user, token, loading } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && token) {
      fetchOpportunities()
    }
  }, [user, token, loading, router])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOpportunities(data)
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Investment Opportunities</h1>

        {dataLoading ? (
          <div className="text-center py-8">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No opportunities available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">{opp.name}</h2>
                <p className="text-gray-600 mb-4">{opp.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Minimum Investment: ${parseFloat(opp.minimum_investment).toLocaleString()}
                </p>
                {(user.role === 'investor' || user.role === 'approver') && (
                  <button
                    onClick={() => router.push(`/investments/new?opportunityId=${opp.id}`)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Invest
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}