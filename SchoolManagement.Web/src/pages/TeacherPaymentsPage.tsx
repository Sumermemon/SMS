import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherPaymentApi, teacherApi } from '@/lib/services'
import { Plus, Search, Pencil, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

export default function TeacherPaymentsPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<Record<string, string | number>>({})

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['teacher-payments'],
    queryFn: () => teacherPaymentApi.getAll().then(r => r.data),
  })

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-all'],
    queryFn: () => teacherApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => teacherPaymentApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-payments'] })
      toast.success('Payment recorded!')
      setShowDrawer(false)
    },
    onError: () => toast.error('Failed to save payment'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => teacherPaymentApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-payments'] })
      toast.success('Payment updated!')
      setShowDrawer(false)
    },
    onError: () => toast.error('Failed to update payment'),
  })

  function openCreate() {
    setEditing(null)
    setForm({
      teacherId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      remarks: '',
    })
    setShowDrawer(true)
  }

  function handleSave() {
    if (!form.teacherId) {
      toast.error('Please select a teacher')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }
    if (!form.paymentDate) {
      toast.error('Please select a payment date')
      return
    }

    const d = form.paymentDate ? String(form.paymentDate).split('-') : []
    const payload = {
      teacherId: Number(form.teacherId),
      amount: Number(form.amount),
      paymentDate: form.paymentDate,
      paidDate: form.paymentDate,
      month: d.length >= 2 ? Number(d[1]) : new Date().getMonth() + 1,
      year: d.length >= 1 ? Number(d[0]) : new Date().getFullYear(),
      status: form.status || 'Completed',
      notes: form.remarks || '',
      remarks: form.remarks || '',
    }
    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const payments = paymentsData?.data ?? paymentsData ?? []
  const teachers = teachersData?.data ?? []

  const filteredPayments = payments.filter((p: any) =>
    p.teacherName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            className="form-control"
            placeholder="Search by teacher name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {hasPermission('expenses.create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Record Payment
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={32} style={{ color: 'var(--clr-text-muted)' }} />
              <p>No payment records found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>TEACHER</th>
                  <th>AMOUNT</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>REMARKS</th>
                  {hasPermission('expenses.edit') && <th>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.teacherName}</td>
                    <td style={{ fontWeight: 700, color: 'var(--clr-success)' }}>
                      ₨ {Number(p.amount).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)' }}>{p.paidDate || p.paymentDate || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === 'Completed' || p.status === 'Paid' ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--clr-text-muted)' }}>{p.notes || p.remarks || '—'}</td>
                    {hasPermission('expenses.edit') && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => {
                              setEditing(p)
                              setForm({
                                teacherId: p.teacherId,
                                amount: p.amount,
                                paymentDate: p.paidDate || p.paymentDate || '',
                                status: p.status === 'Paid' ? 'Completed' : (p.status || 'Completed'),
                                remarks: p.notes || p.remarks || '',
                              })
                              setShowDrawer(true)
                            }}
                          >
                            <Pencil size={13} />
                          </button>
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

      {/* ── Slide-over Sidebar Drawer for Payment (> 3 fields) ── */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={editing ? 'Edit Teacher Payment' : 'Record Teacher Payment'}
        subtitle="Process salary, compensation, or stipend disbursements"
        icon={<CreditCard size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowDrawer(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending
                ? 'Saving…'
                : editing
                ? 'Update Payment'
                : 'Save Payment'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          <div className="form-group drawer-col-full">
            <label className="form-label">Teacher *</label>
            <select
              className="form-control"
              value={form.teacherId}
              onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
              disabled={!!editing}
            >
              <option value="">Select Teacher</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Amount (₨) *</label>
            <input
              type="number"
              className="form-control"
              value={form.amount}
              placeholder="e.g. 45000"
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Disbursement Date *</label>
            <input
              type="date"
              className="form-control"
              value={form.paymentDate ? String(form.paymentDate).split('T')[0] : ''}
              onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
            />
          </div>

          <div className="form-group drawer-col-full">
            <label className="form-label">Payment Status</label>
            <select
              className="form-control"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="form-group drawer-col-full">
            <label className="form-label">Payment Remarks / Reference</label>
            <input
              className="form-control"
              value={form.remarks}
              onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="e.g. Monthly salary for October 2026 / Cheque #1042"
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
