import { useState, useEffect } from 'react'
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
  const { data: currentExam } = useQuery({
    queryKey: ['exam', selectedExamId],
    queryFn: () => examApi.getById(Number(selectedExamId)).then(r => r.data),
    enabled: !!selectedExamId
  })

  // Fetch students for the exam's class
  const { data: studentsData } = useQuery({
    queryKey: ['students-list', currentExam?.classId],
    queryFn: () => studentApi.getAll({ classId: currentExam?.classId, page: 1, pageSize: 1000 }).then(r => r.data),
    enabled: !!currentExam?.classId
  })
  // Filter by section locally if exam has a specific section
  const students = (studentsData?.data ?? []).filter((s: any) => !currentExam?.sectionId || s.sectionId === currentExam.sectionId)

  // Fetch existing grades for this exam
  const { data: existingGrades, isLoading: gradesLoading } = useQuery({
    queryKey: ['grades', selectedExamId],
    queryFn: () => gradeApi.getByExam(Number(selectedExamId)).then(r => r.data),
    enabled: !!selectedExamId
  })

  useEffect(() => {
    if (students.length > 0 && existingGrades) {
      const newState: Record<number, any> = {}
      students.forEach((s: any) => {
        const eg = existingGrades.find((g: any) => g.studentId === s.id)
        if (eg) {
          newState[s.id] = { id: eg.id, marksObtained: eg.marksObtained, grade: eg.grade || '', remarks: eg.remarks || '' }
        } else {
          newState[s.id] = { marksObtained: '', grade: '', remarks: '' }
        }
      })
      setGradesState(newState)
    }
  }, [studentsData, existingGrades])

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
          ) : gradesLoading ? (
             <div className="loader"><div className="spinner" /></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <p>No students found for this exam's class/section.</p>
            </div>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
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
                        <td>{s.rollNumber || '—'}</td>
                        <td><strong>{s.name}</strong></td>
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
