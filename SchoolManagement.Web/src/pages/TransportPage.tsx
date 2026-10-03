import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transportApi } from '@/lib/services'
import { Plus, Search, Pencil, Bus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

export default function TransportPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const { data: transportData, isLoading } = useQuery({
    queryKey: ['transport', page],
    queryFn: () => transportApi.getAll({ page, pageSize: 15 }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => transportApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transport'] })
      toast.success('Route added!')
      setShowDrawer(false)
    },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => transportApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transport'] })
      toast.success('Route updated!')
      setShowDrawer(false)
    },
  })

  function openCreate() {
    setEditing(null)
    setForm({
      routeTitle: '',
      vehicleNo: '',
      driverName: '',
      driverPhone: '',
      helperName: '',
      helperPhone: '',
      driverLicense: '',
    })
    setShowDrawer(true)
  }

  function handleSave() {
    if (!form.routeTitle?.trim() || !form.vehicleNo?.trim()) {
      toast.error('Route Title and Vehicle Number are required')
      return
    }
    if (editing) updateMut.mutate({ id: editing.id, data: form })
    else createMut.mutate(form)
  }

  const routes = transportData?.data ?? []
  const total = transportData?.total ?? 0
  const pageSize = 15
  const totalPages = Math.ceil(total / pageSize)

  const filteredRoutes = routes.filter(
    (r: any) =>
      r.routeTitle?.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicleNo?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            className="form-control"
            placeholder="Search routes or vehicles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {hasPermission('transport.create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Route
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading ? (
            <div className="loader">
              <div className="spinner" />
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="empty-state">
              <Bus size={32} style={{ color: 'var(--clr-text-muted)' }} />
              <p>No transport routes found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ROUTE TITLE</th>
                  <th>VEHICLE NO</th>
                  <th>DRIVER</th>
                  <th>DRIVER PHONE</th>
                  <th>STUDENTS</th>
                  {hasPermission('transport.edit') && <th>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.routeTitle}</td>
                    <td>
                      <span className="badge badge-info">{r.vehicleNo}</span>
                    </td>
                    <td>{r.driverName}</td>
                    <td style={{ color: 'var(--clr-text-muted)' }}>{r.driverPhone}</td>
                    <td>
                      <span className="badge badge-success">{r.studentCount ?? 0}</span>
                    </td>
                    {hasPermission('transport.edit') && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => {
                              setEditing(r)
                              setForm({
                                routeTitle: r.routeTitle,
                                vehicleNo: r.vehicleNo,
                                driverName: r.driverName,
                                driverPhone: r.driverPhone || '',
                                helperName: r.helperName || '',
                                helperPhone: r.helperPhone || '',
                                driverLicense: r.driverLicense || '',
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
        {totalPages > 1 && (
          <div className="pagination">
            <span>{total} records</span>
            <div className="pagination-controls">
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ‹
              </button>
              <span style={{ padding: '0 8px', color: 'var(--clr-text-muted)', fontSize: 12 }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-over Sidebar Drawer for Add / Edit Route (> 3 fields) ── */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={editing ? 'Edit Transport Route' : 'Add New Route'}
        subtitle="Configure route details, assigned vehicle, and staffing"
        icon={<Bus size={20} />}
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
                ? 'Update Route'
                : 'Save Route'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          <div className="form-group drawer-col-full">
            <label className="form-label">Route Title *</label>
            <input
              className="form-control"
              value={form.routeTitle || ''}
              onChange={e => setForm(f => ({ ...f, routeTitle: e.target.value }))}
              placeholder="e.g. Morning City Route or North Campus Express"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vehicle Registration No *</label>
            <input
              className="form-control"
              value={form.vehicleNo || ''}
              onChange={e => setForm(f => ({ ...f, vehicleNo: e.target.value }))}
              placeholder="e.g. ABC-1234"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Driver Name</label>
            <input
              className="form-control"
              value={form.driverName || ''}
              placeholder="e.g. Michael Smith"
              onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Driver Contact Phone</label>
            <input
              className="form-control"
              value={form.driverPhone || ''}
              placeholder="e.g. +1 555-0199"
              onChange={e => setForm(f => ({ ...f, driverPhone: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Driver Commercial License</label>
            <input
              className="form-control"
              value={form.driverLicense || ''}
              placeholder="e.g. DL-884920"
              onChange={e => setForm(f => ({ ...f, driverLicense: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Conductor / Helper Name</label>
            <input
              className="form-control"
              value={form.helperName || ''}
              placeholder="e.g. David Brown"
              onChange={e => setForm(f => ({ ...f, helperName: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Helper Contact Phone</label>
            <input
              className="form-control"
              value={form.helperPhone || ''}
              placeholder="e.g. +1 555-0188"
              onChange={e => setForm(f => ({ ...f, helperPhone: e.target.value }))}
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}

