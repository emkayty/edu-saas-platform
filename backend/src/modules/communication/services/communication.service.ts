import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, EmailTemplate, SmsTemplate, Announcement, NotificationType, NotificationStatus } from './entities/communication.entity';
import { SendNotificationDto, CreateEmailTemplateDto, CreateSmsTemplateDto, CreateAnnouncementDto } from './dto/communication.dto';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(EmailTemplate) private emailTemplateRepo: Repository<EmailTemplate>,
    @InjectRepository(SmsTemplate) private smsTemplateRepo: Repository<SmsTemplate>,
    @InjectRepository(Announcement) private announcementRepo: Repository<Announcement>,
  ) {}

  // Notifications
  async sendNotification(dto: SendNotificationDto, tenantId?: string): Promise<Notification> {
    const notification = this.notifRepo.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      channel: dto.channel,
      recipient: dto.recipient,
      status: NotificationStatus.PENDING,
      tenantId,
    });
    const saved = await this.notifRepo.save(notification);
    
    // Simulate sending (in production, integrate with Termii, SendGrid, etc.)
    if (dto.type === NotificationType.SMS) {
      // await this.sendSms(dto.recipient, dto.message);
    } else if (dto.type === NotificationType.EMAIL) {
      // await this.sendEmail(dto.recipient, dto.title, dto.message);
    }
    
    saved.status = NotificationStatus.SENT;
    return this.notifRepo.save(saved);
  }

  async getUserNotifications(userId: string, tenantId?: string): Promise<Notification[]> {
    return this.notifRepo.find({ where: { userId, ...(tenantId ? { tenantId } : {}) }, order: { createdAt: 'DESC' }, take: 50 });
  }

  // Email Templates
  async createEmailTemplate(dto: CreateEmailTemplateDto, tenantId?: string): Promise<EmailTemplate> {
    return this.emailTemplateRepo.save({ ...dto, tenantId });
  }

  async getEmailTemplates(tenantId?: string): Promise<EmailTemplate[]> {
    return this.emailTemplateRepo.find({ where: tenantId ? { tenantId } : {} });
  }

  // SMS Templates
  async createSmsTemplate(dto: CreateSmsTemplateDto, tenantId?: string): Promise<SmsTemplate> {
    return this.smsTemplateRepo.save({ ...dto, tenantId });
  }

  async getSmsTemplates(tenantId?: string): Promise<SmsTemplate[]> {
    return this.smsTemplateRepo.find({ where: tenantId ? { tenantId } : {} });
  }

  // Announcements
  async createAnnouncement(dto: CreateAnnouncementDto, tenantId?: string): Promise<Announcement> {
    return this.announcementRepo.save({ ...dto, tenantId });
  }

  async getAnnouncements(tenantId?: string, status?: string): Promise<Announcement[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (status) where.status = status;
    return this.announcementRepo.find({ where, order: { isPinned: 'DESC', createdAt: 'DESC' } });
  }

  async publishAnnouncement(id: string): Promise<Announcement> {
    const announcement = await this.announcementRepo.findOne({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');
    announcement.status = 'active';
    announcement.publishDate = new Date();
    return this.announcementRepo.save(announcement);
  }
}