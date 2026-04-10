'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft01Icon, Briefcase01Icon, Invoice03Icon, Shield01Icon } from '@hugeicons/core-free-icons'
import { AppIcon } from '@/components/icons'
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
    <main className="flex min-h-screen items-center justify-center bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <AppIcon icon={ArrowLeft01Icon} size={16} />
          Back to home
        </Link>

        <div className="surface-card overflow-hidden p-0">
          <div className="grid md:grid-cols-2">
            <section className="p-6 sm:p-8">
              <div className="space-y-2 text-center md:text-left">
                <p className="text-sm font-medium text-slate-500">Project Invest</p>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
                <p className="text-sm leading-6 text-slate-500">
                  Sign in to continue into the governed investment workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm leading-6 text-slate-500 md:text-left">
                Access remains role-scoped after authentication. Controls outside your assigned role stay hidden by default.
              </p>
            </section>

            <section className="hidden border-l border-slate-200 bg-slate-50/80 p-8 md:flex md:flex-col md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Workspace access</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Private capital workflows in one controlled environment.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  The login surface should be simple: one form, one supporting panel, and clear explanations of what access enables.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <AppIcon icon={Briefcase01Icon} size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Opportunity review</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Review current mandates, minimums, and request context.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <AppIcon icon={Invoice03Icon} size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Approval workflow</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Keep pending requests, decisions, and notes in a single operating queue.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <AppIcon icon={Shield01Icon} size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Audit visibility</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Authentication and review actions remain visible in the governance trail.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
