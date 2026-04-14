import { Injectable } from '@nestjs/common';
import { Tenant } from '../../tenants/tenant.entity';

export interface DashboardMetric {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EnrollmentData {
  month: string;
  year: number;
  applications: number;
  admissions: number;
  enrollments: number;
}

export interface RevenueData {
  month: string;
  expected: number;
  collected: number;
  pending: number;
}

export interface PerformanceData {
  label: string;
  value: number;
}

@Injectable()
export class AnalyticsService {
  
  // ============== EXECUTIVE DASHBOARD ==============

  async getExecutiveDashboard(tenantId?: string): Promise<{
    enrollment: { total: number; change: number };
    revenue: { total: number; collected: number; pending: number };
    academics: { avgGpa: number; passRate: number; atRisk: number };
    attendance: { avgAttendance: number; concerns: number };
  }> {
    // Simulated data - in production, aggregate from database
    return {
      enrollment: { total: 5420, change: 12.5 },
      revenue: { total: 125000000, collected: 98000000, pending: 27000000 },
      academics: { avgGpa: 3.2, passRate: 87.5, atRisk: 156 },
      attendance: { avgAttendance: 89.2, concerns: 23 }
    };
  }

  async getEnrollmentAnalytics(tenantId?: string, year?: number): Promise<EnrollmentData[]> {
    const currentYear = year || new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map(month => ({
      month,
      year: currentYear,
      applications: Math.floor(Math.random() * 200) + 50,
      admissions: Math.floor(Math.random() * 150) + 30,
      enrollments: Math.floor(Math.random() * 100) + 20
    }));
  }

  async getRevenueAnalytics(tenantId?: string): Promise<RevenueData[]> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const expected = Math.floor(Math.random() * 30000000) + 10000000;
      const collected = expected * (0.7 + Math.random() * 0.3);
      return {
        month,
        expected,
        collected: Math.floor(collected),
        pending: expected - Math.floor(collected)
      };
    });
  }

  // ============== ACADEMIC ANALYTICS ==============

  async getDepartmentPerformance(tenantId?: string): Promise<PerformanceData[]> {
    return [
      { label: 'Computer Science', value: 88.5 },
      { label: 'Engineering', value: 82.3 },
      { label: 'Business Admin', value: 79.8 },
      { label: 'Mathematics', value: 85.2 },
      { label: 'Physics', value: 81.7 }
    ];
  }

  async getCoursePerformance(tenantId?: string, sessionId?: string): Promise<any[]> {
    return [
      { course: 'CSC101', title: 'Intro to Computing', enrollment: 245, avgScore: 72.5, passRate: 89 },
      { course: 'MTH101', title: 'Calculus I', enrollment: 198, avgScore: 65.2, passRate: 78 },
      { course: 'ENG101', title: 'Technical Writing', enrollment: 156, avgScore: 78.3, passRate: 92 }
    ];
  }

  async getStudentPerformanceDistribution(tenantId?: string): Promise<any> {
    return {
      excellent: 15, // 4.0 GPA
      good: 35,      // 3.0-3.9
      average: 30,   // 2.0-2.9
      belowAverage: 15, // < 2.0
      atRisk: 5     // < 1.0
    };
  }

  // ============== ATTENDANCE ANALYTICS ==============

  async getAttendanceTrends(tenantId?: string, weeks: number = 8): Promise<any[]> {
    const data = [];
    for (let i = weeks; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      data.push({
        week: `Week ${weeks - i + 1}`,
        date: date.toISOString().split('T')[0],
        avgAttendance: 85 + Math.random() * 10,
        absences: Math.floor(Math.random() * 50) + 10
      });
    }
    return data;
  }

  // ============== DEMOGRAPHIC ANALYTICS ==============

  async getStudentDemographics(tenantId?: string): Promise<{
    gender: { male: number; female: number };
    level: { [key: string]: number };
    state: { [key: string]: number };
  }> {
    return {
      gender: { male: 2850, female: 2570 },
      level: { '100L': 1200, '200L': 1100, '300L': 980, '400L': 850, '500L': 650 },
      state: { 'Lagos': 850, 'Kano': 620, 'Ibadan': 480, 'Abuja': 420, 'Others': 3050 }
    };
  }

  // ============== FINANCIAL ANALYTICS ==============

  async getFeeCollectionRate(tenantId?: string): Promise<{ rate: number; trend: 'up' | 'down' }> {
    return { rate: 78.5, trend: 'up' };
  }

  async getOutstandingFees(tenantId?: string): Promise<{ total: number; byCategory: { [key: string]: number } }> {
    return {
      total: 27000000,
      byCategory: { tuition: 18000000, accommodation: 5000000, other: 4000000 }
    };
  }

  // ============== RETENTION ANALYTICS ==============

  async getRetentionRate(tenantId?: string): Promise<{ rate: number; year: number }> {
    return { rate: 89.2, year: new Date().getFullYear() };
  }

  async getDropoutAnalysis(tenantId?: string): Promise<{ reasons: { reason: string; count: number }[] }> {
    return {
      reasons: [
        { reason: 'Financial difficulties', count: 45 },
        { reason: 'Academic issues', count: 32 },
        { reason: 'Health issues', count: 18 },
        { reason: 'Personal reasons', count: 25 },
        { reason: 'Employment', count: 15 }
      ]
    };
  }

  // ============== REPORT GENERATION ==============

  async generateReport(type: string, filters: any, tenantId?: string): Promise<{ url: string; expiresAt: Date }> {
    // In production, generate PDF/Excel and upload to storage
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    
    return {
      url: `/reports/${type}_${Date.now()}.pdf`,
      expiresAt: expires
    };
  }
}