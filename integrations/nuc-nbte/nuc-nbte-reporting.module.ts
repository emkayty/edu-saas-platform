/**
 * NUC/NBTE Reporting Module
 */

import { Module } from '@nestjs/common';
import { NucNbteReportingController } from './nuc-nbte-reporting.controller';
import { NucNbteReportingService } from './nuc-nbte-reporting.service';

@Module({
  controllers: [NucNbteReportingController],
  providers: [NucNbteReportingService],
  exports: [NucNbteReportingService],
})
export class NucNbteReportingModule {}