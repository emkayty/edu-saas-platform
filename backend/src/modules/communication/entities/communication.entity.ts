import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

export enum NotificationType { SMS = 'sms', EMAIL = 'email', PUSH = 'push', IN_APP = 'in_app' }
export enum NotificationStatus { PENDING = 'pending', SENT = 'sent', FAILED = 'failed' }

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() type: NotificationType;
  @Column() title: string;
  @Column({ type: 'text' }) message: string;
  @Column({ default: 'pending' }) status: NotificationStatus;
  @Column({ nullable: true }) channel: string;
  @Column({ nullable: true }) recipient: string;
  @Column({ nullable: true }) externalId: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() subject: string;
  @Column({ type: 'text' }) body: string;
  @Column({ default: false }) isActive: boolean;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('sms_templates')
export class SmsTemplate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'text' }) message: string;
  @Column({ default: false }) isActive: boolean;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ default: 'active' }) status: 'active' | 'draft' | 'archived';
  @Column({ nullable: true }) targetRoles: string;
  @Column({ nullable: true }) targetDepartment: string;
  @Column({ default: false }) isPinned: boolean;
  @Column({ nullable: true }) publishDate: Date;
  @Column({ nullable: true }) expiryDate: Date;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}