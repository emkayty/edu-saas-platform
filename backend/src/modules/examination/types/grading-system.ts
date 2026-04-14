/**
 * Customizable Grading System
 * Supports Nigerian and American University Grading Systems
 */

export enum GradingSystem {
  NIGERIAN = 'nigerian',      // Nigerian University System (NUC)
  AMERICAN = 'american',      // American University System (4.0 Scale)
  BRITISH = 'british',       // British System (Honours)
  CUSTOM = 'custom',          // Custom defined by institution
}

export enum NigerianGradeScale {
  A = 'A',        // 70-100% - Excellent
  B = 'B',        // 60-69%  - Very Good
  C = 'C',        // 50-59%  - Good
  D = 'D',        // 45-49%  - Pass
  E = 'E',        // 40-44%  - Pass
  F = 'F',        // 0-39%   - Fail
}

export enum AmericanGradeScale {
  A_PLUS = 'A+',   // 97-100% - 4.0
  A = 'A',         // 93-96%  - 4.0
  A_MINUS = 'A-',  // 90-92%  - 3.7
  B_PLUS = 'B+',   // 87-89%  - 3.3
  B = 'B',         // 83-86%  - 3.0
  B_MINUS = 'B-',  // 80-82%  - 2.7
  C_PLUS = 'C+',   // 77-79%  - 2.3
  C = 'C',         // 73-76%  - 2.0
  C_MINUS = 'C-',  // 70-72%  - 1.7
  D_PLUS = 'D+',   // 67-69%  - 1.3
  D = 'D',         // 63-66%  - 1.0
  D_MINUS = 'D-',  // 60-62%  - 0.7
  F = 'F',         // 0-59%   - 0.0
}

export interface GradeScale {
  system: GradingSystem;
  name: string;
  description: string;
  gradePoints: boolean;
  requiresMinimumPassScore: boolean;
  minimumPassScore: number;
}

export interface GradeDefinition {
  letter: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint?: number;
  description: string;
  isPassing: boolean;
}

export interface GradingConfiguration {
  system: GradingSystem;
  institutionId: string;
  academicSessionId: string;
  semesterId?: string;
  
  // Grade scale definitions
  gradeScale: GradeDefinition[];
  
  // Pass/Fail settings
  minimumPassScore: number;
  allowCarryOver: boolean;
  maxCarryOverCourses: number;
  
  // Calculation settings
  includeTotalCredits: boolean;
  weightByCreditHours: boolean;
  roundCGPA: boolean;
  decimalPlaces: number;
  
  // Classification (Honours)
  honoursClassification: HonoursClassification[];
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface HonoursClassification {
  name: string;
  minCGPA: number;
  maxCGPA: number;
  description: string;
  equivalentGrade?: string;
}

// Default Nigerian Grading System (NUC Standard)
export const NIGERIAN_GRADING_SYSTEM: GradingConfiguration = {
  system: GradingSystem.NIGERIAN,
  institutionId: '',
  academicSessionId: '',
  
  gradeScale: [
    { letter: 'A', minPercentage: 70, maxPercentage: 100, gradePoint: 5.0, description: 'Excellent', isPassing: true },
    { letter: 'B', minPercentage: 60, maxPercentage: 69, gradePoint: 4.0, description: 'Very Good', isPassing: true },
    { letter: 'C', minPercentage: 50, maxPercentage: 59, gradePoint: 3.0, description: 'Good', isPassing: true },
    { letter: 'D', minPercentage: 45, maxPercentage: 49, gradePoint: 2.0, description: 'Pass', isPassing: true },
    { letter: 'E', minPercentage: 40, maxPercentage: 44, gradePoint: 1.0, description: 'Pass', isPassing: true },
    { letter: 'F', minPercentage: 0, maxPercentage: 39, gradePoint: 0.0, description: 'Fail', isPassing: false },
  ],
  
  minimumPassScore: 40,
  allowCarryOver: true,
  maxCarryOverCourses: 2,
  
  includeTotalCredits: true,
  weightByCreditHours: true,
  roundCGPA: true,
  decimalPlaces: 2,
  
  honoursClassification: [
    { name: 'First Class Honours', minCGPA: 4.5, maxCGPA: 5.0, description: '70-100%', equivalentGrade: 'A' },
    { name: 'Second Class Upper', minCGPA: 3.5, maxCGPA: 4.49, description: '60-69%', equivalentGrade: 'B' },
    { name: 'Second Class Lower', minCGPA: 2.5, maxCGPA: 3.49, description: '50-59%', equivalentGrade: 'C' },
    { name: 'Third Class', minCGPA: 1.5, maxCGPA: 2.49, description: '40-49%', equivalentGrade: 'D/E' },
    { name: 'Pass', minCGPA: 1.0, maxCGPA: 1.49, description: '40-44%', equivalentGrade: 'E' },
    { name: 'Fail', minCGPA: 0.0, maxCGPA: 0.99, description: '0-39%', equivalentGrade: 'F' },
  ],
  
  createdBy: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

// Default American Grading System (4.0 Scale)
export const AMERICAN_GRADING_SYSTEM: GradingConfiguration = {
  system: GradingSystem.AMERICAN,
  institutionId: '',
  academicSessionId: '',
  
  gradeScale: [
    { letter: 'A+', minPercentage: 97, maxPercentage: 100, gradePoint: 4.0, description: 'Exceptional', isPassing: true },
    { letter: 'A', minPercentage: 93, maxPercentage: 96, gradePoint: 4.0, description: 'Excellent', isPassing: true },
    { letter: 'A-', minPercentage: 90, maxPercentage: 92, gradePoint: 3.7, description: 'Excellent', isPassing: true },
    { letter: 'B+', minPercentage: 87, maxPercentage: 89, gradePoint: 3.3, description: 'Very Good', isPassing: true },
    { letter: 'B', minPercentage: 83, maxPercentage: 86, gradePoint: 3.0, description: 'Good', isPassing: true },
    { letter: 'B-', minPercentage: 80, maxPercentage: 82, gradePoint: 2.7, description: 'Good', isPassing: true },
    { letter: 'C+', minPercentage: 77, maxPercentage: 79, gradePoint: 2.3, description: 'Satisfactory', isPassing: true },
    { letter: 'C', minPercentage: 73, maxPercentage: 76, gradePoint: 2.0, description: 'Satisfactory', isPassing: true },
    { letter: 'C-', minPercentage: 70, maxPercentage: 72, gradePoint: 1.7, description: 'Below Average', isPassing: true },
    { letter: 'D+', minPercentage: 67, maxPercentage: 69, gradePoint: 1.3, description: 'Pass', isPassing: true },
    { letter: 'D', minPercentage: 63, maxPercentage: 66, gradePoint: 1.0, description: 'Pass', isPassing: true },
    { letter: 'D-', minPercentage: 60, maxPercentage: 62, gradePoint: 0.7, description: 'Pass', isPassing: true },
    { letter: 'F', minPercentage: 0, maxPercentage: 59, gradePoint: 0.0, description: 'Fail', isPassing: false },
  ],
  
  minimumPassScore: 60,
  allowCarryOver: false,
  maxCarryOverCourses: 0,
  
  includeTotalCredits: true,
  weightByCreditHours: true,
  roundCGPA: false,
  decimalPlaces: 2,
  
  honoursClassification: [
    { name: "Dean's List", minCGPA: 3.9, maxCGPA: 4.0, description: 'Honor Roll' },
    { name: 'Summa Cum Laude', minCGPA: 3.9, maxCGPA: 4.0, description: 'Highest Honors (97-100%)' },
    { name: 'Magna Cum Laude', minCGPA: 3.7, maxCGPA: 3.89, description: 'High Honors (93-96%)' },
    { name: 'Cum Laude', minCGPA: 3.5, maxCGPA: 3.69, description: 'Honors (90-92%)' },
    { name: "President's List", minCGPA: 4.0, maxCGPA: 4.0, description: 'All A grades' },
  ],
  
  createdBy: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

// British Grading System
export const BRITISH_GRADING_SYSTEM: GradingConfiguration = {
  system: GradingSystem.BRITISH,
  institutionId: '',
  academicSessionId: '',
  
  gradeScale: [
    { letter: 'First Class', minPercentage: 70, maxPercentage: 100, gradePoint: 4.0, description: 'First Class Honours', isPassing: true },
    { letter: 'Upper Second', minPercentage: 60, maxPercentage: 69, gradePoint: 3.33, description: 'Second Class Upper', isPassing: true },
    { letter: 'Lower Second', minPercentage: 50, maxPercentage: 59, gradePoint: 2.67, description: 'Second Class Lower', isPassing: true },
    { letter: 'Third Class', minPercentage: 40, maxPercentage: 49, gradePoint: 2.0, description: 'Third Class Honours', isPassing: true },
    { letter: 'Pass', minPercentage: 35, maxPercentage: 39, gradePoint: 1.0, description: 'Ordinary Pass', isPassing: true },
    { letter: 'Fail', minPercentage: 0, maxPercentage: 34, gradePoint: 0.0, description: 'Fail', isPassing: false },
  ],
  
  minimumPassScore: 40,
  allowCarryOver: true,
  maxCarryOverCourses: 2,
  
  includeTotalCredits: true,
  weightByCreditHours: true,
  roundCGPA: true,
  decimalPlaces: 2,
  
  honoursClassification: [
    { name: 'First Class Honours', minCGPA: 3.7, maxCGPA: 4.0, description: '70-100%' },
    { name: 'Upper Second Class', minCGPA: 3.0, maxCGPA: 3.69, description: '60-69%' },
    { name: 'Lower Second Class', minCGPA: 2.0, maxCGPA: 2.99, description: '50-59%' },
    { name: 'Third Class', minCGPA: 1.0, maxCGPA: 1.99, description: '40-49%' },
  ],
  
  createdBy: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};