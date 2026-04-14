import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffProfile, LeaveApplication, PayrollRecord, StaffAttendance, EmploymentType, StaffStatus, LeaveStatus } from '../entities/hr.entity';
import { 
  CreateStaffProfileDto, UpdateStaffProfileDto,
  CreateLeaveApplicationDto, UpdateLeaveApplicationDto,
  ProcessPayrollDto
} from '../dto/hr.dto';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(StaffProfile)
    private staffRepo: Repository<StaffProfile>,
    @InjectRepository(LeaveApplication)
    private leaveRepo: Repository<LeaveApplication>,
    @InjectRepository(PayrollRecord)
    private payrollRepo: Repository<PayrollRecord>,
    @InjectRepository(StaffAttendance)
    private attendanceRepo: Repository<StaffAttendance>,
  ) {}

  // ============== STAFF ==============

  async createStaffProfile(dto: CreateStaffProfileDto, tenantId?: string): Promise<StaffProfile> {
    const existing = await this.staffRepo.findOne({ where: { staffNumber: dto.staffNumber } });
    if (existing) throw new ConflictException('Staff number already exists');
    const staff = this.staffRepo.create({ ...dto, tenantId });
    return this.staffRepo.save(staff);
  }

  async getStaffProfiles(tenantId?: string, departmentId?: string): Promise<StaffProfile[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (departmentId) where.departmentId = departmentId;
    return this.staffRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getStaffById(id: string): Promise<StaffProfile> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Staff profile not found');
    return staff;
  }

  async getStaffByUserId(userId: string, tenantId?: string): Promise<StaffProfile> {
    const staff = await this.staffRepo.findOne({ where: { userId, ...(tenantId ? { tenantId } : {}) } });
    if (!staff) throw new NotFoundException('Staff profile not found');
    return staff;
  }

  async updateStaffProfile(id: string, dto: UpdateStaffProfileDto): Promise<StaffProfile> {
    const staff = await this.getStaffById(id);
    Object.assign(staff, dto);
    return this.staffRepo.save(staff);
  }

  // ============== LEAVE ==============

  async createLeaveApplication(dto: CreateLeaveApplicationDto, tenantId?: string): Promise<LeaveApplication> {
    const leave = this.leaveRepo.create({ ...dto, status: LeaveStatus.PENDING, tenantId });
    return this.leaveRepo.save(leave);
  }

  async getLeaveApplications(staffId?: string, tenantId?: string): Promise<LeaveApplication[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (staffId) where.staffId = staffId;
    return this.leaveRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getPendingLeaves(tenantId?: string): Promise<LeaveApplication[]> {
    return this.leaveRepo.find({ where: { status: LeaveStatus.PENDING, ...(tenantId ? { tenantId } : {}) }, order: { createdAt: 'ASC' } });
  }

  async approveLeave(leaveId: string, approverId: string): Promise<LeaveApplication> {
    const leave = await this.leaveRepo.findOne({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave application not found');
    leave.status = LeaveStatus.APPROVED;
    leave.approverId = approverId;
    leave.approvedDate = new Date();
    return this.leaveRepo.save(leave);
  }

  async rejectLeave(leaveId: string, rejectionReason: string): Promise<LeaveApplication> {
    const leave = await this.leaveRepo.findOne({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave application not found');
    leave.status = LeaveStatus.REJECTED;
    leave.rejectionReason = rejectionReason;
    return this.leaveRepo.save(leave);
  }

  // ============== PAYROLL ==============

  async processPayroll(dto: ProcessPayrollDto, tenantId?: string): Promise<PayrollRecord[]> {
    const results: PayrollRecord[] = [];
    const staff = await this.staffRepo.find({ where: { status: StaffStatus.ACTIVE, ...(tenantId ? { tenantId } : {}) } });
    for (const s of staff) {
      const grossPay = Number(s.monthlySalary || 0);
      const tax = grossPay * 0.1;
      const pension = grossPay * 0.08;
      const deductions = tax + pension;
      const netPay = grossPay - deductions;
      const payroll = this.payrollRepo.create({
        staffId: s.id, month: dto.month, year: dto.year,
        basicSalary: Number(s.basicSalary || 0), allowances: 0, deductions, grossPay, netPay, isPaid: false, tenantId
      });
      results.push(await this.payrollRepo.save(payroll));
    }
    return results;
  }

  async getPayrollRecords(staffId: string, tenantId?: string): Promise<PayrollRecord[]> {
    return this.payrollRepo.find({ where: { staffId, ...(tenantId ? { tenantId } : {}) }, order: { createdAt: 'DESC' } });
  }

  async markPayrollAsPaid(payrollId: string): Promise<PayrollRecord> {
    const payroll = await this.payrollRepo.findOne({ where: { id: payrollId } });
    if (!payroll) throw new NotFoundException('Payroll record not found');
    payroll.isPaid = true;
    payroll.paymentDate = new Date();
    payroll.paymentReference = `PAY${Date.now()}`;
    return this.payrollRepo.save(payroll);
  }

  // ============== ATTENDANCE ==============

  async clockIn(staffId: string, tenantId?: string): Promise<StaffAttendance> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await this.attendanceRepo.findOne({ where: { staffId, date: today } });
    if (existing) throw new ConflictException('Already clocked in today');
    const attendance = this.attendanceRepo.create({ staffId, date: today, clockIn: new Date(), status: 'present', tenantId });
    return this.attendanceRepo.save(attendance);
  }

  async clockOut(staffId: string, tenantId?: string): Promise<StaffAttendance> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const attendance = await this.attendanceRepo.findOne({ where: { staffId, date: today } });
    if (!attendance) throw new NotFoundException('No clock-in record found');
    if (attendance.clockOut) throw new ConflictException('Already clocked out');
    const clockOut = new Date();
    const hoursWorked = (clockOut.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60);
    attendance.clockOut = clockOut;
    attendance.hoursWorked = Math.round(hoursWorked * 10) / 10;
    if (hoursWorked < 8) attendance.status = 'late';
    return this.attendanceRepo.save(attendance);
  }

  async getAttendanceRecords(staffId: string, tenantId?: string): Promise<StaffAttendance[]> {
    return this.attendanceRepo.find({ where: { staffId, ...(tenantId ? { tenantId } : {}) }, order: { date: 'ASC' } });
  }

  // ============== STATISTICS ==============

  async getHrStats(tenantId?: string): Promise<any> {
    const where = tenantId ? { tenantId } : {};
    return {
      totalStaff: await this.staffRepo.count({ where }),
      activeStaff: await this.staffRepo.count({ where: { ...where, status: StaffStatus.ACTIVE } }),
      onLeave: await this.staffRepo.count({ where: { ...where, status: StaffStatus.ON_LEAVE } }),
      pendingLeaves: await this.leaveRepo.count({ where: { ...where, status: LeaveStatus.PENDING } }),
    };
  }
}