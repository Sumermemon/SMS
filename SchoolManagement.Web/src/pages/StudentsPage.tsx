import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi, classApi, sectionApi, parentApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

const GENDERS     = ['Male', 'Female', 'Other']
const BLOOD_GROUPS = ['APositive','ANegative','BPositive','BNegative','OPositive','ONegative','ABPositive','ABNegative']

const GENDER_COLORS: Record<string, string> = {
  Male:   '#5B7A9E',
  Female: '#B0503E',
  Other:  '#C67B4E',
}

interface Student {
  id: number; roll: number; photoUrl: string; name: string;
  gender: string; className: string; sectionName: string;
  parentName: string; address: string; dateOfBirth: string;
  phone: string; email: string;
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
      color,
      border: `1px solid ${color}20`,
    }}>
      {gender}
    </span>
  )
}

function StudentAvatar({ name }: { name: string }) {
  const tone = ['record-avatar--a', 'record-avatar--b', 'record-avatar--c'][name.charCodeAt(0) % 3]
  return (
    <div className={`record-avatar ${tone}`} aria-label={name}>
      {name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()}
    </div>
  )
}

export default function StudentsPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch]     = useState('')
  const [classId, setClassId]   = useState<string>('')
  const [page, setPage]         = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState<Student | null>(null)
  const [activeTab, setActiveTab] = useState('Personal')
  const [form, setForm]         = useState<Record<string, string | number>>({})

  const [showQuickParent, setShowQuickParent] = useState(false)
  const [quickParentName, setQuickParentName] = useState('')
  const [quickParentPhone, setQuickParentPhone] = useState('')
  const [quickParentEmail, setQuickParentEmail] = useState('')

  const [showQuickClass, setShowQuickClass] = useState(false)
  const [quickClassName, setQuickClassName] = useState('')

  const [showQuickSection, setShowQuickSection] = useState(false)
  const [quickSectionName, setQuickSectionName] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, classId, page],
    queryFn: () => studentApi.getAll({ search: search || undefined, classId: classId || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const { data: classes }  = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })
  const { data: sections } = useQuery({ queryKey: ['sections', form.classId], queryFn: () => sectionApi.getAll(form.classId ? Number(form.classId) : undefined).then(r => r.data), enabled: true })
  const { data: parents }  = useQuery({ queryKey: ['parents-list'], queryFn: () => parentApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })

  const quickCreateParentMut = useMutation({
    mutationFn: (d: any) => parentApi.create(d),
    onSuccess: (res: any) => {
      const created = res.data
      const createdId = created?.id ?? created
      qc.setQueryData(['parents-list'], (old: any) => {
        if (!old) return { data: [created], total: 1 }
        if (Array.isArray(old)) return [created, ...old]
        if (old.data && Array.isArray(old.data)) {
          return { ...old, data: [created, ...old.data], total: (old.total ?? old.data.length) + 1 }
        }
        return old
      })
      qc.invalidateQueries({ queryKey: ['parents-list'] })
      toast.success('Parent created & linked!')
      setForm(f => ({ ...f, parentId: String(createdId) }))
      setShowQuickParent(false)
      setQuickParentName('')
      setQuickParentPhone('')
      setQuickParentEmail('')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.title || 'Failed to create parent'
      toast.error(msg)
    },
  })

  const quickCreateClassMut = useMutation({
    mutationFn: (d: any) => classApi.create(d),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Class created & selected!')
      const createdId = res.data?.id || res.data
      setForm(f => ({ ...f, classId: createdId, sectionId: '' }))
      setShowQuickClass(false)
      setQuickClassName('')
    },
    onError: () => toast.error('Failed to create class'),
  })

  const quickCreateSectionMut = useMutation({
    mutationFn: (d: any) => sectionApi.create(d),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['sections'] })
      toast.success('Section created & selected!')
      const createdId = res.data?.id || res.data
      setForm(f => ({ ...f, sectionId: createdId }))
      setShowQuickSection(false)
      setQuickSectionName('')
    },
    onError: () => toast.error('Failed to create section'),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => studentApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student added!'); setShowModal(false) },
    onError:   () => toast.error('Failed to save student'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => studentApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student updated!'); setShowModal(false) },
    onError:   () => toast.error('Failed to update student'),
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => studentApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student deleted') },
    onError:   () => toast.error('Failed to delete student'),
  })

  function openCreate() {
    setEditing(null); setActiveTab('Personal')
    setShowQuickParent(false)
    setShowQuickClass(false)
    setShowQuickSection(false)
    setForm({ firstName:'', lastName:'', gender:'Male', dateOfBirth:'', roll:'', bloodGroup:'APositive', religion:'Islam', email:'', phone:'', address:'', classId:'', sectionId:'', parentId:'', admissionId:'', admissionDate:'', photoUrl:'' })
    setShowModal(true)
  }

  async function openEdit(s: Student) {
    try {
      const res = await studentApi.getById(s.id)
      const d = res.data
      setEditing(d); setActiveTab('Personal')
      setShowQuickParent(false)
      setShowQuickClass(false)
      setShowQuickSection(false)
      setForm({ firstName:d.firstName, lastName:d.lastName, gender:d.gender, dateOfBirth:d.dateOfBirth, roll:d.roll, classId:d.classId||'', sectionId:d.sectionId||'', email:d.email, phone:d.phone||'', address:d.address||'', bloodGroup:d.bloodGroup, religion:d.religion||'', parentId:d.parentId||'', admissionId:d.admissionId||'', admissionDate:d.admissionDate||'', photoUrl:d.photoUrl||'' })
      setShowModal(true)
    } catch { toast.error('Failed to load student details') }
  }

  function handleSave() {
    if (!form.firstName || !String(form.firstName).trim()) {
      toast.error('First name is required')
      setActiveTab('Personal')
      return
    }
    if (!form.lastName || !String(form.lastName).trim()) {
      toast.error('Last name is required')
      setActiveTab('Personal')
      return
    }
    if (!form.roll) {
      toast.error('Roll number is required')
      setActiveTab('Academic')
      return
    }
    if (!form.classId) {
      toast.error('Please select a class')
      setActiveTab('Academic')
      return
    }
    if (!form.sectionId) {
      toast.error('Please select a section')
      setActiveTab('Academic')
      return
    }

    const payload = { ...form, roll: Number(form.roll), classId: Number(form.classId), sectionId: Number(form.sectionId), parentId: Number(form.parentId) || null }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const students: Student[] = data?.data ?? []
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
            id="student-search"
            className="form-control"
            placeholder="Search students by name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          id="student-class-filter"
          className="form-control"
          style={{ width: 170 }}
          value={classId}
          onChange={e => { setClassId(e.target.value); setPage(1) }}
        >
          <option value="">All Classes</option>
          {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {hasPermission('students.create') && (
          <button id="student-add-btn" className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Student
          </button>
        )}
      </div>

      {/* ── Table Card ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GraduationCap size={15} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>Student Records</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{total} total students</div>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-emoji">🎓</div>
              <p>No students found</p>
              <p className="empty-state-sub">Try adjusting your search or add a new student</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Gender</th>
                  <th>Parent</th>
                  <th>Phone</th>
                  {(hasPermission('students.edit') || hasPermission('students.delete')) && (
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StudentAvatar name={s.name} />
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-1)' }}>{s.name}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--accent)', fontSize: 13 }}>#{s.roll}</span>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontWeight: 450 }}>{s.className}</td>
                    <td><span className="badge badge-muted">{s.sectionName}</span></td>
                    <td><GenderBadge gender={s.gender} /></td>
                    <td style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{s.parentName || '—'}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{s.phone || '—'}</td>
                    {(hasPermission('students.edit') || hasPermission('students.delete')) && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {hasPermission('students.edit') && (
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => openEdit(s)}
                              title="Edit student"
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          {hasPermission('students.delete') && (
                            <button
                              className="btn btn-danger btn-icon btn-sm"
                              onClick={() => { if (confirm('Delete this student?')) deleteMut.mutate(s.id) }}
                              title="Delete student"
                            >
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '14px 24px' }}>
            <span>Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}</span>
            <div className="pagination-controls">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2)
                .map(p => (
                  <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
                ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-over Sidebar Drawer for Students (> 3 fields) ── */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        wide
        title={editing ? 'Edit Student Record' : 'Add New Student'}
        subtitle={editing ? `Update student #${editing.roll || ''} details` : 'Enter student information to enroll'}
        icon={<GraduationCap size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Student' : 'Add Student'}
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
              {[
                { key: 'firstName', label: 'First Name *' },
                { key: 'lastName',  label: 'Last Name *' },
                { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                { key: 'religion',  label: 'Religion' },
                { key: 'photoUrl',  label: 'Photo URL' },
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
                { key: 'roll', label: 'Roll No. *', type: 'number' },
                { key: 'admissionId', label: 'Admission ID' },
                { key: 'admissionDate', label: 'Admission Date', type: 'date' },
              ].map(({ key, label, type = 'text' }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-control" type={type} value={String(form[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group drawer-col-full">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Class *</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setShowQuickClass(v => !v)}
                    style={{ fontSize: 11, padding: '2px 8px', color: 'var(--brand-amber)' }}
                  >
                    {showQuickClass ? 'Cancel' : '+ New Class'}
                  </button>
                </div>
                {showQuickClass && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, padding: 8, background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Grade 10"
                      value={quickClassName}
                      onChange={e => setQuickClassName(e.target.value)}
                      style={{ fontSize: 12, height: 32 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      disabled={quickCreateClassMut.isPending || !quickClassName.trim()}
                      onClick={() => quickCreateClassMut.mutate({ name: quickClassName.trim(), numericValue: 1 })}
                    >
                      {quickCreateClassMut.isPending ? 'Saving...' : 'Add Class'}
                    </button>
                  </div>
                )}
                <select className="form-control" value={String(form.classId ?? '')} onChange={e => setForm(f => ({ ...f, classId: e.target.value, sectionId: '' }))}>
                  <option value="">Select Class</option>
                  {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group drawer-col-full">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Section *</label>
                  {form.classId && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setShowQuickSection(v => !v)}
                      style={{ fontSize: 11, padding: '2px 8px', color: 'var(--brand-amber)' }}
                    >
                      {showQuickSection ? 'Cancel' : '+ New Section'}
                    </button>
                  )}
                </div>
                {showQuickSection && form.classId && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, padding: 8, background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Section A"
                      value={quickSectionName}
                      onChange={e => setQuickSectionName(e.target.value)}
                      style={{ fontSize: 12, height: 32 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      disabled={quickCreateSectionMut.isPending || !quickSectionName.trim()}
                      onClick={() => quickCreateSectionMut.mutate({ name: quickSectionName.trim(), classId: Number(form.classId), capacity: 40 })}
                    >
                      {quickCreateSectionMut.isPending ? 'Saving...' : 'Add Section'}
                    </button>
                  </div>
                )}
                <select className="form-control" value={String(form.sectionId ?? '')} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))} disabled={!form.classId}>
                  <option value="">{form.classId ? 'Select Section' : 'Select Class First'}</option>
                  {sections?.filter((s: any) => s.classId === Number(form.classId)).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}

          {activeTab === 'Contact' && (
            <>
              {[
                { key: 'email',   label: 'Email',   type: 'email' },
                { key: 'phone',   label: 'Phone' },
              ].map(({ key, label, type = 'text' }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-control" type={type} value={String(form[key] ?? '')} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group drawer-col-full">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Parent / Guardian <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setShowQuickParent(v => !v)}
                    style={{ fontSize: 11, padding: '2px 8px', color: 'var(--brand-amber)' }}
                  >
                    {showQuickParent ? 'Cancel' : '+ New Parent'}
                  </button>
                </div>
                {showQuickParent && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10, padding: 12, background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-navy)' }}>Quick Add Parent</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Parent Name *"
                        value={quickParentName}
                        onChange={e => setQuickParentName(e.target.value)}
                        style={{ fontSize: 12, height: 32 }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Phone Number *"
                        value={quickParentPhone}
                        onChange={e => setQuickParentPhone(e.target.value)}
                        style={{ fontSize: 12, height: 32 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email Address (optional)"
                        value={quickParentEmail}
                        onChange={e => setQuickParentEmail(e.target.value)}
                        style={{ fontSize: 12, height: 32, flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        disabled={quickCreateParentMut.isPending || !quickParentName.trim() || !quickParentPhone.trim()}
                        onClick={() => {
                          if (!quickParentName.trim()) { toast.error('Parent name is required'); return }
                          if (!quickParentPhone.trim()) { toast.error('Phone number is required'); return }
                          quickCreateParentMut.mutate({
                            name: quickParentName.trim(),
                            phone: quickParentPhone.trim(),
                            email: quickParentEmail.trim() ? quickParentEmail.trim() : null
                          })
                        }}
                        style={{ height: 32, padding: '0 12px' }}
                      >
                        {quickCreateParentMut.isPending ? 'Saving...' : 'Save & Link'}
                      </button>
                    </div>
                  </div>
                )}
                <select className="form-control" value={String(form.parentId ?? '')} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
                  <option value="">None / Not Assigned (Select Parent)</option>
                  {parents?.data?.map((p: any) => <option key={p.id} value={p.id}>{p.name} {p.phone ? `(${p.phone})` : ''}</option>)}
                </select>
              </div>
              <div className="form-group drawer-col-full">
                <label className="form-label">Residential Address</label>
                <textarea className="form-control" rows={3} value={String(form.address ?? '')} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Complete address" />
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  )
}
