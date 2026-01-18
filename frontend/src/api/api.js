import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';
const API_BASE_URL = `${BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only reload if it's a 401 and NOT from a login request
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const API = {
  auth: {
    login: async (username, password) => {
      const response = await axiosInstance.post('/auth/login', { username, password });
      return response.data;
    },
    logout: async () => {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    me: async () => {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    }
  },

  admin: {
    createUser: async (data) => (await axiosInstance.post('/admin/users', data)).data,
    deleteUser: async (id) => (await axiosInstance.delete(`/admin/users/${id}`)).data,
    getDashboardStats: async () => (await axiosInstance.get('/admin/stats')).data,
  },

  classes: {
    getAll: async () => (await axiosInstance.get('/classes')).data,
    getById: async (id) => (await axiosInstance.get(`/classes/${id}`)).data,
    create: async (data) => (await axiosInstance.post('/classes', data)).data,
    update: async (id, data) => (await axiosInstance.put(`/classes/${id}`, data)).data,
    delete: async (id) => (await axiosInstance.delete(`/classes/${id}`)).data,
  },

  subjects: {
    getAll: async (query = '') => (await axiosInstance.get(`/subjects${query}`)).data,
    getById: async (id) => (await axiosInstance.get(`/subjects/${id}`)).data,
    create: async (data) => (await axiosInstance.post('/subjects', data)).data,
    update: async (id, data) => (await axiosInstance.put(`/subjects/${id}`, data)).data,
    delete: async (id) => (await axiosInstance.delete(`/subjects/${id}`)).data,
  },

  schedules: {
    getAll: async (params = {}) => (await axiosInstance.get('/schedules', { params })).data,
    getById: async (id) => (await axiosInstance.get(`/schedules/${id}`)).data,
    getOptions: async () => (await axiosInstance.get('/schedules/options')).data,
    create: async (data) => (await axiosInstance.post('/schedules', data)).data,
    update: async (id, data) => (await axiosInstance.put(`/schedules/${id}`, data)).data,
    delete: async (id) => (await axiosInstance.delete(`/schedules/${id}`)).data,
  },

  students: {
    getAll: async (params = {}) => (await axiosInstance.get('/students', { params })).data,
    getById: async (id) => (await axiosInstance.get(`/students/${id}`)).data,
    update: async (id, data) => {
      const isFormData = data instanceof FormData;
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      return (await axiosInstance.post(`/students/${id}`, data, config)).data;
    },
    enroll: async (id, subjectIds) => (await axiosInstance.post(`/students/${id}/enroll`, { subject_ids: subjectIds })).data,
    getTimetable: async (id) => (await axiosInstance.get(`/students/${id}/timetable`)).data,
    getMyTimetable: async () => (await axiosInstance.get('/student/timetable')).data,
    getStats: async () => (await axiosInstance.get('/students/stats')).data,
  },

  tutors: {
    getAll: async (params = {}) => (await axiosInstance.get('/tutors', { params })).data,
    getById: async (id) => (await axiosInstance.get(`/tutors/${id}`)).data,
    update: async (id, data) => {
      // Handle FormData for file uploads
      const isFormData = data instanceof FormData;
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      return (await axiosInstance.post(`/tutors/${id}`, data, config)).data;
    },
    delete: async (id) => (await axiosInstance.delete(`/tutors/${id}`)).data,
  },

  attendance: {
    mark: async (data) => (await axiosInstance.post('/attendance/mark', data)).data,
    getBySchedule: async (scheduleId) => (await axiosInstance.get(`/attendance/schedule/${scheduleId}`)).data,
    getAnalytics: async () => (await axiosInstance.get('/attendance/analytics')).data,
    getStudentSummary: async (id = '') => (await axiosInstance.get(`/attendance/student-summary/${id}`)).data,
  },

  fees: {
    getAll: async (params = {}) => (await axiosInstance.get('/fees', { params })).data,
    getStudentFees: async (params = {}) => (await axiosInstance.get('/student/fees', { params })).data,
    create: async (data) => (await axiosInstance.post('/fees', data)).data,
    update: async (id, data) => (await axiosInstance.put(`/fees/${id}`, data)).data,
    generate: async (data) => (await axiosInstance.post('/fees/generate', data)).data,
    markPaid: async (id) => (await axiosInstance.post(`/fees/${id}/pay`)).data,
    remind: async (id) => (await axiosInstance.post(`/fees/${id}/remind`)).data,
  },

  salaries: {
    // ... existed methods ...
    getAll: async (params = {}) => (await axiosInstance.get('/salaries', { params })).data,
    getById: async (id) => (await axiosInstance.get(`/salaries/${id}`)).data,
    getTutorSalaries: async () => (await axiosInstance.get('/tutor/salaries')).data,
    create: async (data) => (await axiosInstance.post('/salaries', data)).data,
    update: async (id, data) => (await axiosInstance.put(`/salaries/${id}`, data)).data,
    generate: async (data) => (await axiosInstance.post('/salaries/generate', data)).data,
    markPaid: async (id) => (await axiosInstance.post(`/salaries/${id}/pay`)).data,
  },

  materials: {
    getAll: async (params = {}) => (await axiosInstance.get('/study-materials', { params })).data,
    getOptions: async () => (await axiosInstance.get('/study-materials/options')).data,
    upload: async (data) => {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      return (await axiosInstance.post('/study-materials/upload', data, config)).data;
    },
    download: async (id) => {
      const response = await axiosInstance.get(`/study-materials/download/${id}`, { responseType: 'blob' });
      return response.data;
    },
    delete: async (id) => (await axiosInstance.delete(`/study-materials/${id}`)).data,
  },

  announcements: {
    getAll: async () => (await axiosInstance.get('/announcements')).data,
    getById: async (id) => (await axiosInstance.get(`/announcements/${id}`)).data,
    create: async (data) => (await axiosInstance.post('/announcements', data)).data,
    delete: async (id) => (await axiosInstance.delete(`/announcements/${id}`)).data,
  },

  notifications: {
    getAll: async () => (await axiosInstance.get('/notifications')).data,
    getMy: async () => (await axiosInstance.get('/notifications/my')).data,
    getUnreadCount: async () => (await axiosInstance.get('/notifications/unread-count')).data,
    markAsRead: async (id) => (await axiosInstance.post(`/notifications/${id}/read`)).data,
  }
};