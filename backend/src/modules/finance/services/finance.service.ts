import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeStructure, StudentFee, Payment, Invoice, Scholarship, StudentScholarship, FeeCategory, PaymentStatus } from '../entities/finance.entity';
import { 
  CreateFeeStructureDto, UpdateFeeStructureDto,
  CreatePaymentDto, PaymentQueryDto,
  CreateScholarshipDto, UpdateScholarshipDto,
  ApplyScholarshipDto
} from '../dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FeeStructure)
    private feeStructureRepo: Repository<FeeStructure>,
    @InjectRepository(StudentFee)
    private studentFeeRepo: Repository<StudentFee>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Scholarship)
    private scholarshipRepo: Repository<Scholarship>,
    @InjectRepository(StudentScholarship)
    private studentScholarshipRepo: Repository<StudentScholarship>,
  ) {}

  // ============== FEE STRUCTURES ==============

  async createFeeStructure(dto: CreateFeeStructureDto, tenantId?: string): Promise<FeeStructure> {
    const fee = this.feeStructureRepo.create({ ...dto, tenantId });
    return this.feeStructureRepo.save(fee);
  }

  async getFeeStructures(tenantId?: string, sessionId?: string, category?: FeeCategory): Promise<FeeStructure[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (sessionId) where.sessionId = sessionId;
    if (category) where.category = category;
    
    return this.feeStructureRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getFeeStructureById(id: string): Promise<FeeStructure> {
    const fee = await this.feeStructureRepo.findOne({ where: { id } });
    if (!fee) throw new NotFoundException('Fee structure not found');
    return fee;
  }

  async updateFeeStructure(id: string, dto: UpdateFeeStructureDto): Promise<FeeStructure> {
    const fee = await this.getFeeStructureById(id);
    Object.assign(fee, dto);
    return this.feeStructureRepo.save(fee);
  }

  // ============== STUDENT FEES ==============

  async generateStudentFees(sessionId: string, departmentId?: string, level?: number): Promise<StudentFee[]> {
    // Get all fee structures for the session
    const feeStructures = await this.getFeeStructures(undefined, sessionId);
    
    const studentFees: StudentFee[] = [];
    
    // This would normally query all students from the system
    // For now, returning the structures as reference
    return studentFees;
  }

  async getStudentFees(studentId: string, tenantId?: string): Promise<StudentFee[]> {
    return this.studentFeeRepo.find({
      where: { studentId, ...(tenantId ? { tenantId } : {}) },
      order: { createdAt: 'DESC' }
    });
  }

  async getStudentBalance(studentId: string, tenantId?: string): Promise<{ total: number; paid: number; outstanding: number }> {
    const fees = await this.getStudentFees(studentId, tenantId);
    
    const total = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const paid = fees.reduce((sum, fee) => sum + Number(fee.amountPaid), 0);
    
    return {
      total,
      paid,
      outstanding: total - paid
    };
  }

  // ============== PAYMENTS ==============

  async createPayment(dto: CreatePaymentDto, tenantId?: string): Promise<Payment> {
    const paymentData = {
      ...dto,
      amount: Number(dto.amount),
      tenantId
    };
    const payment = this.paymentRepo.create(paymentData as any);
    const saved = await this.paymentRepo.save(payment);
    
    // Update student fee if applicable
    if (dto.studentFeeId) {
      await this.updateStudentFeePayment(dto.studentFeeId, Number(dto.amount));
    }
    
    return saved[0];
  }

  private async updateStudentFeePayment(studentFeeId: string, amount: number): Promise<void> {
    const studentFee = await this.studentFeeRepo.findOne({ where: { id: studentFeeId } });
    if (!studentFee) return;
    
    const newAmountPaid = Number(studentFee.amountPaid) + amount;
    const isFullyPaid = newAmountPaid >= Number(studentFee.amount);
    
    studentFee.amountPaid = newAmountPaid;
    studentFee.status = isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
    
    await this.studentFeeRepo.save(studentFee);
  }

  async getPayments(studentId?: string, tenantId?: string): Promise<Payment[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (studentId) where.studentId = studentId;
    
    return this.paymentRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async verifyPayment(reference: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { reference } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // ============== INVOICES ==============

  async generateInvoice(studentId: string, sessionId: string, tenantId?: string): Promise<Invoice> {
    // Get all student fees for the session
    const studentFees = await this.getStudentFees(studentId, tenantId);
    
    const totalAmount = studentFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    
    const invoice = this.invoiceRepo.create({
      invoiceNumber: `INV-${Date.now()}`,
      studentId,
      totalAmount,
      status: 'pending',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      tenantId
    });
    
    return this.invoiceRepo.save(invoice);
  }

  async getInvoices(studentId?: string, tenantId?: string): Promise<Invoice[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (studentId) where.studentId = studentId;
    
    return this.invoiceRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  // ============== SCHOLARSHIPS ==============

  async createScholarship(dto: CreateScholarshipDto, tenantId?: string): Promise<Scholarship> {
    const scholarship = this.scholarshipRepo.create({ ...dto, tenantId });
    return this.scholarshipRepo.save(scholarship);
  }

  async getScholarships(tenantId?: string, activeOnly?: boolean): Promise<Scholarship[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (activeOnly) where.isActive = true;
    
    return this.scholarshipRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async applyScholarship(dto: ApplyScholarshipDto, tenantId?: string): Promise<StudentScholarship> {
    const scholarship = await this.scholarshipRepo.findOne({ where: { id: dto.scholarshipId } });
    if (!scholarship) throw new NotFoundException('Scholarship not found');
    
    const amount = scholarship.type === 'percentage'
      ? (Number(dto.amount) * (scholarship.percentage || 0) / 100)
      : scholarship.amount;
    
    const studentScholarship = this.studentScholarshipRepo.create({
      studentId: dto.studentId,
      scholarshipId: dto.scholarshipId,
      amount,
      status: 'active',
      startDate: new Date(),
      tenantId
    });
    
    return this.studentScholarshipRepo.save(studentScholarship);
  }

  async getStudentScholarships(studentId: string, tenantId?: string): Promise<StudentScholarship[]> {
    return this.studentScholarshipRepo.find({
      where: { studentId, ...(tenantId ? { tenantId } : {}) },
      relations: ['scholarship']
    });
  }

  // ============== PAYMENT INTEGRATION (Remita template) ==============

  async initiateRemitaPayment(studentFeeId: string, amount: number): Promise<{ RRR: string; checkoutUrl: string }> {
    // This is a template for Remita integration
    // In production, this would call the Remita API
    const RRR = `REM${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const checkoutUrl = `https://remita.com/pay/${RRR}`;
    
    return { RRR, checkoutUrl };
  }

  async verifyRemitaPayment(RRR: string): Promise<{ status: string; amount: number }> {
    // This would verify payment with Remita API
    return { status: 'success', amount: 0 };
  }
}