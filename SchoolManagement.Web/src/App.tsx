import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import TeachersPage from './pages/TeachersPage'
import FeesPage from './pages/FeesPage'
import NoticesPage from './pages/NoticesPage'
import ClassesPage from './pages/ClassesPage'
import SectionsPage from './pages/SectionsPage'
import SubjectsPage from './pages/SubjectsPage'
import TimetablePage from './pages/TimetablePage'
import ParentsPage from './pages/ParentsPage'
import AttendancePage from './pages/AttendancePage'
import ExpensesPage from './pages/ExpensesPage'
import ExamsPage from './pages/ExamsPage'
import ExamGradesPage from './pages/ExamGradesPage'
import TeacherPaymentsPage from './pages/TeacherPaymentsPage'
import TransportPage from './pages/TransportPage'
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage'
import TenantsPage from './pages/TenantsPage'
import UsersPage from './pages/UsersPage'
import RolesPage from './pages/RolesPage'
import ExceptionLogsPage from './pages/ExceptionLogsPage'

import CmsSettingsPage from './pages/CmsSettingsPage'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

// Dynamic root redirect based on user role
const RootRedirect = () => {
  const { user } = useAuth()
  if (user?.isSuperAdmin) return <Navigate to="/superadmin/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes inside Layout */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<RootRedirect />} />
              
              {/* Super Admin Routes */}
              <Route path="superadmin/dashboard" element={<ProtectedRoute superAdminOnly><SuperAdminDashboardPage /></ProtectedRoute>} />
              <Route path="superadmin/tenants" element={<ProtectedRoute superAdminOnly><TenantsPage /></ProtectedRoute>} />
              <Route path="superadmin/cms" element={<ProtectedRoute superAdminOnly><CmsSettingsPage /></ProtectedRoute>} />
              <Route path="superadmin/exception-logs" element={<ProtectedRoute superAdminOnly><ExceptionLogsPage /></ProtectedRoute>} />

              {/* Tenant Admin Routes */}
              <Route path="dashboard" element={<ProtectedRoute tenantOnly><DashboardPage /></ProtectedRoute>} />
              <Route path="admin/users" element={<ProtectedRoute permission="users.view"><UsersPage /></ProtectedRoute>} />
              <Route path="admin/roles" element={<ProtectedRoute permission="roles.view"><RolesPage /></ProtectedRoute>} />

              {/* Tenant Academic & Operational Modules */}
              <Route path="students" element={<ProtectedRoute permission="students.view"><StudentsPage /></ProtectedRoute>} />
              <Route path="teachers" element={<ProtectedRoute permission="teachers.view"><TeachersPage /></ProtectedRoute>} />
              <Route path="fees" element={<ProtectedRoute permission="fees.view"><FeesPage /></ProtectedRoute>} />
              <Route path="notices" element={<ProtectedRoute permission="notices.view"><NoticesPage /></ProtectedRoute>} />
              <Route path="parents" element={<ProtectedRoute permission="parents.view"><ParentsPage /></ProtectedRoute>} />
              <Route path="classes" element={<ProtectedRoute permission="classes.view"><ClassesPage /></ProtectedRoute>} />
              <Route path="sections" element={<ProtectedRoute permission="sections.view"><SectionsPage /></ProtectedRoute>} />
              <Route path="subjects" element={<ProtectedRoute permission="subjects.view"><SubjectsPage /></ProtectedRoute>} />
              <Route path="timetable" element={<ProtectedRoute permission="classes.view"><TimetablePage /></ProtectedRoute>} />
              <Route path="exams" element={<ProtectedRoute permission="exams.view"><ExamsPage /></ProtectedRoute>} />
              <Route path="exam-grades" element={<ProtectedRoute permission="exams.view"><ExamGradesPage /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute permission="attendance.view"><AttendancePage /></ProtectedRoute>} />
              <Route path="expenses" element={<ProtectedRoute permission="expenses.view"><ExpensesPage /></ProtectedRoute>} />
              <Route path="teacher-payments" element={<ProtectedRoute permission="expenses.view"><TeacherPaymentsPage /></ProtectedRoute>} />
              <Route path="transport" element={<ProtectedRoute permission="transport.view"><TransportPage /></ProtectedRoute>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
