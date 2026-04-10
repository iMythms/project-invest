'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="space-y-6 px-2 lg:px-0">
          <div>
            <p className="page-eyebrow">Secure access</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Sign in to the investment workspace.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Access opportunities, capital requests, approvals, and audit history inside a
              restrained operational environment designed for business users.
            </p>
          </div>

          <div className="surface-subtle p-5">
            <p className="text-sm font-medium text-slate-900">Test access</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p><code>viewer@test.com</code></p>
              <p><code>investor@test.com</code></p>
              <p><code>approver@test.com</code></p>
              <p>Password: <code>password123</code></p>
            </div>
          </div>

          <Link href="/" className="btn-tertiary px-0">
            Return to portal overview
          </Link>
        </section>

        <section className="surface-card w-full p-8 sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Family office portal</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Authenticate with your assigned account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Access is role-scoped. Unavailable actions remain hidden by default.
          </p>
        </section>
      </div>
    </main>
  )
}
