import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
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
import ParentsPage from './pages/ParentsPage'
import AttendancePage from './pages/AttendancePage'
import ExpensesPage from './pages/ExpensesPage'
import ExamsPage from './pages/ExamsPage'
import ExamGradesPage from './pages/ExamGradesPage'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

// Placeholder components for unimplemented pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="empty-state">
    <div style={{ fontSize: 40 }}>🚧</div>
    <p>{title} module is under construction</p>
  </div>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes inside Layout */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="notices" element={<NoticesPage />} />
              
              {/* Placeholders for other pages to avoid 404s */}
              <Route path="parents" element={<ParentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="sections" element={<SectionsPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="class-routines" element={<Placeholder title="Class Routines" />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="exam-grades" element={<ExamGradesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="teacher-payments" element={<Placeholder title="Teacher Payments" />} />
              <Route path="transport" element={<Placeholder title="Transport" />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--clr-surface)',
            color: 'var(--clr-text)',
            border: '1px solid var(--clr-border)'
          }
        }} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
