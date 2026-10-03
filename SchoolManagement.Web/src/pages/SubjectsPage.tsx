import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectApi, classApi } from '@/lib/services'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ListToolbar, SortableHeader, sortRecords, type SortDirection } from '@/components/ListControls'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

interface SubjectData {
  id: number
  name: string
  subjectType: string
  classId: number
  className: string
}

export default function SubjectsPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SubjectData | null>(null)
  const [form, setForm] = useState<Record<string, string | number>>({})
  const [filterClassId, setFilterClassId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', filterClassId],
    queryFn: () => subjectApi.getAll(filterClassId ? Number(filterClassId) : undefined).then(r => r.data),
  })

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })

  const [showQuickClass, setShowQuickClass] = useState(false)
  const [quickClassName, setQuickClassName] = useState('')

  const quickCreateClassMut = useMutation({
    mutationFn: (name: string) => classApi.create({ name }),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      const newClassId = res?.data?.id
      if (newClassId) {
        setForm(prev => ({ ...prev, classId: newClassId }))
      }
      toast.success('Class created!')
      setShowQuickClass(false)
      setQuickClassName('')
    },
    onError: () => toast.error('Failed to create class')
  })

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
    if (!form.name || !String(form.name).trim()) {
      toast.error('Subject name is required')
      return
    }
    const cid = Number(form.classId)
    if (!cid) {
      toast.error('Please select a class')
      return
    }
    const payload = { ...form, classId: cid }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }
  const changeSort = (column: string) => { setSortDirection(current => sortColumn === column && current === 'asc' ? 'desc' : 'asc'); setSortColumn(column) }
  const visibleSubjects = sortRecords<SubjectData>(((subjects ?? []) as SubjectData[]).filter(item => `${item.name} ${item.subjectType} ${item.className}`.toLowerCase().includes(search.toLowerCase())), sortColumn, sortDirection)

  return (
    <div>
      <ListToolbar search={search} onSearchChange={setSearch} placeholder="Search subjects" onClear={search || filterClassId ? () => { setSearch(''); setFilterClassId('') } : undefined} filters={<select className="form-control" value={filterClassId} onChange={e => setFilterClassId(e.target.value)} aria-label="Filter by class">
          <option value="">All Classes</option>
          {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>}>
        {hasPermission('subjects.create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Subject
          </button>
        )}
      </ListToolbar>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>Subject Curriculum</div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : !subjects?.length ? (
            <div className="empty-state">
              <p>No subjects found</p>
              <p className="empty-state-sub">Add a subject to your curriculum</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <SortableHeader label="Subject name" column="name" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  <SortableHeader label="Type" column="subjectType" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  <SortableHeader label="Class" column="className" activeColumn={sortColumn} direction={sortDirection} onSort={changeSort} />
                  {(hasPermission('subjects.edit') || hasPermission('subjects.delete')) && (
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleSubjects.map((s: SubjectData) => (
                  <tr key={s.id}>
                    <td><strong style={{ color: 'var(--text-1)', fontWeight: 500 }}>{s.name}</strong></td>
                    <td><span className="badge badge-info">{s.subjectType}</span></td>
                    <td style={{ color: 'var(--text-2)' }}>{s.className || '—'}</td>
                    {(hasPermission('subjects.edit') || hasPermission('subjects.delete')) && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {hasPermission('subjects.edit') && (
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)} title="Edit">
                              <Pencil size={13} />
                            </button>
                          )}
                          {hasPermission('subjects.delete') && (
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete this subject?')) deleteMut.mutate(s.id) }} title="Delete">
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
              <div>
                <div className="modal-title">
                  {editing ? 'Edit Subject' : 'Add New Subject'}
                </div>
                <div className="modal-subtitle">
                  {editing ? 'Update subject details or course type' : 'Configure curriculum subject for a class'}
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input className="form-control" placeholder="e.g. Physics, Mathematics" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Type</label>
                  <select className="form-control" value={form.subjectType || 'Theory'} onChange={e => setForm({ ...form, subjectType: e.target.value })}>
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0 }}>Class</label>
                    <button 
                      type="button" 
                      className="btn btn-ghost btn-sm" 
                      style={{ padding: '2px 8px', fontSize: 11, color: 'var(--primary)', height: 'auto' }}
                      onClick={() => setShowQuickClass(v => !v)}
                    >
                      {showQuickClass ? 'Cancel' : '+ New Class'}
                    </button>
                  </div>
                  {showQuickClass && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, padding: 8, background: 'var(--primary-light)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <input 
                        className="form-control" 
                        style={{ background: '#fff', fontSize: 12, padding: '4px 8px', height: 32 }}
                        placeholder="e.g. Class 10" 
                        value={quickClassName} 
                        onChange={e => setQuickClassName(e.target.value)} 
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (quickClassName.trim()) quickCreateClassMut.mutate(quickClassName.trim())
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm" 
                        style={{ height: 32, whiteSpace: 'nowrap', fontSize: 12 }}
                        disabled={!quickClassName.trim() || quickCreateClassMut.isPending}
                        onClick={() => quickCreateClassMut.mutate(quickClassName.trim())}
                      >
                        {quickCreateClassMut.isPending ? 'Saving...' : 'Save Class'}
                      </button>
                    </div>
                  )}
                  <select className="form-control" value={form.classId || ''} onChange={e => setForm({ ...form, classId: e.target.value })}>
                    <option value="">Select Class</option>
                    {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
