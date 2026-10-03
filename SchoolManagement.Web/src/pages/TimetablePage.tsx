import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routineApi, classApi, sectionApi, subjectApi, teacherApi } from '@/lib/services'
import {
  Calendar, Clock, Plus, Search, Pencil, Trash2, Printer,
  School, BookOpen, UserCheck, Layers, Filter, CheckCircle2, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Drawer from '@/components/Drawer'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const STANDARD_PERIODS = [
  { name: 'Period 1', slot: '08:00 - 08:45' },
  { name: 'Period 2', slot: '08:50 - 09:35' },
  { name: 'Period 3', slot: '09:40 - 10:25' },
  { name: 'Break', slot: '10:25 - 10:55', isBreak: true },
  { name: 'Period 4', slot: '10:55 - 11:40' },
  { name: 'Period 5', slot: '11:45 - 12:30' },
  { name: 'Period 6', slot: '12:35 - 01:20' },
]

const SUBJECT_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', text: '#2563eb' },
  { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#059669' },
  { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)', text: '#7c3aed' },
  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#d97706' },
  { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.3)', text: '#db2777' },
  { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.3)', text: '#0284c7' },
  { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', text: '#dc2626' },
]

function getSubjectColor(subjectName: string) {
  if (!subjectName) return SUBJECT_COLORS[0]
  let hash = 0
  for (let i = 0; i < subjectName.length; i++) {
    hash = (hash << 5) - hash + subjectName.charCodeAt(i)
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

export default function TimetablePage() {
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const { hasPermission } = useAuth()

  // View state: 'class' | 'teacher' | 'list'
  const initialTeacherParam = searchParams.get('teacherId')
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'list'>(
    initialTeacherParam ? 'teacher' : 'class'
  )

  const [selectedClassId, setSelectedClassId]     = useState<string>('')
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherParam || '')
  const [selectedDay, setSelectedDay]             = useState<string>('')
  const [search, setSearch]                       = useState<string>('')

  // Drawer form state
  const [showDrawer, setShowDrawer] = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [form, setForm]             = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    day: 'Monday',
    timeSlot: '08:00 - 08:45',
    effectiveDate: '',
  })

  // Lookups
  const { data: classes }  = useQuery({ queryKey: ['classes'],  queryFn: () => classApi.getAll().then(r => r.data) })
  const { data: sections } = useQuery({ queryKey: ['sections'], queryFn: () => sectionApi.getAll().then(r => r.data) })
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectApi.getAll().then(r => r.data) })
  const { data: teachersData } = useQuery({
    queryKey: ['teachers-all'],
    queryFn: () => teacherApi.getAll({ pageSize: 100 }).then(r => r.data?.data ?? [])
  })

  // Auto-select first class & section when loaded
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id.toString())
    }
  }, [classes, selectedClassId])

  useEffect(() => {
    if (selectedClassId && sections && !selectedSectionId) {
      const match = sections.find((s: any) => s.classId === Number(selectedClassId))
      if (match) setSelectedSectionId(match.id.toString())
    }
  }, [selectedClassId, sections, selectedSectionId])

  // Timetable query
  const { data: routineData, isLoading } = useQuery({
    queryKey: ['class-routines', selectedClassId, selectedSectionId, selectedTeacherId, selectedDay, viewMode],
    queryFn: () => {
      const params: Record<string, any> = { pageSize: 100 }
      if (viewMode === 'class') {
        if (selectedClassId) params.classId = Number(selectedClassId)
        if (selectedSectionId) params.sectionId = Number(selectedSectionId)
      } else if (viewMode === 'teacher') {
        if (selectedTeacherId) params.teacherId = Number(selectedTeacherId)
      }
      if (selectedDay) params.day = selectedDay
      return routineApi.getAll(params).then(r => r.data)
    }
  })

  const routines: any[] = routineData?.data ?? []

  // Mutations
  const createMut = useMutation({
    mutationFn: (d: any) => routineApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-routines'] })
      toast.success('Timetable period scheduled!')
      setShowDrawer(false)
      setEditing(null)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.title || 'Failed to create timetable slot'
      toast.error(msg)
    }
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => routineApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-routines'] })
      toast.success('Timetable period updated!')
      setShowDrawer(false)
      setEditing(null)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.title || 'Failed to update timetable slot'
      toast.error(msg)
    }
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => routineApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-routines'] })
      toast.success('Period removed from schedule')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.title || 'Failed to delete'
      toast.error(msg)
    }
  })

  function openCreate(prefill?: { day?: string; timeSlot?: string }) {
    setEditing(null)
    setForm({
      classId: selectedClassId || (classes?.[0]?.id?.toString() ?? ''),
      sectionId: selectedSectionId || '',
      subjectId: subjects?.[0]?.id?.toString() ?? '',
      teacherId: viewMode === 'teacher' && selectedTeacherId ? selectedTeacherId : '',
      day: prefill?.day || selectedDay || 'Monday',
      timeSlot: prefill?.timeSlot || '08:00 - 08:45',
      effectiveDate: new Date().toISOString().split('T')[0],
    })
    setShowDrawer(true)
  }

  function openEdit(r: any) {
    setEditing(r)

    // Match class by ID or Name
    const foundClass = classes?.find((c: any) => c.id === r.classId || c.name?.toLowerCase() === r.className?.toLowerCase())
    const cId = foundClass ? foundClass.id.toString() : (r.classId?.toString() || '')

    // Match section by ID or Name within class or overall
    const foundSection = sections?.find((s: any) =>
      (s.id === r.sectionId || s.name?.toLowerCase() === r.sectionName?.toLowerCase()) &&
      (!cId || s.classId === Number(cId))
    ) || sections?.find((s: any) => s.id === r.sectionId || s.name?.toLowerCase() === r.sectionName?.toLowerCase())
    const sId = foundSection ? foundSection.id.toString() : (r.sectionId?.toString() || '')

    // Match subject by ID or Name
    const foundSubject = subjects?.find((s: any) => s.id === r.subjectId || s.name?.toLowerCase() === r.subjectName?.toLowerCase())
    const subId = foundSubject ? foundSubject.id.toString() : (r.subjectId?.toString() || '')

    // Match teacher by ID or Name
    const foundTeacher = teachersData?.find((t: any) => t.id === r.teacherId || t.name?.toLowerCase() === r.teacherName?.toLowerCase())
    const tId = foundTeacher ? foundTeacher.id.toString() : (r.teacherId?.toString() || '')

    setForm({
      classId: cId,
      sectionId: sId,
      subjectId: subId,
      teacherId: tId,
      day: r.day || 'Monday',
      timeSlot: r.timeSlot || '08:00 - 08:45',
      effectiveDate: r.effectiveDate || '',
    })
    setShowDrawer(true)
  }

  function handleSave() {
    if (!form.classId) {
      toast.error('Class is required')
      return
    }
    if (!form.sectionId) {
      toast.error('Section is required')
      return
    }
    if (!form.subjectId) {
      toast.error('Subject is required')
      return
    }
    if (!form.day) {
      toast.error('Day of week is required')
      return
    }
    if (!form.timeSlot?.trim()) {
      toast.error('Time slot is required')
      return
    }

    const payload = {
      classId: Number(form.classId),
      sectionId: Number(form.sectionId),
      subjectId: Number(form.subjectId),
      teacherId: form.teacherId ? Number(form.teacherId) : null,
      day: form.day,
      timeSlot: form.timeSlot.trim(),
      effectiveDate: form.effectiveDate ? form.effectiveDate : null,
    }

    if (editing) {
      updateMut.mutate({ id: editing.id, data: payload })
    } else {
      createMut.mutate(payload)
    }
  }

  // Filter sections by selected class
  const classSections = useMemo(() => {
    if (!selectedClassId || !sections) return []
    return sections.filter((s: any) => s.classId === Number(selectedClassId))
  }, [selectedClassId, sections])

  const formSections = useMemo(() => {
    if (!form.classId || !sections) return []
    return sections.filter((s: any) => s.classId === Number(form.classId))
  }, [form.classId, sections])

  // Get distinct time slots present in data or fallback to standard periods
  const activeTimeSlots = useMemo(() => {
    const set = new Set<string>()
    STANDARD_PERIODS.forEach(p => set.add(p.slot))
    routines.forEach(r => {
      if (r.timeSlot) set.add(r.timeSlot)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [routines])

  // Print function
  const handlePrint = () => {
    window.print()
  }

  const selectedClassName = classes?.find((c: any) => c.id.toString() === selectedClassId)?.name ?? 'Class'
  const selectedSectionName = sections?.find((s: any) => s.id.toString() === selectedSectionId)?.name ?? ''
  const selectedTeacherName = teachersData?.find((t: any) => t.id.toString() === selectedTeacherId)?.name ?? 'All Teachers'

  return (
    <div>
      {/* ── Header Toolbar ── */}
      <div className="filter-bar" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {/* View Mode Buttons */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-2)',
          padding: 3,
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
        }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'class' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--r-sm)', padding: '5px 12px', fontSize: 12 }}
            onClick={() => setViewMode('class')}
          >
            <School size={14} /> Class Timetable
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'teacher' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--r-sm)', padding: '5px 12px', fontSize: 12 }}
            onClick={() => setViewMode('teacher')}
          >
            <UserCheck size={14} /> Teacher Schedule
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--r-sm)', padding: '5px 12px', fontSize: 12 }}
            onClick={() => setViewMode('list')}
          >
            <Layers size={14} /> All Slots
          </button>
        </div>

        {/* Dynamic Filters depending on viewMode */}
        {viewMode === 'class' && (
          <>
            <select
              className="form-control"
              style={{ width: 170 }}
              value={selectedClassId}
              onChange={e => {
                setSelectedClassId(e.target.value)
                const s = sections?.find((sec: any) => sec.classId === Number(e.target.value))
                if (s) setSelectedSectionId(s.id.toString())
                else setSelectedSectionId('')
              }}
            >
              <option value="">Select Class</option>
              {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              className="form-control"
              style={{ width: 160 }}
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
            >
              <option value="">All Sections</option>
              {classSections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        )}

        {viewMode === 'teacher' && (
          <select
            className="form-control"
            style={{ width: 220 }}
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
          >
            <option value="">Select Teacher</option>
            {teachersData?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.subjectName ? `(${t.subjectName})` : ''}
              </option>
            ))}
          </select>
        )}

        <select
          className="form-control"
          style={{ width: 140 }}
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
        >
          <option value="">All Days</option>
          {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handlePrint}
            title="Print Schedule"
          >
            <Printer size={15} /> Print
          </button>

          {hasPermission('classes.create') && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openCreate()}
            >
              <Plus size={15} /> Add Period
            </button>
          )}
        </div>
      </div>

      {/* ── Subtitle Info Banner ── */}
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        padding: '12px 18px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--r-md)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>
              {viewMode === 'class' && (
                <>Weekly Routine: {selectedClassName} {selectedSectionName ? `- ${selectedSectionName}` : ''}</>
              )}
              {viewMode === 'teacher' && (
                <>Faculty Schedule: {selectedTeacherName}</>
              )}
              {viewMode === 'list' && <>All Scheduled Routine Periods</>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {routines.length} periods active in this view • A teacher can be assigned multiple subjects & classes across the weekly timetable
            </div>
          </div>
        </div>

        {viewMode === 'teacher' && selectedTeacherId && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-info" style={{ fontSize: 11 }}>
              Assigned to Multiple Subjects & Classes
            </span>
          </div>
        )}
      </div>

      {/* ── Main Timetable Views ── */}
      {isLoading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div className="loader"><div className="spinner" /></div>
          <p style={{ marginTop: 12, color: 'var(--text-3)', fontSize: 13 }}>Loading timetable schedules…</p>
        </div>
      ) : viewMode === 'list' ? (
        /* ── List / Table View ── */
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            {routines.length === 0 ? (
              <div className="empty-state" style={{ padding: 48 }}>
                <Calendar size={32} style={{ color: 'var(--text-4)' }} />
                <p>No timetable periods found</p>
                <p className="empty-state-sub">Click "Add Period" above to create routine slots</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time Slot</th>
                    <th>Class & Section</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Effective Date</th>
                    {(hasPermission('classes.edit') || hasPermission('classes.delete')) && (
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {routines.map((r: any) => {
                    const color = getSubjectColor(r.subjectName)
                    return (
                      <tr key={r.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{r.day}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-2)' }}>
                            <Clock size={13} style={{ color: 'var(--primary)' }} />
                            <span>{r.timeSlot}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>
                            {r.className} {r.sectionName ? `(${r.sectionName})` : ''}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 9px',
                              borderRadius: 'var(--r-full)',
                              fontSize: 11.5,
                              fontWeight: 500,
                              background: color.bg,
                              color: color.text,
                              border: `1px solid ${color.border}`,
                            }}
                          >
                            <BookOpen size={12} />
                            {r.subjectName}
                          </span>
                        </td>
                        <td>
                          {r.teacherName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)' }}>
                              <UserCheck size={13} style={{ color: 'var(--green)' }} />
                              <span>{r.teacherName}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-3)' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                          {r.effectiveDate || 'Always'}
                        </td>
                        {(hasPermission('classes.edit') || hasPermission('classes.delete')) && (
                          <td>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              {hasPermission('classes.edit') && (
                                <button
                                  className="btn btn-ghost btn-icon btn-sm"
                                  onClick={() => openEdit(r)}
                                  title="Edit Routine"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                              {hasPermission('classes.delete') && (
                                <button
                                  className="btn btn-danger btn-icon btn-sm"
                                  onClick={() => {
                                    if (confirm('Delete this timetable slot?')) deleteMut.mutate(r.id)
                                  }}
                                  title="Delete"
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
            )}
          </div>
        </div>
      ) : (
        /* ── Weekly Schedule Grid View (Class or Teacher) ── */
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <div style={{ minWidth: 920 }}>
            {/* Days Column Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '130px repeat(6, 1fr)',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)',
              fontWeight: 600,
              fontSize: 12.5,
              color: 'var(--text-1)',
              textAlign: 'center'
            }}>
              <div style={{
                padding: '12px 14px',
                textAlign: 'left',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} />
                <span>Time / Day</span>
              </div>
              {DAYS_OF_WEEK.map(day => (
                <div
                  key={day}
                  style={{
                    padding: '12px 8px',
                    borderRight: '1px solid var(--border)',
                    background: selectedDay === day ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    color: selectedDay === day ? 'var(--primary)' : 'var(--text-1)'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Rows by Time Slot */}
            {activeTimeSlots.map((slot, rowIndex) => {
              const standardP = STANDARD_PERIODS.find(p => p.slot === slot)
              const isBreak = standardP?.isBreak

              return (
                <div
                  key={slot}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '130px repeat(6, 1fr)',
                    borderBottom: '1px solid var(--border)',
                    minHeight: isBreak ? 45 : 82,
                    background: isBreak ? 'rgba(245, 158, 11, 0.04)' : rowIndex % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)',
                  }}
                >
                  {/* Time label cell */}
                  <div style={{
                    padding: '10px 12px',
                    borderRight: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'var(--surface-2)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: isBreak ? '#d97706' : 'var(--text-1)' }}>
                      {standardP ? standardP.name : `Period`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {slot}
                    </div>
                  </div>

                  {/* Day Cells */}
                  {isBreak ? (
                    <div style={{
                      gridColumn: 'span 6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#d97706',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      background: 'rgba(245, 158, 11, 0.06)'
                    }}>
                      ☕ Recess / Lunch Break ({slot})
                    </div>
                  ) : (
                    DAYS_OF_WEEK.map(day => {
                      const matched = routines.filter(
                        r => r.day.toLowerCase() === day.toLowerCase() && r.timeSlot === slot
                      )

                      return (
                        <div
                          key={day}
                          style={{
                            padding: 6,
                            borderRight: '1px solid var(--border)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            justifyContent: matched.length > 0 ? 'flex-start' : 'center',
                            alignItems: matched.length > 0 ? 'stretch' : 'center',
                          }}
                        >
                          {matched.length === 0 ? (
                            hasPermission('classes.create') && (
                              <button
                                type="button"
                                onClick={() => openCreate({ day, timeSlot: slot })}
                                style={{
                                  border: '1px dashed var(--border)',
                                  background: 'transparent',
                                  borderRadius: 'var(--r-sm)',
                                  padding: '6px 10px',
                                  fontSize: 11,
                                  color: 'var(--text-4)',
                                  cursor: 'pointer',
                                  opacity: 0.6,
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-4)' }}
                                title={`Add period for ${day} ${slot}`}
                              >
                                <Plus size={12} /> Add
                              </button>
                            )
                          ) : (
                            matched.map((r: any) => {
                              const color = getSubjectColor(r.subjectName)
                              return (
                                <div
                                  key={r.id}
                                  style={{
                                    background: color.bg,
                                    border: `1px solid ${color.border}`,
                                    borderRadius: 'var(--r-sm)',
                                    padding: '7px 8px',
                                    position: 'relative',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                  }}
                                >
                                  {/* Subject Title */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 3
                                  }}>
                                    <div style={{
                                      fontWeight: 600,
                                      fontSize: 12,
                                      color: color.text,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}>
                                      <BookOpen size={12} />
                                      <span>{r.subjectName}</span>
                                    </div>

                                    {(hasPermission('classes.edit') || hasPermission('classes.delete')) && (
                                      <div style={{ display: 'flex', gap: 2 }}>
                                        {hasPermission('classes.edit') && (
                                          <button
                                            type="button"
                                            onClick={() => openEdit(r)}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              cursor: 'pointer',
                                              color: 'var(--text-3)',
                                              padding: 2
                                            }}
                                            title="Edit"
                                          >
                                            <Pencil size={11} />
                                          </button>
                                        )}
                                        {hasPermission('classes.delete') && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (confirm('Delete this slot?')) deleteMut.mutate(r.id)
                                            }}
                                            style={{
                                              background: 'transparent',
                                              border: 'none',
                                              cursor: 'pointer',
                                              color: '#dc2626',
                                              padding: 2
                                            }}
                                            title="Delete"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Class & Section (shown prominently if in teacher view) */}
                                  <div style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: 'var(--text-1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    marginBottom: 2
                                  }}>
                                    <School size={11} style={{ opacity: 0.7 }} />
                                    <span>{r.className} {r.sectionName ? `(${r.sectionName})` : ''}</span>
                                  </div>

                                  {/* Teacher */}
                                  <div style={{
                                    fontSize: 10.5,
                                    color: 'var(--text-3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}>
                                    <UserCheck size={11} style={{ color: 'var(--green)' }} />
                                    <span>{r.teacherName || 'No Teacher'}</span>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Add / Edit Period Slide-Over Drawer ── */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={editing ? 'Edit Timetable Slot' : 'Add Timetable Period'}
        subtitle={editing ? 'Update class routine slot' : 'Assign class, subject, teacher and schedule time'}
        icon={<Calendar size={20} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowDrawer(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editing ? 'Update Period' : 'Save Period'}
            </button>
          </>
        }
      >
        <div className="drawer-form-grid">
          {/* Class Select */}
          <div className="form-group">
            <label className="form-label">Class *</label>
            <select
              className="form-control"
              value={form.classId}
              onChange={e => {
                const cid = e.target.value
                setForm(f => ({ ...f, classId: cid, sectionId: '' }))
                const matchSec = sections?.find((s: any) => s.classId === Number(cid))
                if (matchSec) setForm(f => ({ ...f, sectionId: matchSec.id.toString() }))
              }}
            >
              <option value="">Select Class</option>
              {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Section Select */}
          <div className="form-group">
            <label className="form-label">Section *</label>
            <select
              className="form-control"
              value={form.sectionId}
              onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}
            >
              <option value="">Select Section</option>
              {formSections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Subject Select */}
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className="form-control"
              value={form.subjectId}
              onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
            >
              <option value="">Select Subject</option>
              {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Teacher Select */}
          <div className="form-group">
            <label className="form-label">Assigned Teacher</label>
            <select
              className="form-control"
              value={form.teacherId}
              onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
            >
              <option value="">Select Teacher (Optional)</option>
              {teachersData?.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.subjectName ? `(${t.subjectName})` : ''}
                </option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'block' }}>
              One teacher can take multiple subjects & classes across different periods.
            </span>
          </div>

          {/* Day of Week */}
          <div className="form-group">
            <label className="form-label">Day of Week *</label>
            <select
              className="form-control"
              value={form.day}
              onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
            >
              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Time Slot with Presets */}
          <div className="form-group">
            <label className="form-label">Time Slot *</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <select
                className="form-control"
                value={
                  STANDARD_PERIODS.some(p => p.slot === form.timeSlot)
                    ? form.timeSlot
                    : 'custom'
                }
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    setForm(f => ({ ...f, timeSlot: e.target.value }))
                  } else {
                    setForm(f => ({ ...f, timeSlot: '' }))
                  }
                }}
              >
                {STANDARD_PERIODS.filter(p => !p.isBreak).map(p => (
                  <option key={p.slot} value={p.slot}>
                    {p.name} ({p.slot})
                  </option>
                ))}
                <option value="custom">Custom Time...</option>
              </select>
            </div>
            {!STANDARD_PERIODS.some(p => p.slot === form.timeSlot) && (
              <input
                className="form-control"
                style={{ marginTop: 6 }}
                placeholder="e.g. 02:00 - 02:45"
                value={form.timeSlot}
                onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}
              />
            )}
          </div>

          {/* Effective Date */}
          <div className="form-group drawer-col-full">
            <label className="form-label">Effective From (Optional)</label>
            <input
              type="date"
              className="form-control"
              value={form.effectiveDate}
              onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))}
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
