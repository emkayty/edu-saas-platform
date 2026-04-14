import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationController } from './controllers/communication.controller';
import { CommunicationService } from './services/communication.service';
import { Notification, EmailTemplate, SmsTemplate, Announcement } from './entities/communication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, EmailTemplate, SmsTemplate, Announcement])],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [CommunicationService],
})
export class CommunicationModule {}