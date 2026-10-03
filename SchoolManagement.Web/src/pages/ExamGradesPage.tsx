import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examApi, gradeApi, studentApi } from '@/lib/services'
import { Save, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExamGradesPage() {
  const qc = useQueryClient()
  const [selectedExamId, setSelectedExamId] = useState('')
  const [gradesState, setGradesState] = useState<Record<number, { id?: number, marksObtained: number | string, grade: string, remarks: string }>>({})

  // Fetch all exams for dropdown
  const { data: examsData } = useQuery({ queryKey: ['exams', '', 1], queryFn: () => examApi.getAll({ page: 1, pageSize: 1000 }).then(r => r.data) })
  const exams = examsData?.data ?? []

  // Fetch specific exam details
  const { data: currentExam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', selectedExamId],
    queryFn: () => examApi.getById(Number(selectedExamId)).then(r => r.data),
    enabled: !!selectedExamId
  })

  const [filterBySectionOnly, setFilterBySectionOnly] = useState(true)

  // Fetch students for the exam's class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-list', currentExam?.classId],
    queryFn: () => studentApi.getAll({ classId: currentExam?.classId, page: 1, pageSize: 1000 }).then(r => r.data),
    enabled: !!currentExam?.classId
  })

  const rawStudents = studentsData?.data ?? []

  // Filter students with multi-level section matching and fallback
  const students = useMemo(() => {
    if (!rawStudents.length) return []
    if (!currentExam?.sectionId || !filterBySectionOnly) return rawStudents

    const filtered = rawStudents.filter((s: any) => {
      // 1. Direct sectionId match
      if (s.sectionId != null && s.sectionId !== 0) {
        return s.sectionId === currentExam.sectionId
      }
      // 2. Section name match (handling "A", "Section A", etc.)
      if (s.sectionName && currentExam.sectionName) {
        const cleanS = s.sectionName.replace(/section/i, '').trim().toLowerCase()
        const cleanE = currentExam.sectionName.replace(/section/i, '').trim().toLowerCase()
        if (cleanS === cleanE || s.sectionName.trim().toLowerCase() === currentExam.sectionName.trim().toLowerCase()) {
          return true
        }
      }
      return false
    })

    // If section filtering gave 0 students but the class has students, return all class students as fallback
    return filtered.length > 0 ? filtered : rawStudents
  }, [rawStudents, currentExam, filterBySectionOnly])

  // Fetch existing grades for this exam
  const { data: existingGrades, isLoading: gradesLoading } = useQuery({
    queryKey: ['grades', selectedExamId],
    queryFn: () => gradeApi.getByExam(Number(selectedExamId)).then(r => r.data),
    enabled: !!selectedExamId
  })

  useEffect(() => {
    if (students.length > 0) {
      const newState: Record<number, any> = {}
      students.forEach((s: any) => {
        const eg = existingGrades?.find((g: any) => g.studentId === s.id)
        if (eg) {
          newState[s.id] = { id: eg.id, marksObtained: eg.marksObtained, grade: eg.grade || '', remarks: eg.remarks || '' }
        } else {
          newState[s.id] = { marksObtained: '', grade: '', remarks: '' }
        }
      })
      setGradesState(newState)
    }
  }, [students, existingGrades])

  const bulkCreateMut = useMutation({
    mutationFn: (payload: any) => gradeApi.bulkCreate(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['grades'] }) }
  })
  
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => gradeApi.update(id, data),
  })

  const handleSave = async () => {
    const toCreate = []
    const toUpdate = []

    for (const studentId of Object.keys(gradesState)) {
      const state = gradesState[Number(studentId)]
      if (state.marksObtained !== '') {
        if (state.id) {
          // Check if changed compared to existing (optional optimization, but we can just update)
          toUpdate.push({ id: state.id, data: { examId: Number(selectedExamId), studentId: Number(studentId), marksObtained: Number(state.marksObtained), grade: state.grade, remarks: state.remarks } })
        } else {
          toCreate.push({ studentId: Number(studentId), marksObtained: Number(state.marksObtained), grade: state.grade, remarks: state.remarks })
        }
      }
    }

    try {
      const promises = []
      if (toCreate.length > 0) {
        promises.push(bulkCreateMut.mutateAsync({ examId: Number(selectedExamId), grades: toCreate }))
      }
      for (const update of toUpdate) {
        promises.push(updateMut.mutateAsync(update))
      }

      if (promises.length > 0) {
        await Promise.all(promises)
        toast.success('Grades saved successfully!')
        qc.invalidateQueries({ queryKey: ['grades', selectedExamId] })
      } else {
        toast.error('No grades entered to save')
      }
    } catch (err) {
      toast.error('Failed to save some grades')
    }
  }

  return (
    <div>
      <div className="filter-bar" style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, marginRight: 'auto' }}>Exam Grades</h2>
        
        <select className="form-control" style={{ width: 300 }} value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)}>
          <option value="">Select Exam...</option>
          {exams?.map((e: any) => <option key={e.id} value={e.id}>{e.examName} ({e.className} {e.sectionName}) - {e.subjectName}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {!selectedExamId ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>🎓</div>
              <p>Select an exam to enter grades.</p>
            </div>
          ) : (examLoading || studentsLoading || gradesLoading) ? (
             <div className="loader"><div className="spinner" /></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <p>No students found for this exam's class ({currentExam?.className || 'Class'}).</p>
              <p className="empty-state-sub" style={{ marginTop: 4 }}>
                {rawStudents.length > 0
                  ? `There are ${rawStudents.length} students in this class, but none matched section ${currentExam?.sectionName}.`
                  : 'Ensure students are enrolled in this class from the Students module.'}
              </p>
              {rawStudents.length > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => setFilterBySectionOnly(false)}
                >
                  Show all {rawStudents.length} students of {currentExam?.className}
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ padding: '10px 16px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-1)' }}>
                  Showing <strong>{students.length}</strong> students for {currentExam?.className} {currentExam?.sectionName ? `(Section ${currentExam.sectionName})` : ''}
                </div>
                {currentExam?.sectionId && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setFilterBySectionOnly(v => !v)}
                    style={{ fontSize: 11 }}
                  >
                    {filterBySectionOnly ? `Show all students from ${currentExam?.className}` : `Filter by Section ${currentExam?.sectionName} only`}
                  </button>
                )}
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Section</th>
                    <th>Marks (out of {currentExam?.totalMarks || 100})</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s: any) => {
                    const state = gradesState[s.id] || { marksObtained: '', grade: '', remarks: '' }
                    return (
                      <tr key={s.id}>
                        <td>{s.roll ?? s.rollNumber ?? '—'}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>
                          <span className="badge" style={{ fontSize: 11 }}>
                            {s.sectionName || '—'}
                          </span>
                        </td>
                        <td>
                          <input 
                            type="number"
                            className="form-control" 
                            style={{ width: 100 }}
                            value={state.marksObtained} 
                            onChange={e => setGradesState(prev => ({ ...prev, [s.id]: { ...prev[s.id], marksObtained: e.target.value } }))}
                          />
                        </td>
                        <td>
                          <input 
                            className="form-control" 
                            style={{ width: 100 }}
                            placeholder="e.g. A+"
                            value={state.grade} 
                            onChange={e => setGradesState(prev => ({ ...prev, [s.id]: { ...prev[s.id], grade: e.target.value } }))}
                          />
                        </td>
                        <td>
                          <input 
                            className="form-control" 
                            placeholder="Optional remarks" 
                            value={state.remarks} 
                            onChange={e => setGradesState(prev => ({ ...prev, [s.id]: { ...prev[s.id], remarks: e.target.value } }))}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ padding: 20, borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={bulkCreateMut.isPending || updateMut.isPending}>
                  <Save size={15} style={{ marginRight: 8 }} /> {bulkCreateMut.isPending || updateMut.isPending ? 'Saving...' : 'Save Grades'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
