import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">Family Office Investment Portal</h1>
          <p className="text-gray-600 mb-8">
            Manage investment opportunities and requests with role-based access control.
          </p>

          <div className="flex space-x-4">
            <Link
              href="/login"
              className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="py-2 px-6 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Dashboard
            </Link>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-3">Features</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Multi-user authentication with JWT</li>
              <li>• Role-based access control (viewer, investor, approver)</li>
              <li>• Browse investment opportunities</li>
              <li>• Submit and track investment requests</li>
              <li>• Approve/reject requests (for approvers)</li>
              <li>• Comprehensive audit logging</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}