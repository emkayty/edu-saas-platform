import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

// LMS Course (extends academic course with content)
@Entity('lms_courses')
export class LmsCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string; // Reference to academic course

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'jsonb', nullable: true })
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: 'video' | 'text' | 'quiz' | 'assignment';
      content: string;
      duration: number;
    }[];
  }[];

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ default: 0 })
  enrollmentCount: number;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Student Enrollment
@Entity('lms_enrollments')
export class LmsEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  lmsCourseId: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ type: 'jsonb', default: [] })
  completedLessons: string[];

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Quiz/Assessment
@Entity('lms_quizzes')
export class LmsQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lmsCourseId: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  passingScore: number;

  @Column({ type: 'jsonb', default: [] })
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
  }[];

  @Column({ default: false })
  shuffleQuestions: boolean;

  @Column({ default: false })
  showCorrectAnswers: boolean;

  @Column({ default: 0 })
  timeLimit: number; // in minutes, 0 = no limit

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Quiz Attempts
@Entity('lms_quiz_attempts')
export class LmsQuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  quizId: string;

  @Column({ type: 'jsonb', default: [] })
  answers: { questionId: string; answer: number; isCorrect: boolean }[];

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ default: false })
  passed: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Assignment
@Entity('lms_assignments')
export class LmsAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lmsCourseId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  dueDate: Date;

  @Column({ default: 0 })
  maxScore: number;

  @Column({ default: false })
  allowLateSubmission: boolean;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Assignment Submissions
@Entity('lms_submissions')
export class LmsSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  assignmentId: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ default: false })
  isLate: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({ nullable: true })
  gradedAt: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Discussion Forum
@Entity('lms_discussions')
export class LmsDiscussion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lmsCourseId: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  replyCount: boolean;

  @Column({ nullable: true })
  pinnedAt: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}