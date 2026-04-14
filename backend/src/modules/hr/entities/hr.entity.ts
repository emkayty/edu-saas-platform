import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

// Employment Type
export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TENURE_TRACK = 'tenure_track',
  VISITING = 'visiting',
}

// Staff Status
export enum StaffStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  RETIRED = 'retired',
}

// Leave Type
export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  STUDY = 'study',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  CASUAL = 'casual',
  UNPAID = 'unpaid',
}

// Leave Status
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

// Staff Profile
@Entity('staff_profiles')
export class StaffProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // Link to User entity

  @Column()
  staffNumber: string; // Unique staff ID

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.ACTIVE })
  status: StaffStatus;

  // Employment dates
  @Column({ nullable: true })
  appointmentDate: Date;

  @Column({ nullable: true })
  confirmationDate: Date;

  @Column({ nullable: true })
  terminationDate: Date;

  // Position
  @Column({ nullable: true })
  position: string; // e.g., Professor, Lecturer I, Admin Officer

  @Column({ nullable: true })
  grade: string; // e.g., GL07, CONUASS 3

  @Column({ nullable: true })
  step: number;

  // Department
  @Column({ nullable: true })
  departmentId: string;

  // Academic info (for lecturers)
  @Column({ nullable: true })
  highestQualification: string; // PhD, Masters, BSc

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  researchArea: string;

  @Column({ type: 'jsonb', default: [] })
  publications: string[];

  @Column({ nullable: true })
  yearsOfExperience: number;

  // Salary
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlySalary: number;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankAccountName: string;

  // PFA (for pension)
  @Column({ nullable: true })
  pfaName: string;

  @Column({ nullable: true })
  pfaNumber: string;

  // NHIS
  @Column({ nullable: true })
  nhisNumber: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Leave Application
@Entity('leave_applications')
export class LeaveApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staffId: string;

  @Column({ type: 'enum', enum: LeaveType })
  leaveType: LeaveType;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Column({ nullable: true })
  approverId: string;

  @Column({ nullable: true })
  approvedDate: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  // Substitute lecturer (for academics)
  @Column({ nullable: true })
  substituteStaffId: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Payroll
@Entity('payroll_records')
export class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staffId: string;

  @Column()
  month: number; // 1-12

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowances: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netPay: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paymentDate: Date;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Attendance
@Entity('staff_attendance')
export class StaffAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staffId: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  clockIn: Date;

  @Column({ nullable: true })
  clockOut: Date;

  @Column({ default: 0 })
  hoursWorked: number;

  @Column({ default: 'present' })
  status: 'present' | 'absent' | 'late' | 'on_leave';

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}