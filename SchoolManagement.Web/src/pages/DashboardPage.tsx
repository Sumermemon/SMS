import { useQuery } from '@tanstack/react-query'
import { studentApi, teacherApi, parentApi, classApi, sectionApi, subjectApi, feeApi, noticeApi } from '@/lib/services'
import {
  GraduationCap, UserCheck, Users, BookOpen, DollarSign, Bell,
  TrendingUp, TrendingDown, Award, Bus
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#00B4D8', '#0F4C75', '#48CAE4', '#10b981', '#f59e0b']

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Mock monthly fee data (replace with real chart API later)
const feeChartData = MONTHS.slice(0, 7).map((m, i) => ({
  name: m,
  collected: [48000, 52000, 47000, 61000, 58000, 65000, 70000][i],
  due: [12000, 8000, 13000, 7000, 9000, 5000, 6000][i],
}))

const attendanceData = [
  { name: 'Present', value: 87 },
  { name: 'Absent', value: 13 },
]

export default function DashboardPage() {
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: () => studentApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })
  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: () => teacherApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })
  const { data: parents } = useQuery({ queryKey: ['parents'], queryFn: () => parentApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })
  const { data: fees } = useQuery({ queryKey: ['fees'], queryFn: () => feeApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })
  const { data: notices } = useQuery({ queryKey: ['notices'], queryFn: () => noticeApi.getAll({ page: 1, pageSize: 5 }).then(r => r.data) })

  const totalStudents = students?.totalCount ?? 0
  const totalTeachers = teachers?.totalCount ?? 0
  const totalParents = parents?.totalCount ?? 0
  const totalNotices = notices?.totalCount ?? 0

  const stats = [
    { label: 'Students', value: totalStudents, icon: GraduationCap, color: '#00B4D8', bg: 'rgba(0,180,216,0.1)' },
    { label: 'Teachers', value: totalTeachers, icon: UserCheck,    color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Parents',  value: totalParents,  icon: Users,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Notices',  value: totalNotices,  icon: Bell,         color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ]

  return (
    <div>
      {/* Stat cards */}
      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{value.toLocaleString()}</div>
              <div className="stat-label">Total {label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* Fee Collection Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Fee Collection Overview</span>
            <span className="badge badge-info">2024</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={feeChartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="due" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--clr-text-faint)" fontSize={11} />
              <YAxis stroke="var(--clr-text-faint)" fontSize={11} tickFormatter={v => `${v/1000}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 8, fontSize: 12 }}
                formatter={(val: number) => [`₨ ${val.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="collected" name="Collected" stroke="#00B4D8" fill="url(#collected)" strokeWidth={2} />
              <Area type="monotone" dataKey="due" name="Due" stroke="#ef4444" fill="url(#due)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Donut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">Today's Attendance</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart width={200} height={200}>
              <Pie data={attendanceData} cx={100} cy={100} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', marginTop: -8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Present 87%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Absent 13%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Recent notices + Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Recent Notices */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Notices</span>
            <a href="/notices" style={{ fontSize: 12 }}>View All</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notices?.data?.length ? notices.data.map((n: any) => (
              <div key={n.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--clr-border)' }}>
                <div style={{ width: 36, height: 36, background: 'rgba(0,180,216,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={16} style={{ color: 'var(--clr-teal)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 13 }} className="truncate">{n.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>{n.date} · {n.viewCount || 0} views</p>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>No recent notices</p>
            )}
          </div>
        </div>

        {/* Quick Finance Summary */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Finance Summary</span>
            <span className="badge badge-success">This Month</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[
              { label: 'Total Fees Collected', value: '₨ 70,000', icon: TrendingUp, color: '#10b981' },
              { label: 'Pending Fees',          value: '₨ 6,000',  icon: TrendingDown, color: '#ef4444' },
              { label: 'Total Expenses',         value: '₨ 42,500', icon: DollarSign, color: '#f59e0b' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px var(--space-md)', background: 'var(--clr-surface-2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} style={{ color }} />
                  <span style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>{label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
