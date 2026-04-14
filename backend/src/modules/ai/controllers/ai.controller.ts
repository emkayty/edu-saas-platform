import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './services/ai.service';
import { 
  StartConversationDto, SendMessageDto, CreateRagDocumentDto, GetInsightsDto, ChatFeedbackDto,
  CreateLearningPathDto, GetRecommendationsDto, GradeAssignmentDto, CheckPlagiarismDto,
  SemanticSearchDto, IndexContentDto, ForecastEnrollmentDto, DetectAnomalyDto, AnalyzeSentimentDto,
  ResolveInsightDto, PredictDropoutDto, PredictGradeDto, AnalyzeQuestionBankDto, AddQuestionDto
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ============== 🤖 INTELLIGENT CHATBOT ==============
  @Post('chat/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start chatbot conversation' })
  async startChat(@Body() dto: StartConversationDto, @Req() req: any) {
    return this.aiService.startConversation(req.user.id, dto.chatbotType, dto.language || 'en', req.user.tenantId);
  }

  @Post('chat/:id/message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to chatbot' })
  async sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto, @Req() req: any) {
    return this.aiService.sendMessage(id, dto, req.user.tenantId);
  }

  @Get('chat/conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my conversations' })
  async getConversations(@Req() req: any) {
    return { message: 'List of conversations' };
  }

  @Post('chat/:id/feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate conversation' })
  async giveFeedback(@Param('id') id: string, @Body() dto: ChatFeedbackDto) {
    return { message: 'Feedback recorded', rating: dto.rating };
  }

  @Post('chat/intents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create chatbot intent' })
  async createIntent(@Body() body: any) {
    return { message: 'Intent created' };
  }

  // ============== 📚 RAG KNOWLEDGE BASE ==============
  @Post('rag/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add document to knowledge base' })
  async addRagDocument(@Body() dto: CreateRagDocumentDto, @Req() req: any) {
    return this.aiService.createRagDocument(dto, req.user.tenantId);
  }

  @Get('rag/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search knowledge base' })
  async searchRag(@Query('q') query: string, @Req() req: any) {
    return this.aiService.searchRAG(query, req.user.tenantId);
  }

  // ============== 🎯 STUDENT SUCCESS & PREDICTIVE ANALYTICS ==============
  @Get('insights')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI insights' })
  async getInsights(@Req() req: any, @Query() query: GetInsightsDto) {
    return this.aiService.getInsights(req.user.tenantId, query.type);
  }

  @Post('insights/student/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate insights for a student' })
  async generateStudentInsights(@Param('id') id: string, @Req() req: any) {
    return this.aiService.generateStudentInsights(id, req.user.tenantId);
  }

  @Post('insights/department/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate department insights' })
  async generateDepartmentInsights(@Param('id') id: string, @Req() req: any) {
    return { departmentId: id, generatedAt: new Date() };
  }

  @Patch('insights/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve insight' })
  async resolveInsight(@Param('id') id: string, @Body() dto: ResolveInsightDto) {
    return { message: 'Insight resolved', status: dto.interventionStatus };
  }

  @Post('predictions/dropout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Predict dropout risk for a student' })
  async predictDropout(@Body() dto: PredictDropoutDto, @Req() req: any) {
    return this.aiService.predictDropoutRisk(dto.studentId, req.user.tenantId);
  }

  @Post('predictions/grade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Predict student grade for a course' })
  async predictGrade(@Body() dto: PredictGradeDto, @Req() req: any) {
    return this.aiService.predictGrade(dto.studentId, dto.courseId, req.user.tenantId);
  }

  // ============== 🎓 PERSONALIZED LEARNING ==============
  @Post('learning-paths')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create personalized learning path' })
  async createLearningPath(@Body() dto: CreateLearningPathDto, @Req() req: any) {
    return this.aiService.createLearningPath(dto.studentId, dto, req.user.tenantId);
  }

  @Get('learning-paths/student/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student learning paths' })
  async getLearningPaths(@Param('id') id: string, @Req() req: any) {
    return { message: 'Learning paths for student' };
  }

  @Post('course-recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course recommendations' })
  async getCourseRecommendations(@Body() dto: GetRecommendationsDto, @Req() req: any) {
    return this.aiService.getCourseRecommendations(dto.studentId, dto.careerGoals || [], req.user.tenantId);
  }

  @Post('course-recommendations/:id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept course recommendation' })
  async acceptRecommendation(@Param('id') id: string) {
    return { message: 'Recommendation accepted' };
  }

  // ============== 📝 INTELLIGENT ASSESSMENT ==============
  @Post('assessment/grade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI grade essay assignment' })
  async gradeEssay(@Body() dto: GradeAssignmentDto, @Req() req: any) {
    return this.aiService.gradeEssay(dto.assignmentId, dto.studentId, dto.content, dto.criteria || [], req.user.tenantId);
  }

  @Post('assessment/plagiarism')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check plagiarism' })
  async checkPlagiarism(@Body() dto: CheckPlagiarismDto, @Req() req: any) {
    return this.aiService.checkPlagiarism(dto.submissionId, dto.studentId, dto.content, req.user.tenantId);
  }

  @Get('assessment/grades/student/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student AI grades' })
  async getStudentGrades(@Param('id') id: string) {
    return { message: 'AI graded assignments' };
  }

  // ============== 📋 QUESTION BANK ==============
  @Post('question-bank')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add question to bank' })
  async addQuestion(@Body() dto: AddQuestionDto, @Req() req: any) {
    return { message: 'Question added' };
  }

  @Get('question-bank/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'lecturer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get question bank' })
  async getQuestionBank(@Param('courseId') courseId: string, @Req() req: any) {
    return this.aiService.analyzeQuestionBank(courseId, req.user.tenantId);
  }

  // ============== 🔍 SEMANTIC SEARCH ==============
  @Post('search/semantic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Semantic search across all content' })
  async semanticSearch(@Body() dto: SemanticSearchDto, @Req() req: any) {
    return this.aiService.semanticSearch(dto.query, dto.entityTypes, req.user.tenantId, dto.limit || 10);
  }

  @Post('search/index')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Index content for search' })
  async indexContent(@Body() dto: IndexContentDto, @Req() req: any) {
    return this.aiService.indexForSearch(dto.entityType, dto.entityId, dto.title, dto.content, dto.metadata, req.user.tenantId);
  }

  @Get('search/courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Course discovery by career goal' })
  async discoverCourses(@Query('goal') goal: string) {
    return { message: 'Courses matching your career goal' };
  }

  @Get('search/research')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find relevant research papers' })
  async findResearch(@Query('topic') topic: string) {
    return { message: 'Research papers on this topic' };
  }

  // ============== 📊 ADMINISTRATIVE AUTOMATION ==============
  @Post('admin/forecast-enrollment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Forecast enrollment' })
  async forecastEnrollment(@Body() dto: ForecastEnrollmentDto, @Req() req: any) {
    return this.aiService.forecastEnrollment(dto.sessionId, dto.semester, req.user.tenantId);
  }

  @Post('admin/anomaly-detect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detect anomalies' })
  async detectAnomaly(@Body() dto: DetectAnomalyDto, @Req() req: any) {
    return this.aiService.detectAnomalies(dto.type, dto.entityId, { ...dto.data, entityType: dto.entityType }, req.user.tenantId);
  }

  @Get('admin/anomalies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get anomaly alerts' })
  async getAnomalies(@Req() req: any) {
    return { message: 'Active anomaly alerts' };
  }

  @Post('admin/sentiment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyze feedback sentiment' })
  async analyzeSentiment(@Body() dto: AnalyzeSentimentDto, @Req() req: any) {
    return this.aiService.analyzeFeedback(dto.feedbackText, dto.entityType, dto.entityId, req.user.tenantId);
  }

  // ============== 📈 DASHBOARDS ==============
  @Get('dashboard/student-success')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Student success dashboard' })
  async getStudentSuccessDashboard(@Req() req: any) {
    return this.aiService.getStudentSuccessDashboard(req.user.tenantId);
  }

  @Get('dashboard/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin analytics dashboard' })
  async getAdminDashboard(@Req() req: any) {
    return this.aiService.getAdminDashboard(req.user.tenantId);
  }
}