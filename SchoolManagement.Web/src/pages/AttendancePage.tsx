import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceApi, classApi, sectionApi } from '@/lib/services'
import { Save, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AttendancePage() {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  const [attendanceState, setAttendanceState] = useState<Record<number, { isPresent: boolean, remarks: string }>>({})

  const { data: classes } = useQuery({ queryKey: ['classes'], queryFn: () => classApi.getAll().then(r => r.data) })
  const { data: sections } = useQuery({ queryKey: ['sections', form.classId], queryFn: () => sectionApi.getAll(form.classId ? Number(form.classId) : undefined).then(r => r.data), enabled: !!form.classId })

  // We fetch the "sheet" to see if attendance was already marked.
  // The API expects (classId, sectionId, month, year) for sheet, which groups by student.
  const { data: sheetData, isLoading, refetch } = useQuery({
    queryKey: ['attendance-sheet', form.classId, form.sectionId, form.date],
    queryFn: () => {
      const d = new Date(form.date)
      return attendanceApi.getSheet(Number(form.classId), Number(form.sectionId), d.getMonth() + 1, d.getFullYear()).then(r => r.data)
    },
    enabled: !!(form.classId && form.sectionId && form.date)
  })

  const saveMut = useMutation({
    mutationFn: (payload: any) => attendanceApi.mark(payload),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['attendance-sheet'] })
      toast.success('Attendance saved!')
    },
    onError: () => toast.error('Failed to save attendance')
  })

  // Initialize attendance state when sheetData changes
  const handleLoadStudents = () => {
    if (!sheetData) return
    const newState: Record<number, { isPresent: boolean, remarks: string }> = {}
    const day = new Date(form.date).getDate()
    
    sheetData.forEach((s: any) => {
      const existingStatus = s.dayStatus ? s.dayStatus[day] : null
      newState[s.studentId] = {
        isPresent: existingStatus === true || existingStatus === null, // default to present
        remarks: ''
      }
    })
    setAttendanceState(newState)
  }

  const handleSave = () => {
    if (!form.classId || !form.sectionId || !form.date) {
      toast.error('Please select Class, Section, and Date')
      return
    }

    const entries = Object.keys(attendanceState).map(studentId => ({
      studentId: Number(studentId),
      isPresent: attendanceState[Number(studentId)].isPresent,
      remarks: attendanceState[Number(studentId)].remarks
    }))

    if (entries.length === 0) {
      toast.error('No students to mark')
      return
    }

    saveMut.mutate({
      classId: Number(form.classId),
      sectionId: Number(form.sectionId),
      date: form.date,
      entries
    })
  }

  return (
    <div>
      <div className="filter-bar" style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, marginRight: 'auto' }}>Attendance</h2>
        
        <input 
          type="date" 
          className="form-control" 
          value={form.date} 
          onChange={e => setForm({ ...form, date: e.target.value })} 
        />

        <select className="form-control" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value, sectionId: '' })}>
          <option value="">Select Class...</option>
          {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select className="form-control" value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })}>
          <option value="">Select Section...</option>
          {sections?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <button className="btn btn-primary" onClick={handleLoadStudents} disabled={!sheetData}>
          Load Sheet
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {isLoading && form.sectionId ? (
            <div className="empty-state">Loading...</div>
          ) : !sheetData || Object.keys(attendanceState).length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>📋</div>
              <p>Select a class and section, then click "Load Sheet" to mark attendance.</p>
            </div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetData.map((s: any) => {
                    const state = attendanceState[s.studentId]
                    if (!state) return null
                    
                    return (
                      <tr key={s.studentId}>
                        <td>{s.roll}</td>
                        <td><strong>{s.studentName}</strong></td>
                        <td>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button 
                              className={`btn btn-sm ${state.isPresent ? 'btn-primary' : 'btn-ghost'}`}
                              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                              onClick={() => setAttendanceState(prev => ({ ...prev, [s.studentId]: { ...prev[s.studentId], isPresent: true } }))}
                            >
                              <CheckCircle size={14} /> Present
                            </button>
                            <button 
                              className={`btn btn-sm ${!state.isPresent ? 'btn-danger' : 'btn-ghost'}`}
                              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                              onClick={() => setAttendanceState(prev => ({ ...prev, [s.studentId]: { ...prev[s.studentId], isPresent: false } }))}
                            >
                              <XCircle size={14} /> Absent
                            </button>
                          </div>
                        </td>
                        <td>
                          <input 
                            className="form-control" 
                            placeholder="Optional remarks" 
                            value={state.remarks} 
                            onChange={e => setAttendanceState(prev => ({ ...prev, [s.studentId]: { ...prev[s.studentId], remarks: e.target.value } }))}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ padding: 20, borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saveMut.isPending}>
                  <Save size={15} style={{ marginRight: 8 }} /> Save Attendance
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
