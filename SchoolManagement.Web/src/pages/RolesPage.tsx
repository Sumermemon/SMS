import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleApi, permissionApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, Shield, CheckSquare, Square, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import Drawer from '@/components/Drawer'
import { useAuth } from '@/contexts/AuthContext'

interface RoleItem {
  id: string
  name: string
  displayName?: string
  description?: string
  tenantId: number
  permissions: Array<{ name: string; displayName?: string; module?: string } | string>
}

interface PermissionItem {
  id: number
  name: string
  displayName: string
  module: string
  description?: string
}

export default function RolesPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null)

  // Drawer form state
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [permSearch, setPermSearch] = useState('')

  // Queries
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getAll().then(r => r.data as RoleItem[]),
  })

  const { data: allPermsData, isLoading: permsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionApi.getAll().then(r => r.data as PermissionItem[]),
  })

  const roles = rolesData ?? []
  const allPermissions = allPermsData ?? []

  // Mutations
  const createMut = useMutation({
    mutationFn: (d: unknown) => roleApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role created successfully!')
      setShowDrawer(false)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create role'
      toast.error(msg)
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => roleApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role updated!')
      setShowDrawer(false)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update role'
      toast.error(msg)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role deleted')
    },
    onError: () => toast.error('Failed to delete role'),
  })

  function openCreate() {
    setEditingRole(null)
    setRoleName('')
    setRoleDescription('')
    setSelectedPerms([])
    setPermSearch('')
    setShowDrawer(true)
  }

  function openEdit(r: RoleItem) {
    setEditingRole(r)
    // Extract string names of permissions
    const permsList = r.permissions.map(p => (typeof p === 'string' ? p : p.name))
    setRoleName(r.displayName || (r.name.includes('_') ? r.name.split('_')[1] : r.name))
    setRoleDescription(r.description || '')
    setSelectedPerms(permsList)
    setPermSearch('')
    setShowDrawer(true)
  }

  function handleSave() {
    if (!roleName.trim()) {
      toast.error('Role name is required')
      return
    }
    if (selectedPerms.length === 0) {
      toast.error('Please assign at least one permission')
      return
    }

    if (editingRole) {
      updateMut.mutate({
        id: editingRole.id,
        data: {
          description: roleDescription.trim() || null,
          permissions: selectedPerms,
        },
      })
    } else {
      createMut.mutate({
        name: roleName.trim(),
        description: roleDescription.trim() || null,
        permissions: selectedPerms,
      })
    }
  }

  function togglePermission(permName: string) {
    setSelectedPerms(prev =>
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    )
  }

  function toggleModule(modulePerms: PermissionItem[]) {
    const modulePermNames = modulePerms.map(p => p.name)
    const allSelected = modulePermNames.every(name => selectedPerms.includes(name))

    if (allSelected) {
      // Remove all from module
      setSelectedPerms(prev => prev.filter(p => !modulePermNames.includes(p)))
    } else {
      // Add all from module
      setSelectedPerms(prev => Array.from(new Set([...prev, ...modulePermNames])))
    }
  }

  function selectAll() {
    setSelectedPerms(allPermissions.map(p => p.name))
  }

  function clearAll() {
    setSelectedPerms([])
  }

  // Group all permissions by module
  const permissionsByModule = useMemo(() => {
    const map: Record<string, PermissionItem[]> = {}
    for (const p of allPermissions) {
      const mod = p.module || 'General'
      if (!map[mod]) map[mod] = []
      map[mod].push(p)
    }
    return map
  }, [allPermissions])

  // Filtered modules by permSearch inside drawer
  const filteredModules = useMemo(() => {
    if (!permSearch.trim()) return permissionsByModule
    const query = permSearch.toLowerCase()
    const result: Record<string, PermissionItem[]> = {}

    for (const [mod, list] of Object.entries(permissionsByModule)) {
      const matches = list.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.displayName.toLowerCase().includes(query) ||
          mod.toLowerCase().includes(query)
      )
      if (matches.length > 0) {
        result[mod] = matches
      }
    }
    return result
  }, [permissionsByModule, permSearch])

  // Filtered roles list
  const filteredRoles = roles.filter(r => {
    const name = (r.displayName || r.name).toLowerCase()
    const desc = (r.description || '').toLowerCase()
    return name.includes(search.toLowerCase()) || desc.includes(search.toLowerCase())
  })

  const formatRoleTitle = (r: RoleItem) => {
    if (r.displayName) return r.displayName
    return r.name.includes('_') ? r.name.split('_')[1] : r.name
  }

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            id="role-search"
            className="form-control"
            placeholder="Search roles by name or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {hasPermission('roles.create') && (
          <button className="btn btn-primary" onClick={openCreate} id="add-role-btn">
            <Plus size={15} /> Add Role
          </button>
        )}
      </div>

      {/* ── Roles Grid Cards ── */}
      {rolesLoading ? (
        <div className="loader">
          <div className="spinner" />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="card empty-state">
          <Shield size={36} style={{ color: 'var(--text-4)' }} />
          <p>No roles found</p>
          <p className="empty-state-sub">Create your first custom role to manage granular access</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {filteredRoles.map(r => {
            const permsCount = r.permissions?.length || 0
            const isSystemAdminRole = r.name.endsWith('_Admin')

            return (
              <div
                key={r.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 20,
                  transition: 'transform 140ms ease, box-shadow 140ms ease',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 'var(--r-md)',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid var(--primary-border)',
                        }}
                      >
                        <Shield size={17} />
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 14.5,
                            fontWeight: 700,
                            color: 'var(--text-1)',
                          }}
                        >
                          {formatRoleTitle(r)}
                        </h3>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.name}</span>
                      </div>
                    </div>

                    <span className="badge badge-info" style={{ fontSize: 11 }}>
                      {permsCount} allowed
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-2)',
                      margin: '12px 0',
                      minHeight: 36,
                      lineHeight: 1.45,
                    }}
                  >
                    {r.description || 'Custom role with defined permissions and module access.'}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Key size={13} style={{ color: 'var(--text-3)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {permsCount} permissions
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    {hasPermission('roles.edit') && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ gap: 5 }}
                        onClick={() => openEdit(r)}
                      >
                        <Pencil size={12} /> Edit Permissions
                      </button>
                    )}
                    {hasPermission('roles.delete') && !isSystemAdminRole && (
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => {
                          if (confirm(`Delete role "${formatRoleTitle(r)}"?`)) {
                            deleteMut.mutate(r.id)
                          }
                        }}
                        title="Delete Role"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Slide-over Sidebar Drawer for Add / Edit Role (> 3 fields / complex grid) ── */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        wide
        title={editingRole ? `Edit Role: ${formatRoleTitle(editingRole)}` : 'Create New Role'}
        subtitle="Define role identity and toggle granular module permissions"
        icon={<Shield size={20} />}
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
                : editingRole
                ? 'Update Role'
                : 'Create Role'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Identity Fields in 2-column auto-adjusting grid */}
          <div className="drawer-form-grid">
            <div className="form-group">
              <label className="form-label">Role Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. VicePrincipal or Accountant"
                value={roleName}
                disabled={!!editingRole}
                onChange={e => setRoleName(e.target.value)}
              />
              {editingRole && (
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'block' }}>
                  Role identifier cannot be renamed.
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief summary of duties and responsibilities"
                value={roleDescription}
                onChange={e => setRoleDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Permissions Matrix Header */}
          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>
                  Assigned Permissions ({selectedPerms.length} / {allPermissions.length} Enabled)
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-3)' }}>
                  Users assigned this role will inherit all active permissions below.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={selectAll}
                  style={{ fontSize: 12 }}
                >
                  <CheckSquare size={13} /> Select All
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={clearAll}
                  style={{ fontSize: 12 }}
                >
                  <Square size={13} /> Clear All
                </button>
              </div>
            </div>

            {/* In-drawer filter search */}
            <div className="search-input" style={{ marginBottom: 16 }}>
              <Search className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Filter permissions by keyword (e.g. create, edit, fees, students)…"
                value={permSearch}
                onChange={e => setPermSearch(e.target.value)}
              />
            </div>

            {/* Grouped Modules */}
            {permsLoading ? (
              <div className="loader">
                <div className="spinner" />
              </div>
            ) : Object.keys(filteredModules).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>
                No permissions matched your filter "{permSearch}".
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(filteredModules).map(([moduleName, modulePerms]) => {
                  const modSelectedCount = modulePerms.filter(p =>
                    selectedPerms.includes(p.name)
                  ).length
                  const allModSelected =
                    modulePerms.length > 0 && modSelectedCount === modulePerms.length

                  return (
                    <div
                      key={moduleName}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-lg)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Module Header */}
                      <div
                        style={{
                          padding: '10px 16px',
                          background: 'var(--bg-subtle)',
                          borderBottom: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>
                            {moduleName}
                          </span>
                          <span
                            className="badge badge-muted"
                            style={{ fontSize: 11, padding: '1px 7px' }}
                          >
                            {modSelectedCount} of {modulePerms.length} enabled
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11.5, padding: '3px 8px', height: 'auto' }}
                          onClick={() => toggleModule(modulePerms)}
                        >
                          {allModSelected ? 'Deselect Module' : 'Select Module'}
                        </button>
                      </div>

                      {/* Permissions Grid inside module */}
                      <div
                        style={{
                          padding: '12px 14px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                          gap: 8,
                        }}
                      >
                        {modulePerms.map(p => {
                          const isChecked = selectedPerms.includes(p.name)
                          return (
                            <label
                              key={p.name}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 9,
                                padding: '8px 10px',
                                borderRadius: 'var(--r-md)',
                                border: isChecked
                                  ? '1px solid var(--primary-border)'
                                  : '1px solid var(--border)',
                                background: isChecked ? 'var(--primary-light)' : 'var(--surface)',
                                cursor: 'pointer',
                                transition: 'all var(--t-fast)',
                                userSelect: 'none',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.name)}
                                style={{ marginTop: 2, cursor: 'pointer' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 12,
                                    color: isChecked ? 'var(--primary-active)' : 'var(--text-1)',
                                    lineHeight: 1.25,
                                  }}
                                >
                                  {p.displayName || p.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 10.5,
                                    color: 'var(--text-3)',
                                    fontFamily: 'monospace',
                                    marginTop: 2,
                                  }}
                                >
                                  {p.name}
                                </div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  )
}
