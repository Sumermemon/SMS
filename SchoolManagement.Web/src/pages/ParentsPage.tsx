import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parentApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ParentData | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

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
    const payload = { ...form }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const parents: ParentData[] = data?.data ?? []
  
  return (
    <div>
      <div className="filter-bar">
        <h2 style={{ margin: 0 }}>Parents</h2>
        <div style={{ flex: 1 }}></div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Parent
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading ? (
            <div className="empty-state">Loading...</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Parent Name</th>
                  <th>Contact Info</th>
                  <th>Occupation</th>
                  <th>Address</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f59e0b, #d97706)', fontSize: 13 }}>{p.name.charAt(0)}</div>
                        <div>
                          <strong>{p.name}</strong>
                          {p.children && p.children.length > 0 && <div style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>Children: {p.children.join(', ')}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{p.phone}</div>
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{p.email}</div>
                    </td>
                    <td>{p.occupation || '-'}</td>
                    <td>{p.address || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon text-primary" onClick={() => openEdit(p)}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon text-danger" onClick={() => { if (confirm('Delete this parent?')) deleteMut.mutate(p.id) }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!parents.length && <tr><td colSpan={5} className="empty-state">No parents found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Parent' : 'Add New Parent'}</h2>
            </div>
            <div className="modal-body form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Full Name</label>
                <input className="form-control" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Occupation</label>
                <input className="form-control" value={form.occupation || ''} onChange={e => setForm({ ...form, occupation: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <textarea className="form-control" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
