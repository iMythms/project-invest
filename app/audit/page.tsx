'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { StatusPill } from '@/components/status-pill'
import { useAuth } from '@/lib/auth-context'
import { formatDateTime, formatLabel } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AuditLog {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  details: any
  timestamp: string
  ip_address: string | null
  user: {
    email: string
    name: string
  } | null
}

export default function AuditPage() {
  const { user, token, loading } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && user.role !== 'approver') {
      router.push('/dashboard')
      return
    }

    if (user && token) {
      void fetchLogs()
    }
  }, [user, token, loading, actionFilter, page, router])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' })

      if (actionFilter !== 'all') {
        params.append('action', actionFilter)
      }

      const response = await fetch(`/api/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setTotal(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || !user || user.role !== 'approver') {
    return null
  }

  const metrics = [
    {
      label: 'Visible events',
      value: String(logs.length),
      description: 'Events currently returned on this page.',
    },
    {
      label: 'Total matched events',
      value: String(total),
      description: 'Event count for the current filter.',
    },
    {
      label: 'Current page',
      value: `${page} / ${totalPages}`,
      description: 'Navigate through retained history.',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance history"
        title="Audit log"
        description="Inspect authenticated user activity and workflow events across login, submission, approval, and rejection operations."
        actions={
          <Select
            value={actionFilter}
            onValueChange={(value) => {
              setPage(1)
              setActionFilter(value ?? 'all')
            }}
          >
            <SelectTrigger className="min-w-[220px] rounded-full">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="login_success">Login success</SelectItem>
              <SelectItem value="login_failed">Login failed</SelectItem>
              <SelectItem value="submit_investment">Submit investment</SelectItem>
              <SelectItem value="approve_investment">Approve investment</SelectItem>
              <SelectItem value="reject_investment">Reject investment</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {dataLoading ? null : logs.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No audit logs match the current filter.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Audit events</CardTitle>
            <CardDescription>Shadcn table layout for governance history and event details.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{log.user ? log.user.name : 'Unknown actor'}</p>
                        <p className="text-xs text-muted-foreground">{log.user ? log.user.email : '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill value={formatLabel(log.action)} />
                    </TableCell>
                    <TableCell>
                      {log.entity_type ? (
                        <div className="space-y-1">
                          <p className="font-medium">{formatLabel(log.entity_type)}</p>
                          <p className="text-xs text-muted-foreground">{log.entity_id}</p>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-sm whitespace-normal text-muted-foreground">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </TableCell>
                    <TableCell>{log.ip_address || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages} across {total} matched events.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
