import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feeApi, studentApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown, Clock, ChevronDown, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

const STATUS_CONFIG: Record<string, { cls: string; dot?: boolean }> = {
  Paid:    { cls: 'badge-success' },
  Due:     { cls: 'badge-danger',  dot: true },
  Partial: { cls: 'badge-warning' },
  Waived:  { cls: 'badge-muted' },
}

export default function FeesPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch]       = useState('')
  const [status, setStatus]       = useState('')
  const [page, setPage]           = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<any>(null)
  const [form, setForm]           = useState<Record<string, string>>({})

  // Searchable student select state
  const [studentSearch, setStudentSearch] = useState('')
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)
  const studentDropdownRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['fees', status, page],
    queryFn: () => feeApi.getAll({ status: status || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: () => studentApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data),
  })

  // Safely extract student list whether students is PagedResult ({ data: [] }) or direct array
  const studentList: any[] = useMemo(() => {
    if (!students) return []
    return Array.isArray(students) ? students : (students.data ?? [])
  }, [students])

  // Format student display e.g. "Sumer memon (10th-A)"
  const formatStudentDisplay = (s: any) => {
    if (!s) return ''
    const classInfo = s.className ? (s.sectionName ? `${s.className}-${s.sectionName}` : s.className) : ''
    return classInfo ? `${s.name} (${classInfo})` : s.name
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
        setIsStudentDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedStudent = useMemo(() => {
    if (!form.studentId) return null
    return studentList.find(s => String(s.id) === String(form.studentId)) || null
  }, [form.studentId, studentList])

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return studentList
    return studentList.filter(s => {
      const name = (s.name ?? '').toLowerCase()
      const className = (s.className ?? '').toLowerCase()
      const sectionName = (s.sectionName ?? '').toLowerCase()
      const roll = String(s.roll ?? '')
      const combined = `${name} ${className}-${sectionName} ${roll}`.toLowerCase()
      return combined.includes(q)
    })
  }, [studentList, studentSearch])

  const createMut = useMutation({
    mutationFn: (d: unknown) => feeApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Fee record added!'); setShowModal(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => feeApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Updated!'); setShowModal(false) },
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => feeApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Deleted') },
  })

  function openCreate() {
    setEditing(null)
    setForm({ studentId: '', feeType: '', amount: '', dueDate: '', remarks: '' })
    setStudentSearch('')
    setIsStudentDropdownOpen(false)
    setShowModal(true)
  }

  function handleSave() {
    if (!form.studentId) {
      toast.error('Please select a student')
      return
    }
    if (!form.feeType) {
      toast.error('Please select fee type')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid fee amount')
      return
    }
    if (!form.dueDate) {
      toast.error('Please specify a due date')
      return
    }

    const payload = { ...form, studentId: Number(form.studentId), amount: Number(form.amount), status: form.status || 'Due' }
    if (editing) updateMut.mutate({ id: editing.id, data: { ...payload, paidDate: form.paidDate, status: form.status } })
    else createMut.mutate(payload)
  }

  const fees       = data?.data ?? []
  const total      = data?.total ?? 0
  const pageSize   = 15
  const totalPages = Math.ceil(total / pageSize)

  /* ── Compute mini stats from loaded data ── */
  const totalCollected = fees.filter((f: any) => f.status === 'Paid').reduce((acc: number, f: any) => acc + Number(f.amount), 0)
  const totalPending   = fees.filter((f: any) => f.status === 'Due').reduce((acc: number, f: any) => acc + Number(f.amount), 0)
  const totalPartial   = fees.filter((f: any) => f.status === 'Partial').reduce((acc: number, f: any) => acc + Number(f.amount), 0)

  return (
    <div>
      {/* ── Mini stat strip ── */}
      <div className="mini-stat-strip">
        <div className="mini-stat">
          <div className="mini-stat-label">Collected (this page)</div>
          <div className="mini-stat-value text-success">₨ {totalCollected.toLocaleString()}</div>
          <div className="mini-stat-sub flex items-center gap-1">
            <TrendingUp size={11} style={{ color: 'var(--green)' }} />
            <span style={{ color: 'var(--green)' }}>Paid</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">Pending (this page)</div>
          <div className="mini-stat-value text-danger">₨ {totalPending.toLocaleString()}</div>
          <div className="mini-stat-sub flex items-center gap-1">
            <TrendingDown size={11} style={{ color: 'var(--red)' }} />
            <span style={{ color: 'var(--red)' }}>Due</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">Partial (this page)</div>
          <div className="mini-stat-value text-warning">₨ {totalPartial.toLocaleString()}</div>
          <div className="mini-stat-sub flex items-center gap-1">
            <Clock size={11} style={{ color: 'var(--yellow)' }} />
            <span style={{ color: 'var(--yellow)' }}>Partial</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">Total Records</div>
          <div className="mini-stat-value">{total}</div>
          <div className="mini-stat-sub">All statuses</div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input className="form-control" placeholder="Search fees…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 155 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['Paid','Due','Partial','Waived'].map(s => <option key={s}>{s}</option>)}
        </select>
        {hasPermission('fees.create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Fee
          </button>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DollarSign size={15} style={{ color: 'var(--yellow)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>Fee Records</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{total} records found</div>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          {isLoading
            ? <div className="loader"><div className="spinner" /></div>
            : fees.length === 0
              ? (
                <div className="empty-state">
                  <DollarSign size={28} style={{ color: 'var(--text-4)' }} />
                  <p>No fee records found</p>
                  <p className="empty-state-sub">Add a new fee record to get started</p>
                </div>
              )
              : (
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Paid Date</th>
                      <th>Status</th>
                      {(hasPermission('fees.edit') || hasPermission('fees.delete')) && (
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((f: any) => {
                      const cfg = STATUS_CONFIG[f.status] ?? { cls: 'badge-muted' }
                      return (
                        <tr key={f.id}>
                          <td style={{ fontWeight: 500, color: 'var(--text-1)', fontSize: 13 }}>{f.studentName}</td>
                          <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{f.className}</td>
                          <td style={{ color: 'var(--text-2)', fontWeight: 450 }}>{f.feeType}</td>
                          <td>
                            <span style={{
                              fontWeight: 600,
                              fontSize: 13, color: 'var(--text-1)',
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              ₨ {Number(f.amount).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{f.dueDate}</td>
                          <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{f.paidDate || '—'}</td>
                          <td>
                            <span className={`badge ${cfg.cls}`}>
                              {cfg.dot && <span className="badge-dot" />}
                              {f.status}
                            </span>
                          </td>
                          {(hasPermission('fees.edit') || hasPermission('fees.delete')) && (
                            <td>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                {hasPermission('fees.edit') && (
                                  <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    title="Edit"
                                    onClick={() => {
                                      setEditing(f)
                                      setForm({ studentId: String(f.studentId), feeType: f.feeType, amount: String(f.amount), dueDate: f.dueDate, paidDate: f.paidDate || '', status: f.status, remarks: '' })
                                      setStudentSearch('')
                                      setIsStudentDropdownOpen(false)
                                      setShowModal(true)
                                    }}
                                  >
                                    <Pencil size={13} />
                                  </button>
                                )}
                                {hasPermission('fees.delete') && (
                                  <button
                                    className="btn btn-danger btn-icon btn-sm"
                                    title="Delete"
                                    onClick={() => { if (confirm('Delete this fee record?')) deleteMut.mutate(f.id) }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
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

      {/* ── Slide-over Sidebar Drawer for Fees (> 3 fields) ── */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Fee Record' : 'Record New Fee Invoice'}
        subtitle={editing ? 'Update invoice status and payment info' : 'Issue a fee record to a registered student'}
        icon={<DollarSign size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Record' : 'Add Fee'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          <div className="form-group drawer-col-full" ref={studentDropdownRef} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Student *</label>
              {selectedStudent && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Roll #{selectedStudent.roll}
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search size={15} />
              </div>

              <input
                type="text"
                className="form-control"
                style={{
                  paddingLeft: 32,
                  paddingRight: form.studentId ? 56 : 32,
                  cursor: 'pointer',
                  backgroundColor: 'var(--surface)',
                }}
                placeholder={
                  selectedStudent
                    ? formatStudentDisplay(selectedStudent)
                    : editing?.studentName
                      ? `${editing.studentName}${editing.className ? ` (${editing.className})` : ''}`
                      : 'Search student by name, roll, or class…'
                }
                value={
                  isStudentDropdownOpen
                    ? studentSearch
                    : selectedStudent
                      ? formatStudentDisplay(selectedStudent)
                      : editing?.studentName
                        ? `${editing.studentName}${editing.className ? ` (${editing.className})` : ''}`
                        : ''
                }
                onFocus={() => {
                  setIsStudentDropdownOpen(true)
                  setStudentSearch('')
                }}
                onChange={e => {
                  setStudentSearch(e.target.value)
                  if (!isStudentDropdownOpen) setIsStudentDropdownOpen(true)
                }}
                onClick={() => setIsStudentDropdownOpen(true)}
              />

              <div
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {form.studentId && (
                  <button
                    type="button"
                    tabIndex={-1}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '50%',
                    }}
                    title="Clear student"
                    onClick={e => {
                      e.stopPropagation()
                      setForm(f => ({ ...f, studentId: '' }))
                      setStudentSearch('')
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  tabIndex={-1}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 2,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    setIsStudentDropdownOpen(prev => !prev)
                  }}
                >
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isStudentDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Dropdown Options Popup */}
            {isStudentDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  marginTop: 4,
                  background: 'var(--surface, #ffffff)',
                  border: '1px solid var(--border, #e4dfd5)',
                  borderRadius: 'var(--r-lg, 8px)',
                  boxShadow: 'var(--shadow-dialog, 0 10px 25px -5px rgba(0,0,0,0.12))',
                  maxHeight: 240,
                  overflowY: 'auto',
                }}
              >
                {filteredStudents.length === 0 ? (
                  <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    {studentList.length === 0 ? 'No students available in system' : `No students found matching "${studentSearch}"`}
                  </div>
                ) : (
                  <div style={{ padding: 4 }}>
                    {filteredStudents.map((s: any) => {
                      const isSelected = String(s.id) === String(form.studentId)
                      const label = formatStudentDisplay(s)
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setForm(f => ({ ...f, studentId: String(s.id) }))
                            setIsStudentDropdownOpen(false)
                            setStudentSearch('')
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: isSelected ? 600 : 450,
                            color: isSelected ? 'var(--primary, #d89b3c)' : 'var(--text-primary, #0f1b3d)',
                            background: isSelected ? 'var(--primary-light, #fbf1df)' : 'transparent',
                            transition: 'background 0.1s ease',
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover, #f8fafc)'
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span>{label}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              Roll: #{s.roll} {s.gender ? `· ${s.gender}` : ''}
                            </span>
                          </div>
                          {isSelected && <Check size={14} style={{ color: 'var(--primary, #d89b3c)', flexShrink: 0 }} />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Fee Type *</label>
            <select className="form-control" value={form.feeType} onChange={e => setForm(f => ({ ...f, feeType: e.target.value }))}>
              <option value="">Select Type</option>
              {['Tuition','Transport','Exam','Library','Sports','Lab'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₨) *</label>
            <input type="number" className="form-control" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input type="date" className="form-control" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          {editing && (
            <>
              <div className="form-group">
                <label className="form-label">Paid Date</label>
                <input type="date" className="form-control" value={form.paidDate} onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {['Paid','Due','Partial','Waived'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="form-group drawer-col-full">
            <label className="form-label">Remarks</label>
            <input className="form-control" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes regarding this fee" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
