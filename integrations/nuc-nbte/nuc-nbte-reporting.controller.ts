/**
 * NUC/NBTE Reporting Controller
 */

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NucNbteReportingService } from './nuc-nbte-reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reporting')
@Controller('integrations/reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NucNbteReportingController {
  constructor(private readonly reportingService: NucNbteReportingService) {}

  @Get('enrollment')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate student enrollment report for NUC' })
  async getEnrollmentReport(@Query('sessionId') sessionId: string) {
    return this.reportingService.generateEnrollmentReport(sessionId);
  }

  @Get('staff-profile')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate staff profile report for NUC' })
  async getStaffProfileReport() {
    return this.reportingService.generateStaffProfileReport();
  }

  @Get('course-registration')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate course registration report' })
  async getCourseRegistrationReport(
    @Query('sessionId') sessionId: string,
    @Query('semester') semester: 'first' | 'second',
  ) {
    return this.reportingService.generateCourseRegistrationReport(sessionId, semester);
  }

  @Get('graduation')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate graduation report for NUC' })
  async getGraduationReport(@Query('sessionId') sessionId: string) {
    return this.reportingService.generateGraduationReport(sessionId);
  }

  @Get('nbte/:reportType')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate NBTE compliance report' })
  async getNbteReport(@Param('reportType') reportType: string) {
    return this.reportingService.generateNbteReport(reportType);
  }

  @Get('annual/:year')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate comprehensive annual report' })
  async getAnnualReport(@Param('year') year: number) {
    return this.reportingService.generateAnnualReport(year);
  }

  @Post('export/csv')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Export report to CSV' })
  async exportToCsv(@Body() body: { reportType: string; data: any[] }) {
    return this.reportingService.exportToCsv(body.reportType, body.data);
  }
}