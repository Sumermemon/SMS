import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { noticeApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NoticesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ title: '', details: '', postedBy: '', date: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['notices', search, page],
    queryFn: () => noticeApi.getAll({ search: search || undefined, page, pageSize: 12 }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => noticeApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice posted!'); setShowModal(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => noticeApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Updated!'); setShowModal(false) },
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => noticeApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Deleted') },
  })

  function openCreate() {
    setEditing(null)
    const today = new Date().toISOString().split('T')[0]
    setForm({ title: '', details: '', postedBy: '', date: today })
    setShowModal(true)
  }

  function openEdit(n: any) {
    setEditing(n)
    setForm({ title: n.title, details: n.details, postedBy: n.postedBy, date: n.date })
    setShowModal(true)
  }

  function handleSave() {
    if (editing) updateMut.mutate({ id: editing.id, data: form })
    else createMut.mutate(form)
  }

  const notices = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div className="filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input className="form-control" placeholder="Search notices…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Post Notice</button>
      </div>

      {isLoading ? <div className="loader"><div className="spinner" /></div>
        : notices.length === 0 ? (
          <div className="empty-state card"><div style={{ fontSize: 40 }}>📢</div><p>No notices found</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
            {notices.map((n: any) => (
              <div key={n.id} className="card" style={{ cursor: 'default', transition: 'transform 150ms ease, box-shadow 150ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                {/* Color strip */}
                <div style={{ height: 3, background: 'linear-gradient(90deg, var(--clr-navy), var(--clr-teal))', borderRadius: '99px', marginBottom: 'var(--space-md)', marginTop: -8, marginLeft: -16, marginRight: -16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{n.title}</h3>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(n)}><Pencil size={13} /></button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete this notice?')) deleteMut.mutate(n.id) }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.details}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', fontSize: 11, color: 'var(--clr-text-faint)' }}>
                  <span>📅 {n.date}</span>
                  <span>✍️ {n.postedBy}</span>
                  <span><Eye size={11} style={{ verticalAlign: 'middle' }} /> {n.viewCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Notice' : 'Post New Notice'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title…" />
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea className="form-control" rows={4} value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="Full notice details…" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Posted By</label>
                  <input className="form-control" value={form.postedBy} onChange={e => setForm(f => ({ ...f, postedBy: e.target.value }))} placeholder="Principal / Admin" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-md mt-lg">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
                {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update' : 'Post Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
