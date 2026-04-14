/**
 * Zustand Store for Global State Management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from '@zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  studentId?: string;
  staffId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Student Store
interface StudentState {
  profile: any | null;
  courses: any[];
  grades: any[];
  timetable: any[];
  setProfile: (profile: any) => void;
  setCourses: (courses: any[]) => void;
  setGrades: (grades: any[]) => void;
  setTimetable: (timetable: any[]) => void;
}

export const useStudentStore = create<StudentState>()((set) => ({
  profile: null,
  courses: [],
  grades: [],
  timetable: [],
  setProfile: (profile) => set({ profile }),
  setCourses: (courses) => set({ courses }),
  setGrades: (grades) => set({ grades }),
  setTimetable: (timetable) => set({ timetable }),
}));

// Finance Store
interface FinanceState {
  feeStructure: any | null;
  payments: any[];
  pendingPayments: any[];
  setFeeStructure: (fee: any) => void;
  setPayments: (payments: any[]) => void;
  addPayment: (payment: any) => void;
}

export const useFinanceStore = create<FinanceState>()((set) => ({
  feeStructure: null,
  payments: [],
  pendingPayments: [],
  setFeeStructure: (feeStructure) => set({ feeStructure }),
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) =>
    set((state) => ({ payments: [...state.payments, payment] })),
}));

// Notification Store
interface NotificationState {
  notifications: any[];
  unreadCount: number;
  addNotification: (notification: any) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      primaryColor: '#0066CC',
      setTheme: (theme) => set({ theme }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Chatbot Store
interface ChatbotState {
  conversations: any[];
  currentConversation: any | null;
  addConversation: (conversation: any) => void;
  setCurrentConversation: (conversation: any) => void;
  addMessage: (conversationId: string, message: any) => void;
}

export const useChatbotStore = create<ChatbotState>()((set) => ({
  conversations: [],
  currentConversation: null,
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  setCurrentConversation: (currentConversation) => set({ currentConversation }),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c
      ),
    })),
}));