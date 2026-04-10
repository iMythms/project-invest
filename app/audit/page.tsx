'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { EmptyState, LoadingState, MetricCard, PageHeader, StatusBadge } from '@/components/ui'
import { formatDateTime, formatLabel } from '@/lib/format'

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
  const [actionFilter, setActionFilter] = useState('')
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
      fetchLogs()
    }
  }, [user, token, loading, actionFilter, page, router])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      })

      if (actionFilter) {
        params.append('action', actionFilter)
      }

      const response = await fetch(`/api/audit-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  if (loading || !user) {
    return <LoadingState label="Loading audit log..." />
  }

  if (user.role !== 'approver') {
    return null
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Governance history"
        title="Audit log"
        description="Inspect authenticated user activity and workflow events across login, submission, and approval operations."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-500" htmlFor="actionFilter">
              Action filter
            </label>
            <select
              id="actionFilter"
              value={actionFilter}
              onChange={(e) => {
                setPage(1)
                setActionFilter(e.target.value)
              }}
              className="select-field min-w-[220px]"
            >
              <option value="">All actions</option>
              <option value="login_success">Login success</option>
              <option value="login_failed">Login failed</option>
              <option value="submit_investment">Submit investment</option>
              <option value="approve_investment">Approve investment</option>
              <option value="reject_investment">Reject investment</option>
            </select>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Visible events"
          value={String(logs.length)}
          description="Events currently returned on this page."
          tone="brand"
        />
        <MetricCard
          label="Total matched events"
          value={String(total)}
          description="Event count for the current filter criteria."
        />
        <MetricCard
          label="Current page"
          value={`${page} / ${totalPages}`}
          description="Navigate through the retained audit history."
          tone="warning"
        />
      </section>

      {dataLoading ? (
        <LoadingState label="Loading audit events..." />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="Try widening the current action filter or return later once additional activity has been recorded."
        />
      ) : (
        <div className="table-shell">
          <div className="table-container">
            <table className="data-table min-w-[1100px]">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                  <th>IP address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <p className="font-medium text-slate-900">{formatDateTime(log.timestamp)}</p>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900">
                          {log.user ? log.user.name : 'Unknown actor'}
                        </p>
                        <p className="mt-1 text-slate-500">{log.user ? log.user.email : '-'}</p>
                      </div>
                    </td>
                    <td>
                      <StatusBadge label={formatLabel(log.action)} tone="brand" />
                    </td>
                    <td>
                      {log.entity_type ? (
                        <div>
                          <p className="font-medium text-slate-900">{formatLabel(log.entity_type)}</p>
                          <p className="mono-text mt-1">{log.entity_id}</p>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <p className="max-w-sm break-words leading-6 text-slate-500">
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </p>
                    </td>
                    <td>{log.ip_address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing page {page} of {totalPages} across {total} matched events.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-secondary">
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
