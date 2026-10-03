import api from '@/lib/api'

// ─── Students ────────────────────────────────────────────────────────────────
export const studentApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/students', { params }),
  getById: (id: number) => api.get(`/students/${id}`),
  create: (data: unknown) => api.post('/students', data),
  update: (id: number, data: unknown) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  promote: (data: unknown) => api.post('/students/promote', data),
}

// ─── Teachers ────────────────────────────────────────────────────────────────
export const teacherApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/teachers', { params }),
  getById: (id: number) => api.get(`/teachers/${id}`),
  create: (data: unknown) => api.post('/teachers', data),
  update: (id: number, data: unknown) => api.put(`/teachers/${id}`, data),
  delete: (id: number) => api.delete(`/teachers/${id}`),
}

// ─── Parents ─────────────────────────────────────────────────────────────────
export const parentApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/parents', { params }),
  getById: (id: number) => api.get(`/parents/${id}`),
  create: (data: unknown) => api.post('/parents', data),
  update: (id: number, data: unknown) => api.put(`/parents/${id}`, data),
  delete: (id: number) => api.delete(`/parents/${id}`),
}

// ─── Classes ─────────────────────────────────────────────────────────────────
export const classApi = {
  getAll: () => api.get('/classes'),
  create: (data: unknown) => api.post('/classes', data),
  update: (id: number, data: unknown) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
}

// ─── Sections ────────────────────────────────────────────────────────────────
export const sectionApi = {
  getAll: (classId?: number) => api.get('/sections', { params: { classId } }),
  create: (data: unknown) => api.post('/sections', data),
  update: (id: number, data: unknown) => api.put(`/sections/${id}`, data),
  delete: (id: number) => api.delete(`/sections/${id}`),
}

// ─── Subjects ────────────────────────────────────────────────────────────────
export const subjectApi = {
  getAll: (classId?: number) => api.get('/subjects', { params: { classId } }),
  create: (data: unknown) => api.post('/subjects', data),
  update: (id: number, data: unknown) => api.put(`/subjects/${id}`, data),
  delete: (id: number) => api.delete(`/subjects/${id}`),
}

// ─── Class Routines ───────────────────────────────────────────────────────────
export const routineApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/class-routines', { params }),
  create: (data: unknown) => api.post('/class-routines', data),
  update: (id: number, data: unknown) => api.put(`/class-routines/${id}`, data),
  delete: (id: number) => api.delete(`/class-routines/${id}`),
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  getSheet: (classId: number, sectionId: number, month: number, year: number) =>
    api.get('/attendance/sheet', { params: { classId, sectionId, month, year } }),
  getByStudent: (studentId: number) => api.get(`/attendance/student/${studentId}`),
  mark: (data: unknown) => api.post('/attendance', data),
}

// ─── Exams ────────────────────────────────────────────────────────────────────
export const examApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/exams', { params }),
  getById: (id: number) => api.get(`/exams/${id}`),
  create: (data: unknown) => api.post('/exams', data),
  update: (id: number, data: unknown) => api.put(`/exams/${id}`, data),
  delete: (id: number) => api.delete(`/exams/${id}`),
}

// ─── Exam Grades ──────────────────────────────────────────────────────────────
export const gradeApi = {
  getByExam: (examId: number) => api.get(`/exam-grades/exam/${examId}`),
  getByStudent: (studentId: number) => api.get(`/exam-grades/student/${studentId}`),
  bulkCreate: (data: unknown) => api.post('/exam-grades', data),
  update: (id: number, data: unknown) => api.put(`/exam-grades/${id}`, data),
  delete: (id: number) => api.delete(`/exam-grades/${id}`),
}

// ─── Fees ─────────────────────────────────────────────────────────────────────
export const feeApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/fees', { params }),
  getById: (id: number) => api.get(`/fees/${id}`),
  create: (data: unknown) => api.post('/fees', data),
  update: (id: number, data: unknown) => api.put(`/fees/${id}`, data),
  delete: (id: number) => api.delete(`/fees/${id}`),
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const expenseApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/expenses', { params }),
  create: (data: unknown) => api.post('/expenses', data),
  update: (id: number, data: unknown) => api.put(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
}

// ─── Teacher Payments ─────────────────────────────────────────────────────────
export const teacherPaymentApi = {
  getAll: (teacherId?: number) => api.get('/teacher-payments', { params: { teacherId } }),
  create: (data: unknown) => api.post('/teacher-payments', data),
  update: (id: number, data: unknown) => api.put(`/teacher-payments/${id}`, data),
  delete: (id: number) => api.delete(`/teacher-payments/${id}`),
}

// ─── Transport ────────────────────────────────────────────────────────────────
export const transportApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/transport', { params }),
  create: (data: unknown) => api.post('/transport', data),
  update: (id: number, data: unknown) => api.put(`/transport/${id}`, data),
  delete: (id: number) => api.delete(`/transport/${id}`),
}

// ─── Notices ──────────────────────────────────────────────────────────────────
export const noticeApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/notices', { params }),
  create: (data: unknown) => api.post('/notices', data),
  update: (id: number, data: unknown) => api.put(`/notices/${id}`, data),
  delete: (id: number) => api.delete(`/notices/${id}`),
}

// ─── Super Admin: Tenants ──────────────────────────────────────────────────────
export const tenantApi = {
  getAll: () => api.get('/tenants'),
  getById: (id: number) => api.get(`/tenants/${id}`),
  getStats: () => api.get('/tenants/stats'),
  create: (data: unknown) => api.post('/tenants', data),
  update: (id: number, data: unknown) => api.put(`/tenants/${id}`, data),
  delete: (id: number) => api.delete(`/tenants/${id}`),
  getPermissions: (id: number) => api.get(`/tenants/${id}/permissions`),
  setPermissions: (id: number, permissionNames: string[]) => api.post(`/tenants/${id}/permissions`, { permissionNames }),
  grantPermissions: (id: number, data: unknown) => api.post(`/tenants/${id}/permissions`, data),
  revokePermission: (id: number, permissionName: string) => api.delete(`/tenants/${id}/permissions/${permissionName}`),
}

// ─── Super Admin: Exception Logs ───────────────────────────────────────────────
export const exceptionLogApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/exceptionlogs', { params }),
  getById: (id: number) => api.get(`/exceptionlogs/${id}`),
  resolve: (id: number, data: unknown) => api.patch(`/exceptionlogs/${id}/resolve`, data),
  clearResolved: () => api.delete('/exceptionlogs/resolved'),
}

// ─── Admin: Users ─────────────────────────────────────────────────────────────
export const userApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: unknown) => api.post('/users', data),
  update: (id: string, data: unknown) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  assignRole: (userId: string, roleName: string) => api.post(`/users/${userId}/role`, { roleName }),
  assignRoles: (userId: string, roleNames: string[]) => api.post(`/users/${userId}/roles`, roleNames),
  getUserRoles: (userId: string) => api.get(`/users/${userId}/roles`),
}

// ─── Admin: Roles ─────────────────────────────────────────────────────────────
export const roleApi = {
  getAll: () => api.get('/roles'),
  getById: (id: string) => api.get(`/roles/${id}`),
  create: (data: unknown) => api.post('/roles', data),
  update: (id: string, data: unknown) => api.put(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
  assignPermissions: (roleId: string, permissions: string[]) => api.post(`/roles/${roleId}/permissions`, permissions),
  getRolePermissions: (roleId: string) => api.get(`/roles/${roleId}/permissions`),
}

// ─── Admin: Permissions ───────────────────────────────────────────────────────
export const permissionApi = {
  getAll: () => api.get('/permissions'),
}

// ─── Super Admin: CMS & System Settings ───────────────────────────────────────
export const cmsApi = {
  getPublic: () => api.get('/cms/public'),
  getSettings: () => api.get('/cms/settings'),
  updateSettings: (data: unknown) => api.put('/cms/settings', data),
}
