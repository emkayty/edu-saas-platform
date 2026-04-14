import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';

export type TenantType = 'university' | 'polytechnic';
export type TenantCategory = 'federal' | 'state' | 'private';
export type TenantStatus = 'active' | 'suspended' | 'trial' | 'inactive';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({
    type: 'enum',
    enum: ['university', 'polytechnic'],
    default: 'university',
  })
  type: TenantType;

  @Column({
    type: 'enum',
    enum: ['federal', 'state', 'private'],
    default: 'private',
  })
  category: TenantCategory;

  @Column({ default: 'Nigeria' })
  country: string;

  @Column({ default: 'Africa/Lagos' })
  timezone: string;

  // ============================================
  // BRANDING & COLORS - Complete Color System
  // ============================================
  
  // Primary Colors
  @Column({ default: '#1E3A8A' })
  primaryColor: string;

  @Column({ default: '#3B82F6' })
  secondaryColor: string;

  @Column({ default: '#F59E0B' })
  accentColor: string;

  // Background Colors
  @Column({ default: '#F8FAFC' })
  backgroundColor: string;

  @Column({ default: '#FFFFFF' })
  surfaceColor: string;

  // Text Colors
  @Column({ default: '#1E293B' })
  textColor: string;

  @Column({ default: '#64748B' })
  textSecondaryColor: string;

  // Border Color
  @Column({ default: '#E2E8F0' })
  borderColor: string;

  // Status Colors
  @Column({ default: '#10B981' })
  successColor: string;

  @Column({ default: '#F59E0B' })
  warningColor: string;

  @Column({ default: '#EF4444' })
  errorColor: string;

  @Column({ default: '#3B82F6' })
  infoColor: string;

  // Branding Assets
  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  logoDark: string;

  @Column({ nullable: true })
  favicon: string;

  @Column({ nullable: true })
  banner: string;

  // Typography
  @Column({ default: 'Inter, system-ui, sans-serif' })
  fontFamily: string;

  @Column({ nullable: true })
  fontFamilyHeadings: string;

  // Custom CSS
  @Column({ type: 'text', nullable: true })
  customCSS: string;

  // ============================================
  // ACADEMIC CONFIGURATION
  // ============================================
  
  @Column({
    type: 'enum',
    enum: ['4_point', '5_point', 'percentage'],
    default: '5_point',
  })
  gradingSystem: string;

  @Column({ default: 'semester' })
  sessionType: string;

  @Column({ default: 4 })
  maxLevels: number;

  @Column({ default: true })
  carryOverEnabled: boolean;

  @Column({ default: false })
  industrialTrainingEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customAcademicConfig: Record<string, any>;

  // ============================================
  // MODULE TOGGLES
  // ============================================
  
  @Column({ type: 'jsonb', default: {} })
  moduleConfig: Record<string, { enabled: boolean; config?: Record<string, any> }>;

  // ============================================
  // INTEGRATION SETTINGS
  // ============================================
  
  @Column({ default: true })
  jambEnabled: boolean;

  @Column({ default: true })
  remitaEnabled: boolean;

  @Column({ default: true })
  nucEnabled: boolean;

  @Column({ default: false })
  nbteEnabled: boolean;

  @Column({ default: true })
  nyscEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customIntegrations: Record<string, any>;

  // ============================================
  // FEATURE FLAGS
  // ============================================
  
  @Column({ default: true })
  aiEnabled: boolean;

  @Column({ default: true })
  mobileAppEnabled: boolean;

  @Column({ default: true })
  customDomainEnabled: boolean;

  @Column({ default: false })
  whiteLabelEnabled: boolean;

  // ============================================
  // SUBSCRIPTION & STATUS
  // ============================================
  
  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'trial', 'inactive'],
    default: 'trial',
  })
  status: TenantStatus;

  @Column({ nullable: true })
  customDomain: string;

  @Column({ type: 'jsonb', nullable: true })
  subscription: {
    plan: string;
    startedAt: Date;
    expiresAt: Date;
    maxUsers: number;
  };

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  theme: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deactivatedAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}

// ============================================
// DEFAULT THEME PRESETS
// ============================================

export const THEME_PRESETS = {
  // University Presets
  'traditional-blue': {
    primaryColor: '#1E3A8A',
    secondaryColor: '#3B82F6',
    accentColor: '#F59E0B',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#1E293B',
    textSecondaryColor: '#64748B',
    borderColor: '#E2E8F0',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  'science-green': {
    primaryColor: '#047857',
    secondaryColor: '#10B981',
    accentColor: '#FCD34D',
    backgroundColor: '#ECFDF5',
    surfaceColor: '#FFFFFF',
    textColor: '#064E3B',
    textSecondaryColor: '#6B7280',
    borderColor: '#D1FAE5',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  'heritage-maroon': {
    primaryColor: '#7F1D1D',
    secondaryColor: '#DC2626',
    accentColor: '#FEF3C7',
    backgroundColor: '#FEF2F2',
    surfaceColor: '#FFFFFF',
    textColor: '#450A0A',
    textSecondaryColor: '#7F1D1D',
    borderColor: '#FECACA',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#DC2626',
    infoColor: '#3B82F6',
    fontFamily: 'Georgia, serif',
  },
  'prestige-gold': {
    primaryColor: '#B45309',
    secondaryColor: '#D97706',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    surfaceColor: '#FFFFFF',
    textColor: '#451A03',
    textSecondaryColor: '#92400E',
    borderColor: '#FDE68A',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  // Polytechnic Presets
  'industrial-orange': {
    primaryColor: '#C2410C',
    secondaryColor: '#EA580C',
    accentColor: '#FBBF24',
    backgroundColor: '#FFF7ED',
    surfaceColor: '#FFFFFF',
    textColor: '#431407',
    textSecondaryColor: '#7C2D12',
    borderColor: '#FED7AA',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  'technical-blue': {
    primaryColor: '#1E40AF',
    secondaryColor: '#2563EB',
    accentColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
    surfaceColor: '#FFFFFF',
    textColor: '#1E3A8A',
    textSecondaryColor: '#1E40AF',
    borderColor: '#BFDBFE',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  'engineering-red': {
    primaryColor: '#991B1B',
    secondaryColor: '#DC2626',
    accentColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    surfaceColor: '#FFFFFF',
    textColor: '#7F1D1D',
    textSecondaryColor: '#991B1B',
    borderColor: '#FECACA',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#DC2626',
    infoColor: '#3B82F6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  'modern-teal': {
    primaryColor: '#0F766E',
    secondaryColor: '#14B8A6',
    accentColor: '#5EEAD4',
    backgroundColor: '#F0FDFA',
    surfaceColor: '#FFFFFF',
    textColor: '#134E4A',
    textSecondaryColor: '#115E59',
    borderColor: '#99F6E4',
    successColor: '#10B981',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

// ============================================
// DEFAULT MODULE CONFIGURATION
// ============================================

export const DEFAULT_MODULE_CONFIG = {
  // Core Modules - Always Enabled
  studentPortal: { enabled: true },
  academicManagement: { enabled: true },
  financeAndFees: { enabled: true },
  examinationSystem: { enabled: true },
  documentManagement: { enabled: true },
  
  // Extended Modules
  lms: { enabled: true },
  library: { enabled: true },
  hostel: { enabled: true },
  hrAndPayroll: { enabled: true },
  alumni: { enabled: true },
  qualityAssurance: { enabled: true },
  
  // Optional Modules
  research: { enabled: false }, // University only
  industrialTraining: { enabled: false }, // Polytechnic only
  transport: { enabled: true },
  healthCenter: { enabled: true },
  sportsAndRecreation: { enabled: true },
  eventManagement: { enabled: true },
  
  // AI Modules
  aiAnalytics: { enabled: true },
  aiChatbot: { enabled: true },
  predictiveAnalytics: { enabled: true },
};