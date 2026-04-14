import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExaminationService } from '../services/examination.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('examination')
@Controller('examination')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExaminationController {
  constructor(private readonly examinationService: ExaminationService) {}

  @Get('schedules')
  @ApiOperation({ summary: 'Get exam schedules' })
  async getSchedules(@Req() req: any, @Param('sessionId') sessionId?: string) {
    return this.examinationService.getExamSchedules(req.user.tenantId, sessionId);
  }

  @Get('results')
  @ApiOperation({ summary: 'Get my results' })
  async getResults(@Req() req: any, @Param('sessionId') sessionId?: string) {
    return this.examinationService.getResults(req.user.id, sessionId);
  }

  @Get('transcript')
  @ApiOperation({ summary: 'Get my transcript' })
  async getTranscript(@Req() req: any) {
    return this.examinationService.generateTranscript(req.user.id);
  }

  @Post('seating/generate')
  @ApiOperation({ summary: 'Generate seating plan' })
  async generateSeating(
    @Body() body: { sessionId: string; semester: number; venueId: string },
    @Req() req: any
  ) {
    return this.examinationService.generateSeatingPlan(body.sessionId, body.semester, body.venueId);
  }
}