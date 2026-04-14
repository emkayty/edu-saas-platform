import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableSession, TimetableCourse, TimetableSlot, TimetableVenue, TimetableConflict, TimeSlotStatus } from './entities/timetable.entity';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableSession) private sessionRepo: Repository<TimetableSession>,
    @InjectRepository(TimetableCourse) private courseRepo: Repository<TimetableCourse>,
    @InjectRepository(TimetableSlot) private slotRepo: Repository<TimetableSlot>,
    @InjectRepository(TimetableVenue) private venueRepo: Repository<TimetableVenue>,
    @InjectRepository(TimetableConflict) private conflictRepo: Repository<TimetableConflict>,
  ) {}

  // ============== VENUES ==============

  async getVenues(tenantId?: string): Promise<TimetableVenue[]> {
    return this.venueRepo.find({ where: tenantId ? { tenantId } : {}, order: { capacity: 'DESC' } });
  }

  async createVenue(venue: Partial<TimetableVenue>, tenantId?: string): Promise<TimetableVenue> {
    return this.venueRepo.save({ ...venue, tenantId });
  }

  // ============== TIMETABLE GENERATION (Smart Algorithm) ==============

  async generateTimetable(sessionId: string, semester: number, tenantId?: string): Promise<{
    session: TimetableSession;
    conflicts: TimetableConflict[];
    stats: any;
  }> {
    // Create session
    const session = await this.sessionRepo.save({ sessionId, semester, status: 'draft', tenantId });

    // Get all courses to schedule
    const courses = await this.courseRepo.find({ where: tenantId ? { tenantId } : {} });
    const venues = await this.venueRepo.find({ where: { isAvailable: true, ...(tenantId ? { tenantId } : {}) } });

    // Time slots (5 days x 4 slots per day + afternoon)
    const days = [1, 2, 3, 4, 5]; // Monday to Friday
    const slots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

    const scheduledSlots: TimetableSlot[] = [];
    const conflicts: TimetableConflict[] = [];

    // Smart scheduling algorithm
    for (const course of courses) {
      const scheduledForCourse: { day: number; slot: string }[] = [];
      
      // Find venue with sufficient capacity
      let assignedVenue = venues.find(v => v.capacity >= course.studentCount && v.isAvailable);
      if (!assignedVenue) {
        conflicts.push(this.conflictRepo.create({
          type: 'venue', description: `No venue with capacity ${course.studentCount} for ${course.courseId}`,
          courseId: course.courseId, severity: 'high', tenantId
        }));
        continue;
      }

      // Try to respect preferences
      const preferredDays = course.preferredDays.length > 0 ? course.preferredDays : days;
      const preferredSlots = course.preferredSlots.length > 0 ? course.preferredSlots : slots;

      let scheduled = false;
      
      for (const day of preferredDays) {
        for (const slot of preferredSlots) {
          // Check if slot is available
          const existing = await this.slotRepo.findOne({
            where: { timetableSessionId: session.id, dayOfWeek: day, timeSlot: slot }
          });

          if (!existing) {
            const slotRecord = await this.slotRepo.save({
              timetableSessionId: session.id,
              dayOfWeek: day,
              timeSlot: slot,
              venueId: assignedVenue.id,
              courseId: course.courseId,
              lecturerId: course.lecturerId,
              level: course.level,
              status: TimeSlotStatus.BOOKED,
              tenantId
            });
            scheduledSlots.push(slotRecord);
            scheduledForCourse.push({ day, slot });
            scheduled = true;
            break;
          }
        }
        if (scheduled) break;
      }

      // If preferences didn't work, try any available slot
      if (!scheduled) {
        for (const day of days) {
          for (const slot of slots) {
            const existing = await this.slotRepo.findOne({
              where: { timetableSessionId: session.id, dayOfWeek: day, timeSlot: slot }
            });
            if (!existing) {
              const slotRecord = await this.slotRepo.save({
                timetableSessionId: session.id,
                dayOfWeek: day,
                timeSlot: slot,
                venueId: assignedVenue.id,
                courseId: course.courseId,
                lecturerId: course.lecturerId,
                level: course.level,
                status: TimeSlotStatus.BOOKED,
                tenantId
              });
              scheduledSlots.push(slotRecord);
              break;
            }
          }
          break;
        }
      }
    }

    // Check for conflicts
    const lecturerSlots = new Map<string, Set<string>>();
    const levelSlots = new Map<string, Set<string>>();

    for (const slot of scheduledSlots) {
      const key = `${slot.dayOfWeek}-${slot.timeSlot}`;
      
      // Lecturer conflict
      if (lecturerSlots.has(slot.lecturerId)) {
        const existing = lecturerSlots.get(slot.lecturerId);
        if (existing.has(key)) {
          conflicts.push(this.conflictRepo.create({
            type: 'lecturer', description: `Lecturer ${slot.lecturerId} has conflict at ${key}`,
            courseId: slot.courseId, severity: 'high', tenantId
          }));
        } else {
          existing.add(key);
        }
      } else {
        lecturerSlots.set(slot.lecturerId, new Set([key]));
      }
    }

    // Update session
    session.generatedAt = new Date();
    await this.sessionRepo.save(session);

    return {
      session,
      conflicts,
      stats: {
        totalCourses: courses.length,
        scheduledCourses: scheduledSlots.length,
        conflicts: conflicts.length
      }
    };
  }

  async getTimetable(sessionId: string, tenantId?: string): Promise<TimetableSlot[]> {
    const session = await this.sessionRepo.findOne({ where: { sessionId, ...(tenantId ? { tenantId } : {}) } });
    if (!session) return [];
    return this.slotRepo.find({ where: { timetableSessionId: session.id }, relations: ['venue'] });
  }

  async publishTimetable(sessionId: string): Promise<TimetableSession> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new Error('Session not found');
    session.status = 'published';
    return this.sessionRepo.save(session);
  }

  async getConflicts(sessionId: string, tenantId?: string): Promise<TimetableConflict[]> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) return [];
    return this.conflictRepo.find({ where: { ...(tenantId ? { tenantId } : {}) } });
  }

  async resolveConflict(conflictId: string): Promise<TimetableConflict> {
    const conflict = await this.conflictRepo.findOne({ where: { id: conflictId } });
    if (!conflict) throw new Error('Conflict not found');
    conflict.resolved = true;
    return this.conflictRepo.save(conflict);
  }
}