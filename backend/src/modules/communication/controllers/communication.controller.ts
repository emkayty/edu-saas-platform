import { Controller, Req, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationService } from '../services/communication.service';
import { SendNotificationDto, CreateEmailTemplateDto, CreateSmsTemplateDto, CreateAnnouncementDto } from '../dto/communication.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('communication')
@Controller('communication')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(private readonly service: CommunicationService) {}

  @Post('send')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Send notification' })
  async send(@Body() dto: SendNotificationDto, @Req() req: any) {
    return this.service.sendNotification(dto, req.user.tenantId);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get my notifications' })
  async getNotifications(@Req() req: any) {
    return this.service.getUserNotifications(req.user.id, req.user.tenantId);
  }

  @Post('announcements')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create announcement' })
  async createAnnouncement(@Body() dto: CreateAnnouncementDto, @Req() req: any) {
    return this.service.createAnnouncement(dto, req.user.tenantId);
  }

  @Get('announcements')
  @ApiOperation({ summary: 'Get announcements' })
  async getAnnouncements(@Req() req: any) {
    return this.service.getAnnouncements(req.user.tenantId, 'active');
  }

  @Patch('announcements/:id/publish')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Publish announcement' })
  async publish(@Param('id') id: string) {
    return this.service.publishAnnouncement(id);
  }

  @Post('templates/email')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create email template' })
  async createEmailTemplate(@Body() dto: CreateEmailTemplateDto, @Req() req: any) {
    return this.service.createEmailTemplate(dto, req.user.tenantId);
  }

  @Get('templates/email')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get email templates' })
  async getEmailTemplates(@Req() req: any) {
    return this.service.getEmailTemplates(req.user.tenantId);
  }

  @Post('templates/sms')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create SMS template' })
  async createSmsTemplate(@Body() dto: CreateSmsTemplateDto, @Req() req: any) {
    return this.service.createSmsTemplate(dto, req.user.tenantId);
  }

  @Get('templates/sms')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get SMS templates' })
  async getSmsTemplates(@Req() req: any) {
    return this.service.getSmsTemplates(req.user.tenantId);
  }
}