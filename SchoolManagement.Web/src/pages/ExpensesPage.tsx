import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

const STATUS_COLORS: Record<string, string> = {
  Approved: 'badge-success',
  Paid:     'badge-success',
  Pending:  'badge-warning',
  Due:      'badge-warning',
  Rejected: 'badge-danger',
}

export default function ExpensesPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', status, page],
    queryFn: () => expenseApi.getAll({ status: status || undefined, page, pageSize: 15 }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => expenseApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Expense recorded!'); setShowModal(false) },
    onError: () => toast.error('Failed to save expense'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => expenseApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Expense updated!'); setShowModal(false) },
    onError: () => toast.error('Failed to update expense'),
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => expenseApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed to delete expense'),
  })

  function openCreate() {
    setEditing(null)
    setForm({ name: '', expenseType: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Pending', phone: '', email: '', remarks: '' })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name?.trim()) {
      toast.error('Please enter expense title or vendor name')
      return
    }
    if (!form.expenseType) {
      toast.error('Please select an expense type')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid expense amount')
      return
    }
    if (!form.date) {
      toast.error('Please select an expense date')
      return
    }

    const payload = {
      name: form.name.trim(),
      expenseType: form.expenseType,
      amount: Number(form.amount),
      date: form.date,
      status: form.status || 'Pending',
      phone: form.phone || '',
      email: form.email || '',
      remarks: form.remarks || '',
    }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const expenses = data?.data ?? []
  const total = data?.total ?? 0
  const pageSize = 15
  const totalPages = Math.ceil(total / pageSize)

  // Filter local search since API doesn't support search param natively on Expenses yet
  const filteredExpenses = expenses.filter((e: any) => e.name.toLowerCase().includes(search.toLowerCase()) || e.expenseType.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input className="form-control" placeholder="Search expenses…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 150 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Pending','Approved','Paid','Rejected','Due'].map(s => <option key={s}>{s}</option>)}
        </select>
        {hasPermission('expenses.create') && (
          <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Expense</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading ? <div className="loader"><div className="spinner" /></div>
            : filteredExpenses.length === 0 ? <div className="empty-state"><div style={{ fontSize: 40 }}>🧾</div><p>No expense records found</p></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>TYPE</th>
                    <th>AMOUNT</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    {(hasPermission('expenses.edit') || hasPermission('expenses.delete')) && (
                      <th>ACTIONS</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((e: any) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.name}</td>
                      <td>{e.expenseType}</td>
                      <td style={{ fontWeight: 700, color: 'var(--clr-danger)' }}>₨ {Number(e.amount).toLocaleString()}</td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{e.date}</td>
                      <td><span className={`badge ${STATUS_COLORS[e.status] ?? 'badge-muted'}`}>{e.status}</span></td>
                      {(hasPermission('expenses.edit') || hasPermission('expenses.delete')) && (
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {hasPermission('expenses.edit') && (
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(e); setForm({ name: e.name, expenseType: e.expenseType, amount: String(e.amount), date: e.date ? String(e.date).split('T')[0] : '', status: e.status || 'Pending', phone: e.phone || '', email: e.email || '', remarks: e.remarks || '' }); setShowModal(true) }}><Pencil size={13} /></button>
                            )}
                            {hasPermission('expenses.delete') && (
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

      {/* ── Slide-over Sidebar Drawer for Expense (> 3 fields) ── */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Expense Record' : 'Record New Expense'}
        subtitle={editing ? 'Update expense amount or status' : 'Record operational cost or vendor payment'}
        icon={<DollarSign size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Expense' : 'Add Expense'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          <div className="form-group drawer-col-full">
            <label className="form-label">Expense Title / Vendor *</label>
            <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electric Bill, Lab Equipment, Stationery" />
          </div>
          <div className="form-group">
            <label className="form-label">Expense Type *</label>
            <select className="form-control" value={form.expenseType} onChange={e => setForm(f => ({ ...f, expenseType: e.target.value }))}>
              <option value="">Select Type</option>
              {['Salary','Utility','Maintenance','Event','Supplies','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₨) *</label>
            <input type="number" className="form-control" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Pending','Approved','Paid','Rejected','Due'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Vendor phone" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@email.com" />
          </div>
          <div className="form-group drawer-col-full">
            <label className="form-label">Remarks</label>
            <input className="form-control" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Additional notes" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
