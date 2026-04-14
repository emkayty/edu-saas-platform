import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department, Faculty, Program } from './entities/department.entity';
import { Course, AcademicSession, CourseAllocation, StudentCourse } from './entities/course.entity';
import { 
  CreateDepartmentDto, UpdateDepartmentDto,
  CreateFacultyDto, UpdateFacultyDto,
  CreateProgramDto, UpdateProgramDto,
  CreateCourseDto, UpdateCourseDto,
  CreateAcademicSessionDto, UpdateAcademicSessionDto,
  CourseAllocationDto, StudentCourseRegistrationDto
} from './dto/academic.dto';

@Injectable()
export class AcademicsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(Faculty)
    private facultyRepo: Repository<Faculty>,
    @InjectRepository(Program)
    private programRepo: Repository<Program>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(AcademicSession)
    private sessionRepo: Repository<AcademicSession>,
    @InjectRepository(CourseAllocation)
    private allocationRepo: Repository<CourseAllocation>,
    @InjectRepository(StudentCourse)
    private studentCourseRepo: Repository<StudentCourse>,
  ) {}

  // ============== FACULTIES ==============
  
  async createFaculty(dto: CreateFacultyDto, tenantId?: string): Promise<Faculty> {
    const faculty = this.facultyRepo.create({ ...dto, tenantId });
    return this.facultyRepo.save(faculty);
  }

  async getFaculties(tenantId?: string): Promise<Faculty[]> {
    return this.facultyRepo.find({
      where: tenantId ? { tenantId } : {},
      order: { name: 'ASC' }
    });
  }

  async getFacultyById(id: string): Promise<Faculty> {
    const faculty = await this.facultyRepo.findOne({ where: { id } });
    if (!faculty) throw new NotFoundException('Faculty not found');
    return faculty;
  }

  async updateFaculty(id: string, dto: UpdateFacultyDto): Promise<Faculty> {
    const faculty = await this.getFacultyById(id);
    Object.assign(faculty, dto);
    return this.facultyRepo.save(faculty);
  }

  async deleteFaculty(id: string): Promise<void> {
    const faculty = await this.getFacultyById(id);
    await this.facultyRepo.remove(faculty);
  }

  // ============== DEPARTMENTS ==============

  async createDepartment(dto: CreateDepartmentDto, tenantId?: string): Promise<Department> {
    // Check for duplicate code
    const existing = await this.departmentRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Department code already exists');
    
    const department = this.departmentRepo.create({ ...dto, tenantId });
    return this.departmentRepo.save(department);
  }

  async getDepartments(tenantId?: string, facultyId?: string): Promise<Department[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (facultyId) where.facultyId = facultyId;
    
    return this.departmentRepo.find({
      where,
      relations: ['faculty'],
      order: { name: 'ASC' }
    });
  }

  async getDepartmentById(id: string): Promise<Department> {
    const department = await this.departmentRepo.findOne({
      where: { id },
      relations: ['faculty']
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.getDepartmentById(id);
    Object.assign(department, dto);
    return this.departmentRepo.save(department);
  }

  async deleteDepartment(id: string): Promise<void> {
    const department = await this.getDepartmentById(id);
    await this.departmentRepo.remove(department);
  }

  // ============== PROGRAMS ==============

  async createProgram(dto: CreateProgramDto, tenantId?: string): Promise<Program> {
    const program = this.programRepo.create({ ...dto, tenantId });
    return this.programRepo.save(program);
  }

  async getPrograms(tenantId?: string, departmentId?: string): Promise<Program[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (departmentId) where.departmentId = departmentId;
    
    return this.programRepo.find({
      where,
      relations: ['department', 'faculty'],
      order: { name: 'ASC' }
    });
  }

  async getProgramById(id: string): Promise<Program> {
    const program = await this.programRepo.findOne({
      where: { id },
      relations: ['department', 'faculty']
    });
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async updateProgram(id: string, dto: UpdateProgramDto): Promise<Program> {
    const program = await this.getProgramById(id);
    Object.assign(program, dto);
    return this.programRepo.save(program);
  }

  // ============== COURSES ==============

  async createCourse(dto: CreateCourseDto, tenantId?: string): Promise<Course> {
    const existing = await this.courseRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Course code already exists');
    
    const course = this.courseRepo.create({ ...dto, tenantId });
    return this.courseRepo.save(course);
  }

  async getCourses(tenantId?: string, departmentId?: string, level?: number, semester?: number): Promise<Course[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (departmentId) where.departmentId = departmentId;
    if (level) where.level = level;
    if (semester) where.semester = semester;
    
    return this.courseRepo.find({
      where,
      relations: ['department'],
      order: { code: 'ASC' }
    });
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['department', 'prerequisiteCourses']
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async updateCourse(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.getCourseById(id);
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  // ============== ACADEMIC SESSIONS ==============

  async createAcademicSession(dto: CreateAcademicSessionDto, tenantId?: string): Promise<AcademicSession> {
    const existing = await this.sessionRepo.findOne({ where: { sessionCode: dto.sessionCode } });
    if (existing) throw new ConflictException('Academic session already exists');
    
    const session = this.sessionRepo.create({ ...dto, tenantId });
    return this.sessionRepo.save(session);
  }

  async getAcademicSessions(tenantId?: string): Promise<AcademicSession[]> {
    return this.sessionRepo.find({
      where: tenantId ? { tenantId } : {},
      order: { startDate: 'DESC' }
    });
  }

  async getActiveSession(tenantId?: string): Promise<AcademicSession> {
    const session = await this.sessionRepo.findOne({
      where: { isActive: true, ...(tenantId ? { tenantId } : {}) }
    });
    if (!session) throw new NotFoundException('No active academic session');
    return session;
  }

  async setActiveSession(sessionId: string): Promise<AcademicSession> {
    // Deactivate all sessions first
    await this.sessionRepo.update({}, { isActive: false });
    
    // Activate the selected session
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    
    session.isActive = true;
    return this.sessionRepo.save(session);
  }

  // ============== COURSE ALLOCATIONS ==============

  async allocateCourse(dto: CourseAllocationDto, tenantId?: string): Promise<CourseAllocation> {
    const allocation = this.allocationRepo.create({ ...dto, tenantId });
    return this.allocationRepo.save(allocation);
  }

  async getCourseAllocations(lecturerId?: string, sessionId?: string): Promise<CourseAllocation[]> {
    const where: any = {};
    if (lecturerId) where.lecturerId = lecturerId;
    if (sessionId) where.sessionId = sessionId;
    
    return this.allocationRepo.find({ where });
  }

  // ============== STUDENT COURSE REGISTRATION ==============

  async registerStudentCourses(studentId: string, dto: StudentCourseRegistrationDto, tenantId?: string): Promise<StudentCourse[]> {
    const registrations: StudentCourse[] = [];
    
    for (const courseId of dto.courseIds) {
      // Check for prerequisites
      const course = await this.getCourseById(courseId);
      
      // Check if already registered
      const existing = await this.studentCourseRepo.findOne({
        where: {
          studentId,
          courseId,
          sessionId: dto.sessionId,
          semester: dto.semester
        }
      });
      
      if (existing) continue; // Skip if already registered
      
      const registration = this.studentCourseRepo.create({
        studentId,
        courseId,
        sessionId: dto.sessionId,
        semester: dto.semester,
        status: 'registered',
        tenantId
      });
      
      registrations.push(await this.studentCourseRepo.save(registration));
    }
    
    return registrations;
  }

  async getStudentCourses(studentId: string, sessionId: string): Promise<StudentCourse[]> {
    return this.studentCourseRepo.find({
      where: { studentId, sessionId },
      relations: ['course']
    });
  }

  async dropCourse(studentCourseId: string): Promise<StudentCourse> {
    const registration = await this.studentCourseRepo.findOne({ where: { id: studentCourseId } });
    if (!registration) throw new NotFoundException('Course registration not found');
    
    registration.status = 'dropped';
    return this.studentCourseRepo.save(registration);
  }

  // ============== GRADE CALCULATION ==============

  async calculateCGPA(studentId: string, sessionId?: string): Promise<number> {
    const where: any = { studentId, status: 'completed' };
    if (sessionId) where.sessionId = sessionId;
    
    const courses = await this.studentCourseRepo.find({ where });
    
    if (courses.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    for (const course of courses) {
      if (course.gradePoint) {
        const courseInfo = await this.getCourseById(course.courseId);
        totalPoints += course.gradePoint * courseInfo.creditHours;
        totalCredits += courseInfo.creditHours;
      }
    }
    
    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  }

  async calculateGrade(score: number, gradingSystem: string = '5_point'): Promise<{ grade: string; gradePoint: number }> {
    if (gradingSystem === '5_point') {
      if (score >= 70) return { grade: 'A', gradePoint: 5.0 };
      if (score >= 60) return { grade: 'B', gradePoint: 4.0 };
      if (score >= 50) return { grade: 'C', gradePoint: 3.0 };
      if (score >= 45) return { grade: 'D', gradePoint: 2.0 };
      if (score >= 40) return { grade: 'E', gradePoint: 1.0 };
      return { grade: 'F', gradePoint: 0.0 };
    } else if (gradingSystem === '4_point') {
      if (score >= 90) return { grade: 'A', gradePoint: 4.0 };
      if (score >= 80) return { grade: 'B', gradePoint: 3.0 };
      if (score >= 70) return { grade: 'C', gradePoint: 2.0 };
      if (score >= 60) return { grade: 'D', gradePoint: 1.0 };
      return { grade: 'F', gradePoint: 0.0 };
    }
    return { grade: 'F', gradePoint: 0.0 };
  }
}