import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens on refresh failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string, mfaCode?: string) =>
    api.post('/auth/login', { email, password, mfaCode }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    tenantId?: string;
  }) => api.post('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  getProfile: () => api.get('/auth/me'),

  enableMfa: (code: string) => api.post('/auth/mfa/enable', { code }),

  disableMfa: () => api.post('/auth/mfa/disable'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// Users API
export const usersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    tenantId?: string;
  }) => api.get('/users', { params }),

  getById: (id: string) => api.get(`/users/${id}`),

  getProfile: () => api.get('/users/me'),

  create: (data: any) => api.post('/users', data),

  update: (id: string, data: any) => api.patch(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),
};

// Tenants API
export const tenantsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/tenants', { params }),

  getById: (id: string) => api.get(`/tenants/${id}`),

  getBySlug: (slug: string) => api.get(`/tenants/slug/${slug}`),

  create: (data: any) => api.post('/tenants', data),

  update: (id: string, data: any) => api.patch(`/tenants/${id}`, data),

  delete: (id: string) => api.delete(`/tenants/${id}`),

  getThemePresets: () => api.get('/tenants/theme-presets'),

  applyTheme: (id: string, presetId: string) =>
    api.post(`/tenants/${id}/theme/apply`, { presetId }),

  getPublicConfig: (slug: string) =>
    api.get(`/tenants/${slug}/config`),
};

// Settings API
export const settingsApi = {
  get: () => api.get('/settings'),

  update: (settings: Record<string, any>) => api.patch('/settings', settings),

  getModules: () => api.get('/settings/modules'),

  updateModules: (modules: Record<string, any>) =>
    api.patch('/settings/modules', modules),

  toggleModule: (moduleName: string, enabled: boolean) =>
    api.patch(`/settings/modules/${moduleName}/toggle`, { enabled }),

  getIntegrations: () => api.get('/settings/integrations'),
};

// Academic API (placeholder)
export const academicApi = {
  getCourses: (params?: any) => api.get('/academic/courses', { params }),
  getCourse: (id: string) => api.get(`/academic/courses/${id}`),
  registerCourse: (data: any) => api.post('/academic/courses/register', data),
  getSchedule: () => api.get('/academic/schedule'),
  getResults: () => api.get('/academic/results'),
  getTranscript: () => api.get('/academic/transcript'),
};

// Finance API (placeholder)
export const financeApi = {
  getFees: () => api.get('/finance/fees'),
  getInvoice: (id: string) => api.get(`/finance/invoices/${id}`),
  makePayment: (data: any) => api.post('/finance/payments', data),
  getPaymentHistory: () => api.get('/finance/payments'),
  getBalance: () => api.get('/finance/balance'),
};

// LMS API (placeholder)
export const lmsApi = {
  getCourses: () => api.get('/lms/courses'),
  getCourse: (id: string) => api.get(`/lms/courses/${id}`),
  getContent: (courseId: string) => api.get(`/lms/courses/${courseId}/content`),
  submitAssignment: (data: any) => api.post('/lms/assignments', data),
  takeQuiz: (quizId: string, answers: any) =>
    api.post(`/lms/quizzes/${quizId}/submit`, answers),
};

// Library API (placeholder)
export const libraryApi = {
  search: (query: string) => api.get(`/library/search?q=${query}`),
  getBook: (id: string) => api.get(`/library/books/${id}`),
  borrow: (bookId: string) => api.post(`/library/borrow`, { bookId }),
  return: (bookId: string) => api.post(`/library/return`, { bookId }),
  getMyBooks: () => api.get('/library/my-books'),
};

export default api;