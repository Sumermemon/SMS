import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectApi, classApi } from '@/lib/services'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SubjectData {
  id: number
  name: string
  subjectType: string
  classId: number
  className: string
}

export default function SubjectsPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SubjectData | null>(null)
  const [form, setForm] = useState<Record<string, string | number>>({})
  const [filterClassId, setFilterClassId] = useState<string>('')

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', filterClassId],
    queryFn: () => subjectApi.getAll(filterClassId ? Number(filterClassId) : undefined).then(r => r.data),
  })

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })

  const createMut = useMutation({
    mutationFn: (d: unknown) => subjectApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject added!'); setShowModal(false) },
    onError: () => toast.error('Failed to save subject'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => subjectApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject updated!'); setShowModal(false) },
    onError: () => toast.error('Failed to update subject'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => subjectApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject deleted') },
    onError: () => toast.error('Failed to delete subject'),
  })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', subjectType: 'Theory', classId: '' })
    setShowModal(true)
  }

  function openEdit(s: SubjectData) {
    setEditing(s)
    setForm({ name: s.name, subjectType: s.subjectType, classId: s.classId })
    setShowModal(true)
  }

  function handleSave() {
    const cid = Number(form.classId)
    if (!cid) {
      toast.error('Please select a class')
      return
    }
    const payload = { ...form, classId: cid }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  return (
    <div>
      <div className="filter-bar">
        <h2 style={{ margin: 0 }}>Subjects</h2>
        <select className="form-control" style={{ width: 160 }} value={filterClassId} onChange={e => setFilterClassId(e.target.value)}>
          <option value="">All Classes</option>
          {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Subject
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
                  <th>Subject Name</th>
                  <th>Type</th>
                  <th>Class</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects?.map((s: SubjectData) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.subjectType}</td>
                    <td>{s.className}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon text-primary" onClick={() => openEdit(s)}>
                          <Pencil size={15} />
                        </button>
                        <button className="btn-icon text-danger" onClick={() => { if (confirm('Delete this subject?')) deleteMut.mutate(s.id) }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!subjects?.length && <tr><td colSpan={4} className="empty-state">No subjects found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Subject' : 'Add New Subject'}</h2>
            </div>
            <div className="modal-body form-grid">
              <div className="form-group">
                <label>Subject Name</label>
                <input className="form-control" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Subject Type</label>
                <select className="form-control" value={form.subjectType || 'Theory'} onChange={e => setForm({ ...form, subjectType: e.target.value })}>
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Class</label>
                <select className="form-control" value={form.classId || ''} onChange={e => setForm({ ...form, classId: e.target.value })}>
                  <option value="">Select Class...</option>
                  {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
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
