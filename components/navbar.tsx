'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { StatusBadge } from '@/components/ui'
import { AppIcon, IconTile } from '@/components/icons'
import {
  Audit01Icon,
  Briefcase01Icon,
  ChartLineData01Icon,
  DashboardSquare01Icon,
  Invoice03Icon,
  Logout03Icon,
} from '@hugeicons/core-free-icons'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    description: 'Overview and priorities',
    icon: DashboardSquare01Icon,
  },
  {
    href: '/opportunities',
    label: 'Opportunities',
    description: 'Open opportunities and intake',
    icon: Briefcase01Icon,
  },
  {
    href: '/investments',
    label: 'Investments',
    description: 'Requests and portfolio activity',
    icon: ChartLineData01Icon,
  },
  {
    href: '/approve',
    label: 'Approvals',
    description: 'Decision queue',
    icon: Invoice03Icon,
    roles: ['approver'],
  },
  {
    href: '/audit',
    label: 'Audit Log',
    description: 'System history',
    icon: Audit01Icon,
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

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
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <IconTile icon={DashboardSquare01Icon} tone="brand" size={16} />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Family office portal
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">{section.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] max-w-[86vw] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <IconTile icon={DashboardSquare01Icon} tone="brand" size={16} />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Family office portal
              </p>
              <h1 className="mt-0.5 text-base font-semibold tracking-tight text-slate-900">Investment operations</h1>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-5 text-slate-500">
            Capital workflow, approvals, and oversight.
          </p>
        </div>

        <div className="px-4 pt-4">
          <div className="surface-subtle flex items-center justify-between px-3 py-2.5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Workspace mode</p>
              <p className="mt-0.5 text-sm font-medium text-slate-900">Approver-first shell</p>
            </div>
            <StatusBadge label={user.role} tone="brand" />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl border px-3 py-2.5 text-sm transition ${
                  active
                    ? 'border-slate-200 bg-slate-50 text-slate-900'
                    : 'border-transparent bg-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                      active ? 'bg-white text-slate-900 ring-1 ring-slate-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <AppIcon icon={item.icon} size={16} />
                  </span>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className={`mt-0.5 text-[11px] leading-4 ${active ? 'text-slate-500' : 'text-slate-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4">
          <div className="surface-subtle flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
              <p className="mt-1 text-[11px] text-slate-500">Authenticated workspace session</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Sign out"
            >
              <AppIcon icon={Logout03Icon} size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 hidden border-b border-slate-200 bg-slate-50/85 backdrop-blur lg:block">
          <div className="flex items-center justify-between gap-3 px-8 py-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">{section.label}</p>
              <p className="mt-0.5 text-sm text-slate-600">{section.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>Role-aware controls are applied automatically.</span>
              <StatusBadge label={user.role} tone="brand" />
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</main>
      </div>
    </div>
  )
}
