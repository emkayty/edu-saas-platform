import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrService } from './services/hr.service';
import { CreateStaffProfileDto, UpdateStaffProfileDto, CreateLeaveApplicationDto, ProcessPayrollDto, HrQueryDto } from './dto/hr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('hr')
@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('staff')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create staff profile' })
  async createStaff(@Body() dto: CreateStaffProfileDto, @Req() req: any) {
    return this.hrService.createStaffProfile(dto, req.user.tenantId);
  }

  @Get('staff')
  @ApiOperation({ summary: 'Get all staff' })
  async getStaff(@Req() req: any, @Query() query: HrQueryDto) {
    return this.hrService.getStaffProfiles(req.user.tenantId, query.departmentId);
  }

  @Get('staff/:id')
  @ApiOperation({ summary: 'Get staff by ID' })
  async getStaffById(@Param('id') id: string) {
    return this.hrService.getStaffById(id);
  }

  @Patch('staff/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update staff profile' })
  async updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffProfileDto) {
    return this.hrService.updateStaffProfile(id, dto);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Apply for leave' })
  async createLeave(@Body() dto: CreateLeaveApplicationDto, @Req() req: any) {
    return this.hrService.createLeaveApplication(dto, req.user.tenantId);
  }

  @Get('leave')
  @ApiOperation({ summary: 'Get leave applications' })
  async getLeaves(@Req() req: any, @Query() query: HrQueryDto) {
    return this.hrService.getLeaveApplications(query.staffId, req.user.tenantId);
  }

  @Get('leave/pending')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get pending leaves' })
  async getPendingLeaves(@Req() req: any) {
    return this.hrService.getPendingLeaves(req.user.tenantId);
  }

  @Patch('leave/:id/approve')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Approve leave' })
  async approveLeave(@Param('id') id: string, @Req() req: any) {
    return this.hrService.approveLeave(id, req.user.id);
  }

  @Patch('leave/:id/reject')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Reject leave' })
  async rejectLeave(@Param('id') id: string, @Body('reason') reason: string) {
    return this.hrService.rejectLeave(id, reason);
  }

  @Post('payroll/process')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Process payroll' })
  async processPayroll(@Body() dto: ProcessPayrollDto, @Req() req: any) {
    return this.hrService.processPayroll(dto, req.user.tenantId);
  }

  @Get('payroll')
  @ApiOperation({ summary: 'Get payroll records' })
  async getPayroll(@Req() req: any, @Query('staffId') staffId?: string) {
    return this.hrService.getPayrollRecords(staffId || req.user.id, req.user.tenantId);
  }

  @Post('attendance/clockin')
  @ApiOperation({ summary: 'Clock in' })
  async clockIn(@Req() req: any) {
    // Would need staff profile ID - placeholder
    return { message: 'Clock in recorded' };
  }

  @Post('attendance/clockout')
  @ApiOperation({ summary: 'Clock out' })
  async clockOut(@Req() req: any) {
    return { message: 'Clock out recorded' };
  }

  @Get('stats')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get HR statistics' })
  async getStats(@Req() req: any) {
    return this.hrService.getHrStats(req.user.tenantId);
  }
}