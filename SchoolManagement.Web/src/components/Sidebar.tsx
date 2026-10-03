import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, Book, BookOpen,
  ClipboardList, DollarSign, TrendingDown, Bus, Bell,
  CreditCard, LogOut, School, Layers, X, ShieldAlert, KeyRound, Building, AlertTriangle, Globe, Calendar
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  to: string
  permission?: string // If null, accessible to all (e.g. Dashboard)
  superAdminOnly?: boolean // True if only SuperAdmin should see it
  tenantOnly?: boolean // True if only Tenant users should see it (SuperAdmin shouldn't see it)
}

interface NavGroup {
  section: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  { section: 'Overview', items: [
    { label: 'Dashboard',      icon: LayoutDashboard, to: '/dashboard', tenantOnly: true },
    { label: 'Platform Admin', icon: LayoutDashboard, to: '/superadmin/dashboard', superAdminOnly: true },
  ]},
  { section: 'Platform', items: [
    { label: 'Tenants (Schools)', icon: Building,        to: '/superadmin/tenants',        superAdminOnly: true },
    { label: 'CMS & Settings',   icon: Globe,           to: '/superadmin/cms',            superAdminOnly: true },
    { label: 'Exception Logs',   icon: AlertTriangle,   to: '/superadmin/exception-logs', superAdminOnly: true },
  ]},
  { section: 'People', items: [
    { label: 'Students',       icon: GraduationCap,   to: '/students', permission: 'students.view', tenantOnly: true },
    { label: 'Teachers',       icon: UserCheck,        to: '/teachers', permission: 'teachers.view', tenantOnly: true },
    { label: 'Parents',        icon: Users,            to: '/parents', permission: 'parents.view', tenantOnly: true },
  ]},
  { section: 'Academics', items: [
    { label: 'Classes',        icon: School,           to: '/classes', permission: 'classes.view', tenantOnly: true },
    { label: 'Sections',       icon: Layers,           to: '/sections', permission: 'sections.view', tenantOnly: true },
    { label: 'Subjects',       icon: Book,             to: '/subjects', permission: 'subjects.view', tenantOnly: true },
    { label: 'Timetable',      icon: Calendar,         to: '/timetable', permission: 'classes.view', tenantOnly: true },
    { label: 'Exams',          icon: BookOpen,         to: '/exams', permission: 'exams.view', tenantOnly: true },
    { label: 'Exam Grades',    icon: ClipboardList,    to: '/exam-grades', permission: 'exams.view', tenantOnly: true },
    { label: 'Attendance',     icon: ClipboardList,    to: '/attendance', permission: 'attendance.view', tenantOnly: true },
  ]},
  { section: 'Finance', items: [
    { label: 'Fee Collection', icon: DollarSign,       to: '/fees', permission: 'fees.view', tenantOnly: true },
    { label: 'Expenses',       icon: TrendingDown,     to: '/expenses', permission: 'expenses.view', tenantOnly: true },
    { label: 'Teacher Pay',    icon: CreditCard,       to: '/teacher-payments', permission: 'expenses.view', tenantOnly: true },
  ]},
  { section: 'Operations', items: [
    { label: 'Transport',      icon: Bus,              to: '/transport', permission: 'transport.view', tenantOnly: true },
    { label: 'Notices',        icon: Bell,             to: '/notices', permission: 'notices.view', tenantOnly: true },
  ]},
  { section: 'Administration', items: [
    { label: 'Users',          icon: ShieldAlert,      to: '/admin/users', permission: 'users.view', tenantOnly: true },
    { label: 'Roles',          icon: KeyRound,         to: '/admin/roles', permission: 'roles.view', tenantOnly: true },
  ]}
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  const initials = user?.fullName
    ?.split(' ').slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() ?? 'A'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  // Filter navigation based on current user's permissions and role
  const filteredNav = NAV.map(group => {
    const filteredItems = group.items.filter(item => {
      // 1. Check SuperAdmin vs Tenant constraints
      if (item.superAdminOnly && !user?.isSuperAdmin) return false
      if (item.tenantOnly && user?.isSuperAdmin) return false

      // 2. Check granular permissions
      if (item.permission && !hasPermission(item.permission)) return false

      return true
    })
    return { ...group, items: filteredItems }
  }).filter(group => group.items.length > 0) // Only keep groups with at least 1 item

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-label="Close menu overlay" />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header / Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M5 7.5C5 5.57 6.57 4 8.5 4H22.2C24.41 4 26.2 5.79 26.2 8V20.2C26.2 22.41 24.41 24.2 22.2 24.2H13.7L8.15 28V24.2H8.5C6.57 24.2 5 22.63 5 20.7V7.5Z" fill="currentColor"/>
              <path d="M10 10H21.5M10 15.8H18.5M10 21.5H15" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
            </svg>
          </div>
          <span className="sidebar-logo-text">EduManage {user?.isSuperAdmin && <span style={{ fontSize: 10, color: 'var(--primary)', marginLeft: 6, fontWeight: 700, padding: '2px 6px', background: 'var(--primary-light)', borderRadius: 12 }}>PRO</span>}</span>

          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="modal-close-btn"
              style={{ marginLeft: 'auto', display: isOpen ? 'flex' : 'none' }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categorized Navigation */}
        <div className="sidebar-nav">
          {filteredNav.map(({ section, items }) => (
            <div key={section}>
              <div className="sidebar-section-label">{section}</div>
              {items.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} className="nav-icon" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer with User info & Logout */}
        <div className="sidebar-footer">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 6,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            marginBottom: 8,
          }}>
            <div className="avatar" style={{ width: 28, height: 28, background: user?.isSuperAdmin ? '#000' : 'var(--primary)', fontSize: 11 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName ?? 'Administrator'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.isSuperAdmin ? 'Super Admin' : user?.role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm w-full"
            style={{
              justifyContent: 'flex-start',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border)',
              background: 'transparent',
              fontSize: 12,
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
