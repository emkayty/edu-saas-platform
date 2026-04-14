import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LmsCourse, LmsEnrollment, LmsQuiz, LmsQuizAttempt, LmsAssignment, LmsSubmission, LmsDiscussion } from '../entities/lms.entity';

@Injectable()
export class LmsService {
  constructor(
    @InjectRepository(LmsCourse)
    private courseRepo: Repository<LmsCourse>,
    @InjectRepository(LmsEnrollment)
    private enrollmentRepo: Repository<LmsEnrollment>,
    @InjectRepository(LmsQuiz)
    private quizRepo: Repository<LmsQuiz>,
    @InjectRepository(LmsQuizAttempt)
    private quizAttemptRepo: Repository<LmsQuizAttempt>,
    @InjectRepository(LmsAssignment)
    private assignmentRepo: Repository<LmsAssignment>,
    @InjectRepository(LmsSubmission)
    private submissionRepo: Repository<LmsSubmission>,
    @InjectRepository(LmsDiscussion)
    private discussionRepo: Repository<LmsDiscussion>,
  ) {}

  // Courses
  async getCourses(tenantId?: string): Promise<LmsCourse[]> {
    return this.courseRepo.find({ where: tenantId ? { tenantId, isPublished: true } : {}, order: { createdAt: 'DESC' } });
  }

  async getCourseById(id: string): Promise<LmsCourse> {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async createCourse(course: Partial<LmsCourse>, tenantId?: string): Promise<LmsCourse> {
    return this.courseRepo.save({ ...course, tenantId });
  }

  // Enrollments
  async enrollStudent(studentId: string, courseId: string, tenantId?: string): Promise<LmsEnrollment> {
    const existing = await this.enrollmentRepo.findOne({ where: { studentId, lmsCourseId: courseId } });
    if (existing) return existing;
    
    return this.enrollmentRepo.save({ studentId, lmsCourseId: courseId, tenantId });
  }

  async getStudentEnrollments(studentId: string, tenantId?: string): Promise<LmsEnrollment[]> {
    return this.enrollmentRepo.find({ 
      where: { studentId, ...(tenantId ? { tenantId } : {}) },
      relations: ['lmsCourse']
    });
  }

  async updateProgress(enrollmentId: string, lessonId: string): Promise<LmsEnrollment> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    
    const completedLessons = enrollment.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      enrollment.completedLessons = completedLessons;
      enrollment.progress = (completedLessons.length / 100) * 100; // Simplified
      enrollment.lastAccessedAt = new Date();
    }
    
    return this.enrollmentRepo.save(enrollment);
  }

  // Quizzes
  async getQuizzes(courseId: string): Promise<LmsQuiz[]> {
    return this.quizRepo.find({ where: { lmsCourseId: courseId } });
  }

  async submitQuizAttempt(attempt: Partial<LmsQuizAttempt>, tenantId?: string): Promise<LmsQuizAttempt> {
    return this.quizAttemptRepo.save({ ...attempt, tenantId });
  }

  // Assignments
  async getAssignments(courseId: string): Promise<LmsAssignment[]> {
    return this.assignmentRepo.find({ where: { lmsCourseId: courseId } });
  }

  async submitAssignment(submission: Partial<LmsSubmission>, tenantId?: string): Promise<LmsSubmission> {
    return this.submissionRepo.save({ ...submission, tenantId });
  }

  // Discussions
  async getDiscussions(courseId: string): Promise<LmsDiscussion[]> {
    return this.discussionRepo.find({ 
      where: { lmsCourseId: courseId },
      order: { createdAt: 'DESC' }
    });
  }

  async createDiscussion(discussion: Partial<LmsDiscussion>, tenantId?: string): Promise<LmsDiscussion> {
    return this.discussionRepo.save({ ...discussion, tenantId });
  }
}