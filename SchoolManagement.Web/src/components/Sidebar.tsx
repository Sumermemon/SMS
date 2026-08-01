import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, Book, BookOpen,
  ClipboardList, Calendar, DollarSign, TrendingDown, Bus, Bell,
  CreditCard, LogOut, School, ChevronRight, Layers
} from 'lucide-react'

const NAV = [
  { section: 'Overview', items: [
    { label: 'Dashboard',    icon: LayoutDashboard, to: '/dashboard' },
  ]},
  { section: 'People', items: [
    { label: 'Students',     icon: GraduationCap,   to: '/students' },
    { label: 'Teachers',     icon: UserCheck,       to: '/teachers' },
    { label: 'Parents',      icon: Users,           to: '/parents' },
  ]},
  { section: 'Academics', items: [
    { label: 'Classes',      icon: School,          to: '/classes' },
    { label: 'Sections',     icon: Layers,          to: '/sections' },
    { label: 'Subjects',     icon: Book,            to: '/subjects' },
    { label: 'Exams',        icon: BookOpen,        to: '/exams' },
    { label: 'Exam Grades',  icon: ClipboardList,   to: '/exam-grades' },
    { label: 'Attendance',   icon: ClipboardList,   to: '/attendance' },
  ]},
  { section: 'Finance', items: [
    { label: 'Fees',         icon: DollarSign,      to: '/fees' },
    { label: 'Expenses',     icon: TrendingDown,    to: '/expenses' },
    { label: 'Teacher Pay',  icon: CreditCard,      to: '/teacher-payments' },
  ]},
  { section: 'Other', items: [
    { label: 'Transport',    icon: Bus,             to: '/transport' },
    { label: 'Notices',      icon: Bell,            to: '/notices' },
  ]},
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏫</div>
        <div>
          <div className="sidebar-logo-text">EduManage</div>
          <div className="sidebar-logo-sub">School System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="sidebar-section-label">{section}</div>
            {items.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div className="avatar" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--clr-navy), var(--clr-teal))', fontSize: 14 }}>
            {user?.fullName?.charAt(0) ?? 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="user-name truncate">{user?.fullName}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost w-full btn-sm" onClick={() => { logout(); navigate('/login') }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}
