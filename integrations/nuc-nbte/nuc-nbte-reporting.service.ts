/**
 * NUC/NBTE Reporting Service
 * 
 * Generates required reports for National Universities Commission (NUC)
 * and National Board for Technical Education (NBTE)
 * 
 * Reports include:
 * - Student enrollment statistics
 * - Staff profile data
 * - Course registration reports
 * - Graduation statistics
 * - Institutional data
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/user.entity';
import { AcademicSession } from '../../academics/entities/course.entity';
import { Faculty, Department, Programme } from '../../academics/entities/department.entity';

export interface NucReportConfig {
  institutionCode: string;
  institutionType: 'university' | 'polytechnic';
  reportingPeriod: 'annual' | 'semester';
}

export interface StudentEnrollmentReport {
  sessionId: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  newStudents: number;
  returningStudents: number;
  byLevel: Record<string, { male: number; female: number; total: number }>;
  byFaculty: Record<string, { male: number; female: number; total: number }>;
  byState: Record<string, number>;
}

export interface StaffProfileReport {
  totalStaff: number;
  academic: {
    professors: number;
    associateProfessors: number;
    seniorLecturers: number;
    lecturers: number;
    assistantLecturers: number;
    others: number;
  };
  administrative: number;
  technical: number;
  support: number;
  byFaculty: Record<string, number>;
  qualification: {
    phd: number;
    masters: number;
    bachelor: number;
    others: number;
  };
}

export interface CourseRegistrationReport {
  sessionId: string;
  semester: string;
  totalCourses: number;
  totalRegistrations: number;
  byCourse: {
    code: string;
    title: string;
    enrolled: number;
    passed: number;
    failed: number;
  }[];
}

export interface GraduationReport {
  sessionId: number;
  totalGraduates: number;
  byFaculty: Record<string, number>;
  byDegree: {
    firstClass: number;
    secondClassUpper: number;
    secondClassLower: number;
    pass: number;
  };
  byProgramme: {
    programme: string;
    graduates: number;
  }[];
}

export interface NbteReport {
  reportType: string;
  reportingPeriod: string;
  institutionCode: string;
  data: any;
}

@Injectable()
export class NucNbteReportingService {
  private config: NucReportConfig;
  
  constructor(
    private configService: ConfigService,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AcademicSession)
    private sessionRepository: Repository<AcademicSession>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Programme)
    private programmeRepository: Repository<Programme>,
  ) {
    this.config = {
      institutionCode: this.configService.get('INSTITUTION_CODE', ''),
      institutionType: this.configService.get('INSTITUTION_TYPE', 'university') as 'university' | 'polytechnic',
      reportingPeriod: this.configService.get('REPORTING_PERIOD', 'annual') as 'annual' | 'semester',
    };
  }

  /**
   * Generate comprehensive student enrollment report
   */
  async generateEnrollmentReport(sessionId: string): Promise<StudentEnrollmentReport> {
    const students = await this.studentRepository.find({
      where: { sessionId },
    });
    
    const byLevel: Record<string, { male: number; female: number; total: number }> = {};
    const byFaculty: Record<string, { male: number; female: number; total: number }> = {};
    const byState: Record<string, number> = {};
    
    let totalStudents = 0;
    let maleStudents = 0;
    let femaleStudents = 0;
    let newStudents = 0;
    let returningStudents = 0;
    
    for (const student of students) {
      totalStudents++;
      
      // Gender
      if (student.gender === 'male') {
        maleStudents++;
      } else {
        femaleStudents++;
      }
      
      // By level
      const level = student.level || '100L';
      if (!byLevel[level]) {
        byLevel[level] = { male: 0, female: 0, total: 0 };
      }
      byLevel[level].total++;
      if (student.gender === 'male') {
        byLevel[level].male++;
      } else {
        byLevel[level].female++;
      }
      
      // New vs Returning
      if (student.admissionYear === new Date().getFullYear()) {
        newStudents++;
      } else {
        returningStudents++;
      }
      
      // By state
      const state = student.state || 'Unknown';
      byState[state] = (byState[state] || 0) + 1;
    }
    
    return {
      sessionId,
      totalStudents,
      maleStudents,
      femaleStudents,
      newStudents,
      returningStudents,
      byLevel,
      byFaculty, // Would need faculty join
      byState,
    };
  }

  /**
   * Generate staff profile report
   */
  async generateStaffProfileReport(): Promise<StaffProfileReport> {
    const staff = await this.userRepository.find({
      where: { role: 'lecturer' },
    });
    
    const academic = {
      professors: 0,
      associateProfessors: 0,
      seniorLecturers: 0,
      lecturers: 0,
      assistantLecturers: 0,
      others: 0,
    };
    
    const qualification = {
      phd: 0,
      masters: 0,
      bachelor: 0,
      others: 0,
    };
    
    let totalStaff = 0;
    let administrative = 0;
    let technical = 0;
    let support = 0;
    
    for (const member of staff) {
      totalStaff++;
      
      // By rank
      const rank = (member as any).academicRank || 'lecturer';
      if (academic[rank as keyof typeof academic] !== undefined) {
        academic[rank as keyof typeof academic]++;
      } else {
        academic.others++;
      }
      
      // By qualification
      const qual = (member as any).highestQualification;
      if (qual === 'PhD') {
        qualification.phd++;
      } else if (qual === 'Masters') {
        qualification.masters++;
      } else if (qual === 'Bachelor') {
        qualification.bachelor++;
      } else {
        qualification.others++;
      }
    }
    
    return {
      totalStaff,
      academic,
      administrative,
      technical,
      support,
      byFaculty: {}, // Would need faculty join
      qualification,
    };
  }

  /**
   * Generate course registration report
   */
  async generateCourseRegistrationReport(
    sessionId: string,
    semester: 'first' | 'second',
  ): Promise<CourseRegistrationReport> {
    // This would require joining with course registration data
    return {
      sessionId,
      semester,
      totalCourses: 0,
      totalRegistrations: 0,
      byCourse: [],
    };
  }

  /**
   * Generate graduation report
   */
  async generateGraduationReport(sessionId: string): Promise<GraduationReport> {
    const graduates = await this.studentRepository.find({
      where: { 
        status: 'graduated',
        graduationYear: sessionId,
      },
    });
    
    const byDegree = {
      firstClass: 0,
      secondClassUpper: 0,
      secondClassLower: 0,
      pass: 0,
    };
    
    let totalGraduates = 0;
    
    for (const graduate of graduates) {
      totalGraduates++;
      
      const cgpa = (graduate as any).cgpa || 0;
      if (cgpa >= 4.0) {
        byDegree.firstClass++;
      } else if (cgpa >= 3.5) {
        byDegree.secondClassUpper++;
      } else if (cgpa >= 2.5) {
        byDegree.secondClassLower++;
      } else {
        byDegree.pass++;
      }
    }
    
    return {
      sessionId: parseInt(sessionId),
      totalGraduates,
      byFaculty: {},
      byDegree,
      byProgramme: [],
    };
  }

  /**
   * Generate NBTE compliance report
   */
  async generateNbteReport(reportType: string): Promise<NbteReport> {
    return {
      reportType,
      reportingPeriod: new Date().toISOString(),
      institutionCode: this.config.institutionCode,
      data: {
        // NBTE-specific data structures
        programmes: await this.getNbteProgrammes(),
        studentEnrollments: await this.getNbteEnrollments(),
        staffData: await this.getNbteStaffData(),
        facilities: await this.getNbteFacilities(),
      },
    };
  }

  private async getNbteProgrammes() {
    const programmes = await this.programmeRepository.find();
    return programmes.map(p => ({
      code: p.code,
      name: p.name,
      accreditationStatus: (p as any).accreditationStatus || 'pending',
      intake: (p as any).intake || 0,
    }));
  }

  private async getNbteEnrollments() {
    // Get enrollment data by programme
    return [];
  }

  private async getNbteStaffData() {
    // Get staff data for NBTE
    return [];
  }

  private async getNbteFacilities() {
    // Get facility data for NBTE
    return [];
  }

  /**
   * Export report to CSV format
   */
  async exportToCsv(reportType: string, data: any): Promise<string> {
    // Generate CSV from report data
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map((row: any) => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }

  /**
   * Generate annual report
   */
  async generateAnnualReport(year: number) {
    return {
      year,
      institutionCode: this.config.institutionCode,
      enrollment: await this.generateEnrollmentReport(year.toString()),
      staff: await this.generateStaffProfileReport(),
      graduation: await this.generateGraduationReport(year.toString()),
      generatedAt: new Date().toISOString(),
    };
  }
}