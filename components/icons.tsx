import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

type IconTone = 'default' | 'brand' | 'success' | 'warning' | 'danger'

const toneClasses: Record<IconTone, string> = {
  default: 'bg-slate-100 text-slate-700',
  brand: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
}

export function AppIcon({
  icon,
  size = 18,
  className,
}: {
  icon: IconSvgElement
  size?: number
  className?: string
}) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} className={className} />
}

export function IconTile({
  icon,
  tone = 'default',
  size = 18,
}: {
  icon: IconSvgElement
  tone?: IconTone
  size?: number
}) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
    >
      <AppIcon icon={icon} size={size} />
    </span>
  )
}
