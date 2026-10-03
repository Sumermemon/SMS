import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: string
  superAdminOnly?: boolean
  tenantOnly?: boolean
}

export default function ProtectedRoute({
  children,
  permission,
  superAdminOnly,
  tenantOnly
}: ProtectedRouteProps) {
  const { isAuthenticated, user, hasPermission } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // 1. SuperAdmin only guard
  if (superAdminOnly && !user.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // 2. Tenant only guard (SuperAdmin should not be in tenant data routes)
  if (tenantOnly && user.isSuperAdmin) {
    return <Navigate to="/superadmin/dashboard" replace />
  }

  // 3. Permission guard
  if (permission && !hasPermission(permission)) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh', gap: 14 }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'var(--danger-light, #fee2e2)', color: 'var(--danger, #dc2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ShieldAlert size={28} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
          Access Restricted
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 420, margin: 0, textAlign: 'center' }}>
          Your assigned role does not have the required <code>{permission}</code> permission to access this module.
          Contact your school administrator or system administrator to request access.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
