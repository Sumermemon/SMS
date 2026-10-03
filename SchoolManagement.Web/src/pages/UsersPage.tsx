import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi, roleApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, Shield, UserCheck, Key, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Drawer from '@/components/Drawer'
import { useAuth } from '@/contexts/AuthContext'

interface UserItem {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: number | string
  photoUrl?: string
  isActive: boolean
  tenantId?: number
  isSuperAdmin: boolean
  createdAt: string
  roles: string[]
}

const SYSTEM_ROLES = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Teacher' },
  { value: 3, label: 'Student' },
  { value: 4, label: 'Parent' },
]

function getRoleName(val: number | string) {
  if (typeof val === 'string') return val
  switch (val) {
    case 0: return 'SuperAdmin'
    case 1: return 'Admin'
    case 2: return 'Teacher'
    case 3: return 'Student'
    case 4: return 'Parent'
    default: return 'User'
  }
}

function UserAvatar({ name }: { name: string }) {
  const tone = ['record-avatar--a', 'record-avatar--b', 'record-avatar--c'][(name?.charCodeAt(0) || 0) % 3]
  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`record-avatar ${tone}`} aria-label={name}>
      {initials || 'U'}
    </div>
  )
}

export default function UsersPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [showRoleDrawer, setShowRoleDrawer] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserItem | null>(null)
  const [assignedRoleName, setAssignedRoleName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 1,
    roleName: '',
    photoUrl: '',
    isActive: true,
  })

  // Queries
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then(r => r.data as UserItem[]),
  })

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getAll().then(r => r.data),
  })

  const roles = rolesData ?? []
  const users = usersData ?? []

  // Mutations
  const createMut = useMutation({
    mutationFn: (d: unknown) => userApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User account created!')
      setShowDrawer(false)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create user'
      toast.error(msg)
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => userApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated!')
      setShowDrawer(false)
    },
    onError: () => toast.error('Failed to update user'),
  })

  const deactivateMut = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('User status updated')
    },
    onError: () => toast.error('Failed to change user status'),
  })

  const assignRoleMut = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      userApi.assignRole(userId, roleName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Role assigned successfully!')
      setShowRoleDrawer(false)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to assign role'
      toast.error(msg)
    },
  })

  function openCreate() {
    setEditingUser(null)
    const defaultRoleName = roles[0]?.name || ''
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 1,
      roleName: defaultRoleName,
      photoUrl: '',
      isActive: true,
    })
    setShowPassword(false)
    setShowDrawer(true)
  }

  function openEdit(u: UserItem) {
    setEditingUser(u)
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      role: typeof u.role === 'number' ? u.role : 1,
      roleName: u.roles?.[0] || '',
      photoUrl: u.photoUrl || '',
      isActive: u.isActive,
    })
    setShowDrawer(true)
  }

  function openRoleAssignment(u: UserItem) {
    setSelectedUserForRole(u)
    setAssignedRoleName(u.roles?.[0] || '')
    setShowRoleDrawer(true)
  }

  function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First and last name are required')
      return
    }
    if (!form.email.trim()) {
      toast.error('Valid email is required')
      return
    }

    if (editingUser) {
      updateMut.mutate({
        id: editingUser.id,
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          photoUrl: form.photoUrl.trim() || null,
          isActive: form.isActive,
        },
      })
    } else {
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      if (!form.roleName) {
        toast.error('Please select an assigned role')
        return
      }

      createMut.mutate({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: Number(form.role),
        roleName: form.roleName,
        photoUrl: form.photoUrl.trim() || null,
      })
    }
  }

  // Filtered list
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const roleStr = getRoleName(u.role)
    const matchRole = !roleFilter || roleStr.toLowerCase() === roleFilter.toLowerCase()
    return matchSearch && matchRole
  })

  // Format clean role name (strip T{tenantId}_)
  const formatRoleBadge = (rName: string) => {
    return rName.includes('_') ? rName.split('_')[1] : rName
  }

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            id="user-search"
            className="form-control"
            placeholder="Search users by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 170 }}
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {SYSTEM_ROLES.map(r => (
            <option key={r.value} value={r.label}>
              {r.label}
            </option>
          ))}
        </select>

        {hasPermission('users.create') && (
          <button className="btn btn-primary" onClick={openCreate} id="add-user-btn">
            <Plus size={15} /> Add User
          </button>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserCheck size={16} style={{ color: 'var(--primary)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>
                User Accounts
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                {filteredUsers.length} total staff & users
              </div>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={32} style={{ color: 'var(--text-4)' }} />
              <p>No user accounts found</p>
              <p className="empty-state-sub">Add staff or teachers to grant system access</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>System Role</th>
                  <th>Assigned Permissions Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  {(hasPermission('users.edit') || hasPermission('users.delete')) && (
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const roleNameStr = getRoleName(u.role)
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <UserAvatar name={u.fullName} />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>
                              {u.fullName}
                            </p>
                            <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{roleNameStr}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {u.roles?.map(r => (
                            <span key={r} className="badge badge-primary">
                              <Shield size={10} style={{ marginRight: 3 }} />
                              {formatRoleBadge(r)}
                            </span>
                          ))}
                          {(!u.roles || u.roles.length === 0) && (
                            <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontStyle: 'italic' }}>
                              No role assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge badge-success">
                            <span className="badge-dot" /> Active
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <span className="badge-dot" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-3)', fontSize: 12 }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      {(hasPermission('users.edit') || hasPermission('users.delete')) && (
                        <td>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            {hasPermission('users.edit') && (
                              <>
                                <button
                                  className="btn btn-ghost btn-icon btn-sm"
                                  onClick={() => openEdit(u)}
                                  title="Edit User Profile"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  className="btn btn-ghost btn-icon btn-sm"
                                  style={{ color: 'var(--primary)' }}
                                  onClick={() => openRoleAssignment(u)}
                                  title="Assign Permissions Role"
                                >
                                  <Key size={13} />
                                </button>
                              </>
                            )}
                            {hasPermission('users.delete') && (
                              <button
                                className="btn btn-danger btn-icon btn-sm"
                                onClick={() => {
                                  if (confirm(`Deactivate user "${u.fullName}"?`)) {
                                    deactivateMut.mutate(u.id)
                                  }
                                }}
                                title="Deactivate User"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Slide-over Sidebar Drawer for User Creation / Editing (> 3 fields) ── */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={editingUser ? 'Edit User Profile' : 'Add New User'}
        subtitle={
          editingUser
            ? `Update account details for ${editingUser.fullName}`
            : 'Fill in user profile, credentials, and role permissions'
        }
        icon={<UserCheck size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowDrawer(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending
                ? 'Saving…'
                : editingUser
                ? 'Save Changes'
                : 'Create User'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          {/* First Name & Last Name (Side by side) */}
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Sarah"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Jenkins"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            />
          </div>

          {/* Email Address */}
          <div className="form-group drawer-col-full">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@school.com"
              value={form.email}
              disabled={!!editingUser}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {editingUser && (
              <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'block' }}>
                Email address cannot be modified after account creation.
              </span>
            )}
          </div>

          {/* Password (only on create) */}
          {!editingUser && (
            <div className="form-group drawer-col-full">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: 38 }}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* System Role Selection */}
          {!editingUser && (
            <div className="form-group">
              <label className="form-label">System Role *</label>
              <select
                className="form-control"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: Number(e.target.value) }))}
              >
                {SYSTEM_ROLES.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Assigned Dynamic AppRole */}
          {!editingUser && (
            <div className="form-group">
              <label className="form-label">Assign Permissions Role *</label>
              <select
                className="form-control"
                value={form.roleName}
                onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))}
              >
                <option value="">Select a Role…</option>
                {roles.map((r: any) => (
                  <option key={r.id} value={r.name}>
                    {r.displayName || formatRoleBadge(r.name)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Photo / Avatar URL */}
          <div className="form-group drawer-col-full">
            <label className="form-label">Profile Photo URL (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={form.photoUrl}
              onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))}
            />
          </div>

          {/* Active Status (when editing) */}
          {editingUser && (
            <div
              className="form-group drawer-col-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--border)',
              }}
            >
              <input
                type="checkbox"
                id="user-active-status"
                style={{ width: 16, height: 16, cursor: 'pointer' }}
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              <label
                htmlFor="user-active-status"
                style={{ margin: 0, fontWeight: 500, fontSize: 13, cursor: 'pointer' }}
              >
                Account Active (User can log in)
              </label>
            </div>
          )}
        </div>
      </Drawer>

      {/* ── Slide-over Sidebar Drawer for Assigning Role ── */}
      <Drawer
        isOpen={showRoleDrawer}
        onClose={() => setShowRoleDrawer(false)}
        title="Assign Permissions Role"
        subtitle={`Select the primary role for ${selectedUserForRole?.fullName}`}
        icon={<Shield size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowRoleDrawer(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={assignRoleMut.isPending}
              onClick={() => {
                if (!assignedRoleName) {
                  toast.error('Please select a role to assign')
                  return
                }
                if (selectedUserForRole) {
                  assignRoleMut.mutate({
                    userId: selectedUserForRole.id,
                    roleName: assignedRoleName,
                  })
                }
              }}
            >
              {assignRoleMut.isPending ? 'Assigning…' : 'Save Role Assignment'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
            Choose which permission bundle this user should inherit across all modules:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {roles.map((r: any) => {
              const isSelected = assignedRoleName === r.name
              return (
                <div
                  key={r.id}
                  onClick={() => setAssignedRoleName(r.name)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--r-lg)',
                    border: isSelected
                      ? '2px solid var(--primary)'
                      : '1px solid var(--border)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--t-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="radio"
                      name="role-select"
                      checked={isSelected}
                      onChange={() => setAssignedRoleName(r.name)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)' }}>
                        {r.displayName || formatRoleBadge(r.name)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                        {r.description || `${r.permissions?.length || 0} permissions configured`}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>
                    {r.permissions?.length || 0} perms
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Drawer>
    </div>
  )
}
