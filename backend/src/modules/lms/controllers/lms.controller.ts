import { Controller, Req, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LmsService } from '../services/lms.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('lms')
@Controller('lms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Get('courses')
  @ApiOperation({ summary: 'Get all LMS courses' })
  async getCourses(@Req() req: any) {
    return this.lmsService.getCourses(req.user.tenantId);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  async getCourse(@Param('id') id: string) {
    return this.lmsService.getCourseById(id);
  }

  @Post('courses/:id/enroll')
  @ApiOperation({ summary: 'Enroll in course' })
  async enroll(@Param('id') id: string, @Req() req: any) {
    return this.lmsService.enrollStudent(req.user.id, id, req.user.tenantId);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Get my enrollments' })
  async getEnrollments(@Req() req: any) {
    return this.lmsService.getStudentEnrollments(req.user.id, req.user.tenantId);
  }

  @Post('progress/:enrollmentId')
  @ApiOperation({ summary: 'Update lesson progress' })
  async updateProgress(@Param('enrollmentId') enrollmentId: string, @Body('lessonId') lessonId: string) {
    return this.lmsService.updateProgress(enrollmentId, lessonId);
  }

  @Get('courses/:courseId/quizzes')
  @ApiOperation({ summary: 'Get course quizzes' })
  async getQuizzes(@Param('courseId') courseId: string) {
    return this.lmsService.getQuizzes(courseId);
  }

  @Get('courses/:courseId/assignments')
  @ApiOperation({ summary: 'Get course assignments' })
  async getAssignments(@Param('courseId') courseId: string) {
    return this.lmsService.getAssignments(courseId);
  }

  @Get('courses/:courseId/discussions')
  @ApiOperation({ summary: 'Get course discussions' })
  async getDiscussions(@Param('courseId') courseId: string) {
    return this.lmsService.getDiscussions(courseId);
  }

  @Post('courses/:courseId/discussions')
  @ApiOperation({ summary: 'Create discussion post' })
  async createDiscussion(@Param('courseId') courseId: string, @Body() body: { title: string; content: string }, @Req() req: any) {
    return this.lmsService.createDiscussion({
      lmsCourseId: courseId,
      userId: req.user.id,
      title: body.title,
      content: body.content
    }, req.user.tenantId);
  }
}