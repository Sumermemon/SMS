import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi, classApi, sectionApi, parentApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, Eye, ArrowUpRight } from 'lucide-react'
import toast from 'react-hot-toast'

const GENDERS = ['Male', 'Female', 'Other']
const BLOOD_GROUPS = ['APositive', 'ANegative', 'BPositive', 'BNegative', 'OPositive', 'ONegative', 'ABPositive', 'ABNegative']

interface Student {
  id: number; roll: number; photoUrl: string; name: string;
  gender: string; className: string; sectionName: string;
  parentName: string; address: string; dateOfBirth: string;
  phone: string; email: string;
}

function StatusBadge({ gender }: { gender: string }) {
  return <span className={`badge ${gender === 'Male' ? 'badge-info' : 'badge-success'}`}>{gender}</span>
}

export default function StudentsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState<string>('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [activeTab, setActiveTab] = useState('Personal')
  const [form, setForm] = useState<Record<string, string | number>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, classId, page],
    queryFn: () => studentApi.getAll({ search: search || undefined, classId: classId || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })
  const { data: sections } = useQuery({ queryKey: ['sections', form.classId], queryFn: () => sectionApi.getAll(form.classId ? Number(form.classId) : undefined).then(r => r.data), enabled: true })
  const { data: parents } = useQuery({ queryKey: ['parents-list'], queryFn: () => parentApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })

  const createMut = useMutation({
    mutationFn: (d: unknown) => studentApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student added!'); setShowModal(false) },
    onError: () => toast.error('Failed to save student'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => studentApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student updated!'); setShowModal(false) },
    onError: () => toast.error('Failed to update student'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => studentApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student deleted') },
    onError: () => toast.error('Failed to delete student'),
  })

  function openCreate() {
    setEditing(null)
    setActiveTab('Personal')
    setForm({ firstName: '', lastName: '', gender: 'Male', dateOfBirth: '', roll: '', bloodGroup: 'APositive', religion: 'Islam', email: '', phone: '', address: '', classId: '', sectionId: '', parentId: '', admissionId: '', admissionDate: '', photoUrl: '' })
    setShowModal(true)
  }

  async function openEdit(s: Student) {
    try {
      const res = await studentApi.getById(s.id)
      const d = res.data
      setEditing(d)
      setActiveTab('Personal')
      setForm({ 
        firstName: d.firstName, lastName: d.lastName, gender: d.gender, 
        dateOfBirth: d.dateOfBirth, roll: d.roll, classId: d.classId || '', 
        sectionId: d.sectionId || '', email: d.email, phone: d.phone || '', 
        address: d.address || '', bloodGroup: d.bloodGroup, religion: d.religion || '', 
        parentId: d.parentId || '', admissionId: d.admissionId || '', 
        admissionDate: d.admissionDate || '', photoUrl: d.photoUrl || '' 
      })
      setShowModal(true)
    } catch (e) {
      toast.error('Failed to load student details')
    }
  }

  function handleSave() {
    const payload = { ...form, roll: Number(form.roll), classId: Number(form.classId), sectionId: Number(form.sectionId), parentId: Number(form.parentId) || null }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const students: Student[] = data?.data ?? []
  const total = data?.total ?? 0
  const pageSize = 15
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input id="student-search" className="form-control" placeholder="Search students…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select id="student-class-filter" className="form-control" style={{ width: 160 }} value={classId} onChange={e => { setClassId(e.target.value); setPage(1) }}>
          <option value="">All Classes</option>
          {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button id="student-add-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Student
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>🎓</div>
              <p>No students found</p>
            </div>
          ) : (
            <table>
              <thead><tr>
                <th>STUDENT</th><th>ROLL</th><th>CLASS</th><th>SECTION</th><th>GENDER</th><th>PARENT</th><th>PHONE</th><th>ACTIONS</th>
              </tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--clr-navy), var(--clr-teal))', fontSize: 13 }}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600 }}>{s.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--clr-teal)' }}>#{s.roll}</td>
                    <td>{s.className}</td>
                    <td>{s.sectionName}</td>
                    <td><StatusBadge gender={s.gender} /></td>
                    <td>{s.parentName || '—'}</td>
                    <td style={{ color: 'var(--clr-text-muted)' }}>{s.phone || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)} title="Edit"><Pencil size={13} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete this student?')) deleteMut.mutate(s.id) }} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span>Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</span>
            <div className="pagination-controls">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Student' : 'Add New Student'}</h2>
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
                  {[
                    { key: 'firstName', label: 'First Name' },
                    { key: 'lastName', label: 'Last Name' },
                    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                    { key: 'religion', label: 'Religion' },
                    { key: 'photoUrl', label: 'Photo URL' },
                  ].map(({ key, label, type = 'text' }) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{label}</label>
                      <input className="form-control" type={type} value={String(form[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={String(form.gender ?? '')} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      {GENDERS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-control" value={String(form.bloodGroup ?? '')} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                      {BLOOD_GROUPS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'Academic' && (
                <>
                  {[
                    { key: 'roll', label: 'Roll No.', type: 'number' },
                    { key: 'admissionId', label: 'Admission ID' },
                    { key: 'admissionDate', label: 'Admission Date', type: 'date' },
                  ].map(({ key, label, type = 'text' }) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{label}</label>
                      <input className="form-control" type={type} value={String(form[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select className="form-control" value={String(form.classId ?? '')} onChange={e => setForm(f => ({ ...f, classId: e.target.value, sectionId: '' }))}>
                      <option value="">Select Class</option>
                      {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <select className="form-control" value={String(form.sectionId ?? '')} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}>
                      <option value="">Select Section</option>
                      {sections?.filter((s: any) => s.classId === Number(form.classId)).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'Contact' && (
                <>
                  {[
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'address', label: 'Address' },
                  ].map(({ key, label, type = 'text' }) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{label}</label>
                      <input className="form-control" type={type} value={String(form[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Parent</label>
                    <select className="form-control" value={String(form.parentId ?? '')} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
                      <option value="">Select Parent</option>
                      {parents?.data?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
