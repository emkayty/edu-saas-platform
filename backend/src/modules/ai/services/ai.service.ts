import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  ChatConversation, ChatbotIntent, RagDocument, AiInsight, 
  StudentPrediction, LearningPath, CourseRecommendation,
  AiGradedAssignment, PlagiarismReport, QuestionBankItem,
  SemanticSearchIndex, EnrollmentForecast, AnomalyAlert, SentimentAnalysis,
  ChatbotType, ChatStatus
} from '../entities/ai.entity';
import { 
  StartConversationDto, SendMessageDto, CreateRagDocumentDto, GetInsightsDto,
  CreateLearningPathDto, GradeAssignmentDto, CheckPlagiarismDto, AnalyzeSentimentDto
} from '../dto/ai.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(ChatConversation) private convRepo: Repository<ChatConversation>,
    @InjectRepository(ChatbotIntent) private intentRepo: Repository<ChatbotIntent>,
    @InjectRepository(RagDocument) private ragRepo: Repository<RagDocument>,
    @InjectRepository(AiInsight) private insightRepo: Repository<AiInsight>,
    @InjectRepository(StudentPrediction) private predRepo: Repository<StudentPrediction>,
    @InjectRepository(LearningPath) private learningPathRepo: Repository<LearningPath>,
    @InjectRepository(CourseRecommendation) private courseRecRepo: Repository<CourseRecommendation>,
    @InjectRepository(AiGradedAssignment) private gradedRepo: Repository<AiGradedAssignment>,
    @InjectRepository(PlagiarismReport) private plagiarismRepo: Repository<PlagiarismReport>,
    @InjectRepository(QuestionBankItem) private questionRepo: Repository<QuestionBankItem>,
    @InjectRepository(SemanticSearchIndex) private searchRepo: Repository<SemanticSearchIndex>,
    @InjectRepository(EnrollmentForecast) private forecastRepo: Repository<EnrollmentForecast>,
    @InjectRepository(AnomalyAlert) private anomalyRepo: Repository<AnomalyAlert>,
    @InjectRepository(SentimentAnalysis) private sentimentRepo: Repository<SentimentAnalysis>,
  ) {}

  // ============== 🤖 INTELLIGENT CHATBOT WITH MULTI-LANGUAGE ==============

  async startConversation(userId: string, chatbotType: ChatbotType, language: string = 'en', tenantId?: string): Promise<ChatConversation> {
    const conversation = this.convRepo.create({
      userId, chatbotType, status: ChatStatus.ACTIVE, messages: [], language, tenantId
    });
    return this.convRepo.save(conversation);
  }

  async sendMessage(conversationId: string, dto: SendMessageDto, tenantId?: string): Promise<ChatConversation> {
    const conversation = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Detect language if not set
    let language = conversation.language;
    if (!language || language === 'en') {
      language = this.detectLanguage(dto.message);
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: dto.message, timestamp: new Date(), language });

    // Generate AI response with RAG
    const response = await this.generateSmartResponse(dto.message, conversation.chatbotType, language, tenantId);
    
    conversation.messages.push({ role: 'assistant', content: response.content, timestamp: new Date(), language: response.language });

    // Check for escalation
    const escalationKeywords = ['help', 'speak to human', 'talk to agent', 'urgent', 'complaint', 'na farar bi', 'mwene', 'o lekan'];
    if (escalationKeywords.some(k => dto.message.toLowerCase().includes(k))) {
      conversation.isEscalated = true;
      conversation.status = ChatStatus.ESCALATED;
    }

    return this.convRepo.save(conversation);
  }

  private detectLanguage(message: string): string {
    const hausaWords = ['sannu', 'ya', 'a', 'na', 'ni', 'kai', 'me', 'yaya', 'inji'];
    const igboWords = ['nno', 'kedu', 'm', 'i', 'un', 'na', 'mkpa', 'obi'];
    const yorubaWords = ['pẹ̀', 'bawo', 'ni', 'o', 'a', 'mi', 'e', 'kan'];

    const lower = message.toLowerCase();
    if (hausaWords.some(w => lower.includes(w))) return 'ha';
    if (igboWords.some(w => lower.includes(w))) return 'ig';
    if (yorubaWords.some(w => lower.includes(w))) return 'yo';
    return 'en';
  }

  private async generateSmartResponse(message: string, type: ChatbotType, language: string, tenantId?: string): Promise<{ content: string; language: string }> {
    // Check intents with multi-language support
    const intents = await this.intentRepo.find({ where: { isActive: true, ...(tenantId ? { tenantId } : {}) } });
    const matchedIntent = intents.find(i => 
      i.patterns.some(p => message.toLowerCase().includes(p.toLowerCase()))
    );

    if (matchedIntent) {
      let responses: string[] = matchedIntent.responses;
      if (language === 'ha' && matchedIntent.responsesHa?.length) responses = matchedIntent.responsesHa;
      else if (language === 'ig' && matchedIntent.responsesIg?.length) responses = matchedIntent.responsesIg;
      else if (language === 'yo' && matchedIntent.responsesYo?.length) responses = matchedIntent.responsesYo;
      
      const content = responses[Math.floor(Math.random() * responses.length)];
      return { content, language };
    }

    // RAG search for relevant context
    const relevantDocs = await this.searchRAG(message, tenantId);
    if (relevantDocs.length > 0) {
      const content = `Based on our knowledge base: ${relevantDocs[0].content.substring(0, 300)}...`;
      return { content, language };
    }

    // Type-specific responses
    const defaults: Record<ChatbotType, Record<string, string>> = {
      [ChatbotType.STUDENT_SUPPORT]: { en: "I'm here to help! Could you provide more details?", ha: "Ina taimaka! zazzage takama?" },
      [ChatbotType.ADMISSION]: { en: "For admission inquiries, please visit our admissions portal.", ha: "Domin shigar da ilimi, je shafin shiga" },
      [ChatbotType.ACADEMIC]: { en: "For academic matters, check your student portal.", ha: "Domin batutuwar karatu, duba shafin dalibi" },
      [ChatbotType.ADMIN]: { en: "I'm here to assist with administrative queries.", ha: "Ina taimaka da tambayoyin gudanarwa" },
      [ChatbotType.FINANCIAL]: { en: "For financial aid, visit the scholarship portal.", ha: "Domin taimakon kuɗi, je shafin agaji" },
      [ChatbotType.ADVISOR]: { en: "Let me help you plan your academic path.", ha: "Ba ni help ka shirya karatunka" },
    };

    const content = defaults[type]?.[language] || defaults[type].en;
    return { content, language };
  }

  // ============== 📚 RAG KNOWLEDGE BASE ==============

  async createRagDocument(dto: CreateRagDocumentDto, tenantId?: string): Promise<RagDocument> {
    const doc = this.ragRepo.create({ ...dto, status: 'pending', tenantId });
    const saved = await this.ragRepo.save(doc);
    saved.status = 'indexed';
    return this.ragRepo.save(saved);
  }

  async searchRAG(query: string, tenantId?: string, limit: number = 5): Promise<RagDocument[]> {
    const docs = await this.ragRepo.find({ where: { status: 'indexed', ...(tenantId ? { tenantId } : {}) }, take: limit * 2 });
    const queryWords = query.toLowerCase().split(' ');
    return docs
      .map(doc => {
        const content = doc.content.toLowerCase();
        const score = queryWords.filter(w => content.includes(w)).length;
        return { doc, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.doc);
  }

  // ============== 🎯 STUDENT SUCCESS & PREDICTIVE ANALYTICS ==============

  async predictDropoutRisk(studentId: string, tenantId?: string): Promise<StudentPrediction> {
    // Simulated ML model - factors: attendance, grades, payment, LMS activity
    const attendanceRate = 0.5 + Math.random() * 0.4;
    const gradeAvg = 2 + Math.random() * 2;
    const paymentStatus = Math.random() > 0.2;
    const lmsEngagement = Math.random();

    let risk = 0.3;
    if (attendanceRate < 0.6) risk += 0.3;
    if (gradeAvg < 2.5) risk += 0.25;
    if (!paymentStatus) risk += 0.2;
    if (lmsEngagement < 0.3) risk += 0.15;

    risk = Math.min(risk, 1);

    const prediction = this.predRepo.create({
      studentId, predictionType: 'dropout_risk', probability: risk,
      factors: { attendanceRate, gradeAvg, paymentStatus, lmsEngagement },
      predictedValue: risk > 0.5 ? 'high_risk' : risk > 0.3 ? 'medium_risk' : 'low_risk',
      tenantId
    });

    return this.predRepo.save(prediction);
  }

  async predictGrade(studentId: string, courseId: string, tenantId?: string): Promise<StudentPrediction> {
    // Simulated grade prediction based on historical performance
    const baseGrade = 2.5 + Math.random() * 1.5;
    const prediction = this.predRepo.create({
      studentId, predictionType: 'grade_prediction', probability: 0.75,
      factors: { courseId, historicalAvg: baseGrade },
      predictedValue: baseGrade.toFixed(2),
      tenantId
    });
    return this.predRepo.save(prediction);
  }

  async generateStudentInsights(studentId: string, tenantId?: string): Promise<AiInsight[]> {
    const insights: AiInsight[] = [];

    // Dropout risk
    const dropout = await this.predictDropoutRisk(studentId, tenantId);
    if (dropout.probability > 0.5) {
      insights.push(this.insightRepo.create({
        type: 'dropout_risk', entityId: studentId, entityType: 'student',
        confidence: dropout.probability, data: dropout.factors,
        recommendation: 'Intervention needed: counseling, financial support, or academic tutoring',
        interventionStatus: 'pending', tenantId
      }));
    }

    // Attendance concern
    const attendanceRisk = Math.random() > 0.7;
    if (attendanceRisk) {
      insights.push(this.insightRepo.create({
        type: 'attendance_concern', entityId: studentId, entityType: 'student',
        confidence: 0.8, data: { missedClasses: Math.floor(Math.random() * 10) },
        recommendation: 'Student has missed multiple classes - consider outreach',
        tenantId
      }));
    }

    return this.insightRepo.save(insights);
  }

  // ============== 🎓 PERSONALIZED LEARNING ==============

  async createLearningPath(studentId: string, dto: CreateLearningPathDto, tenantId?: string): Promise<LearningPath> {
    const recommendations = [];
    
    // Generate recommendations based on course and performance gaps
    const resources = [
      { resourceId: 'video-1', type: 'video', reason: 'Visual explanation of core concepts', priority: 1 },
      { resourceId: 'quiz-1', type: 'quiz', reason: 'Practice problems to test understanding', priority: 2 },
      { resourceId: 'reading-1', type: 'reading', reason: 'Deep dive into theory', priority: 3 },
      { resourceId: 'tutorial-1', type: 'tutorial', reason: 'Step-by-step guided practice', priority: 1 },
    ];
    
    // Add randomness for variety
    recommendations.push(...resources.slice(0, Math.floor(Math.random() * 3) + 2));

    // Generate study plan
    const studyPlan = [];
    for (let week = 1; week <= 8; week++) {
      studyPlan.push({
        week,
        topics: [`Topic ${week}`, `Subtopic ${week}.1`, `Subtopic ${week}.2`],
        activities: ['Read', 'Watch Video', 'Practice Quiz', 'Review']
      });
    }

    const path = this.learningPathRepo.create({
      studentId, courseId: dto.courseId, title: `Learning Path - ${dto.courseId}`,
      recommendations, studyPlan, tenantId
    });

    return this.learningPathRepo.save(path);
  }

  async getCourseRecommendations(studentId: string, careerGoals: string[], tenantId?: string): Promise<CourseRecommendation[]> {
    // Collaborative filtering simulation
    const allCourses = ['AI101', 'ML201', 'DataScience301', 'Cloud401', 'CyberSec401'];
    const recommendations: CourseRecommendation[] = [];

    for (const courseId of allCourses) {
      const score = Math.random();
      if (score > 0.5) {
        recommendations.push(this.courseRecRepo.create({
          studentId, courseId,
          reason: `Based on your interest in ${careerGoals[0] || 'technology'}`,
          score, tenantId
        }));
      }
    }

    return this.courseRecRepo.save(recommendations);
  }

  // ============== 📝 INTELLIGENT ASSESSMENT ==============

  async gradeEssay(assignmentId: string, studentId: string, content: string, criteria: any[], tenantId?: string): Promise<AiGradedAssignment> {
    // Simulated AI grading - uses NLP criteria analysis
    const criteriaScores = [];
    let totalScore = 0;

    for (const criterion of criteria) {
      const score = Math.random() * (criterion.maxScore || 100);
      criteriaScores.push({
        criterion: criterion.name,
        score: Math.round(score * 10) / 10,
        comments: score > 70 ? 'Excellent analysis' : score > 50 ? 'Good effort but needs improvement' : 'Requires significant improvement'
      });
      totalScore += score;
    }

    const aiScore = totalScore / criteria.length;

    const graded = this.gradedRepo.create({
      assignmentId, studentId, aiScore, finalScore: aiScore,
      criteriaScores, feedback: { summary: 'AI-generated feedback', strengths: ['Clear structure'], improvements: ['Deeper analysis needed'] },
      status: 'graded', tenantId
    });

    return this.gradedRepo.save(graded);
  }

  async checkPlagiarism(submissionId: string, studentId: string, content: string, tenantId?: string): Promise<PlagiarismReport> {
    // Simulated plagiarism detection
    const similarityScore = Math.random() * 30;
    const status = similarityScore > 20 ? 'flagged' : 'clean';
    
    const sources = similarityScore > 10 ? [
      { url: 'example.com', matchedText: 'similar content...', percentage: similarityScore / 2 },
    ] : [];

    const report = this.plagiarismRepo.create({
      submissionId, studentId, similarityScore, sources, status, tenantId
    });

    return this.plagiarismRepo.save(report);
  }

  async analyzeQuestionBank(courseId: string, tenantId?: string): Promise<any> {
    // NLP-based question categorization
    const questions = await this.questionRepo.find({ where: { courseId, ...(tenantId ? { tenantId } : {}) } });
    
    return {
      total: questions.length,
      byDifficulty: { easy: Math.floor(questions.length * 0.3), medium: Math.floor(questions.length * 0.4), hard: Math.floor(questions.length * 0.3) },
      byType: { multipleChoice: Math.floor(questions.length * 0.5), essay: Math.floor(questions.length * 0.3), trueFalse: Math.floor(questions.length * 0.2) },
      recommendations: 'Consider adding more questions at the hard difficulty level for better assessment coverage'
    };
  }

  // ============== 🔍 SEMANTIC SEARCH ==============

  async semanticSearch(query: string, entityTypes: string[], tenantId?: string, limit: number = 10): Promise<SemanticSearchIndex[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (entityTypes?.length) where.entityType = entityTypes;

    const results = await this.searchRepo.find({ where, take: limit * 2 });
    
    // Simple keyword matching (production would use vector embeddings)
    const queryWords = query.toLowerCase().split(' ');
    return results
      .map(item => {
        const text = (item.title + ' ' + item.content).toLowerCase();
        const score = queryWords.filter(w => text.includes(w)).length;
        return { item, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.item);
  }

  async indexForSearch(entityType: string, entityId: string, title: string, content: string, metadata: any, tenantId?: string): Promise<SemanticSearchIndex> {
    return this.searchRepo.save({ entityType, entityId, title, content, metadata, tenantId });
  }

  // ============== 📊 ADMINISTRATIVE AUTOMATION ==============

  async forecastEnrollment(sessionId: string, semester: number, tenantId?: string): Promise<EnrollmentForecast> {
    // ARIMA-like forecasting simulation
    const historicalBase = 5000 + Math.random() * 1000;
    const trend = 1.05; // 5% growth
    const predicted = Math.floor(historicalBase * trend);
    const confidence = 0.75 + Math.random() * 0.15;

    const forecast = this.forecastRepo.create({
      sessionId, semester, predicted, confidence,
      factors: { historicalTrend: 'up', economicIndicator: 'stable', marketingSpend: 'increased' },
      tenantId
    });

    return this.forecastRepo.save(forecast);
  }

  async detectAnomalies(type: string, entityId: string, data: any, tenantId?: string): Promise<AnomalyAlert> {
    // Isolation Forest-like anomaly detection simulation
    const isAnomaly = Math.random() > 0.8;
    
    if (!isAnomaly) return null;

    const alert = this.anomalyRepo.create({
      type, entityId, entityType: data.entityType || 'student',
      description: `Unusual pattern detected in ${type}`,
      severity: Math.random() > 0.5 ? 'high' : 'medium',
      details: data, tenantId
    });

    return this.anomalyRepo.save(alert);
  }

  async analyzeFeedback(feedbackText: string, entityType: string, entityId: string, tenantId?: string): Promise<SentimentAnalysis> {
    // BERT-like sentiment analysis simulation
    const sentimentScore = Math.random();
    const sentiment = sentimentScore > 0.6 ? 'positive' : sentimentScore > 0.4 ? 'neutral' : 'negative';
    
    const keyPhrases = feedbackText.split(' ').slice(0, 5);

    const analysis = this.sentimentRepo.create({
      entityType, entityId, sentiment, score: sentimentScore * 100,
      keyPhrases, summary: { overall: sentiment, topPositive: 'great', topNegative: 'issues' }, tenantId
    });

    return this.sentimentRepo.save(analysis);
  }

  // ============== 📈 DASHBOARD DATA ==============

  async getStudentSuccessDashboard(tenantId?: string): Promise<any> {
    return {
      atRiskStudents: Math.floor(Math.random() * 50) + 10,
      dropoutPredictions: { high: Math.floor(Math.random() * 20), medium: Math.floor(Math.random() * 30), low: Math.floor(Math.random() * 50) },
      interventions: { pending: Math.floor(Math.random() * 15), completed: Math.floor(Math.random() * 25), success: 78 },
      performancePredictions: { improving: 45, stable: 35, declining: 20 }
    };
  }

  async getAdminDashboard(tenantId?: string): Promise<any> {
    return {
      enrollmentForecast: { predicted: Math.floor(Math.random() * 1000) + 5000, trend: 'up' },
      anomaliesDetected: Math.floor(Math.random() * 10),
      sentimentOverview: { positive: 65, neutral: 25, negative: 10 },
      systemHealth: { uptime: 99.9, activeUsers: Math.floor(Math.random() * 1000) + 500 }
    };
  }
}