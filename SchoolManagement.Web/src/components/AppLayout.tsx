import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const PAGE_META: Record<string, { title: string; sub: string }> = {
  '/dashboard':        { title: 'Dashboard',         sub: 'Overview & key school metrics'          },
  '/students':         { title: 'Students',           sub: 'Manage student roster & admissions'    },
  '/teachers':         { title: 'Teachers',           sub: 'Faculty directory & staff assignments' },
  '/parents':          { title: 'Parents',            sub: 'Parent & guardian records'             },
  '/classes':          { title: 'Classes',            sub: 'Academic grades & class structure'     },
  '/sections':         { title: 'Sections',           sub: 'Class sections & student cohorts'      },
  '/subjects':         { title: 'Subjects',           sub: 'Curriculum & subject course list'      },
  '/class-routines':   { title: 'Class Routines',     sub: 'Weekly timetable & schedules'          },
  '/exams':            { title: 'Examinations',       sub: 'Assessments & exam timetables'         },
  '/exam-grades':      { title: 'Exam Grades',        sub: 'Mark entry & academic scorecards'      },
  '/attendance':       { title: 'Attendance',         sub: 'Daily attendance logs & sheets'        },
  '/fees':             { title: 'Fee Collection',     sub: 'Invoices, receipts & fee status'       },
  '/expenses':         { title: 'Expenses',           sub: 'Operational expense ledger & claims'   },
  '/teacher-payments': { title: 'Teacher Payments',   sub: 'Faculty payroll & disbursements'       },
  '/transport':        { title: 'Transport',          sub: 'Bus routes & fleet management'         },
  '/notices':          { title: 'Notices',            sub: 'School bulletins & announcements'      },
  '/superadmin/dashboard':      { title: 'Platform Admin',      sub: 'Platform overview & tenant analytics' },
  '/superadmin/tenants':        { title: 'Tenants (Schools)',   sub: 'Tenant provisioning & permission sets' },
  '/superadmin/cms':            { title: 'CMS & Settings',      sub: 'Site branding, social channels & SMTP' },
  '/superadmin/exception-logs': { title: 'Exception Logs',      sub: 'System health & diagnostic exceptions' },
  '/admin/users':               { title: 'User Management',     sub: 'Manage tenant staff & user accounts'   },
  '/admin/roles':               { title: 'Role Permissions',    sub: 'Configure tenant roles & privileges'   },
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const matched = Object.entries(PAGE_META).find(([k]) => pathname.startsWith(k))
  const { title, sub } = matched?.[1] ?? { title: 'EduManage', sub: 'School Management Portal' }

  const initials = user?.fullName
    ?.split(' ').slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <div className="layout">
      {/* Sidebar with Mobile Drawer State */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Canvas Area */}
      <main className="main-area">
        {/* Topbar Header */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Mobile Menu Trigger Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <h1 className="topbar-title">{title}</h1>
              {sub && <span className="topbar-subtitle">{sub}</span>}
            </div>
          </div>

          <div className="topbar-right">
            {/* Quick Search Trigger */}
            <button
              className="btn btn-ghost btn-sm"
              style={{
                gap: 8,
                color: 'var(--text-muted)',
                padding: '5px 12px',
                fontSize: 12.5,
              }}
              aria-label="Search"
            >
              <Search size={14} />
              <span>Search…</span>
              <kbd style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1px 5px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-strong)',
                borderRadius: 4,
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'inherit',
              }}>⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <button className="notif-btn" aria-label="Notifications">
              <Bell size={15} />
              <span className="notif-dot" />
            </button>

            {/* User Profile Badge */}
            <div className="user-menu">
              <div className="avatar" style={{
                width: 24,
                height: 24,
                background: 'var(--primary)',
                fontSize: 10.5,
              }}>
                {initials}
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div className="user-name">{user?.fullName?.split(' ')[0] ?? 'Admin'}</div>
                <div className="user-role">{user?.role ?? 'Administrator'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
