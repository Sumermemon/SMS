import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exceptionLogApi } from '@/lib/services'
import {
  AlertTriangle, CheckCircle, Trash2, RefreshCw,
  Search, Filter, Eye, Clock, Globe, User, ShieldAlert, Check
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Drawer from '@/components/Drawer'

const SEVERITIES = ['All', 'Critical', 'Error', 'Warning']

export default function ExceptionLogsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('All')
  const [isResolved, setIsResolved] = useState<boolean | null>(false)
  const [selected, setSelected] = useState<any | null>(null)

  const qc = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exception-logs', page, severity, isResolved],
    queryFn: async () => {
      const res = await exceptionLogApi.getAll({
        page,
        pageSize: 15,
        severity: severity === 'All' ? undefined : severity,
        isResolved: isResolved ?? undefined,
      })
      return res.data
    },
  })

  const resolveMutation = useMutation({
    mutationFn: (id: number) => exceptionLogApi.resolve(id, { note: 'Resolved by SuperAdmin' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exception-logs'] })
      toast.success('Exception marked as resolved')
      setSelected(null)
    }
  })

  const clearResolvedMutation = useMutation({
    mutationFn: () => exceptionLogApi.clearResolved(),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['exception-logs'] })
      toast.success(`Cleared ${res.data.deleted} resolved logs`)
    }
  })

  const logs = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 15)

  const filtered = search
    ? logs.filter((l: any) =>
        l.message?.toLowerCase().includes(search.toLowerCase()) ||
        l.requestPath?.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  const severityBadge = (s: string) => {
    if (s === 'Critical') {
      return {
        bg: 'var(--danger-bg)',
        color: 'var(--danger)',
        border: '1px solid var(--danger-border)'
      }
    }
    if (s === 'Warning') {
      return {
        bg: 'var(--warning-bg)',
        color: 'var(--warning)',
        border: '1px solid var(--warning-border)'
      }
    }
    return {
      bg: '#fff7ed',
      color: '#ea580c',
      border: '1px solid #fed7aa'
    }
  }

  return (
    <div className="page-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--danger-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger)',
                border: '1px solid var(--danger-border)'
              }}
            >
              <AlertTriangle size={18} />
            </div>
            Exception Logs
          </h1>
          <p className="page-subtitle">Platform-wide diagnostic health tracking & unhandled exceptions</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => refetch()}
            title="Refresh logs"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              if (window.confirm('Delete all resolved exception logs?')) {
                clearResolvedMutation.mutate()
              }
            }}
            disabled={clearResolvedMutation.isPending}
          >
            <Trash2 size={14} />
            <span>Clear Resolved</span>
          </button>
        </div>
      </div>

      {/* ── Modern Search & Filter Toolbar ── */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          marginBottom: 16,
          background: 'var(--surface)',
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: 240, maxWidth: 360 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search messages, endpoints or paths..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            {/* Severity Segmented Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Filter size={13} style={{ color: 'var(--text-muted)' }} />
                <span>Severity:</span>
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--bg-subtle)',
                  padding: 3,
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}
              >
                {SEVERITIES.map(s => {
                  const isSel = severity === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setSeverity(s); setPage(1) }}
                      style={{
                        padding: '5px 11px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: isSel ? 600 : 500,
                        background: isSel ? 'var(--surface)' : 'transparent',
                        color: isSel ? 'var(--brand-navy)' : 'var(--text-secondary)',
                        border: isSel ? '1px solid var(--border-strong)' : '1px solid transparent',
                        boxShadow: isSel ? 'var(--shadow-xs)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status Segmented Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--bg-subtle)',
                  padding: 3,
                  borderRadius: 8,
                  border: '1px solid var(--border)'
                }}
              >
                {[
                  { label: 'Open', value: false },
                  { label: 'Resolved', value: true },
                  { label: 'All', value: null },
                ].map(opt => {
                  const isSel = isResolved === opt.value
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => { setIsResolved(opt.value); setPage(1) }}
                      style={{
                        padding: '5px 11px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: isSel ? 600 : 500,
                        background: isSel ? 'var(--surface)' : 'transparent',
                        color: isSel
                          ? (opt.value === false ? 'var(--danger)' : opt.value === true ? 'var(--success)' : 'var(--brand-navy)')
                          : 'var(--text-secondary)',
                        border: isSel ? '1px solid var(--border-strong)' : '1px solid transparent',
                        boxShadow: isSel ? 'var(--shadow-xs)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subtitle Count ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          {total} exception log{total !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* ── Logs Content Card ── */}
      <div
        className="card"
        style={{
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          overflow: 'hidden'
        }}
      >
        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontSize: 13 }}>Loading diagnostic logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'var(--success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                border: '1px solid var(--success-border)',
                color: 'var(--success)'
              }}
            >
              <CheckCircle size={28} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              No Exceptions Found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, margin: 0 }}>
              System is running clean and operating smoothly with no matching exception records.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((log: any, index: number) => {
              const badgeStyle = severityBadge(log.severity)
              return (
                <div
                  key={log.id}
                  onClick={() => setSelected(log)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    borderBottom: index < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    opacity: log.isResolved ? 0.65 : 1,
                    background: 'var(--surface)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
                >
                  {/* Severity badge */}
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        ...badgeStyle
                      }}
                    >
                      {log.severity}
                    </span>
                  </div>

                  {/* Message & metadata */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                      {log.message}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 14px', marginTop: 6 }}>
                      {log.requestPath && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          <Globe size={11} />
                          {log.requestMethod} {log.requestPath}
                        </span>
                      )}
                      {log.userId && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-muted)' }}>
                          <User size={11} />
                          User #{log.userId.slice(0, 8)}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-muted)' }}>
                        <Clock size={11} />
                        {new Date(log.occurredAt).toLocaleString()}
                      </span>
                      {log.tenantId && (
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                          Tenant #{log.tenantId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {log.isResolved ? (
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        Resolved
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: 11,
                          color: 'var(--success)',
                          padding: '3px 8px',
                          height: 'auto',
                          borderColor: 'var(--success-border)'
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          resolveMutation.mutate(log.id)
                        }}
                      >
                        <Check size={12} />
                        <span>Resolve</span>
                      </button>
                    )}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-subtle)'
                      }}
                    >
                      <Eye size={13} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Slide-over Sidebar Drawer for Exception Detail ── */}
      <Drawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        wide
        title="Exception Details"
        subtitle={selected ? `${selected.requestMethod} ${selected.requestPath}` : ''}
        icon={<AlertTriangle size={20} style={{ color: 'var(--danger)' }} />}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
              Close
            </button>
            {selected && !selected.isResolved && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => resolveMutation.mutate(selected.id)}
                disabled={resolveMutation.isPending}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={15} />
                <span>{resolveMutation.isPending ? 'Resolving…' : 'Mark as Resolved'}</span>
              </button>
            )}
          </>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  ...severityBadge(selected.severity)
                }}
              >
                {selected.severity}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {new Date(selected.occurredAt).toLocaleString()}
              </span>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                Exception Message
              </p>
              <div
                style={{
                  padding: 14,
                  borderRadius: 8,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  lineHeight: 1.45
                }}
              >
                {selected.message}
              </div>
            </div>

            <div className="drawer-form-grid">
              <div className="form-group">
                <label className="form-label">HTTP Method & Path</label>
                <input className="form-control" readOnly value={`${selected.requestMethod} ${selected.requestPath}`} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <input className="form-control" readOnly value={selected.isResolved ? 'Resolved' : 'Active / Unresolved'} />
              </div>
            </div>

            {selected.stackTrace && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Stack Trace
                </p>
                <pre
                  style={{
                    fontSize: 11.5,
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: 16,
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 380,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    lineHeight: 1.5,
                    border: '1px solid #1e293b'
                  }}
                >
                  {selected.stackTrace}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
