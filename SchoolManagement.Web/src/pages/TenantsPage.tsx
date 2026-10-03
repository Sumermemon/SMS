import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { tenantApi, permissionApi } from '@/lib/services'
import {
  Plus, Edit2, Trash2, ShieldCheck, Search, X, Check,
  CalendarCheck, Layers, School, Book, BookOpen, GraduationCap,
  UserCheck, Users, DollarSign, TrendingDown, Bus, Bell,
  ShieldAlert, KeyRound, BarChart3, CheckCircle2
} from 'lucide-react'
import Drawer from '@/components/Drawer'

interface ModuleDef {
  key: string
  name: string
  category: string
  description: string
  icon: any
}

const KNOWN_MODULES: Record<string, Omit<ModuleDef, 'key'>> = {
  attendance: {
    name: 'Attendance',
    category: 'Academics',
    description: 'Student & staff daily attendance tracking, roll calls, and attendance reporting',
    icon: CalendarCheck,
  },
  sections: {
    name: 'Sections',
    category: 'Academics',
    description: 'Class section divisions (e.g. Section A, B, C) and student room allocations',
    icon: Layers,
  },
  classes: {
    name: 'Classes',
    category: 'Academics',
    description: 'Academic grade levels, standard classrooms, and class configurations',
    icon: School,
  },
  subjects: {
    name: 'Subjects',
    category: 'Academics',
    description: 'Curriculum courses, subject codes, and class syllabus mappings',
    icon: Book,
  },
  exams: {
    name: 'Exams & Grading',
    category: 'Academics',
    description: 'Term examinations, schedules, marks grading system, and report cards',
    icon: BookOpen,
  },
  students: {
    name: 'Students',
    category: 'People',
    description: 'Student admissions, profiles, roll numbers, and academic records',
    icon: GraduationCap,
  },
  teachers: {
    name: 'Teachers',
    category: 'People',
    description: 'Teacher staff profiles, subject assignments, and qualification records',
    icon: UserCheck,
  },
  parents: {
    name: 'Parents & Guardians',
    category: 'People',
    description: 'Parent accounts, emergency contact profiles, and student linkages',
    icon: Users,
  },
  fees: {
    name: 'Fee Collection',
    category: 'Finance',
    description: 'Tuition fees, invoice generation, receipts, and payment transactions',
    icon: DollarSign,
  },
  expenses: {
    name: 'Expenses & Payroll',
    category: 'Finance',
    description: 'Operational school expenses, expense vouchers, and teacher payroll',
    icon: TrendingDown,
  },
  transport: {
    name: 'Transport',
    category: 'Operations',
    description: 'School bus routes, vehicle assignments, and transportation fees',
    icon: Bus,
  },
  notices: {
    name: 'Notices & Bulletin',
    category: 'Operations',
    description: 'School-wide circulars, event announcements, and notice board',
    icon: Bell,
  },
  users: {
    name: 'User Management',
    category: 'Administration',
    description: 'Staff user accounts, login credentials, and user invitations',
    icon: ShieldAlert,
  },
  roles: {
    name: 'Roles & Permissions',
    category: 'Administration',
    description: 'Custom role access control and internal role management',
    icon: KeyRound,
  },
  reports: {
    name: 'Reports & Analytics',
    category: 'Reports',
    description: 'Cross-module performance metrics, financial summaries, and exports',
    icon: BarChart3,
  },
}

const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slugCode: z.string().min(1, 'Slug Code (subdomain) is required'),
  contactEmail: z.string().email('Valid email is required'),
  adminPassword: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  planExpiryDate: z.string().optional(),
  isActive: z.boolean(),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSenderEmail: z.string().optional(),
  smtpSenderName: z.string().optional(),
  smtpEnableSsl: z.boolean().optional(),
})

type TenantForm = z.infer<typeof tenantSchema>

interface TenantItem {
  id: number
  name: string
  slugCode: string
  subdomain?: string
  contactEmail: string
  phone?: string | null
  address?: string | null
  planExpiryDate?: string | null
  isActive: boolean
  permissionCount?: number
  studentCount?: number
  teacherCount?: number
  smtpHost?: string | null
  smtpPort?: number | null
  smtpUsername?: string | null
  smtpPassword?: string | null
  smtpSenderEmail?: string | null
  smtpSenderName?: string | null
  smtpEnableSsl?: boolean | null
}

export default function TenantsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Permissions Modal state (Module-wise: attendance true/false, sections true/false, etc.)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [selectedTenantForPerms, setSelectedTenantForPerms] = useState<TenantItem | null>(null)
  const [enabledModuleKeys, setEnabledModuleKeys] = useState<string[]>([])
  const [moduleSearch, setModuleSearch] = useState('')

  const queryClient = useQueryClient()

  // 1. Fetch Tenants
  const { data: tenants, isLoading } = useQuery<TenantItem[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await tenantApi.getAll()
      return res.data
    },
  })

  // 2. Fetch all system permissions for SuperAdmin to allocate
  const { data: allPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await permissionApi.getAll()
      return res.data
    },
  })

  // Exclude SuperAdmin-only system permissions (tenants.*, cms.*)
  const eligiblePermissions = useMemo(() => {
    if (!allPermissions) return []
    return (allPermissions as any[]).filter(
      (p) => !p.name.startsWith('tenants.') && !p.name.startsWith('cms.')
    )
  }, [allPermissions])

  // Group eligible permissions by prefix into discrete, independent modules
  const availableModules = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const p of eligiblePermissions) {
      const key = p.name.split('.')[0]
      if (!map[key]) map[key] = []
      map[key].push(p)
    }

    const list = Object.keys(map).map((key) => {
      const known = KNOWN_MODULES[key]
      return {
        key,
        name: known?.name || key.charAt(0).toUpperCase() + key.slice(1),
        category: known?.category || 'General',
        description: known?.description || `Features & capabilities for ${key}`,
        icon: known?.icon || Layers,
        permissions: map[key],
      }
    })

    const categoryOrder = ['Academics', 'People', 'Finance', 'Operations', 'Administration', 'Reports', 'General']
    list.sort((a, b) => {
      const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      if (catDiff !== 0) return catDiff
      return a.name.localeCompare(b.name)
    })

    return list
  }, [eligiblePermissions])

  // 3. Fetch permissions assigned to the currently selected tenant (always fresh)
  const { data: currentTenantPerms, isLoading: isLoadingTenantPerms } = useQuery({
    queryKey: ['tenant-permissions', selectedTenantForPerms?.id],
    queryFn: async () => {
      if (!selectedTenantForPerms) return []
      const res = await tenantApi.getPermissions(selectedTenantForPerms.id)
      return res.data
    },
    enabled: !!selectedTenantForPerms && isPermModalOpen,
    staleTime: 0,
    gcTime: 0,
  })

  // Sync enabledModuleKeys whenever modal opens or tenant data changes
  useEffect(() => {
    if (currentTenantPerms && isPermModalOpen && availableModules.length > 0) {
      const activeNames = new Set(
        currentTenantPerms.map((tp: any) => tp.permissionName || tp.name)
      )
      // A module is True/Enabled if any of its permissions are granted to the tenant
      const activeKeys = availableModules
        .filter((m) => m.permissions.some((p) => activeNames.has(p.name)))
        .map((m) => m.key)
      setEnabledModuleKeys(activeKeys)
    }
  }, [currentTenantPerms, isPermModalOpen, availableModules])

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema)
  })

  const createMutation = useMutation({
    mutationFn: (data: TenantForm) => tenantApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Tenant created successfully with default eligible permissions')
      handleCloseModal()
    },
    onError: () => toast.error('Failed to create tenant')
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: any }) => tenantApi.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Tenant updated successfully')
      handleCloseModal()
    },
    onError: () => toast.error('Failed to update tenant')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tenantApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success('Tenant deleted successfully')
    },
    onError: () => toast.error('Failed to delete tenant')
  })

  // Permission Save Mutation
  const savePermissionsMutation = useMutation({
    mutationFn: (permissionNames: string[]) =>
      tenantApi.setPermissions(selectedTenantForPerms!.id, permissionNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.removeQueries({ queryKey: ['tenant-permissions'] })
      toast.success(`Permissions updated for ${selectedTenantForPerms?.name}`)
      handleClosePermissionsModal()
    },
    onError: (err: any) => {
      console.error('Failed to update permissions:', err)
      const msg = err.response?.data?.message 
        || err.response?.data?.title 
        || (err.response?.status === 405 ? 'Server endpoint not found. Please restart backend in Visual Studio.' : 'Failed to update permissions')
      toast.error(msg)
    }
  })

  const onSubmit = (data: TenantForm) => {
    const payload = {
      ...data,
      phone: data.phone || null,
      address: data.address || null,
      planExpiryDate: data.planExpiryDate || null,
      smtpHost: data.smtpHost || null,
      smtpPort: data.smtpPort ? Number(data.smtpPort) : 587,
      smtpUsername: data.smtpUsername || null,
      smtpPassword: data.smtpPassword || null,
      smtpSenderEmail: data.smtpSenderEmail || null,
      smtpSenderName: data.smtpSenderName || null,
      smtpEnableSsl: data.smtpEnableSsl ?? true,
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload })
    } else {
      createMutation.mutate(payload as any)
    }
  }

  const handleEdit = (tenant: TenantItem) => {
    setEditingId(tenant.id)
    reset({
      name: tenant.name,
      slugCode: tenant.slugCode || tenant.subdomain || '',
      contactEmail: tenant.contactEmail || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      planExpiryDate: tenant.planExpiryDate ? new Date(tenant.planExpiryDate).toISOString().split('T')[0] : '',
      isActive: tenant.isActive,
      smtpHost: tenant.smtpHost || '',
      smtpPort: tenant.smtpPort || 587,
      smtpUsername: tenant.smtpUsername || '',
      smtpPassword: tenant.smtpPassword || '',
      smtpSenderEmail: tenant.smtpSenderEmail || '',
      smtpSenderName: tenant.smtpSenderName || '',
      smtpEnableSsl: tenant.smtpEnableSsl ?? true,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    reset({
      name: '',
      slugCode: '',
      contactEmail: '',
      adminPassword: '',
      phone: '',
      address: '',
      planExpiryDate: '',
      isActive: true,
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpSenderEmail: '',
      smtpSenderName: '',
      smtpEnableSsl: true,
    } as TenantForm)
  }

  // Open Permission Modal
  const handleOpenPermissionsModal = (tenant: TenantItem) => {
    setSelectedTenantForPerms(tenant)
    setEnabledModuleKeys([])
    setModuleSearch('')
    setIsPermModalOpen(true)
  }

  const handleClosePermissionsModal = () => {
    setIsPermModalOpen(false)
    setSelectedTenantForPerms(null)
    setEnabledModuleKeys([])
    setModuleSearch('')
  }

  const handleToggleModule = (modKey: string) => {
    setEnabledModuleKeys((prev) =>
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    )
  }

  const handleEnableAllModules = () => {
    setEnabledModuleKeys(availableModules.map((m) => m.key))
  }

  const handleDisableAllModules = () => {
    setEnabledModuleKeys([])
  }

  const handleSaveModules = () => {
    // Collect all underlying permissions for all enabled (true) modules
    const permissionNamesToSave: string[] = []
    for (const modKey of enabledModuleKeys) {
      const mod = availableModules.find((m) => m.key === modKey)
      if (mod) {
        for (const p of mod.permissions) {
          permissionNamesToSave.push(p.name)
        }
      }
    }
    savePermissionsMutation.mutate(permissionNamesToSave)
  }

  // Filter modules by search
  const filteredModules = useMemo(() => {
    if (!moduleSearch.trim()) return availableModules
    const query = moduleSearch.toLowerCase()
    return availableModules.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.key.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
    )
  }, [availableModules, moduleSearch])

  // Group filtered modules by category
  const modulesByCategory = useMemo(() => {
    const acc: Record<string, typeof availableModules> = {}
    for (const m of filteredModules) {
      if (!acc[m.category]) acc[m.category] = []
      acc[m.category].push(m)
    }
    return acc
  }, [filteredModules])

  if (isLoading) return <div className="p-8">Loading tenants...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenants (Schools)</h1>
          <p className="page-subtitle">Manage multi-tenant school instances & feature access</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Tenant</span>
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Subdomain / Slug</th>
              <th>Contact Email</th>
              <th>Expiry</th>
              <th>Permissions</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants?.map((t: TenantItem) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td className="font-medium">{t.name}</td>
                <td>{t.slugCode || t.subdomain}</td>
                <td>{t.contactEmail || '-'}</td>
                <td>{t.planExpiryDate ? new Date(t.planExpiryDate).toLocaleDateString() : '-'}</td>
                <td>
                  <button
                    type="button"
                    style={{
                      border: '1px solid var(--primary-border)',
                      background: 'var(--primary-light)',
                      color: '#ad7420',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => handleOpenPermissionsModal(t)}
                    title="Click to configure school modules & permissions"
                  >
                    <ShieldCheck size={14} />
                    <span>{t.permissionCount ?? 0} allowed</span>
                  </button>
                </td>
                <td>
                  <span className={`badge ${t.isActive ? 'badge-success' : 'badge-error'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-action-btn table-action-btn--primary"
                      title="Manage School Modules & Permissions"
                      onClick={() => handleOpenPermissionsModal(t)}
                    >
                      <ShieldCheck size={16} />
                    </button>
                    <button
                      type="button"
                      className="table-action-btn table-action-btn--edit"
                      title="Edit Tenant"
                      onClick={() => handleEdit(t)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="table-action-btn table-action-btn--danger"
                      title="Delete Tenant"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!tenants || tenants.length === 0) && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  No tenants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Slide-over Sidebar Drawer for Tenant Form (> 3 fields) ── */}
      <Drawer
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Tenant' : 'Add New Tenant'}
        subtitle="Manage school instance, credentials, and subscription status"
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Tenant'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="drawer-form-grid">
            <div className="form-group">
              <label className="form-label">School Name *</label>
              <input
                type="text"
                className="form-control"
                {...register('name')}
                placeholder="e.g. Scholar Academy"
                style={errors.name ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.name && <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Slug / Subdomain *</label>
              <input
                type="text"
                className="form-control"
                {...register('slugCode')}
                placeholder="e.g. scholar"
                disabled={!!editingId}
                style={errors.slugCode ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.slugCode && <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.slugCode.message}</p>}
              {!!editingId && <p style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Slug code cannot be changed once created.</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email (Admin Login) *</label>
              <input
                type="email"
                className="form-control"
                {...register('contactEmail')}
                placeholder="admin@scholar.com"
                style={errors.contactEmail ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.contactEmail && <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.contactEmail.message}</p>}
            </div>

            {!editingId && (
              <div className="form-group">
                <label className="form-label">Admin Password *</label>
                <input
                  type="password"
                  className="form-control"
                  {...register('adminPassword')}
                  placeholder="Default password"
                  required={!editingId}
                  style={errors.adminPassword ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.adminPassword && <p style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.adminPassword.message}</p>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                {...register('phone')}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="form-group drawer-col-full">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                {...register('address')}
                placeholder="School address"
                rows={2}
                style={{ minHeight: '60px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Plan Expiry Date</label>
              <input
                type="date"
                className="form-control"
                {...register('planExpiryDate')}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', alignSelf: 'flex-end', paddingBottom: '8px' }}>
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Is Active Instance
              </label>
            </div>

            {/* ── Tenant-Specific SMTP Mail Server ── */}
            <div className="drawer-col-full" style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>📧</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>School SMTP Mail Server (Optional)</h4>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                    Configure dedicated SMTP credentials for this school so emails/notices are sent from their custom address. If empty, the system-wide global SMTP is used.
                  </p>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">SMTP Host / Server</label>
              <input
                type="text"
                className="form-control"
                {...register('smtpHost')}
                placeholder="e.g. smtp.gmail.com / mail.school.edu"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SMTP Port</label>
              <input
                type="number"
                className="form-control"
                {...register('smtpPort')}
                placeholder="587"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SMTP Username</label>
              <input
                type="text"
                className="form-control"
                {...register('smtpUsername')}
                placeholder="e.g. notifications@school.edu"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SMTP Password</label>
              <input
                type="password"
                className="form-control"
                {...register('smtpPassword')}
                placeholder="App password or secret"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sender Email Address</label>
              <input
                type="email"
                className="form-control"
                {...register('smtpSenderEmail')}
                placeholder="e.g. no-reply@school.edu"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sender Display Name</label>
              <input
                type="text"
                className="form-control"
                {...register('smtpSenderName')}
                placeholder="e.g. Springdale High School"
              />
            </div>

            <div className="form-group drawer-col-full" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
              <input
                type="checkbox"
                id="smtpEnableSsl"
                {...register('smtpEnableSsl')}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="smtpEnableSsl" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Enable SSL / TLS Encryption
              </label>
            </div>
          </div>
        </form>
      </Drawer>

      {/* ── Slide-over Sidebar Drawer for School Module-Wise Permissions ── */}
      <Drawer
        isOpen={Boolean(isPermModalOpen && selectedTenantForPerms)}
        onClose={handleClosePermissionsModal}
        wide
        title={`Modules & Access: ${selectedTenantForPerms?.name ?? ''}`}
        subtitle={`Configure school modules (Attendance, Sections, Exams, etc.) for ${selectedTenantForPerms?.slugCode || selectedTenantForPerms?.subdomain}`}
        icon={<ShieldCheck size={20} />}
        footer={
          <>
            <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: enabledModuleKeys.length > 0 ? 'var(--primary-light)' : 'var(--surface-muted)',
                  color: enabledModuleKeys.length > 0 ? '#ad7420' : 'var(--text-muted)',
                  border: `1px solid ${enabledModuleKeys.length > 0 ? 'var(--primary-border)' : 'var(--border)'}`
                }}
              >
                {enabledModuleKeys.length} of {availableModules.length} Modules Active
              </span>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClosePermissionsModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={savePermissionsMutation.isPending}
              onClick={handleSaveModules}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldCheck size={16} />
              <span>{savePermissionsMutation.isPending ? 'Saving...' : 'Save Permissions'}</span>
            </button>
          </>
        }
      >
        {/* Filter and Quick Actions Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '340px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search module (e.g. Attendance, Section...)"
              value={moduleSearch}
              onChange={(e) => setModuleSearch(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '12px', height: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleEnableAllModules}
            >
              <CheckCircle2 size={14} style={{ color: 'var(--brand-amber)' }} />
              <span>Enable All ({availableModules.length})</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '6px 12px', height: '36px' }}
              onClick={handleDisableAllModules}
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Modules List Categorized */}
        <div>
          {isLoadingTenantPerms ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading school permissions...
            </div>
          ) : Object.keys(modulesByCategory).length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matching modules found.
            </div>
          ) : (
            Object.entries(modulesByCategory).map(([category, modules]) => {
              const activeCountInCategory = modules.filter((m) => enabledModuleKeys.includes(m.key)).length

              return (
                <div key={category} style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      paddingBottom: '6px',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        {category}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ({activeCountInCategory} of {modules.length} active)
                      </span>
                    </div>
                  </div>

                  <div className="module-grid">
                    {modules.map((m) => {
                      const isEnabled = enabledModuleKeys.includes(m.key)
                      const IconComponent = m.icon

                      return (
                        <div
                          key={m.key}
                          className={`module-card ${isEnabled ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleModule(m.key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault()
                              handleToggleModule(m.key)
                            }
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isEnabled ? 'var(--primary-light)' : 'var(--surface-muted)',
                                    color: isEnabled ? 'var(--brand-amber)' : 'var(--text-muted)',
                                    border: isEnabled ? '1px solid var(--primary-border)' : '1px solid var(--border)',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                  }}
                                >
                                  <IconComponent size={18} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {m.name}
                                  </div>
                                  <div style={{ fontSize: '11px', color: isEnabled ? '#ad7420' : 'var(--text-muted)', fontWeight: 600 }}>
                                    {isEnabled ? 'True (Enabled)' : 'False (Disabled)'}
                                  </div>
                                </div>
                              </div>

                              {/* iOS-Style Toggle Switch */}
                              <div
                                className={`switch-pill ${isEnabled ? 'checked' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleModule(m.key)
                                }}
                              >
                                <div className="switch-thumb" />
                              </div>
                            </div>

                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                              {m.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Drawer>
    </div>
  )
}
