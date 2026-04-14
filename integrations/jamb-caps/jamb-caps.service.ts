/**
 * JAMB CAPS Integration Service
 * 
 * This service integrates with JAMB (Joint Admissions and Matriculation Board)
 * Central Admissions Processing System (CAPS) for admission data exchange.
 * 
 * Features:
 * - Fetch admission lists from JAMB
 * - Submit admitted students data
 * - Verify admission status
 * - Sync student UTME/DE scores
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { AcademicSession } from '../../academics/entities/course.entity';

export interface JambCapsConfig {
  baseUrl: string;
  institutionCode: string;
  apiKey: string;
  secretKey: string;
}

export interface JambCandidate {
  jambNo: string;
  utmeScore: number;
  subject1?: number;
  subject2?: number;
  subject3?: number;
  subject4?: number;
  firstChoice: string;
  secondChoice?: string;
  thirdChoice?: string;
  fourthChoice?: string;
  name: string;
  dateOfBirth: string;
  stateCode: string;
  lgaCode: string;
  gender: string;
  phone: string;
  email?: string;
}

export interface JambAdmissionRecord {
  admissionNumber: string;
  jambNo: string;
  studentName: string;
  programme: string;
  admissionDate: string;
  admissionStatus: 'PROVISIONAL' | 'CONFIRMED' | 'REJECTED';
  batchNumber: string;
}

export interface JambAdmissionResponse {
  success: boolean;
  message: string;
  data?: JambAdmissionRecord[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable()
export class JambCapsService {
  private config: JambCapsConfig;
  
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {
    this.config = {
      baseUrl: this.configService.get('JAMB_CAPS_BASE_URL', 'https://caps.jamb.gov.ng/api/v1'),
      institutionCode: this.configService.get('JAMB_INSTITUTION_CODE', ''),
      apiKey: this.configService.get('JAMB_API_KEY', ''),
      secretKey: this.configService.get('JAMB_SECRET_KEY', ''),
    };
  }

  /**
   * Generate authentication token for JAMB CAPS API
   */
  private async getAuthToken(): Promise<string> {
    try {
      const response = await this.httpService.axiosRef.post(`${this.config.baseUrl}/auth/token`, {
        institutionCode: this.config.institutionCode,
        apiKey: this.config.apiKey,
        secretKey: this.config.secretKey,
      });
      
      return response.data.access_token;
    } catch (error) {
      throw new HttpException(
        'Failed to authenticate with JAMB CAPS',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Fetch admission list from JAMB CAPS
   */
  async getAdmissionList(
    sessionId: string,
    page: number = 1,
    pageSize: number = 100,
  ): Promise<JambAdmissionResponse> {
    try {
      const token = await this.getAuthToken();
      
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/admissions`,
        {
          params: {
            session: sessionId,
            institutionCode: this.config.institutionCode,
            page,
            pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch admission list: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Fetch admitted candidates by UTME number
   */
  async getCandidateByUtmeNo(utmeNo: string): Promise<JambCandidate | null> {
    try {
      const token = await this.getAuthToken();
      
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/candidates/${utmeNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new HttpException(
        `Failed to fetch candidate: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Verify admission status
   */
  async verifyAdmission(admissionNumber: string): Promise<{
    isValid: boolean;
    status: string;
    details?: any;
  }> {
    try {
      const token = await this.getAuthToken();
      
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/admissions/verify/${admissionNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      return {
        isValid: response.data.isValid || false,
        status: response.data.admissionStatus || 'UNKNOWN',
        details: response.data,
      };
    } catch (error) {
      return {
        isValid: false,
        status: 'ERROR',
      };
    }
  }

  /**
   * Submit admitted student to JAMB CAPS for confirmation
   */
  async submitAdmissionConfirmation(
    studentId: string,
    admissionDetails: {
      admissionNumber: string;
      jambNo: string;
      programme: string;
      sessionId: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const token = await this.getAuthToken();
      
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });
      
      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }
      
      const payload = {
        institutionCode: this.config.institutionCode,
        admissionNumber: admissionDetails.admissionNumber,
        jambNo: admissionDetails.jambNo,
        studentName: `${student.firstName} ${student.lastName}`,
        programme: admissionDetails.programme,
        session: admissionDetails.sessionId,
        email: student.email,
        phone: student.phone,
      };
      
      const response = await this.httpService.axiosRef.post(
        `${this.config.baseUrl}/admissions/confirm`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to submit admission: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Sync student UTME/DE scores from JAMB
   */
  async syncStudentScores(studentId: string): Promise<{
    utmeScore?: number;
    deScore?: number;
    subjects?: any;
  }> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    
    if (!student?.jambNo) {
      throw new HttpException(
        'Student has no JAMB number',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    const candidate = await this.getCandidateByUtmeNo(student.jambNo);
    
    if (!candidate) {
      throw new HttpException(
        'Candidate not found in JAMB database',
        HttpStatus.NOT_FOUND,
      );
    }
    
    // Update student record with scores
    await this.studentRepository.update(studentId, {
      utmeScore: candidate.utmeScore,
      subject1: candidate.subject1,
      subject2: candidate.subject2,
      subject3: candidate.subject3,
      subject4: candidate.subject4,
    } as any);
    
    return {
      utmeScore: candidate.utmeScore,
      subjects: {
        subject1: candidate.subject1,
        subject2: candidate.subject2,
        subject3: candidate.subject3,
        subject4: candidate.subject4,
      },
    };
  }

  /**
   * Get list of admitted students for current session
   */
  async getAdmittedStudents(sessionId: string): Promise<{
    totalAdmitted: number;
    admittedToday: number;
    byProgramme: Record<string, number>;
  }> {
    const response = await this.getAdmissionList(sessionId);
    
    const byProgramme: Record<string, number> = {};
    let totalAdmitted = 0;
    
    if (response.data) {
      for (const record of response.data) {
        if (record.admissionStatus === 'CONFIRMED') {
          totalAdmitted++;
          byProgramme[record.programme] = (byProgramme[record.programme] || 0) + 1;
        }
      }
    }
    
    return {
      totalAdmitted,
      admittedToday: 0, // Would need date filtering
      byProgramme,
    };
  }

  /**
   * Bulk import admitted students
   */
  async bulkImportAdmittedStudents(
    sessionId: string,
  ): Promise<{ imported: number; failed: number; errors: string[] }> {
    const response = await this.getAdmissionList(sessionId, 1, 500);
    
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];
    
    if (response.data) {
      for (const record of response.data) {
        try {
          // Check if student already exists
          const existing = await this.studentRepository.findOne({
            where: { jambNo: record.jambNo },
          });
          
          if (existing) {
            // Update admission status
            await this.studentRepository.update(existing.id, {
              admissionNumber: record.admissionNumber,
              admissionDate: new Date(record.admissionDate),
              admissionStatus: record.admissionStatus,
            } as any);
          } else {
            // Create new student record
            await this.studentRepository.save({
              jambNo: record.jambNo,
              admissionNumber: record.admissionNumber,
              admissionDate: new Date(record.admissionDate),
              admissionStatus: record.admissionStatus,
              sessionId,
              // Other fields would need to be mapped
            });
          }
          imported++;
        } catch (error) {
          failed++;
          errors.push(`Failed to import ${record.jambNo}: ${error.message}`);
        }
      }
    }
    
    return { imported, failed, errors };
  }
}