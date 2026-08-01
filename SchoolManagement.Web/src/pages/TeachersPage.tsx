import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherApi, subjectApi, classApi, sectionApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeachersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Personal')
  const [form, setForm] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', search, subjectId, page],
    queryFn: () => teacherApi.getAll({ search: search || undefined, subjectId: subjectId || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll().then(r => r.data) })
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })
  const { data: sections } = useQuery({ queryKey: ['sections', form.classId], queryFn: () => sectionApi.getAll(form.classId ? Number(form.classId) : undefined).then(r => r.data), enabled: true })

  const createMut = useMutation({
    mutationFn: (d: unknown) => teacherApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Teacher added!'); setShowModal(false) },
    onError: () => toast.error('Failed to save'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => teacherApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Teacher updated!'); setShowModal(false) },
    onError: () => toast.error('Failed to update'),
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => teacherApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Deleted') },
  })

  function openCreate() {
    setEditing(null)
    setActiveTab('Personal')
    setForm({ firstName: '', lastName: '', email: '', phone: '', address: '', gender: 'Male', dateOfBirth: '', religion: 'Islam', joiningDate: '', subjectId: '', classId: '', sectionId: '', photoUrl: '' })
    setShowModal(true)
  }

  async function openEdit(t: any) {
    try {
      const res = await teacherApi.getById(t.id)
      const d = res.data
      setEditing(d)
      setActiveTab('Personal')
      setForm({ 
        firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone || '', 
        address: d.address || '', gender: d.gender, dateOfBirth: d.dateOfBirth || '', 
        religion: d.religion || '', joiningDate: d.joiningDate || '', subjectId: d.subjectId || '', 
        classId: d.classId || '', sectionId: d.sectionId || '', photoUrl: d.photoUrl || '' 
      })
      setShowModal(true)
    } catch (e) {
      toast.error('Failed to load teacher details')
    }
  }

  function handleSave() {
    const payload = { ...form, subjectId: Number(form.subjectId) || null, classId: Number(form.classId) || null, sectionId: Number(form.sectionId) || null }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const teachers = data?.data ?? []
  const total = data?.total ?? 0
  const pageSize = 15
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input id="teacher-search" className="form-control" placeholder="Search teachers…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="form-control" style={{ width: 180 }} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Teacher</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading ? <div className="loader"><div className="spinner" /></div>
            : teachers.length === 0 ? <div className="empty-state"><div style={{ fontSize: 40 }}>👨‍🏫</div><p>No teachers found</p></div>
            : (
              <table>
                <thead><tr><th>TEACHER</th><th>SUBJECT</th><th>CLASS</th><th>GENDER</th><th>PHONE</th><th>JOINING DATE</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {teachers.map((t: any) => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: 13 }}>{t.name.charAt(0)}</div>
                          <div>
                            <p style={{ fontWeight: 600 }}>{t.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{t.subjectName || '—'}</span></td>
                      <td>{t.className || '—'}</td>
                      <td><span className={`badge ${t.gender === 'Male' ? 'badge-info' : 'badge-success'}`}>{t.gender}</span></td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{t.phone || '—'}</td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{t.joiningDate || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)}><Pencil size={13} /></button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(t.id) }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <span>{total} total teachers</span>
            <div className="pagination-controls">
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              <span style={{ padding: '0 8px', color: 'var(--clr-text-muted)', fontSize: 12 }}>{page} / {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="tabs">
              {['Personal', 'Academic', 'Contact'].map(t => (
                <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
              ))}
            </div>
            
            <div className="modal-body form-grid" style={{ marginTop: 0 }}>
              {activeTab === 'Personal' && (
                <>
                  {[['firstName','First Name'],['lastName','Last Name'],['religion','Religion'],['photoUrl','Photo URL']].map(([k,l]) => (
                    <div key={k} className="form-group">
                      <label className="form-label">{l}</label>
                      <input className="form-control" value={form[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={form.dateOfBirth ?? ''} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'Academic' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input type="date" className="form-control" value={form.joiningDate ?? ''} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-control" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
                      <option value="">Select Subject</option>
                      {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select className="form-control" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value, sectionId: '' }))}>
                      <option value="">Select Class</option>
                      {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <select className="form-control" value={form.sectionId ?? ''} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}>
                      <option value="">Select Section</option>
                      {sections?.filter((s: any) => s.classId === Number(form.classId)).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'Contact' && (
                <>
                  {[['email','Email'],['phone','Phone'],['address','Address']].map(([k,l]) => (
                    <div key={k} className="form-group">
                      <label className="form-label">{l}</label>
                      <input className="form-control" value={form[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update' : 'Add Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
