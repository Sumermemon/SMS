import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantApi, exceptionLogApi } from '@/lib/services'
import {
  Building2, Users, CheckCircle, XCircle, AlertTriangle,
  GraduationCap, UserCheck, Clock, TrendingUp, RefreshCw,
  ShieldAlert, Activity, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

function StatCard({
  icon: Icon, label, value, color, bg, sub
}: {
  icon: React.ComponentType<any>
  label: string
  value: string | number
  color: string
  bg: string
  sub?: string
}) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color }}>
        <Icon size={22} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
        <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0 0', lineHeight: 1 }}>{value}</h3>
        {sub && <p style={{ fontSize: '12px', color: 'var(--text-faint)', margin: '2px 0 0 0' }}>{sub}</p>}
      </div>
    </div>
  )
}


function ExpiryBadge({ date }: { date?: string | null }) {
  if (!date) return <span className="text-slate-400 text-xs">No expiry</span>
  const d = new Date(date)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return <span className="badge badge-error">Expired</span>
  if (diff <= 30) return <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>Expires in {diff}d</span>
  return <span className="text-xs text-slate-500">{d.toLocaleDateString()}</span>
}

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: async () => {
      const res = await tenantApi.getStats()
      return res.data
    },
    refetchInterval: 30000 // auto-refresh every 30s
  })

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await tenantApi.getAll()
      return res.data
    },
  })

  const { data: recentErrors } = useQuery({
    queryKey: ['exception-logs', 'recent'],
    queryFn: async () => {
      const res = await exceptionLogApi.getAll({ page: 1, pageSize: 5, isResolved: false })
      return res.data
    },
  })

  const resolveError = useMutation({
    mutationFn: (id: number) => exceptionLogApi.resolve(id, { note: 'Resolved from dashboard' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exception-logs'] })
      toast.success('Marked as resolved')
    }
  })

  if (statsLoading || tenantsLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            <span>Loading platform metrics...</span>
          </div>
        </div>
      </div>
    )
  }

  const tenantList = (tenants as any[]) || []

  // Sort by plan expiry ascending (soonest first)
  const sortedByExpiry = [...tenantList]
    .filter((t: any) => t.planExpiryDate)
    .sort((a: any, b: any) => new Date(a.planExpiryDate).getTime() - new Date(b.planExpiryDate).getTime())
    .slice(0, 5)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={24} style={{ color: 'var(--primary)' }} />
            Platform Overview
          </h1>
          <p className="page-subtitle">Super Admin — Real-time platform health</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => qc.invalidateQueries()}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard icon={Building2} label="Total Tenants" value={stats?.totalTenants ?? 0} color="#6366f1" bg="#eef2ff" />
        <StatCard icon={CheckCircle} label="Active" value={stats?.activeTenants ?? 0} color="#16a34a" bg="#dcfce7" />
        <StatCard icon={XCircle} label="Inactive" value={stats?.inactiveTenants ?? 0} color="#dc2626" bg="#fee2e2" />
        <StatCard icon={AlertTriangle} label="Expiring Soon" value={stats?.expiringWithin30Days ?? 0} color="#b45309" bg="#fef3c7" sub="within 30 days" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <StatCard icon={GraduationCap} label="Total Students" value={(stats?.totalStudents ?? 0).toLocaleString()} color="#0891b2" bg="#e0f2fe" />
        <StatCard icon={UserCheck} label="Total Teachers" value={(stats?.totalTeachers ?? 0).toLocaleString()} color="#7c3aed" bg="#ede9fe" />
        <StatCard icon={Users} label="Platform Users" value={(stats?.totalUsers ?? 0).toLocaleString()} color="#ea580c" bg="#ffedd5" />
      </div>

      {/* Two-column section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>

        {/* Tenants Table */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity size={16} style={{ color: 'var(--primary)' }} />
              All Tenants
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/superadmin/tenants')}>
              Manage <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>School</th>
                  <th>Students</th>
                  <th>Plan Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenantList.slice(0, 8).map((t: any) => (
                  <tr key={t.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.contactEmail}</p>
                      </div>
                    </td>
                    <td className="text-sm">
                      <span className="font-medium">{t.studentCount}</span>
                      <span className="text-slate-400 text-xs"> students</span>
                    </td>
                    <td><ExpiryBadge date={t.planExpiryDate} /></td>
                    <td>
                      <span className={`badge ${t.isActive ? 'badge-success' : 'badge-error'}`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {tenantList.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-500 text-sm">No tenants yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <AlertTriangle size={16} style={{ color: '#dc2626' }} />
              Recent Errors
              {recentErrors?.total > 0 && (
                <span className="badge badge-error ml-1">{recentErrors.total} open</span>
              )}
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/superadmin/exception-logs')}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div>
            {(recentErrors?.data || []).map((err: any) => (
              <div key={err.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  marginTop: '4px', width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: err.severity === 'Critical' ? '#dc2626' : err.severity === 'Error' ? '#ea580c' : '#eab308'
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{err.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{err.requestMethod} {err.requestPath}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} />
                      {new Date(err.occurredAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#16a34a' }}
                  onClick={() => resolveError.mutate(err.id)}
                >
                  Resolve
                </button>
              </div>
            ))}
            {(!recentErrors?.data || recentErrors.data.length === 0) && (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <CheckCircle size={32} style={{ color: '#16a34a', margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No open errors — system is healthy!</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Expiry Watchlist */}
      {sortedByExpiry.length > 0 && (
        <div className="card mt-6">
          <div className="flex items-center gap-2 p-5 border-b border-slate-100">
            <TrendingUp size={16} style={{ color: '#b45309' }} />
            <h2 className="font-semibold text-slate-800">Plan Expiry Watchlist</h2>
            <span className="text-xs text-slate-500 ml-1">— schools with upcoming plan renewals</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>School</th>
                  <th>Contact</th>
                  <th>Students</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                </tr>
              </thead>
              <tbody>
                {sortedByExpiry.map((t: any) => {
                  const daysLeft = Math.ceil(
                    (new Date(t.planExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <tr key={t.id}>
                      <td className="font-medium text-slate-800">{t.name}</td>
                      <td className="text-slate-500 text-sm">{t.contactEmail}</td>
                      <td>{t.studentCount}</td>
                      <td>{new Date(t.planExpiryDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          daysLeft < 0 ? 'badge-error' :
                          daysLeft <= 7 ? 'badge-error' :
                          daysLeft <= 30 ? 'badge' : 'badge-success'
                        }`} style={daysLeft > 0 && daysLeft <= 30 ? { background: '#fef3c7', color: '#b45309' } : {}}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
