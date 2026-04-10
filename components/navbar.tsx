'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { StatusBadge } from '@/components/ui'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    description: 'Overview and priorities',
  },
  {
    href: '/opportunities',
    label: 'Opportunities',
    description: 'Open opportunities and intake',
  },
  {
    href: '/investments',
    label: 'Investments',
    description: 'Requests and portfolio activity',
  },
  {
    href: '/approve',
    label: 'Approvals',
    description: 'Decision queue',
    roles: ['approver'],
  },
  {
    href: '/audit',
    label: 'Audit Log',
    description: 'System history',
    roles: ['approver'],
  },
]

const sectionMeta = [
  {
    match: (pathname: string) => pathname.startsWith('/dashboard'),
    label: 'Dashboard',
    subtitle: 'Operational overview for the current workspace.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/opportunities'),
    label: 'Opportunities',
    subtitle: 'Open deals and current intake activity.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/investments/new'),
    label: 'New Investment',
    subtitle: 'Submit a controlled capital request.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/investments'),
    label: 'Investments',
    subtitle: 'Portfolio requests and approval outcomes.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/approve'),
    label: 'Approvals',
    subtitle: 'Review pending capital requests.',
  },
  {
    match: (pathname: string) => pathname.startsWith('/audit'),
    label: 'Audit Log',
    subtitle: 'Immutable activity and governance trail.',
  },
]

export function Navbar({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) {
    return <>{children}</>
  }

  const section =
    sectionMeta.find((item) => item.match(pathname)) ?? {
      label: 'Workspace',
      subtitle: 'Authenticated investment portal workspace.',
    }

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(user.role))

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-slate-100/80 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-sm font-medium text-slate-500">Family office portal</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Investment operations
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Approver-first workspace for opportunity review, capital requests, and audit visibility.
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-1 lg:flex-col lg:overflow-visible">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-w-[190px] rounded-lg border px-4 py-3 text-sm transition lg:min-w-0 ${
                  active
                    ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-900'
                }`}
              >
                <p className="font-medium">{item.label}</p>
                <p className={`mt-1 text-xs ${active ? 'text-blue-600' : 'text-slate-500'}`}>
                  {item.description}
                </p>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
              <p className="mt-1 text-xs text-slate-500">Authenticated workspace session</p>
            </div>
            <StatusBadge label={user.role} tone="brand" />
          </div>
          <button onClick={logout} className="btn-tertiary mt-4 w-full justify-center">
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <p className="text-sm font-medium text-slate-500">{section.label}</p>
              <p className="mt-1 text-sm text-slate-600">{section.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="hidden sm:inline">Role-aware controls are applied automatically.</span>
              <StatusBadge label={user.role} tone="brand" />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
