import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { classApi } from '@/lib/services'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClassData {
  id: number
  name: string
  note?: string
}

export default function ClassesPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ClassData | null>(null)
  const [form, setForm] = useState<Record<string, string | number>>({})

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
    const payload = { ...form }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  return (
    <div>
      <div className="filter-bar">
        <h2 style={{ margin: 0 }}>Classes</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Class
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
                  <th>Class Name</th>
                  <th>Note</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes?.map((c: ClassData) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.note}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon text-primary" onClick={() => openEdit(c)}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon text-danger" onClick={() => { if (confirm('Delete this class?')) deleteMut.mutate(c.id) }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!classes?.length && <tr><td colSpan={3} className="empty-state">No classes found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Class' : 'Add New Class'}</h2>
            </div>
            <div className="modal-body form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Class Name</label>
                <input className="form-control" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <textarea className="form-control" value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} />
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
