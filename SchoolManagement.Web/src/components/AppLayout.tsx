import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/teachers': 'Teachers',
  '/parents': 'Parents',
  '/classes': 'Classes & Sections',
  '/subjects': 'Subjects',
  '/class-routines': 'Class Routines',
  '/exams': 'Exams',
  '/exam-grades': 'Exam Grades',
  '/attendance': 'Attendance',
  '/fees': 'Fee Collection',
  '/expenses': 'Expenses',
  '/teacher-payments': 'Teacher Payments',
  '/transport': 'Transport',
  '/notices': 'Notices',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'School Management'

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-area">
        {/* Top bar */}
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-right">
            <button className="btn btn-icon btn-ghost" aria-label="Notifications">
              <Bell size={18} />
            </button>
          </div>
        </header>
        {/* Page content */}
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
