import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherApi, subjectApi, classApi, sectionApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, UserCheck, Calendar, BookOpen, School, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

const GENDER_COLORS: Record<string, string> = {
  Male:   '#5B7A9E',
  Female: '#B0503E',
  Other:  '#C67B4E',
}

function TeacherAvatar({ name }: { name: string }) {
  const tone = ['record-avatar--a', 'record-avatar--b', 'record-avatar--c'][name.charCodeAt(0) % 3]
  return (
    <div className={`record-avatar ${tone}`} aria-label={name}>
      {name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()}
    </div>
  )
}

function GenderBadge({ gender }: { gender: string }) {
  const color = GENDER_COLORS[gender] ?? 'var(--text-3)'
  return (
    <span style={{
      display: 'inline-flex',
      padding: '2px 9px',
      borderRadius: 'var(--r-full)',
      fontSize: 11, fontWeight: 500,
      background: `${color}12`,
      color, border: `1px solid ${color}20`,
    }}>
      {gender}
    </span>
  )
}

export default function TeachersPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [search, setSearch]       = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [page, setPage]           = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<any>(null)
  const [activeTab, setActiveTab] = useState('Personal')
  const [form, setForm]           = useState<Record<string, string>>({})
  const [assignedSubjectIds, setAssignedSubjectIds] = useState<number[]>([])
  const [assignedClassIds, setAssignedClassIds]     = useState<number[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', search, subjectId, page],
    queryFn: () => teacherApi.getAll({ search: search || undefined, subjectId: subjectId || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll().then(r => r.data) })
  const { data: classes }  = useQuery({ queryKey: ['classes'],  queryFn: () => classApi.getAll().then(r => r.data) })
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
    setEditing(null); setActiveTab('Personal')
    setForm({ firstName:'', lastName:'', email:'', phone:'', address:'', gender:'Male', dateOfBirth:'', religion:'Islam', joiningDate:'', subjectId:'', classId:'', sectionId:'', photoUrl:'' })
    setAssignedSubjectIds([])
    setAssignedClassIds([])
    setShowModal(true)
  }

  async function openEdit(t: any) {
    try {
      const res = await teacherApi.getById(t.id)
      const d = res.data
      setEditing(d); setActiveTab('Personal')
      setForm({
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone || '',
        address: d.address || '',
        gender: d.gender,
        dateOfBirth: d.dateOfBirth || '',
        religion: d.religion || '',
        joiningDate: d.joiningDate || '',
        subjectId: d.subjectId || '',
        classId: d.classId || '',
        sectionId: d.sectionId || '',
        photoUrl: d.photoUrl || ''
      })
      const subs = d.assignedSubjectIds?.length ? d.assignedSubjectIds : (d.subjectId ? [d.subjectId] : [])
      const cls = d.assignedClassIds?.length ? d.assignedClassIds : (d.classId ? [d.classId] : [])
      setAssignedSubjectIds(subs)
      setAssignedClassIds(cls)
      setShowModal(true)
    } catch { toast.error('Failed to load teacher details') }
  }

  function toggleSubject(id: number) {
    setAssignedSubjectIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleClass(id: number) {
    setAssignedClassIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleSave() {
    if (!form.firstName?.trim()) {
      toast.error('First name is required')
      setActiveTab('Personal')
      return
    }
    if (!form.lastName?.trim()) {
      toast.error('Last name is required')
      setActiveTab('Personal')
      return
    }
    if (!form.email?.trim()) {
      toast.error('Email address is required')
      setActiveTab('Contact')
      return
    }

    const payload = {
      ...form,
      subjectId: assignedSubjectIds[0] ?? (Number(form.subjectId) || null),
      classId: assignedClassIds[0] ?? (Number(form.classId) || null),
      sectionId: Number(form.sectionId) || null,
      assignedSubjectIds,
      assignedClassIds
    }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const teachers   = data?.data ?? []
  const total      = data?.total ?? 0
  const pageSize   = 15
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            id="teacher-search"
            className="form-control"
            placeholder="Search teachers by name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className="form-control" style={{ width: 190 }} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {hasPermission('teachers.create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Teacher
          </button>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="card" style={{ padding: 0 }}>
        {/* Card header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserCheck size={15} style={{ color: 'var(--green)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>Teacher Records</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{total} total teachers</div>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          {isLoading
            ? <div className="loader"><div className="spinner" /></div>
            : teachers.length === 0
              ? (
                <div className="empty-state">
                  <UserCheck size={28} style={{ color: 'var(--text-4)' }} />
                  <p>No teachers found</p>
                  <p className="empty-state-sub">Add your first teacher to get started</p>
                </div>
              )
              : (
                <table>
                  <thead>
                    <tr>
                      <th>Teacher</th>
                      <th>Subject</th>
                      <th>Class</th>
                      <th>Gender</th>
                      <th>Phone</th>
                      <th>Joined</th>
                      {(hasPermission('teachers.edit') || hasPermission('teachers.delete')) && (
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t: any) => (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <TeacherAvatar name={t.name} />
                            <div>
                              <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-1)' }}>{t.name}</p>
                              <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{t.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {t.subjects && t.subjects.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {t.subjects.map((sub: string) => (
                                <span key={sub} className="badge badge-info" style={{ fontSize: 11, padding: '2px 7px' }}>
                                  {sub}
                                </span>
                              ))}
                            </div>
                          ) : t.subjectName ? (
                            <span className="badge badge-info">{t.subjectName}</span>
                          ) : (
                            <span style={{ color: 'var(--text-3)' }}>—</span>
                          )}
                        </td>
                        <td>
                          {t.classes && t.classes.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {t.classes.map((cls: string) => (
                                <span key={cls} className="badge" style={{ fontSize: 11, padding: '2px 7px', background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                                  {cls}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-2)', fontWeight: 450 }}>{t.className || '—'}</span>
                          )}
                        </td>
                        <td><GenderBadge gender={t.gender} /></td>
                        <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{t.phone || '—'}</td>
                        <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{t.joiningDate || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ gap: 4, fontSize: 11.5, padding: '3px 8px', color: 'var(--primary)' }}
                              onClick={() => navigate(`/timetable?teacherId=${t.id}`)}
                              title="View Timetable / Routine"
                            >
                              <Calendar size={13} /> Timetable
                            </button>
                            {hasPermission('teachers.edit') && (
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)} title="Edit"><Pencil size={13} /></button>
                            )}
                            {hasPermission('teachers.delete') && (
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete this teacher?')) deleteMut.mutate(t.id) }} title="Delete"><Trash2 size={13} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          }
        </div>

        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '12px 20px' }}>
            <span>Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</span>
            <div className="pagination-controls">
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
              <span style={{ padding: '0 8px', color: 'var(--text-2)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{page} / {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-over Sidebar Drawer for Teachers (> 3 fields) ── */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        wide
        title={editing ? 'Edit Teacher Record' : 'Add New Teacher'}
        subtitle={editing ? `Update ${editing.firstName || 'teacher'} profile` : 'Enter faculty credentials & details'}
        icon={<UserCheck size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          {['Personal', 'Academic', 'Contact'].map(t => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab(t)}
            >
              {t} Details
            </button>
          ))}
        </div>

        <div className="drawer-form-grid">
          {activeTab === 'Personal' && (
            <>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={form.firstName ?? ''} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="e.g. John" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={form.lastName ?? ''} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="e.g. Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={form.dateOfBirth ?? ''} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Religion</label>
                <input className="form-control" value={form.religion ?? ''} onChange={e => setForm(f => ({ ...f, religion: e.target.value }))} placeholder="e.g. Islam, Christianity" />
              </div>
              <div className="form-group">
                <label className="form-label">Photo URL</label>
                <input className="form-control" value={form.photoUrl ?? ''} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </>
          )}

          {activeTab === 'Academic' && (
            <>
              <div className="form-group drawer-col-full">
                <label className="form-label">Joining Date</label>
                <input type="date" className="form-control" value={form.joiningDate ?? ''} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))} />
              </div>

              {/* Multi-Subject Selection */}
              <div className="form-group drawer-col-full">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Assigned Subjects ({assignedSubjectIds.length} selected)
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Click to toggle multiple subjects</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: 10,
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border)',
                  maxHeight: 150,
                  overflowY: 'auto'
                }}>
                  {subjects?.map((s: any) => {
                    const isSelected = assignedSubjectIds.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSubject(s.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 'var(--r-full)',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--primary)' : 'var(--surface-1)',
                          color: isSelected ? '#ffffff' : 'var(--text-2)',
                        }}
                      >
                        {isSelected && <Check size={13} />}
                        <BookOpen size={12} style={{ opacity: isSelected ? 1 : 0.6 }} />
                        {s.name}
                      </button>
                    )
                  })}
                  {(!subjects || subjects.length === 0) && (
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>No subjects defined yet.</span>
                  )}
                </div>
              </div>

              {/* Multi-Class Selection */}
              <div className="form-group drawer-col-full">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Assigned Classes ({assignedClassIds.length} selected)
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Click to toggle multiple classes</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: 10,
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border)',
                  maxHeight: 150,
                  overflowY: 'auto'
                }}>
                  {classes?.map((c: any) => {
                    const isSelected = assignedClassIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleClass(c.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 'var(--r-full)',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--primary)' : 'var(--surface-1)',
                          color: isSelected ? '#ffffff' : 'var(--text-2)',
                        }}
                      >
                        {isSelected && <Check size={13} />}
                        <School size={12} style={{ opacity: isSelected ? 1 : 0.6 }} />
                        {c.name}
                      </button>
                    )
                  })}
                  {(!classes || classes.length === 0) && (
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>No classes defined yet.</span>
                  )}
                </div>
              </div>

              {/* Primary Class / In-charge section */}
              <div className="form-group">
                <label className="form-label">Primary Class Teacher Of (Optional)</label>
                <select className="form-control" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value, sectionId: '' }))}>
                  <option value="">None / Floating Teacher</option>
                  {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Section (Optional)</label>
                <select className="form-control" value={form.sectionId ?? ''} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}>
                  <option value="">All / None</option>
                  {sections?.filter((s: any) => s.classId === Number(form.classId)).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="drawer-col-full" style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--r-md)',
                padding: '10px 14px',
                fontSize: 12,
                color: 'var(--text-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Calendar size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>
                  <strong>Tip:</strong> Teachers can teach multiple subjects across multiple classes. You can also assign their exact day & period slots in the <strong>Timetable</strong> module.
                </span>
              </div>
            </>
          )}

          {activeTab === 'Contact' && (
            <>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-control" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="teacher@school.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 1234567" />
              </div>
              <div className="form-group drawer-col-full">
                <label className="form-label">Residential Address</label>
                <textarea className="form-control" rows={3} value={form.address ?? ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Complete address" />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  )
}
