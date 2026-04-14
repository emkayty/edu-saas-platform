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

export type DepartmentStatus = 'active' | 'inactive';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string; // e.g., "CSC", "ENG", "MTH"

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  faculty: string;

  @Column({ default: 'active' })
  status: DepartmentStatus;

  // For universities: 4 levels, for polytechnics: 5 levels (ND + HND)
  @Column({ default: 4 })
  maxLevels: number;

  // Program types available in this department
  @Column({ type: 'jsonb', default: [] })
  programTypes: string[]; // ['ND', 'HND', 'BSC', 'MSC', 'PGD', 'PHD']

  // Academic system (for universities vs polytechnics)
  @Column({ default: false })
  hasIndustrialTraining: boolean; // For polytechnics (SIWES)

  // HOD information
  @Column({ nullable: true })
  hodName: string;

  @Column({ nullable: true })
  hodEmail: string;

  // Contact information
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  office: string;

  // Tenant relation
  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  deanName: string;

  @Column({ nullable: true })
  deanEmail: string;

  // Tenant relation
  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  type: string; // ND, HND, BSc, MSc, PhD, PGD

  @Column({ nullable: true })
  duration: number; // in semesters

  @Column({ default: 0 })
  creditLoad: number;

  // Department relation
  @ManyToOne(() => Department, (dept) => dept.id, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ nullable: true })
  departmentId: string;

  // Faculty relation
  @ManyToOne(() => Faculty, (faculty) => faculty.id, { nullable: true })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @Column({ nullable: true })
  facultyId: string;

  // Accreditation
  @Column({ nullable: true })
  accreditationStatus: string; // 'accredited', 'pending', 'expired'

  @Column({ nullable: true })
  accreditationExpiry: Date;

  // For polytechnics - industrial training requirement
  @Column({ default: false })
  hasIndustrialTraining: boolean;

  @Column({ nullable: true })
  industrialTrainingDuration: number; // in months

  // Tenant relation
  @ManyToOne(() => Tenant, (tenant) => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}