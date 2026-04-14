import { Controller, Req, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardQueryDto, ReportQueryDto, AnalyticsQueryDto } from '../dto/analytics.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('dashboard')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get executive dashboard' })
  async getDashboard(@Req() req: any) {
    return this.service.getExecutiveDashboard(req.user.tenantId);
  }

  @Get('enrollment')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get enrollment analytics' })
  async getEnrollment(@Query() query: DashboardQueryDto, @Req() req: any) {
    return this.service.getEnrollmentAnalytics(req.user.tenantId, query.year);
  }

  @Get('revenue')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenue(@Req() req: any) {
    return this.service.getRevenueAnalytics(req.user.tenantId);
  }

  @Get('department-performance')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get department performance' })
  async getDepartmentPerformance(@Req() req: any) {
    return this.service.getDepartmentPerformance(req.user.tenantId);
  }

  @Get('course-performance')
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiOperation({ summary: 'Get course performance' })
  async getCoursePerformance(@Query() query: AnalyticsQueryDto, @Req() req: any) {
    return this.service.getCoursePerformance(req.user.tenantId, query.sessionId);
  }

  @Get('student-distribution')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get student performance distribution' })
  async getStudentDistribution(@Req() req: any) {
    return this.service.getStudentPerformanceDistribution(req.user.tenantId);
  }

  @Get('attendance')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get attendance trends' })
  async getAttendance(@Query() query: AnalyticsQueryDto, @Req() req: any) {
    return this.service.getAttendanceTrends(req.user.tenantId, query.weeks || 8);
  }

  @Get('demographics')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get student demographics' })
  async getDemographics(@Req() req: any) {
    return this.service.getStudentDemographics(req.user.tenantId);
  }

  @Get('fees')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get fee collection analytics' })
  async getFeeCollection(@Req() req: any) {
    return this.service.getFeeCollectionRate(req.user.tenantId);
  }

  @Get('retention')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get retention analytics' })
  async getRetention(@Req() req: any) {
    return this.service.getRetentionRate(req.user.tenantId);
  }

  @Get('reports/generate')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Generate report' })
  async generateReport(@Query() query: ReportQueryDto, @Req() req: any) {
    return this.service.generateReport(query.type || 'summary', query, req.user.tenantId);
  }
}