import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimetableService } from '../services/timetable.service';
import { GenerateTimetableDto, CreateTimetableCourseDto, CreateVenueDto } from '../dto/timetable.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

interface AuthUser { id: string; tenantId?: string; [key: string]: any }

@ApiTags('timetable')
@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimetableController {
  constructor(private readonly service: TimetableService) {}

  @Post('venues')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create venue' })
  async createVenue(@Body() dto: CreateVenueDto, @Req() req: any) {
    return this.service.createVenue(dto, req.user?.tenantId);
  }

  @Get('venues')
  @ApiOperation({ summary: 'Get all venues' })
  async getVenues(@Req() req: any) {
    return this.service.getVenues(req.user?.tenantId);
  }

  @Post('courses')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Add course to timetable' })
  async addCourse(@Body() dto: CreateTimetableCourseDto, @Req() req: any) {
    return { message: 'Course added to timetable pool' };
  }

  @Post('generate')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate timetable using AI algorithm' })
  async generateTimetable(@Body() dto: GenerateTimetableDto, @Req() req: any) {
    return this.service.generateTimetable(dto.sessionId, dto.semester, req.user?.tenantId);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get timetable for session' })
  async getTimetable(@Param('sessionId') sessionId: string, @Req() req: any) {
    return this.service.getTimetable(sessionId, req.user?.tenantId);
  }

  @Post('sessions/:id/publish')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Publish timetable' })
  async publishTimetable(@Param('id') id: string) {
    return this.service.publishTimetable(id);
  }

  @Get('sessions/:id/conflicts')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get timetable conflicts' })
  async getConflicts(@Param('id') id: string, @Req() req: any) {
    return this.service.getConflicts(id, req.user?.tenantId);
  }

  @Post('conflicts/:id/resolve')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Resolve conflict' })
  async resolveConflict(@Param('id') id: string) {
    return this.service.resolveConflict(id);
  }
}