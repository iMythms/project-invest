import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <section className="surface-card p-8 sm:p-10">
          <p className="page-eyebrow">Family office investment portal</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Controlled investment workflows for private-office operations.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
            Review opportunities, submit capital requests, approve decisions, and inspect the
            audit trail from one institutional workspace designed for operational clarity.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary">
              Sign in
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Opportunity review</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Open opportunity intake with minimums, availability, and role-aware actions.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Capital requests</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Structured request submission, approval routing, and status visibility by role.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Audit confidence</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review immutable activity history for governance, compliance, and internal control.
              </p>
            </div>
          </div>
        </section>

        <aside className="surface-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Operational scope</h2>
          <div className="mt-6 space-y-5">
            <div className="surface-subtle p-4">
              <p className="text-sm font-medium text-slate-900">Approver-first information hierarchy</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The workspace prioritizes approval queue speed, investment visibility, and audit
                inspection without adding consumer-fintech noise.
              </p>
            </div>
            <div className="surface-subtle p-4">
              <p className="text-sm font-medium text-slate-900">Role-aware experience</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Viewer, investor, and approver permissions share one design language while exposing
                only relevant controls.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
