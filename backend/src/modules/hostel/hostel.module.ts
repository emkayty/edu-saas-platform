import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostelController } from './controllers/hostel.controller';
import { HostelService } from './services/hostel.service';
import { Hostel, HostelRoom, HostelBed, HostelAllocation, HostelMaintenance, HostelComplaint } from './entities/hostel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Hostel, HostelRoom, HostelBed, HostelAllocation, HostelMaintenance, HostelComplaint
    ])
  ],
  controllers: [HostelController],
  providers: [HostelService],
  exports: [HostelService],
})
export class HostelModule {}