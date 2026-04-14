import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

// Fee Categories
export enum FeeCategory {
  TUITION = 'tuition',
  ACCOMMODATION = 'accommodation',
  REGISTRATION = 'registration',
  EXAMINATION = 'examination',
  LIBRARY = 'library',
  ICT = 'ict',
  SPORTS = 'sports',
  MEDICAL = 'medical',
  TRANSPORT = 'transport',
  INDUSTRIAL_TRAINING = 'industrial_training', // For polytechnics
  OTHER = 'other',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  WAIVED = 'waived',
}

// Fee Structure
@Entity('fee_structures')
export class FeeStructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., "2023/2024 Session Fees"

  @Column()
  sessionId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: FeeCategory })
  category: FeeCategory;

  @Column({ default: true })
  isCompulsory: boolean;

  @Column({ nullable: true })
  description: string;

  // Deadline
  @Column({ nullable: true })
  paymentDeadline: Date;

  @Column({ default: false })
  hasLatePenalty: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  latePenaltyPercentage: number;

  // Installment options
  @Column({ default: false })
  allowsInstallment: boolean;

  @Column({ type: 'jsonb', nullable: true })
  installmentPlan: {
    first: { percentage: number; deadline: Date };
    second?: { percentage: number; deadline: Date };
    third?: { percentage: number; deadline: Date };
  };

  // Department-specific fees (optional override)
  @Column({ nullable: true })
  departmentId: string;

  // Program-specific fees (optional override)
  @Column({ nullable: true })
  programId: string;

  // Level-specific fees
  @Column({ type: 'jsonb', nullable: true })
  levelAmounts: { [key: number]: number };

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Student Fee
@Entity('student_fees')
export class StudentFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  feeStructureId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  // Installment tracking
  @Column({ default: 0 })
  currentInstallment: number;

  @Column({ nullable: true })
  nextPaymentDate: Date;

  @Column({ nullable: true })
  penaltyAmount: number;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Payment
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column({ nullable: true })
  studentFeeId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string; // 'remita', 'bank_transfer', 'cash', 'card'

  @Column({ nullable: true })
  reference: string; // Remita RRR or bank reference

  @Column({ nullable: true })
  transactionId: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'completed', 'failed'

  @Column({ nullable: true })
  paymentDate: Date;

  @Column({ nullable: true })
  channel: string; // 'web', 'mobile', 'ussd', 'bank'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Invoice
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @Column()
  studentId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  issueDate: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Scholarship
@Entity('scholarships')
export class Scholarship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'percentage' })
  type: 'percentage' | 'fixed';

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  criteria: string; // JSON string for criteria

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Student Scholarship
@Entity('student_scholarships')
export class StudentScholarship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  scholarshipId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}