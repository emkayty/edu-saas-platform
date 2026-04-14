/**
 * Institution Configuration Entity
 * Stores tenant-specific settings including grading system
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { GradingSystem } from '../modules/examination/types/grading-system';

@Entity('institution_settings')
export class InstitutionSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tenantId: string;

  // Institution Information
  @Column({ nullable: true })
  institutionName: string;

  @Column({ nullable: true })
  institutionType: string; // university, polytechnic

  // Academic Settings
  @Column({
    type: 'enum',
    enum: GradingSystem,
    default: GradingSystem.NIGERIAN
  })
  gradingSystem: GradingSystem;

  @Column({ default: 40 })
  minimumPassScore: number;

  @Column({ default: true })
  allowCarryOver: boolean;

  @Column({ default: 2 })
  maxCarryOverCourses: number;

  @Column({ default: true })
  weightByCreditHours: boolean;

  @Column({ default: 2 })
  decimalPlaces: number;

  @Column({ default: true })
  roundCGPA: boolean;

  // Academic Calendar
  @Column({ nullable: true })
  academicYearStart: string; // e.g., "October"

  @Column({ nullable: true })
  academicYearEnd: string; // e.g., "July"

  @Column({ default: 2 })
  numberOfSemesters: number;

  // Nigeria-specific
  @Column({ nullable: true })
  nutonalAssemblyCode: string; // For NUC reporting

  @Column({ nullable: true })
  universityCode: string; // JAMB code

  // American-specific
  @Column({ default: false })
  usesSemesterSystem: boolean;

  @Column({ nullable: true })
  quarterSystemStart: string;

  // Communication Settings
  @Column({ default: true })
  enableEmailNotifications: boolean;

  @Column({ default: true })
  enableSMSNotifications: boolean;

  @Column({ default: true })
  enablePushNotifications: boolean;

  // Feature Toggles
  @Column({ default: true })
  enableAIChatbot: boolean;

  @Column({ default: true })
  enableAnalytics: boolean;

  @Column({ default: true })
  enableOnlineExams: boolean;

  @Column({ default: true })
  enableLibrary: boolean;

  @Column({ default: true })
  enableHostel: boolean;

  // Branding
  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  secondaryColor: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}