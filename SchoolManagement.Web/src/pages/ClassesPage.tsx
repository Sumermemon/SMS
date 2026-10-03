import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { classApi } from '@/lib/services'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ListToolbar, SortableHeader, sortRecords, type SortDirection } from '@/components/ListControls'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

interface ClassData {
  id: number
  name: string
  note?: string
}

export default function ClassesPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ClassData | null>(null)
  const [form, setForm] = useState<Record<string, string | number>>({})
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classApi.getAll().then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => classApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class added!'); setShowModal(false) },
    onError: () => toast.error('Failed to save class'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => classApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class updated!'); setShowModal(false) },
    onError: () => toast.error('Failed to update class'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => classApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class deleted') },
    onError: () => toast.error('Failed to delete class'),
  })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', note: '' })
    setShowModal(true)
  }

  function openEdit(c: ClassData) {
    setEditing(c)
    setForm({ name: c.name, note: c.note || '' })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name || !String(form.name).trim()) {
      toast.error('Class name is required')
      return
    }
    const payload = { ...form }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }
  const changeSort = (column: string) => {
    setSortDirection(current => sortColumn === column && current === 'asc' ? 'desc' : 'asc')
    setSortColumn(column)
  }
  const visibleClasses = sortRecords<ClassData>(((classes ?? []) as ClassData[]).filter(item => `${item.name} ${item.note ?? ''}`.toLowerCase().includes(search.toLowerCase())), sortColumn, sortDirection)

  return (
    <div>
      <ListToolbar search={search} onSearchChange={setSearch} placeholder="Search classes" onClear={search ? () => setSearch('') : undefined}>
        {hasPermission('classes.create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Class
          </button>
        )}
      </ListToolbar>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>Class List</div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : !classes?.length ? (
            <div className="empty-state">
              <p>No classes configured yet</p>
              <p className="empty-state-sub">Create your first class to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <SortableHeader label="Class name" column="name" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  <SortableHeader label="Note" column="note" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  {(hasPermission('classes.edit') || hasPermission('classes.delete')) && (
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleClasses.map((c: ClassData) => (
                  <tr key={c.id}>
                    <td><strong style={{ color: 'var(--text-1)', fontWeight: 500 }}>{c.name}</strong></td>
                    <td style={{ color: 'var(--text-2)' }}>{c.note || '—'}</td>
                    {(hasPermission('classes.edit') || hasPermission('classes.delete')) && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {hasPermission('classes.edit') && (
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)} title="Edit">
                              <Pencil size={13} />
                            </button>
                          )}
                          {hasPermission('classes.delete') && (
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete this class?')) deleteMut.mutate(c.id) }} title="Delete">
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

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Class' : 'Add Class'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body form-grid" style={{ marginTop: 0 }}>
              <div className="form-group">
                <label className="form-label">Class Name</label>
                <input
                  className="form-control"
                  value={String(form.name ?? '')}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Class 10"
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Note</label>
                <input
                  className="form-control"
                  value={String(form.note ?? '')}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Class' : 'Add Class'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
