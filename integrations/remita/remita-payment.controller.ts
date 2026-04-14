/**
 * Remita Payment Controller
 */

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RemitaPaymentService, PaymentRequest } from './remita-payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('payments')
@Controller('integrations/remita')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RemitaPaymentController {
  constructor(private readonly remitaService: RemitaPaymentService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment' })
  async initiatePayment(@Body() payment: PaymentRequest) {
    return this.remitaService.initiatePayment(payment);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment status' })
  async verifyPayment(@Body('paymentReference') paymentReference: string) {
    return this.remitaService.verifyPayment(paymentReference);
  }

  @Get('status/:orderId')
  @ApiOperation({ summary: 'Check payment status by order ID' })
  async checkStatus(@Param('orderId') orderId: string) {
    return this.remitaService.checkPaymentStatus(orderId);
  }

  @Post('refund')
  @Roles('super_admin', 'admin', 'finance')
  @ApiOperation({ summary: 'Process refund' })
  async processRefund(
    @Body() refund: { paymentReference: string; amount: number; reason: string },
  ) {
    return this.remitaService.processRefund(
      refund.paymentReference,
      refund.amount,
      refund.reason,
    );
  }

  @Get('transactions')
  @Roles('super_admin', 'admin', 'finance')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20,
  ) {
    return this.remitaService.getTransactionHistory(startDate, endDate, page, size);
  }

  @Post('rrr/generate')
  @ApiOperation({ summary: 'Generate Remita Retrieval Reference (RRR)' })
  async generateRRR(
    @Body() rrr: { studentId: string; amount: number; description: string },
  ) {
    return this.remitaService.generateRRR(rrr.studentId, rrr.amount, rrr.description);
  }

  @Post('rrr/verify')
  @ApiOperation({ summary: 'Verify RRR payment' })
  async verifyRRR(@Body('rrr') rrr: string) {
    return this.remitaService.verifyRRR(rrr);
  }

  @Get('banks')
  @ApiOperation({ summary: 'Get bank list' })
  async getBankList() {
    return this.remitaService.getBankList();
  }

  @Post('banks/validate')
  @ApiOperation({ summary: 'Validate bank account' })
  async validateAccount(
    @Body() account: { bankCode: string; accountNumber: string },
  ) {
    return this.remitaService.validateAccount(account.bankCode, account.accountNumber);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Remita payment webhook callback' })
  async handleWebhook(@Body() payload: any) {
    // Process webhook notification
    console.log('Remita webhook received:', payload);
    return { received: true };
  }
}