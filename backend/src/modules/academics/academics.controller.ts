import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicsService } from './services/academics.service';
import { 
  CreateFacultyDto, UpdateFacultyDto,
  CreateDepartmentDto, UpdateDepartmentDto,
  CreateProgramDto, UpdateProgramDto,
  CreateCourseDto, UpdateCourseDto,
  CreateAcademicSessionDto, UpdateAcademicSessionDto,
  CourseAllocationDto, StudentCourseRegistrationDto, BulkGradeEntryDto,
  AcademicQueryDto
} from './dto/academic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('academics')
@Controller('academics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  // ============== FACULTIES ==============

  @Post('faculties')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new faculty' })
  async createFaculty(@Body() dto: CreateFacultyDto, @Req() req: any) {
    return this.academicsService.createFaculty(dto, req.user.tenantId);
  }

  @Get('faculties')
  @ApiOperation({ summary: 'Get all faculties' })
  async getFaculties(@Req() req: any, @Query('facultyId') facultyId?: string) {
    return this.academicsService.getFaculties(req.user.tenantId);
  }

  @Get('faculties/:id')
  @ApiOperation({ summary: 'Get faculty by ID' })
  async getFacultyById(@Param('id') id: string) {
    return this.academicsService.getFacultyById(id);
  }

  @Patch('faculties/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update faculty' })
  async updateFaculty(@Param('id') id: string, @Body() dto: UpdateFacultyDto) {
    return this.academicsService.updateFaculty(id, dto);
  }

  @Delete('faculties/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Delete faculty' })
  async deleteFaculty(@Param('id') id: string) {
    return this.academicsService.deleteFaculty(id);
  }

  // ============== DEPARTMENTS ==============

  @Post('departments')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new department' })
  async createDepartment(@Body() dto: CreateDepartmentDto, @Req() req: any) {
    return this.academicsService.createDepartment(dto, req.user.tenantId);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  async getDepartments(@Req() req: any, @Query() query: AcademicQueryDto) {
    return this.academicsService.getDepartments(req.user.tenantId, query.facultyId);
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Get department by ID' })
  async getDepartmentById(@Param('id') id: string) {
    return this.academicsService.getDepartmentById(id);
  }

  @Patch('departments/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update department' })
  async updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.academicsService.updateDepartment(id, dto);
  }

  @Delete('departments/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Delete department' })
  async deleteDepartment(@Param('id') id: string) {
    return this.academicsService.deleteDepartment(id);
  }

  // ============== PROGRAMS ==============

  @Post('programs')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a new program' })
  async createProgram(@Body() dto: CreateProgramDto, @Req() req: any) {
    return this.academicsService.createProgram(dto, req.user.tenantId);
  }

  @Get('programs')
  @ApiOperation({ summary: 'Get all programs' })
  async getPrograms(@Req() req: any, @Query() query: AcademicQueryDto) {
    return this.academicsService.getPrograms(req.user.tenantId, query.departmentId);
  }

  @Get('programs/:id')
  @ApiOperation({ summary: 'Get program by ID' })
  async getProgramById(@Param('id') id: string) {
    return this.academicsService.getProgramById(id);
  }

  @Patch('programs/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update program' })
  async updateProgram(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.academicsService.updateProgram(id, dto);
  }

  // ============== COURSES ==============

  @Post('courses')
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiOperation({ summary: 'Create a new course' })
  async createCourse(@Body() dto: CreateCourseDto, @Req() req: any) {
    return this.academicsService.createCourse(dto, req.user.tenantId);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses' })
  async getCourses(@Req() req: any, @Query() query: AcademicQueryDto) {
    return this.academicsService.getCourses(
      req.user.tenantId, 
      query.departmentId, 
      query.level, 
      query.semester
    );
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  async getCourseById(@Param('id') id: string) {
    return this.academicsService.getCourseById(id);
  }

  @Patch('courses/:id')
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiOperation({ summary: 'Update course' })
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.academicsService.updateCourse(id, dto);
  }

  // ============== ACADEMIC SESSIONS ==============

  @Post('sessions')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create academic session' })
  async createSession(@Body() dto: CreateAcademicSessionDto, @Req() req: any) {
    return this.academicsService.createAcademicSession(dto, req.user.tenantId);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all academic sessions' })
  async getSessions(@Req() req: any) {
    return this.academicsService.getAcademicSessions(req.user.tenantId);
  }

  @Get('sessions/active')
  @ApiOperation({ summary: 'Get active academic session' })
  async getActiveSession(@Req() req: any) {
    return this.academicsService.getActiveSession(req.user.tenantId);
  }

  @Patch('sessions/:id/activate')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Set active academic session' })
  async setActiveSession(@Param('id') id: string) {
    return this.academicsService.setActiveSession(id);
  }

  @Patch('sessions/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update academic session' })
  async updateSession(@Param('id') id: string, @Body() dto: UpdateAcademicSessionDto) {
    // Implementation would update the session
    return { id, ...dto };
  }

  // ============== COURSE ALLOCATIONS ==============

  @Post('allocations')
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiOperation({ summary: 'Allocate course to lecturer' })
  async allocateCourse(@Body() dto: CourseAllocationDto, @Req() req: any) {
    return this.academicsService.allocateCourse(dto, req.user.tenantId);
  }

  @Get('allocations')
  @ApiOperation({ summary: 'Get course allocations' })
  async getAllocations(@Query('lecturerId') lecturerId?: string, @Query('sessionId') sessionId?: string) {
    return this.academicsService.getCourseAllocations(lecturerId, sessionId);
  }

  // ============== STUDENT COURSE REGISTRATION ==============

  @Post('registrations')
  @ApiOperation({ summary: 'Register student for courses' })
  async registerCourses(@Body() dto: StudentCourseRegistrationDto, @Req() req: any) {
    return this.academicsService.registerStudentCourses(req.user.id, dto, req.user.tenantId);
  }

  @Get('registrations')
  @ApiOperation({ summary: 'Get student course registrations' })
  async getStudentCourses(@Req() req: any, @Query('sessionId') sessionId: string) {
    return this.academicsService.getStudentCourses(req.user.id, sessionId);
  }

  @Delete('registrations/:id')
  @ApiOperation({ summary: 'Drop a course' })
  async dropCourse(@Param('id') id: string) {
    return this.academicsService.dropCourse(id);
  }

  // ============== GRADES ==============

  @Post('grades/bulk')
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiOperation({ summary: 'Bulk enter grades' })
  async bulkEnterGrades(@Body() dto: BulkGradeEntryDto, @Req() req: any) {
    // Implementation would process bulk grade entry
    return { message: 'Grades processed', count: dto.grades.length };
  }

  @Get('students/cgpa')
  @ApiOperation({ summary: 'Calculate student CGPA' })
  async calculateCGPA(@Req() req: any, @Query('sessionId') sessionId?: string) {
    return this.academicsService.calculateCGPA(req.user.id, sessionId);
  }
}