import { ReactNode } from 'react'

type BadgeTone = 'default' | 'brand' | 'success' | 'warning' | 'danger'
type MetricTone = 'default' | 'brand' | 'success' | 'warning'

const badgeToneClasses: Record<BadgeTone, string> = {
  default: 'bg-slate-100 text-slate-700',
  brand: 'bg-blue-50 text-blue-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
}

const metricToneClasses: Record<MetricTone, string> = {
  default: 'bg-white',
  brand: 'bg-blue-50/70',
  success: 'bg-green-50/70',
  warning: 'bg-amber-50/70',
}

export function getStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'approved':
      return 'success'
    case 'rejected':
    case 'closed':
      return 'danger'
    case 'pending':
      return 'warning'
    case 'open':
    case 'active':
      return 'brand'
    default:
      return 'default'
  }
}

export function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone?: BadgeTone
}) {
  const resolvedTone = tone ?? getStatusTone(label.toLowerCase())

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${badgeToneClasses[resolvedTone]}`}
    >
      {label}
    </span>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="page-title">{title}</h1>
          <p className="page-description max-w-3xl">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  description,
  tone = 'default',
}: {
  label: string
  value: string
  description: string
  tone?: MetricTone
}) {
  return (
    <div className={`surface-card p-5 ${metricToneClasses[tone]}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="surface-card p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="surface-card px-6 py-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="surface-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  )
}
