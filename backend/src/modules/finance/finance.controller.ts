import { Controller, Req, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './services/finance.service';
import { CreateFeeStructureDto, UpdateFeeStructureDto, CreatePaymentDto, CreateScholarshipDto, UpdateScholarshipDto, ApplyScholarshipDto, PaymentQueryDto, GenerateInvoiceDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('finance')
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Fee Structures
  @Post('fees')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create fee structure' })
  async createFee(@Body() dto: CreateFeeStructureDto, @Req() req: any) {
    return this.financeService.createFeeStructure(dto, req.user.tenantId);
  }

  @Get('fees')
  @ApiOperation({ summary: 'Get all fee structures' })
  async getFees(@Req() req: any, @Query('sessionId') sessionId?: string, @Query('category') category?: string) {
    return this.financeService.getFeeStructures(req.user.tenantId, sessionId, category as any);
  }

  @Get('fees/:id')
  @ApiOperation({ summary: 'Get fee structure by ID' })
  async getFeeById(@Param('id') id: string) {
    return this.financeService.getFeeStructureById(id);
  }

  @Patch('fees/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update fee structure' })
  async updateFee(@Param('id') id: string, @Body() dto: UpdateFeeStructureDto) {
    return this.financeService.updateFeeStructure(id, dto);
  }

  // Student Fees
  @Get('student-fees')
  @ApiOperation({ summary: 'Get student fees' })
  async getStudentFees(@Req() req: any) {
    return this.financeService.getStudentFees(req.user.id, req.user.tenantId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get student balance' })
  async getBalance(@Req() req: any) {
    return this.financeService.getStudentBalance(req.user.id, req.user.tenantId);
  }

  // Payments
  @Post('payments')
  @ApiOperation({ summary: 'Record payment' })
  async createPayment(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.financeService.createPayment(dto, req.user.tenantId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payment history' })
  async getPayments(@Req() req: any, @Query() query: PaymentQueryDto) {
    return this.financeService.getPayments(query.studentId || req.user.id, req.user.tenantId);
  }

  @Post('payments/remita/initiate')
  @ApiOperation({ summary: 'Initiate Remita payment' })
  async initiateRemita(@Body('studentFeeId') studentFeeId: string, @Body('amount') amount: number) {
    return this.financeService.initiateRemitaPayment(studentFeeId, amount);
  }

  @Post('payments/remita/verify')
  @ApiOperation({ summary: 'Verify Remita payment' })
  async verifyRemita(@Body('RRR') RRR: string) {
    return this.financeService.verifyRemitaPayment(RRR);
  }

  // Invoices
  @Post('invoices/generate')
  @ApiOperation({ summary: 'Generate invoice' })
  async generateInvoice(@Body() dto: GenerateInvoiceDto, @Req() req: any) {
    return this.financeService.generateInvoice(dto.studentId, dto.sessionId, req.user.tenantId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices' })
  async getInvoices(@Req() req: any) {
    return this.financeService.getInvoices(req.user.id, req.user.tenantId);
  }

  // Scholarships
  @Post('scholarships')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create scholarship' })
  async createScholarship(@Body() dto: CreateScholarshipDto, @Req() req: any) {
    return this.financeService.createScholarship(dto, req.user.tenantId);
  }

  @Get('scholarships')
  @ApiOperation({ summary: 'Get all scholarships' })
  async getScholarships(@Req() req: any, @Query('activeOnly') activeOnly?: boolean) {
    return this.financeService.getScholarships(req.user.tenantId, activeOnly);
  }

  @Post('scholarships/apply')
  @ApiOperation({ summary: 'Apply for scholarship' })
  async applyScholarship(@Body() dto: ApplyScholarshipDto, @Req() req: any) {
    return this.financeService.applyScholarship(dto, req.user.tenantId);
  }

  @Get('scholarships/my')
  @ApiOperation({ summary: 'Get my scholarships' })
  async getMyScholarships(@Req() req: any) {
    return this.financeService.getStudentScholarships(req.user.id, req.user.tenantId);
  }
}