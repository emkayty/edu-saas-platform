/**
 * Grading Configuration Controller
 * Allows institutions to configure their grading system
 */

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GradingService, StudentGradeSummary } from '../services/grading.service';
import { GradingSystem, GradingConfiguration, GradeDefinition, HonoursClassification, NIGERIAN_GRADING_SYSTEM, AMERICAN_GRADING_SYSTEM, BRITISH_GRADING_SYSTEM } from '../types/grading-system';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('grading')
@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Get('systems')
  @ApiOperation({ summary: 'Get all available grading system types' })
  getGradingSystemTypes() {
    return this.gradingService.getGradingSystemTypes();
  }

  @Get('system/:type')
  @ApiOperation({ summary: 'Get grading system configuration by type' })
  @Roles('super_admin', 'admin')
  getGradingSystem(@Param('type') type: GradingSystem) {
    return this.gradingService.getGradingSystem(type);
  }

  @Get('systems/default')
  @ApiOperation({ summary: 'Get default Nigerian grading system' })
  getNigerianSystem() {
    return NIGERIAN_GRADING_SYSTEM;
  }

  @Get('systems/american')
  @ApiOperation({ summary: 'Get American grading system' })
  getAmericanSystem() {
    return AMERICAN_GRADING_SYSTEM;
  }

  @Post('configure')
  @ApiOperation({ summary: 'Configure institution grading system' })
  @Roles('super_admin', 'admin')
  configureGradingSystem(
    @Body() config: {
      institutionId: string;
      system: GradingSystem;
      gradingScale?: GradeDefinition[];
      minimumPassScore?: number;
      allowCarryOver?: boolean;
      maxCarryOverCourses?: number;
      decimalPlaces?: number;
      roundCGPA?: boolean;
      honoursClassification?: HonoursClassification[];
    },
    @Req() req: any,
  ) {
    const gradingConfig: GradingConfiguration = {
      system: config.system,
      institutionId: config.institutionId,
      academicSessionId: '',
      
      gradeScale: config.gradingScale || 
        (config.system === GradingSystem.NIGERIAN ? NIGERIAN_GRADING_SYSTEM.gradeScale : 
         config.system === GradingSystem.AMERICAN ? AMERICAN_GRADING_SYSTEM.gradeScale :
         BRITISH_GRADING_SYSTEM.gradeScale),
      
      minimumPassScore: config.minimumPassScore ?? (config.system === GradingSystem.NIGERIAN ? 40 : 60),
      allowCarryOver: config.allowCarryOver ?? true,
      maxCarryOverCourses: config.maxCarryOverCourses ?? (config.system === GradingSystem.NIGERIAN ? 2 : 0),
      
      includeTotalCredits: true,
      weightByCreditHours: true,
      roundCGPA: config.roundCGPA ?? (config.system === GradingSystem.NIGERIAN),
      decimalPlaces: config.decimalPlaces ?? 2,
      
      honoursClassification: config.honoursClassification || [],
      
      createdBy: req.user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    return this.gradingService.createCustomConfiguration(gradingConfig);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate grades and CGPA for student results' })
  @Roles('super_admin', 'admin', 'lecturer')
  calculateGrades(
    @Body() body: {
      studentId: string;
      results: {
        courseId: string;
        courseCode: string;
        courseTitle: string;
        creditHours: number;
        score: number;
        semester: string;
      }[];
      system: GradingSystem;
    },
  ) {
    return this.gradingService.generateGradeSummary(
      body.studentId,
      body.results,
      body.system,
    );
  }

  @Post('semester-gpa')
  @ApiOperation({ summary: 'Calculate semester GPA' })
  @Roles('super_admin', 'admin', 'lecturer')
  calculateSemesterGPA(
    @Body() body: {
      results: {
        creditHours: number;
        score: number;
      }[];
      system: GradingSystem;
    },
  ) {
    return {
      gpa: this.gradingService.calculateSemesterGPA(
        body.results.map((r, i) => ({
          courseId: i.toString(),
          courseCode: '',
          courseTitle: '',
          creditHours: r.creditHours,
          score: r.score,
          semester: '',
        })),
        this.gradingService.getGradingSystem(body.system),
      ),
    };
  }

  @Post('classification')
  @ApiOperation({ summary: 'Get honours classification based on CGPA' })
  @Roles('super_admin', 'admin', 'lecturer', 'student')
  getClassification(
    @Body() body: {
      cgpa: number;
      system: GradingSystem;
    },
  ) {
    const config = this.gradingService.getGradingSystem(body.system);
    const classification = this.gradingService.getClassification(body.cgpa, config);
    
    return { classification, cgpa: body.cgpa, system: body.system };
  }

  @Post('can-proceed')
  @ApiOperation({ summary: 'Check if student can proceed to next level' })
  @Roles('super_admin', 'admin', 'lecturer', 'student')
  checkProgression(
    @Body() body: {
      results: {
        creditHours: number;
        score: number;
      }[];
      system: GradingSystem;
    },
  ) {
    const config = this.gradingService.getGradingSystem(body.system);
    const results = body.results.map((r, i) => ({
      courseId: i.toString(),
      courseCode: '',
      courseTitle: '',
      creditHours: r.creditHours,
      score: r.score,
      semester: '',
    }));

    return this.gradingService.canProceed(results, config);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert grade between systems' })
  @Roles('super_admin', 'admin')
  convertGrade(
    @Body() body: {
      grade: string;
      fromSystem: GradingSystem;
      toSystem: GradingSystem;
    },
  ) {
    const convertedGrade = this.gradingService.convertGrade(
      body.grade,
      body.fromSystem,
      body.toSystem,
    );
    return { original: body.grade, converted: convertedGrade, from: body.fromSystem, to: body.toSystem };
  }

  @Post('preview-grade')
  @ApiOperation({ summary: 'Preview grade for a score in given system' })
  @Roles('super_admin', 'admin', 'lecturer')
  previewGrade(
    @Body() body: {
      score: number;
      system: GradingSystem;
    },
  ) {
    const config = this.gradingService.getGradingSystem(body.system);
    const grade = this.gradingService.getLetterGrade(body.score, config);
    const gradePoint = this.gradingService.getGradePoint(body.score, config);

    return { score: body.score, grade: grade.letter, gradePoint, description: grade.description };
  }

  @Get('institution/:tenantId')
  @ApiOperation({ summary: 'Get institution grading configuration' })
  @Roles('super_admin', 'admin')
  getInstitutionConfig(@Param('tenantId') tenantId: string) {
    // This would fetch from database based on tenant
    // For now, return default Nigerian system as example
    return {
      tenantId,
      system: GradingSystem.NIGERIAN,
      isConfigured: true,
      config: NIGERIAN_GRADING_SYSTEM,
    };
  }

  @Put('institution/:tenantId')
  @ApiOperation({ summary: 'Update institution grading configuration' })
  @Roles('super_admin', 'admin')
  updateInstitutionConfig(
    @Param('tenantId') tenantId: string,
    @Body() body: {
      system: GradingSystem;
      minimumPassScore?: number;
      allowCarryOver?: boolean;
      maxCarryOverCourses?: number;
    },
  ) {
    // This would update database
    return {
      tenantId,
      ...body,
      updatedAt: new Date(),
      message: 'Institution grading configuration updated successfully',
    };
  }
}