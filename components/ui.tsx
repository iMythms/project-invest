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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeToneClasses[resolvedTone]}`}
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <div className="space-y-1.5">
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
  icon,
}: {
  label: string
  value: string
  description: string
  tone?: MetricTone
  icon?: ReactNode
}) {
  return (
    <div className={`surface-card p-3.5 ${metricToneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {icon ? <div className="shrink-0">{icon}</div> : null}
      </div>
      <p className="mt-2.5 text-[24px] font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1.5 text-[13px] leading-5 text-slate-500">{description}</p>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="surface-card p-4 sm:p-5">
      <div className="mb-3.5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? <p className="text-[13px] leading-5 text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
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
    <div className="surface-card px-5 py-8 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="surface-card px-5 py-8 text-center">
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  )
}
