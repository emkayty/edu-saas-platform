/**
 * Grading Service
 * Handles grade calculations, CGPA computation, and classification
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GradingSystem,
  GradingConfiguration,
  GradeDefinition,
  HonoursClassification,
  NIGERIAN_GRADING_SYSTEM,
  AMERICAN_GRADING_SYSTEM,
  BRITISH_GRADING_SYSTEM,
} from '../types/grading-system';

export interface CourseResult {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  creditHours: number;
  score: number;
  grade?: string;
  gradePoint?: number;
  semester: string;
}

export interface StudentGradeSummary {
  studentId: string;
  totalCourses: number;
  totalCreditHours: number;
  totalGradePoints: number;
  cgpa: number;
  classification: string;
  results: CourseResult[];
}

@Injectable()
export class GradingService {
  private gradingConfigurations: Map<string, GradingConfiguration> = new Map();

  constructor() {
    // Initialize default configurations
    this.initializeDefaultSystems();
  }

  private initializeDefaultSystems() {
    // Store default systems for easy access
    this.gradingConfigurations.set(GradingSystem.NIGERIAN, NIGERIAN_GRADING_SYSTEM);
    this.gradingConfigurations.set(GradingSystem.AMERICAN, AMERICAN_GRADING_SYSTEM);
    this.gradingConfigurations.set(GradingSystem.BRITISH, BRITISH_GRADING_SYSTEM);
  }

  /**
   * Get grading configuration by system type
   */
  getGradingSystem(system: GradingSystem): GradingConfiguration {
    const config = this.gradingConfigurations.get(system);
    if (!config) {
      throw new NotFoundException(`Grading system ${system} not found`);
    }
    return config;
  }

  /**
   * Get all available grading systems
   */
  getAllGradingSystems(): GradingConfiguration[] {
    return Array.from(this.gradingConfigurations.values());
  }

  /**
   * Create custom grading configuration
   */
  createCustomConfiguration(config: GradingConfiguration): GradingConfiguration {
    const id = `${config.system}-${config.institutionId}-${config.academicSessionId}`;
    this.gradingConfigurations.set(id, config);
    return config;
  }

  /**
   * Convert score to letter grade based on configuration
   */
  getLetterGrade(score: number, config: GradingConfiguration): GradeDefinition {
    const grade = config.gradeScale.find(
      (g) => score >= g.minPercentage && score <= g.maxPercentage,
    );
    
    if (!grade) {
      throw new NotFoundException(`No grade found for score ${score}`);
    }
    
    return grade;
  }

  /**
   * Get grade point for a score
   */
  getGradePoint(score: number, config: GradingConfiguration): number {
    const grade = this.getLetterGrade(score, config);
    return grade.gradePoint ?? 0;
  }

  /**
   * Calculate CGPA from course results
   */
  calculateCGPA(results: CourseResult[], config: GradingConfiguration): number {
    if (results.length === 0) return 0;

    let totalCreditHours = 0;
    let totalWeightedPoints = 0;

    for (const result of results) {
      const gradePoint = this.getGradePoint(result.score, config);
      const creditHours = result.creditHours;

      totalCreditHours += creditHours;
      totalWeightedPoints += gradePoint * creditHours;
    }

    if (totalCreditHours === 0) return 0;

    const cgpa = totalWeightedPoints / totalCreditHours;

    // Round based on configuration
    if (config.roundCGPA) {
      return Math.round(cgpa * Math.pow(10, config.decimalPlaces)) / Math.pow(10, config.decimalPlaces);
    }

    return parseFloat(cgpa.toFixed(config.decimalPlaces));
  }

  /**
   * Get honours classification based on CGPA
   */
  getClassification(cgpa: number, config: GradingConfiguration): string {
    for (const classification of config.honoursClassification) {
      if (cgpa >= classification.minCGPA && cgpa <= classification.maxCGPA) {
        return classification.name;
      }
    }
    return 'Unclassified';
  }

  /**
   * Generate complete grade summary for a student
   */
  generateGradeSummary(
    studentId: string,
    results: CourseResult[],
    system: GradingSystem,
  ): StudentGradeSummary {
    const config = this.getGradingSystem(system);

    // Map results to include letter grades
    const gradedResults = results.map((result) => {
      const grade = this.getLetterGrade(result.score, config);
      return {
        ...result,
        grade: grade.letter,
        gradePoint: grade.gradePoint,
      };
    });

    const cgpa = this.calculateCGPA(gradedResults, config);
    const classification = this.getClassification(cgpa, config);

    const totalCreditHours = gradedResults.reduce((sum, r) => sum + r.creditHours, 0);

    return {
      studentId,
      totalCourses: gradedResults.length,
      totalCreditHours,
      totalGradePoints: gradedResults.reduce((sum, r) => sum + (r.gradePoint || 0) * r.creditHours, 0),
      cgpa,
      classification,
      results: gradedResults,
    };
  }

  /**
   * Check if student can proceed (for Nigerian system with carryover)
   */
  canProceed(results: CourseResult[], config: GradingConfiguration): {
    canProceed: boolean;
    failedCourses: number;
    canCarryOver: boolean;
    message: string;
  } {
    const failedCourses = results.filter((r) => r.score < config.minimumPassScore);

    if (failedCourses.length === 0) {
      return {
        canProceed: true,
        failedCourses: 0,
        canCarryOver: true,
        message: 'Passed all courses. Can proceed to next level.',
      };
    }

    if (failedCourses.length <= config.maxCarryOverCourses && config.allowCarryOver) {
      return {
        canProceed: true,
        failedCourses: failedCourses.length,
        canCarryOver: true,
        message: `Failed ${failedCourses.length} course(s). Can carry over to next level.`,
      };
    }

    return {
      canProceed: false,
      failedCourses: failedCourses.length,
      canCarryOver: false,
      message: `Failed ${failedCourses.length} courses. Cannot proceed. Must retake ${failedCourses.length} courses.`,
    };
  }

  /**
   * Calculate GPA for a specific semester
   */
  calculateSemesterGPA(results: CourseResult[], config: GradingConfiguration): number {
    return this.calculateCGPA(results, config);
  }

  /**
   * Convert between grading systems
   */
  convertGrade(grade: string, fromSystem: GradingSystem, toSystem: GradingSystem): string {
    const fromConfig = this.getGradingSystem(fromSystem);
    const toConfig = this.getGradingSystem(toSystem);

    // Find the grade definition in source system
    const gradeDef = fromConfig.gradeScale.find((g) => g.letter === grade);
    if (!gradeDef) return grade;

    // Find equivalent grade in target system based on percentage
    const targetGrade = this.getLetterGrade(gradeDef.minPercentage, toConfig);
    return targetGrade.letter;
  }

  /**
   * Get all available grading system types
   */
  getGradingSystemTypes(): { value: string; label: string; description: string }[] {
    return [
      {
        value: GradingSystem.NIGERIAN,
        label: 'Nigerian System (NUC)',
        description: 'A-F scale (70-100% = A, 60-69% = B, etc.) with 5.0 GPA',
      },
      {
        value: GradingSystem.AMERICAN,
        label: 'American System (4.0)',
        description: 'A+ to F scale with 4.0 GPA (Dean\'s List, Cum Laude, etc.)',
      },
      {
        value: GradingSystem.BRITISH,
        label: 'British System',
        description: 'First Class, Upper/Lower Second, Third Class honours',
      },
      {
        value: GradingSystem.CUSTOM,
        label: 'Custom System',
        description: 'Institution-defined grading system',
      },
    ];
  }
}