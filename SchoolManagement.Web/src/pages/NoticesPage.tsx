import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { noticeApi, classApi } from '@/lib/services'
import { Plus, Search, Pencil, Trash2, Eye, Bell, Users, School, Globe, GraduationCap, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

export default function NoticesPage() {
  const qc = useQueryClient()
  const { hasPermission } = useAuth()
  const [search, setSearch] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    details: '',
    postedBy: '',
    date: '',
    targetAudience: 'Global',
    targetClassId: ''
  })

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })

  const { data, isLoading } = useQuery({
    queryKey: ['notices', search, page],
    queryFn: () => noticeApi.getAll({ search: search || undefined, page, pageSize: 24 }).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (d: unknown) => noticeApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice posted!'); setShowModal(false) },
    onError: () => toast.error('Failed to post notice')
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) => noticeApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Updated!'); setShowModal(false) },
    onError: () => toast.error('Failed to update notice')
  })
  const deleteMut = useMutation({
    mutationFn: (id: number) => noticeApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed to delete notice')
  })

  function openCreate() {
    setEditing(null)
    const today = new Date().toISOString().split('T')[0]
    setForm({ title: '', details: '', postedBy: 'Administration', date: today, targetAudience: 'Global', targetClassId: '' })
    setShowModal(true)
  }

  function openEdit(n: any) {
    setEditing(n)
    setForm({
      title: n.title,
      details: n.details,
      postedBy: n.postedBy || '',
      date: n.date || '',
      targetAudience: n.targetAudience || 'Global',
      targetClassId: n.targetClassId ? String(n.targetClassId) : ''
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.title?.trim()) {
      toast.error('Notice title is required')
      return
    }
    if (!form.details?.trim()) {
      toast.error('Notice details are required')
      return
    }
    if (!form.date) {
      toast.error('Publication date is required')
      return
    }
    if (form.targetAudience === 'ClassWise' && !form.targetClassId) {
      toast.error('Please select a target class for class-wise notice')
      return
    }

    const payload = {
      ...form,
      targetClassId: form.targetAudience === 'ClassWise' && form.targetClassId ? Number(form.targetClassId) : null
    }

    if (editing) updateMut.mutate({ id: editing.id, data: payload })
    else createMut.mutate(payload)
  }

  const getAudienceBadge = (n: any) => {
    switch (n.targetAudience) {
      case 'ClassWise':
        return (
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <School size={12} /> {n.targetClassName ? `Class: ${n.targetClassName}` : 'Class-Wise'}
          </span>
        )
      case 'Parents':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Users size={12} /> Parents Only
          </span>
        )
      case 'Teachers':
        return (
          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <UserCheck size={12} /> Teachers Only
          </span>
        )
      case 'Students':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <GraduationCap size={12} /> Students Only
          </span>
        )
      case 'Global':
      default:
        return (
          <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Globe size={12} /> Global / All
          </span>
        )
    }
  }

  const rawNotices = (data?.data ?? []) as any[]
  const notices = rawNotices.filter((n: any) => {
    if (!audienceFilter) return true
    return (n.targetAudience || 'Global') === audienceFilter
  })

  return (
    <div>
      <div className="filter-bar" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input" style={{ flex: 1, minWidth: 200 }}>
          <Search className="search-icon" />
          <input className="form-control" placeholder="Search notices…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>

        <select 
          className="form-control" 
          style={{ width: 'auto', minWidth: 170 }}
          value={audienceFilter} 
          onChange={e => setAudienceFilter(e.target.value)}
        >
          <option value="">All Audiences</option>
          <option value="Global">🌐 Global / All</option>
          <option value="ClassWise">🏫 Class Specific</option>
          <option value="Parents">👨‍👩‍👧 Parents Only</option>
          <option value="Teachers">🧑‍🏫 Teachers Only</option>
          <option value="Students">🎒 Students Only</option>
        </select>

        {hasPermission('notices.create') && (
          <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Post Notice</button>
        )}
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
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  {getAudienceBadge(n)}
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>📅 {n.date}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700, lineHeight: 1.3, margin: '4px 0' }}>{n.title}</h3>
                  {(hasPermission('notices.edit') || hasPermission('notices.delete')) && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {hasPermission('notices.edit') && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(n)} title="Edit"><Pencil size={13} /></button>
                      )}
                      {hasPermission('notices.delete') && (
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Delete this notice?')) deleteMut.mutate(n.id) }} title="Delete"><Trash2 size={13} /></button>
                      )}
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.details}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', fontSize: 11, color: 'var(--clr-text-faint)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                  <span>✍️ {n.postedBy || 'Admin'}</span>
                  <span><Eye size={11} style={{ verticalAlign: 'middle' }} /> {n.viewCount} views</span>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* ── Slide-over Sidebar Drawer for Notices (> 3 fields) ── */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Notice' : 'Post New Notice'}
        subtitle={editing ? 'Update notice announcement' : 'Publish a targeted bulletin for school community'}
        icon={<Bell size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Notice' : 'Post Notice'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          <div className="form-group drawer-col-full">
            <label className="form-label">Notice Title *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Summer Vacation Schedule, Annual Sports Day" />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience / Notice Type *</label>
            <select
              className="form-control"
              value={form.targetAudience}
              onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value, targetClassId: '' }))}
            >
              <option value="Global">🌐 Global (Show to Everyone)</option>
              <option value="ClassWise">🏫 Class Specific (Only selected grade)</option>
              <option value="Parents">👨‍👩‍👧 Parents & Guardians Only</option>
              <option value="Teachers">🧑‍🏫 Teachers & Staff Only</option>
              <option value="Students">🎒 Students Only</option>
            </select>
          </div>

          {form.targetAudience === 'ClassWise' ? (
            <div className="form-group">
              <label className="form-label">Target Class *</label>
              <select
                className="form-control"
                value={form.targetClassId}
                onChange={e => setForm(f => ({ ...f, targetClassId: e.target.value }))}
              >
                <option value="">Select Target Class...</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Publication Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          )}

          {form.targetAudience === 'ClassWise' && (
            <div className="form-group">
              <label className="form-label">Publication Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Posted By</label>
            <input className="form-control" value={form.postedBy} onChange={e => setForm(f => ({ ...f, postedBy: e.target.value }))} placeholder="e.g. Principal / Administration" />
          </div>

          <div className="form-group drawer-col-full">
            <label className="form-label">Notice Details / Announcement *</label>
            <textarea className="form-control" rows={6} value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="Enter full announcement details here…" />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
