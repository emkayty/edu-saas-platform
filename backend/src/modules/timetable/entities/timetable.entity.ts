import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum TimeSlotStatus { AVAILABLE = 'available', BOOKED = 'booked', BLOCKED = 'blocked' }

@Entity('timetable_sessions')
export class TimetableSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() sessionId: string;
  @Column() semester: number;
  @Column({ default: 'draft' }) status: 'draft' | 'published';
  @Column({ nullable: true }) generatedAt: Date;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('timetable_courses')
export class TimetableCourse {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() courseId: string;
  @Column() lecturerId: string;
  @Column() departmentId: string;
  @Column() level: number;
  @Column() studentCount: number;
  @Column({ default: 1 }) requiredHours: number;
  @Column({ type: 'jsonb', default: [] }) preferredDays: number[];
  @Column({ type: 'jsonb', default: [] }) preferredSlots: string[];
  @Column({ default: false }) needsLab: boolean;
  @Column({ default: false }) needsProjector: boolean;
  @Column({ nullable: true }) tenantId: string;
}

@Entity('timetable_slots')
export class TimetableSlot {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() timetableSessionId: string;
  @Column() dayOfWeek: number;
  @Column() timeSlot: string;
  @Column() venueId: string;
  @Column() courseId: string;
  @Column() lecturerId: string;
  @Column() level: number;
  @Column({ type: 'enum', enum: TimeSlotStatus, default: TimeSlotStatus.BOOKED }) status: TimeSlotStatus;
  @Column({ nullable: true }) tenantId: string;
}

@Entity('timetable_venues')
export class TimetableVenue {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() code: string;
  @Column() capacity: number;
  @Column({ default: true }) isAvailable: boolean;
  @Column({ type: 'jsonb', default: [] }) facilities: string[];
  @Column({ nullable: true }) building: string;
  @Column({ nullable: true }) tenantId: string;
}

@Entity('timetable_conflicts')
export class TimetableConflict {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() type: string;
  @Column() description: string;
  @Column() courseId: string;
  @Column() severity: 'low' | 'medium' | 'high';
  @Column({ nullable: true }) resolved: boolean;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}