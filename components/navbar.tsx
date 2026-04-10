'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { AppIcon } from '@/components/icons'
import { StatusPill } from '@/components/status-pill'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Audit01Icon,
  Briefcase01Icon,
  ChartLineData01Icon,
  DashboardSquare01Icon,
  Invoice03Icon,
  Logout03Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: DashboardSquare01Icon,
  },
  {
    href: '/opportunities',
    label: 'Opportunities',
    icon: Briefcase01Icon,
  },
  {
    href: '/investments',
    label: 'Investments',
    icon: ChartLineData01Icon,
    roles: ['viewer', 'investor', 'approver'],
  },
  {
    href: '/approve',
    label: 'Approvals',
    icon: Invoice03Icon,
    roles: ['approver'],
  },
  {
    href: '/audit',
    label: 'Audit Log',
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

  if (!user) {
    return <>{children}</>
  }

  const section =
    sectionMeta.find((item) => item.match(pathname)) ?? {
      label: 'Workspace',
      subtitle: 'Authenticated investment portal workspace.',
    }

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(user.role))
  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" variant="inset" className="border-r border-sidebar-border/70">
        <SidebarHeader className="gap-1 px-3 py-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
              <AppIcon icon={DashboardSquare01Icon} size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">project invest</p>
              <p className="truncate text-xs text-sidebar-foreground/60">investment operations</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 pb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/45">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        size="default"
                        isActive={active}
                        tooltip={item.label}
                        className={cn(
                          'h-11 gap-3 rounded-2xl px-2.5 py-2 text-[15px] font-medium transition-colors',
                          active
                            ? 'bg-sidebar-accent/80 text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/78 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground'
                        )}
                        render={<Link href={item.href} />}
                      >
                        <span
                          className={cn(
                            'flex size-7 shrink-0 items-center justify-center rounded-xl border border-sidebar-border/70 bg-background text-sidebar-foreground/80',
                            active && 'border-transparent bg-background text-sidebar-foreground'
                          )}
                        >
                          <AppIcon icon={item.icon} size={17} />
                        </span>
                        <span className="truncate leading-none">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-3 pb-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton size="default" className="h-11 rounded-2xl px-2.5 py-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
                        {initials}
                      </span>
                      <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">project invest</span>
                        <span className="truncate text-xs text-sidebar-foreground/60">{user.email}</span>
                      </span>
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent side="top" align="end" className="min-w-56 rounded-3xl">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Authenticated workspace session</p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <StatusPill value={user.role} />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <AppIcon icon={Logout03Icon} size={16} />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <Separator orientation="vertical" className="mr-1 hidden h-4 md:block" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:inline-flex">
                  <span className="text-muted-foreground">project invest</span>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>{section.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-3">
              <p className="hidden text-sm text-muted-foreground lg:block">{section.subtitle}</p>
              <StatusPill value={user.role} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
