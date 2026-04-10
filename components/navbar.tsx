'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/dashboard" className="text-gray-900 hover:text-blue-600 py-2">
              Dashboard
            </Link>
            <Link href="/opportunities" className="text-gray-900 hover:text-blue-600 py-2">
              Opportunities
            </Link>
            <Link href="/investments" className="text-gray-900 hover:text-blue-600 py-2">
              My Investments
            </Link>
            {user.role === 'approver' && (
              <>
                <Link href="/approve" className="text-gray-900 hover:text-blue-600 py-2">
                  Approve
                </Link>
                <Link href="/audit" className="text-gray-900 hover:text-blue-600 py-2">
                  Audit Logs
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user.email} ({user.role})</span>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}