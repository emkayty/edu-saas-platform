import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostelService } from '../services/hostel.service';
import { CreateHostelDto, UpdateHostelDto, CreateRoomDto, AllocateStudentDto, CreateMaintenanceDto, UpdateMaintenanceDto, CreateComplaintDto, HostelQueryDto } from '../dto/hostel.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('hostel')
@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  // Hostels
  @Post('hostels')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hostel' })
  async createHostel(@Body() dto: CreateHostelDto, @Req() req: any) {
    return this.hostelService.createHostel(dto, req.user.tenantId);
  }

  @Get('hostels')
  @ApiOperation({ summary: 'Get all hostels' })
  async getHostels(@Req() req: any, @Query('gender') gender?: string) {
    return this.hostelService.getHostels(req.user?.tenantId, gender);
  }

  @Get('hostels/:id')
  @ApiOperation({ summary: 'Get hostel by ID' })
  async getHostel(@Param('id') id: string) {
    return this.hostelService.getHostelById(id);
  }

  @Patch('hostels/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hostel' })
  async updateHostel(@Param('id') id: string, @Body() dto: UpdateHostelDto) {
    return this.hostelService.updateHostel(id, dto);
  }

  // Rooms
  @Post('rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create room' })
  async createRoom(@Body() dto: CreateRoomDto, @Req() req: any) {
    return this.hostelService.createRoom(dto, req.user.tenantId);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get rooms' })
  async getRooms(@Req() req: any, @Query('hostelId') hostelId?: string) {
    return this.hostelService.getRooms(hostelId, req?.user?.tenantId);
  }

  @Get('rooms/available')
  @ApiOperation({ summary: 'Get available rooms' })
  async getAvailableRooms(@Req() req: any, @Query('gender') gender?: string) {
    return this.hostelService.getAvailableRooms(req.user?.tenantId, gender);
  }

  // Allocations
  @Post('allocate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Allocate student to hostel' })
  async allocateStudent(@Body() dto: AllocateStudentDto, @Req() req: any) {
    return this.hostelService.allocateStudent(dto, req.user.tenantId);
  }

  @Get('my-allocation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my allocation' })
  async getMyAllocation(@Req() req: any) {
    return this.hostelService.getStudentAllocation(req.user.id, req.user.tenantId);
  }

  @Post('checkin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check in student' })
  async checkIn(@Param('id') id: string) {
    return this.hostelService.checkIn(id);
  }

  @Post('checkout/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check out student' })
  async checkOut(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.hostelService.checkOut(id, reason);
  }

  // Maintenance
  @Post('maintenance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report maintenance issue' })
  async createMaintenance(@Body() dto: CreateMaintenanceDto, @Req() req: any) {
    return this.hostelService.createMaintenance(dto, req.user.tenantId);
  }

  @Get('maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get maintenance requests' })
  async getMaintenance(@Req() req: any, @Query('roomId') roomId?: string) {
    return this.hostelService.getMaintenanceRequests(roomId, req.user.tenantId);
  }

  @Patch('maintenance/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update maintenance request' })
  async updateMaintenance(@Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    return this.hostelService.updateMaintenance(id, dto);
  }

  // Complaints
  @Post('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit complaint' })
  async createComplaint(@Body() dto: CreateComplaintDto, @Req() req: any) {
    return this.hostelService.createComplaint(dto, req.user.tenantId);
  }

  @Get('complaints')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my complaints' })
  async getMyComplaints(@Req() req: any) {
    return this.hostelService.getComplaints(req.user.id, req.user.tenantId);
  }

  @Patch('complaints/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve complaint' })
  async resolveComplaint(@Param('id') id: string, @Body('resolution') resolution: string) {
    return this.hostelService.resolveComplaint(id, resolution);
  }

  // Statistics
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hostel statistics' })
  async getStats(@Req() req: any) {
    return this.hostelService.getHostelStats(req.user.tenantId);
  }
}