import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../tenants/tenant.entity';

export type UserRole = 'super_admin' | 'admin' | 'lecturer' | 'student' | 'parent' | 'guest';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'lecturer', 'student', 'parent', 'guest'],
    default: 'student',
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending',
  })
  status: UserStatus;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  // Multi-Factor Authentication
  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({ nullable: true })
  mfaBackupCodes: string; // JSON string of backup codes

  // Password reset tokens
  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  // Last login tracking
  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIP: string;

  // Session tracking
  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  // Profile additional fields
  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  // Student-specific fields
  @Column({ nullable: true })
  matricNumber: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  faculty: string;

  @Column({ nullable: true })
  level: number;

  // Lecturer-specific fields
  @Column({ nullable: true })
  staffNumber: string;

  @Column({ nullable: true })
  title: string; // Prof, Dr, Mr, Mrs, etc.

  @Column({ nullable: true })
  specialization: string;

  // Preferences
  @Column({ type: 'jsonb', default: {} })
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };

  // Custom fields per tenant
  @Column({ type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  // Tenant relation - Multi-tenant support
  @ManyToOne(() => Tenant, (tenant) => tenant.users, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deactivatedAt: Date;

  // Virtual getters
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}