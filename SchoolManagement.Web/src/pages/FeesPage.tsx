import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feeApi, studentApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  Paid: 'badge-success',
  Due: 'badge-danger',
  Partial: 'badge-warning',
  Waived: 'badge-muted',
}

export default function FeesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['fees', status, page],
    queryFn: () => feeApi.getAll({ status: status || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const { data: students } = useQuery({ queryKey: ['students-list'], queryFn: () => studentApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })

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
    setShowModal(true)
  }

  function handleSave() {
    const payload = { ...form, studentId: Number(form.studentId), amount: Number(form.amount), status: 'Due' }
    if (editing) updateMut.mutate({ id: editing.id, data: { ...payload, paidDate: form.paidDate, status: form.status } })
    else createMut.mutate(payload)
  }

  const fees = data?.data ?? []
  const total = data?.total ?? 0
  const pageSize = 15
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input className="form-control" placeholder="Search fees…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 150 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Paid','Due','Partial','Waived'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Fee</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading ? <div className="loader"><div className="spinner" /></div>
            : fees.length === 0 ? <div className="empty-state"><div style={{ fontSize: 40 }}>💰</div><p>No fee records found</p></div>
            : (
              <table>
                <thead><tr><th>STUDENT</th><th>CLASS</th><th>FEE TYPE</th><th>AMOUNT</th><th>DUE DATE</th><th>PAID DATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {fees.map((f: any) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.studentName}</td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{f.className}</td>
                      <td>{f.feeType}</td>
                      <td style={{ fontWeight: 700, color: 'var(--clr-teal)' }}>₨ {Number(f.amount).toLocaleString()}</td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{f.dueDate}</td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{f.paidDate || '—'}</td>
                      <td><span className={`badge ${STATUS_COLORS[f.status] ?? 'badge-muted'}`}>{f.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(f); setForm({ studentId: f.studentId, feeType: f.feeType, amount: String(f.amount), dueDate: f.dueDate, paidDate: f.paidDate || '', status: f.status, remarks: '' }); setShowModal(true) }}><Pencil size={13} /></button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(f.id) }}><Trash2 size={13} /></button>
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
            <span>{total} records</span>
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
              <h2 className="modal-title">{editing ? 'Edit Fee Record' : 'Add Fee Record'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Student</label>
                <select className="form-control" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
                  <option value="">Select Student</option>
                  {students?.items?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fee Type</label>
                <select className="form-control" value={form.feeType} onChange={e => setForm(f => ({ ...f, feeType: e.target.value }))}>
                  <option value="">Select Type</option>
                  {['Tuition','Transport','Exam','Library','Sports','Lab'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₨)</label>
                <input type="number" className="form-control" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              {editing && <>
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
              </>}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Remarks</label>
                <input className="form-control" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-md mt-lg">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update' : 'Add Fee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
