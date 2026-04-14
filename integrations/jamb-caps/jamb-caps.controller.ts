/**
 * JAMB CAPS Controller
 * 
 * REST API endpoints for JAMB CAPS integration
 */

import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JambCapsService, JambAdmissionRecord } from './jamb-caps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('jamb-caps')
@Controller('integrations/jamb')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JambCapsController {
  constructor(private readonly jambCapsService: JambCapsService) {}

  @Get('candidates/:utmeNo')
  @Roles('super_admin', 'admin', 'admissions')
  @ApiOperation({ summary: 'Get candidate by UTME number' })
  async getCandidate(@Param('utmeNo') utmeNo: string) {
    return this.jambCapsService.getCandidateByUtmeNo(utmeNo);
  }

  @Get('admissions')
  @Roles('super_admin', 'admin', 'admissions')
  @ApiOperation({ summary: 'Get admission list from JAMB' })
  @ApiQuery({ name: 'sessionId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async getAdmissionList(
    @Query('sessionId') sessionId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 100,
  ) {
    return this.jambCapsService.getAdmissionList(sessionId, page, pageSize);
  }

  @Post('admissions/verify')
  @Roles('super_admin', 'admin', 'admissions')
  @ApiOperation({ summary: 'Verify admission number' })
  async verifyAdmission(@Body('admissionNumber') admissionNumber: string) {
    return this.jambCapsService.verifyAdmission(admissionNumber);
  }

  @Post('admissions/:studentId/confirm')
  @Roles('super_admin', 'admin', 'admissions')
  @ApiOperation({ summary: 'Submit admission confirmation to JAMB' })
  async submitConfirmation(
    @Param('studentId') studentId: string,
    @Body() admissionDetails: {
      admissionNumber: string;
      jambNo: string;
      programme: string;
      sessionId: string;
    },
  ) {
    return this.jambCapsService.submitAdmissionConfirmation(studentId, admissionDetails);
  }

  @Post('students/:studentId/sync-scores')
  @Roles('super_admin', 'admin', 'admissions')
  @ApiOperation({ summary: 'Sync student UTME scores from JAMB' })
  async syncScores(@Param('studentId') studentId: string) {
    return this.jambCapsService.syncStudentScores(studentId);
  }

  @Get('admissions/stats')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get admission statistics' })
  async getAdmissionStats(@Query('sessionId') sessionId: string) {
    return this.jambCapsService.getAdmittedStudents(sessionId);
  }

  @Post('admissions/import')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Bulk import admitted students from JAMB' })
  async bulkImport(@Query('sessionId') sessionId: string) {
    return this.jambCapsService.bulkImportAdmittedStudents(sessionId);
  }
}