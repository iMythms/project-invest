'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user.email}</h1>
          <p className="text-gray-600">Role: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Available Opportunities</h2>
            <p className="text-3xl font-bold text-blue-600">-</p>
            <p className="text-sm text-gray-500 mt-2">Loading data...</p>
          </div>

          {(user.role === 'investor' || user.role === 'approver') && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Pending Investments</h2>
                <p className="text-3xl font-bold text-yellow-600">-</p>
                <p className="text-sm text-gray-500 mt-2">Your pending requests</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Approved Investments</h2>
                <p className="text-3xl font-bold text-green-600">-</p>
                <p className="text-sm text-gray-500 mt-2">Your approved requests</p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}