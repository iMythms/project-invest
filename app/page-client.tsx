'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { LoadingState } from '@/components/ui'

function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-700">
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-blue-700 uppercase">
              Project Invest
            </p>
            <p className="mt-1 text-sm text-slate-500">Private market access with controlled approval workflows.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-primary">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="page-eyebrow text-blue-700">Private market operations, simplified</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              The private capital workspace built for trust.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Review opportunities, route investment requests, and approve decisions through one
              calmer operating surface designed for family offices and internal investment teams.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login" className="btn-secondary">
                Sign in to dashboard
              </Link>
              <Link href="#workflow" className="btn-tertiary">
                Review workflow
              </Link>
            </div>

            <div className="mt-9 grid gap-5 border-t border-slate-200 pt-7 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">4 roles</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Viewer, investor, investment manager, and approver access within one governed system.
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">1 queue</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Requests move through a single approval flow with full context.
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">Full audit</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Activity, decisions, and access events stay visible to the right operators.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-4">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      Approval dashboard
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      $53,683.80
                    </p>
                    <p className="mt-1 text-sm text-emerald-600">+8.21% active request volume</p>
                  </div>
                  <div className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                    Live
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-end justify-between text-xs text-slate-400">
                      <span>Approval flow</span>
                      <span>Last 30 days</span>
                    </div>
                    <div className="mt-6 flex h-32 items-end gap-2">
                      <div className="w-8 rounded-t-full bg-blue-100" style={{ height: '35%' }} />
                      <div className="w-8 rounded-t-full bg-blue-200" style={{ height: '52%' }} />
                      <div className="w-8 rounded-t-full bg-blue-300" style={{ height: '48%' }} />
                      <div className="w-8 rounded-t-full bg-blue-400" style={{ height: '71%' }} />
                      <div className="w-8 rounded-t-full bg-blue-500" style={{ height: '82%' }} />
                      <div className="w-8 rounded-t-full bg-blue-600" style={{ height: '64%' }} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[1.25rem] border border-slate-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        Pending review
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">12 requests</p>
                      <p className="mt-1 text-sm text-slate-500">Distinct requestors across five strategies.</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        Governance trail
                      </p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">Audit complete</p>
                      <p className="mt-1 text-sm text-slate-500">Every approval and login event is retained.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-sm font-medium text-slate-400">
            <span>Institutional review</span>
            <span>Role-scoped permissions</span>
            <span>Approval controls</span>
            <span>Audit visibility</span>
            <span>Capital request tracking</span>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto grid max-w-7xl gap-16 px-4 py-18 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="max-w-xl">
          <p className="page-eyebrow">Why it exists</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Built for disciplined investment execution, not retail noise.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            The platform combines opportunity access, request routing, and governance review in one
            environment so teams can move capital forward without losing control or context.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="surface-card p-5">
            <p className="text-sm font-medium text-slate-900">Opportunity review</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Review deal availability, minimum commitments, and current status before capital is requested.
            </p>
          </div>
          <div className="surface-card p-5">
            <p className="text-sm font-medium text-slate-900">Controlled submissions</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Route requests into a single queue with clear thresholds, notes, and ownership.
            </p>
          </div>
          <div className="surface-card p-5">
            <p className="text-sm font-medium text-slate-900">Approver-first workflow</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Keep approvers close to pending items, requestor context, and the exact decision state.
            </p>
          </div>
          <div className="surface-card p-5">
            <p className="text-sm font-medium text-slate-900">Audit confidence</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Retain login, submission, approval, and rejection events in a clean governance trail.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-18 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-blue-300">Operational clarity</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              The app stays focused on decisions, status, and accountability.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Internal screens are intentionally quieter than the landing page: lighter surfaces,
              denser tables, and fewer visual layers so teams can review more in less time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary">
                Sign in
              </Link>
              <Link href="#workflow" className="btn-secondary bg-white text-slate-900 hover:bg-slate-100">
                Explore workflow
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-white">Approvals</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                One queue, one detail view, and recorded review notes per decision.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-white">Audit log</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Filterable activity history with actor, entity, timestamp, and metadata.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5 sm:col-span-2">
              <p className="text-sm font-medium text-white">Role-aware by default</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                  Viewer, investor, investment manager, and approver experiences share one system while exposing only the controls each role should use.
                </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function PageClient() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingState label="Loading..." />
  }

  if (user) {
    return <LoadingState label="Redirecting to dashboard..." />
  }

  return <LandingPage />
}
