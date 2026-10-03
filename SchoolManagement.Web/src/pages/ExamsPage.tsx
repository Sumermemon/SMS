import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examApi, subjectApi, classApi, sectionApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

export default function ExamsPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  
  const [form, setForm] = useState<Record<string, string | number | boolean>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['exams', classId, page],
    queryFn: () => examApi.getAll({ classId: classId || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll().then(r => r.data) })
  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })
  const { data: sections } = useQuery({ queryKey: ['sections', form.classId], queryFn: () => sectionApi.getAll(form.classId ? Number(form.classId) : undefined).then(r => r.data), enabled: !!form.classId })

  const createMut = useMutation({
    mutationFn: (d: unknown) => examApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Exam created!'); setShowModal(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => examApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Updated!'); setShowModal(false) },
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => examApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Deleted') },
  })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', subjectId: '', classId: '', sectionId: '', examTime: '10:00:00', examDate: new Date().toISOString().split('T')[0], totalMarks: 100, isPublished: false })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name || !String(form.name).trim()) {
      toast.error('Please enter exam name')
      return
    }
    if (!form.classId) {
      toast.error('Please select a class')
      return
    }
    if (!form.sectionId) {
      toast.error('Please select a section')
      return
    }
    if (!form.subjectId) {
      toast.error('Please select a subject')
      return
    }
    if (!form.totalMarks || Number(form.totalMarks) <= 0) {
      toast.error('Please enter valid total marks')
      return
    }
    if (!form.examDate) {
      toast.error('Please select an exam date')
      return
    }

    const payload = {
      name: form.name,
      subjectId: Number(form.subjectId),
      classId: Number(form.classId),
      sectionId: Number(form.sectionId),
      examTime: form.examTime || '10:00:00',
      examDate: form.examDate,
      totalMarks: Number(form.totalMarks),
      isPublished: Boolean(form.isPublished)
    }

    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const exams = data?.data ?? []
  const total = data?.total ?? 0
  const pageSize = 15
  const totalPages = Math.ceil(total / pageSize)

  const filteredExams = exams.filter((e: any) => e.examName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input className="form-control" placeholder="Search exams…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 150 }} value={classId} onChange={e => setClassId(e.target.value)}>
          <option value="">All Classes</option>
          {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {hasPermission('exams.create') && (
          <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Create Exam</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading ? <div className="loader"><div className="spinner" /></div>
            : filteredExams.length === 0 ? <div className="empty-state"><div style={{ fontSize: 40 }}>📝</div><p>No exams found</p></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>EXAM NAME</th>
                    <th>CLASS</th>
                    <th>SECTION</th>
                    <th>SUBJECT</th>
                    <th>DATE</th>
                    <th>TIME</th>
                    <th>STATUS</th>
                    {(hasPermission('exams.edit') || hasPermission('exams.delete')) && (
                      <th>ACTIONS</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map((e: any) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.examName}</td>
                      <td>{e.className}</td>
                      <td>{e.sectionName}</td>
                      <td>{e.subjectName}</td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{e.examDate}</td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{e.examTime}</td>
                      <td>
                        <span className={`badge ${e.isPublished ? 'badge-success' : 'badge-warning'}`}>
                          {e.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      {(hasPermission('exams.edit') || hasPermission('exams.delete')) && (
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {hasPermission('exams.edit') && (
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={async () => {
                                try {
                                  const res = await examApi.getById(e.id)
                                  const d = res.data
                                  setEditing(d)
                                  setForm({
                                    name: d.name,
                                    subjectId: String(d.subjectId),
                                    classId: String(d.classId),
                                    sectionId: String(d.sectionId),
                                    examTime: d.examTime,
                                    examDate: d.examDate,
                                    totalMarks: d.totalMarks,
                                    isPublished: d.isPublished
                                  })
                                  setShowModal(true)
                                } catch (err) {
                                  toast.error('Failed to load details')
                                }
                              }}><Pencil size={13} /></button>
                            )}
                            {hasPermission('exams.delete') && (
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(e.id) }}><Trash2 size={13} /></button>
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
        {totalPages > 1 && (
          <div className="pagination">
            <span>{total} records</span>
            <div className="pagination-controls">
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              <span style={{ padding: '0 8px', color: 'var(--clr-text-muted)', fontSize: 12 }}>{page} / {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-over Sidebar Drawer for Exams (> 3 fields) ── */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Examination' : 'Schedule New Exam'}
        subtitle={editing ? 'Update exam timetable & parameters' : 'Configure exam subject, class, and date'}
        icon={<BookOpen size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Exam' : 'Create Exam'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          <div className="form-group drawer-col-full">
            <label className="form-label">Exam Name *</label>
            <input className="form-control" value={form.name as string} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mid Term Assessment 2026" />
          </div>
          <div className="form-group">
            <label className="form-label">Class *</label>
            <select className="form-control" value={form.classId as string} onChange={e => setForm(f => ({ ...f, classId: e.target.value, sectionId: '' }))}>
              <option value="">Select Class</option>
              {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Section *</label>
            <select className="form-control" value={form.sectionId as string} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}>
              <option value="">Select Section</option>
              {sections?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select className="form-control" value={form.subjectId as string} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
              <option value="">Select Subject</option>
              {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Marks *</label>
            <input type="number" className="form-control" value={form.totalMarks as number} onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))} placeholder="100" />
          </div>
          <div className="form-group">
            <label className="form-label">Exam Date *</label>
            <input type="date" className="form-control" value={form.examDate as string} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Exam Time</label>
            <input type="time" className="form-control" value={form.examTime as string} onChange={e => setForm(f => ({ ...f, examTime: e.target.value + (e.target.value.length === 5 ? ':00' : '') }))} />
          </div>
          
          {editing && (
            <div className="form-group drawer-col-full" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input type="checkbox" id="isPublished" checked={form.isPublished as boolean} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              <label htmlFor="isPublished" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>Publish Results to Students & Parents</label>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}
