import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parentApi } from '@/lib/services'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { ListToolbar, SortableHeader, sortRecords, type SortDirection } from '@/components/ListControls'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

interface ParentData {
  id: number
  name: string
  email: string
  phone: string
  address?: string
  occupation?: string
  photoUrl?: string
  children?: string[]
}

export default function ParentsPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ParentData | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const { data, isLoading } = useQuery({
    queryKey: ['parents', page],
    queryFn: () => parentApi.getAll({ page, pageSize: 15 }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => parentApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Parent added!'); setShowModal(false) },
    onError: () => toast.error('Failed to save parent'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => parentApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Parent updated!'); setShowModal(false) },
    onError: () => toast.error('Failed to update parent'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => parentApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Parent deleted') },
    onError: () => toast.error('Failed to delete parent'),
  })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', address: '', occupation: '', photoUrl: '' })
    setShowModal(true)
  }

  function openEdit(p: ParentData) {
    setEditing(p)
    setForm({ name: p.name, email: p.email, phone: p.phone, address: p.address || '', occupation: p.occupation || '', photoUrl: p.photoUrl || '' })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name?.trim()) {
      toast.error('Parent full name is required')
      return
    }
    if (!form.phone?.trim()) {
      toast.error('Phone number is required')
      return
    }

    const payload = { ...form }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const parents: ParentData[] = data?.data ?? []
  const changeSort = (column: string) => { setSortDirection(current => sortColumn === column && current === 'asc' ? 'desc' : 'asc'); setSortColumn(column) }
  const visibleParents = sortRecords(parents.filter(parent => `${parent.name} ${parent.email} ${parent.phone} ${parent.occupation ?? ''} ${parent.address ?? ''}`.toLowerCase().includes(search.toLowerCase())), sortColumn, sortDirection)
  
  return (
    <div>
      <ListToolbar search={search} onSearchChange={setSearch} placeholder="Search parents or guardians" onClear={search ? () => setSearch('') : undefined}>
        {hasPermission('parents.create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Parent
          </button>
        )}
      </ListToolbar>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>Parent Records</div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : !parents.length ? (
            <div className="empty-state">
              <p>No parent records found</p>
              <p className="empty-state-sub">Add a parent or guardian record</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <SortableHeader label="Parent name" column="name" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  <SortableHeader label="Contact" column="email" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  <SortableHeader label="Occupation" column="occupation" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  <SortableHeader label="Address" column="address" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  {(hasPermission('parents.edit') || hasPermission('parents.delete')) && (
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleParents.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, background: 'var(--yellow)', fontSize: 12 }}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-1)', fontWeight: 500 }}>{p.name}</strong>
                          {p.children && p.children.length > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                              Children: {p.children.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-1)' }}>{p.phone || '—'}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{p.email || '—'}</div>
                    </td>
                    <td style={{ color: 'var(--text-2)' }}>{p.occupation || '—'}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{p.address || '—'}</td>
                    {(hasPermission('parents.edit') || hasPermission('parents.delete')) && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {hasPermission('parents.edit') && (
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)} title="Edit">
                              <Pencil size={13} />
                            </button>
                          )}
                          {hasPermission('parents.delete') && (
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete this parent?')) deleteMut.mutate(p.id) }} title="Delete">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Slide-over Sidebar Drawer for Parents (> 3 fields) ── */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Parent Record' : 'Add New Parent'}
        subtitle={editing ? `Update ${editing.name || ''} information` : 'Enter parent/guardian contact details'}
        icon={<Users size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Record' : 'Add Parent'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          <div className="form-group drawer-col-full">
            <label className="form-label">Full Name *</label>
            <input className="form-control" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Parent full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +92 300 1234567" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="parent@email.com" />
          </div>
          <div className="form-group drawer-col-full">
            <label className="form-label">Occupation</label>
            <input className="form-control" value={form.occupation || ''} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="e.g. Engineer, Doctor, Business" />
          </div>
          <div className="form-group drawer-col-full">
            <label className="form-label">Address</label>
            <input className="form-control" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Residential address" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
