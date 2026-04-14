/**
 * API Service for Mobile App
 * Handles all communication with backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.edusaas.com.ng'; // Configure for your environment

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            const token = await AsyncStorage.getItem('accessToken');
            if (error.config && token) {
              error.config.headers.Authorization = `Bearer ${token}`;
              return this.api.request(error.config);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      await AsyncStorage.setItem('accessToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await this.api.post('/auth/refresh', { refreshToken });
      if (response.data.accessToken) {
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getCurrentUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Students
  async getStudentProfile() {
    return this.api.get('/students/profile');
  }

  async getCourses() {
    return this.api.get('/students/courses');
  }

  async registerCourse(courseId: string) {
    return this.api.post('/academics/course-registration', { courseIds: [courseId] });
  }

  async getGrades() {
    return this.api.get('/students/grades');
  }

  async getTimetable(sessionId?: string) {
    return this.api.get('/timetable/sessions', { params: { sessionId } });
  }

  // Finance
  async getFeeStructure() {
    return this.api.get('/finance/fee-structure');
  }

  async getPaymentHistory() {
    return this.api.get('/finance/payments');
  }

  async initiatePayment(amount: number, description: string) {
    return this.api.post('/integrations/remita/initiate', {
      amount,
      description,
      paymentType: 'SCHOOL_FEE',
    });
  }

  // Library
  async searchBooks(query: string) {
    return this.api.get('/library/books', { params: { q: query } });
  }

  async getMyBorrowings() {
    return this.api.get('/library/my-borrowings');
  }

  async borrowBook(bookId: string) {
    return this.api.post('/library/borrow', { bookId });
  }

  async renewBook(borrowingId: string) {
    return this.api.post(`/library/renew/${borrowingId}`);
  }

  // LMS
  async getLmsCourses() {
    return this.api.get('/lms/courses');
  }

  async getCourseContent(courseId: string) {
    return this.api.get(`/lms/courses/${courseId}/content`);
  }

  async submitAssignment(courseId: string, assignmentId: string, submission: any) {
    return this.api.post(`/lms/courses/${courseId}/assignments/${assignmentId}/submit`, submission);
  }

  // Announcements
  async getAnnouncements() {
    return this.api.get('/communication/announcements');
  }

  async getMessages() {
    return this.api.get('/communication/messages');
  }

  // AI Chatbot
  async startChatbot(type: string = 'student_support') {
    return this.api.post('/ai/chat/start', { type });
  }

  async sendChatMessage(conversationId: string, message: string) {
    return this.api.post(`/ai/chat/${conversationId}/message`, { message });
  }

  // Hostel
  async getHostelRooms() {
    return this.api.get('/hostel/rooms');
  }

  async applyForHostel(roomId: string) {
    return this.api.post('/hostel/applications', { roomId });
  }
}

export const api = ApiService.getInstance();
export default api;