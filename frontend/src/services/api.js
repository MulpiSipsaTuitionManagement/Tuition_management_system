import axios from '../config/axios';

export const authAPI = {
  login: (credentials) => axios.post('/auth/login', credentials),
  logout: () => axios.post('/auth/logout'),
  me: () => axios.get('/auth/me'),
  refresh: () => axios.post('/auth/refresh'),
};

export const adminAPI = {
  createUser: (data) => axios.post('/admin/create-user', data),
  updateUser: (id, data) => axios.put(`/admin/update-user/${id}`, data),
  deleteUser: (id) => axios.delete(`/admin/delete-user/${id}`),
  getDashboardStats: () => axios.get('/admin/dashboard-stats'),
};

export const studentAPI = {
  getAll: (params) => axios.get('/students', { params }),
  getById: (id) => axios.get(`/students/${id}`),
  getProfile: () => axios.get('/student/profile'),
  getAttendanceSummary: (id) => axios.get(`/students/${id}/attendance-summary`),
  getEnrolledClasses: (id) => axios.get(`/students/${id}/enrolled-classes`),
  getClassSchedule: (id) => axios.get(`/students/${id}/schedule`),
  updateProfile: (id, data) => axios.put(`/students/${id}/profile`, data),
  getStats: () => axios.get('/students/stats'),
};

export const tutorAPI = {
  getAll: (params) => axios.get('/tutors', { params }),
  getById: (id) => axios.get(`/tutors/${id}`),
  getProfile: () => axios.get('/tutor/profile'),
  getMyClasses: (params) => axios.get('/tutor/classes', { params }),
  getTodayClasses: () => axios.get('/tutor/classes/today'),
  updateProfile: (id, data) => axios.put(`/tutors/${id}/profile`, data),
  getStats: (id) => axios.get(`/tutors/${id}/stats`),
  getAllStats: () => axios.get('/tutors/stats'),
};

export const attendanceAPI = {
  mark: (data) => axios.post('/attendance/mark', data),
  getByClass: (classId, params) => axios.get(`/attendance/class/${classId}`, { params }),
  getStudentAttendance: (studentId, params) => axios.get(`/attendance/student/${studentId}`, { params }),
  getWeeklyStats: () => axios.get('/attendance/weekly-stats'),
};

export const classAPI = {
  getAll: (params) => axios.get('/classes', { params }),
  getById: (id) => axios.get(`/classes/${id}`),
  create: (data) => axios.post('/classes', data),
  update: (id, data) => axios.put(`/classes/${id}`, data),
  delete: (id) => axios.delete(`/classes/${id}`),
  reschedule: (id, data) => axios.post(`/classes/${id}/reschedule`, data),
  cancel: (id, data) => axios.post(`/classes/${id}/cancel`, data),
  getTodayClasses: () => axios.get('/classes/today'),
  getUpcomingClasses: (params) => axios.get('/classes/upcoming', { params }),
  getStudentClasses: () => axios.get('/student/classes'),
  getTutorClasses: () => axios.get('/tutor/classes'),
  enrollStudent: (classId, data) => axios.post(`/classes/${classId}/enroll`, data),
  removeStudent: (classId, studentId) => axios.delete(`/classes/${classId}/students/${studentId}`),
};

export const feeAPI = {
  getAll: (params) => axios.get('/fees', { params }),
  create: (data) => axios.post('/fees', data),
  update: (id, data) => axios.put(`/fees/${id}`, data),
  delete: (id) => axios.delete(`/fees/${id}`),
  recordPayment: (id, data) => axios.post(`/fees/${id}/payment`, data),
  getPending: () => axios.get('/fees/pending'),
  getStudentFees: () => axios.get('/student/fees'),
  getStudentFeeHistory: (studentId) => axios.get(`/students/${studentId}/fees`),
  sendReminders: () => axios.post('/fees/send-reminders'),
  getCollectionStats: (params) => axios.get('/fees/collection-stats', { params }),
  bulkCreate: (data) => axios.post('/fees/bulk-create', data),
};

export const salaryAPI = {
  getAll: (params) => axios.get('/salaries', { params }),
  create: (data) => axios.post('/salaries', data),
  update: (id, data) => axios.put(`/salaries/${id}`, data),
  delete: (id) => axios.delete(`/salaries/${id}`),
  markAsPaid: (id, data) => axios.post(`/salaries/${id}/mark-paid`, data),
  getTutorSalaries: () => axios.get('/tutor/salaries'),
  getTutorHistory: (tutorId) => axios.get(`/tutors/${tutorId}/salaries`),
  getPending: () => axios.get('/salaries/pending'),
  getStats: (params) => axios.get('/salaries/stats', { params }),
  generateMonthly: (data) => axios.post('/salaries/generate-monthly', data),
  bulkMarkPaid: (data) => axios.post('/salaries/bulk-mark-paid', data),
};

export const studyMaterialAPI = {
  getAll: (params) => axios.get('/study-materials', { params }),
  getById: (id) => axios.get(`/study-materials/${id}`),
  upload: (formData) => axios.post('/study-materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => axios.put(`/study-materials/${id}`, data),
  delete: (id) => axios.delete(`/study-materials/${id}`),
  download: (id) => axios.get(`/study-materials/${id}/download`, { responseType: 'blob' }),
  getByClass: (classId) => axios.get(`/study-materials/class/${classId}`),
  getBySubject: (params) => axios.get('/study-materials/subject', { params }),
  getByGrade: (params) => axios.get('/study-materials/grade', { params }),
  getMyUploads: (params) => axios.get('/study-materials/my-uploads', { params }),
  getRecent: (params) => axios.get('/study-materials/recent', { params }),
  getStats: () => axios.get('/study-materials/stats'),
  bulkDelete: (data) => axios.post('/study-materials/bulk-delete', data),
};

export const notificationAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  getById: (id) => axios.get(`/notifications/${id}`),
  create: (data) => axios.post('/notifications', data),
  send: (id) => axios.post(`/notifications/${id}/send`),
  sendPending: () => axios.post('/notifications/send-pending'),
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),
  delete: (id) => axios.delete(`/notifications/${id}`),
  getMy: (params) => axios.get('/notifications/my', { params }),
  getUnreadCount: () => axios.get('/notifications/unread-count'),
  getStats: () => axios.get('/notifications/stats'),
  bulkSend: (data) => axios.post('/notifications/bulk-send', data),
};