import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from './department.entity';

export type CourseStatus = 'active' | 'inactive' | 'archived';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  code: string; // e.g., "CSC101", "ENG201"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 3 })
  creditHours: number;

  @Column({ type: 'jsonb', nullable: true })
  courseOutline: string[]; // Array of topics

  // Prerequisites
  @Column({ type: 'jsonb', default: [] })
  prerequisites: string[]; // Array of course IDs

  @Column({ type: 'jsonb', default: [] })
  prerequisiteCourses: Course[];

  // Course level (100L-500L for universities, 1-5 for polytechnics)
  @Column()
  level: number;

  // Semester (1 or 2)
  @Column()
  semester: number; // 1 or 2

  @Column({ default: 'active' })
  status: CourseStatus;

  // Assessment weights
  @Column({ type: 'jsonb', default: {} })
  assessmentWeights: {
    ca?: number;
    exam?: number;
    practical?: number;
    project?: number;
  };

  // Pass mark
  @Column({ default: 40 })
  passMark: number;

  // Department relation
  @ManyToOne(() => Department, (dept) => dept.id, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  departmentId: string;

  // For which programs this course is available
  @Column({ type: 'jsonb', default: [] })
  programs: string[]; // Program IDs

  // Tenant ID
  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('academic_sessions')
export class AcademicSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // "2023/2024", "2024/2025"

  @Column({ unique: true })
  sessionCode: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  // Semester information
  @Column({ default: 2 })
  numberOfSemesters: number;

  @Column({ nullable: true })
  currentSemester: number;

  // Registration periods
  @Column({ nullable: true })
  courseRegistrationStart: Date;

  @Column({ nullable: true })
  courseRegistrationEnd: Date;

  // Examination periods
  @Column({ nullable: true })
  examStartDate: Date;

  @Column({ nullable: true })
  examEndDate: Date;

  // For polytechnics - industrial training period
  @Column({ nullable: true })
  industrialTrainingStart: Date;

  @Column({ nullable: true })
  industrialTrainingEnd: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('course_allocations')
export class CourseAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  @Column()
  lecturerId: string;

  @Column()
  sessionId: string;

  @Column()
  semester: number;

  @Column({ default: true })
  isActive: boolean;

  // Tenant ID
  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('student_courses')
export class StudentCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  courseId: string;

  @Column()
  sessionId: string;

  @Column()
  semester: number;

  // Registration status
  @Column({ default: 'registered' })
  status: 'registered' | 'dropped' | 'completed';

  // CA marks
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  caScore: number;

  // Exam marks
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  examScore: number;

  // Total score
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  totalScore: number;

  // Grade
  @Column({ nullable: true })
  grade: string;

  // Grade point
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  gradePoint: number;

  // For carry-over students
  @Column({ default: false })
  isCarryOver: boolean;

  @Column({ nullable: true })
  originalSemester: number;

  // Tenant ID
  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}