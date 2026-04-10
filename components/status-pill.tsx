import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const toneClasses: Record<string, string> = {
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  destructive: 'border-rose-200 bg-rose-50 text-rose-700',
  open: 'border-blue-200 bg-blue-50 text-blue-700',
  active: 'border-blue-200 bg-blue-50 text-blue-700',
  brand: 'border-blue-200 bg-blue-50 text-blue-700',
  investment_manager: 'border-violet-200 bg-violet-50 text-violet-700',
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function StatusPill({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const normalized = value.toLowerCase()

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-2.5 py-0.5 font-medium capitalize', toneClasses[normalized], className)}
    >
      {formatLabel(value)}
    </Badge>
  )
}
