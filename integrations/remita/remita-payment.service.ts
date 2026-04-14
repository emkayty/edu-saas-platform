/**
 * Remita Payment Integration Service
 * 
 * Integrates with Remita Payment Gateway for:
 * - Student fee collection
 * - Payment processing
 * - Transaction verification
 * - Refund handling
 * - Settlement reconciliation
 */

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

export interface RemitaConfig {
  merchantId: string;
  apiKey: string;
  serviceTypeId: string;
  baseUrl: string;
  callbackUrl: string;
}

export interface PaymentRequest {
  amount: number;
  studentId: string;
  description: string;
  paymentType: 'SCHOOL_FEE' | 'ACCOMMODATION' | 'OTHER';
  callbackUrl?: string;
}

export interface RemitaPaymentResponse {
  orderId: string;
  paymentReference: string;
  paymentUrl: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

export interface PaymentStatus {
  paymentReference: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  amount: number;
  transactionDate: string;
  channel: string;
  customerId: string;
  customerName: string;
}

export interface TransactionRecord {
  id: string;
  studentId: string;
  paymentReference: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  channel?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

@Injectable()
export class RemitaPaymentService {
  private config: RemitaConfig;
  
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.config = {
      merchantId: this.configService.get('REMITA_MERCHANT_ID', ''),
      apiKey: this.configService.get('REMITA_API_KEY', ''),
      serviceTypeId: this.configService.get('REMITA_SERVICE_TYPE_ID', ''),
      baseUrl: this.configService.get('REMITA_BASE_URL', 'https://remita.com'),
      callbackUrl: this.configService.get('REMITA_CALLBACK_URL', ''),
    };
  }

  /**
   * Generate hash for payment request
   */
  private generateHash(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Initiate payment request
   */
  async initiatePayment(payment: PaymentRequest): Promise<RemitaPaymentResponse> {
    try {
      const orderId = `ORD-${Date.now()}-${payment.studentId}`;
      
      // Generate hash for payment verification
      const hashData = `${this.config.merchantId}${orderId}${payment.amount}${this.config.apiKey}`;
      const hash = this.generateHash(hashData);
      
      const payload = {
        merchantId: this.config.merchantId,
        serviceTypeId: this.config.serviceTypeId,
        amount: payment.amount,
        orderId,
        hash,
        callbackUrl: payment.callbackUrl || this.config.callbackUrl,
        payer: {
          name: '', // Will be populated from student record
          email: '',
          phone: '',
        },
        description: payment.description,
        customFields: [
          {
            name: 'studentId',
            value: payment.studentId,
          },
          {
            name: 'paymentType',
            value: payment.paymentType,
          },
        ],
      };
      
      const response = await this.httpService.axiosRef.post(
        `${this.config.baseUrl}/payment/v2/payment-init`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      
      if (response.data?.status === '00') {
        return {
          orderId,
          paymentReference: response.data.reference,
          paymentUrl: response.data.paymentUrl,
          status: 'pending',
          message: 'Payment initiated successfully',
        };
      }
      
      throw new HttpException(
        response.data?.message || 'Failed to initiate payment',
        HttpStatus.BAD_GATEWAY,
      );
    } catch (error) {
      throw new HttpException(
        `Payment initiation failed: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentReference: string): Promise<PaymentStatus> {
    try {
      const hash = this.generateHash(`${paymentReference}${this.config.apiKey}`);
      
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/payment/v2/payment/${paymentReference}/${this.config.merchantId}/${hash}`,
      );
      
      if (response.data?.status === '00') {
        return {
          paymentReference,
          status: 'success',
          amount: response.data.amount,
          transactionDate: response.data.transactionDate,
          channel: response.data.channel,
          customerId: response.data.customerId,
          customerName: response.data.customerName,
        };
      }
      
      return {
        paymentReference,
        status: response.data?.status || 'pending',
        amount: 0,
        transactionDate: '',
        channel: '',
        customerId: '',
        customerName: '',
      };
    } catch (error) {
      throw new HttpException(
        `Payment verification failed: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Check payment status with order ID
   */
  async checkPaymentStatus(orderId: string): Promise<{
    status: string;
    amount: number;
    paymentDate: string;
  }> {
    try {
      const hash = this.generateHash(`${orderId}${this.config.apiKey}`);
      
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/payment/v2/query/${orderId}/${this.config.merchantId}/${hash}`,
      );
      
      return {
        status: response.data?.status || 'pending',
        amount: response.data?.amount || 0,
        paymentDate: response.data?.paymentDate || '',
      };
    } catch (error) {
      return {
        status: 'error',
        amount: 0,
        paymentDate: '',
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentReference: string,
    amount: number,
    reason: string,
  ): Promise<{ success: boolean; refundReference: string }> {
    try {
      const refundReference = `REF-${Date.now()}`;
      
      const hash = this.generateHash(
        `${this.config.merchantId}${paymentReference}${amount}${this.config.apiKey}`,
      );
      
      const payload = {
        merchantId: this.config.merchantId,
        refundReference,
        transactionReference: paymentReference,
        amount,
        reason,
        hash,
      };
      
      const response = await this.httpService.axiosRef.post(
        `${this.config.baseUrl}/payment/v2/refund`,
        payload,
      );
      
      return {
        success: response.data?.status === '00',
        refundReference,
      };
    } catch (error) {
      throw new HttpException(
        `Refund failed: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    startDate: string,
    endDate: string,
    page: number = 1,
    size: number = 20,
  ): Promise<{
    transactions: TransactionRecord[];
    total: number;
    page: number;
  }> {
    try {
      const hash = this.generateHash(
        `${this.config.merchantId}${startDate}${endDate}${this.config.apiKey}`,
      );
      
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/payment/v2/transactions`,
        {
          params: {
            merchantId: this.config.merchantId,
            startDate,
            endDate,
            page,
            size,
            hash,
          },
        },
      );
      
      return {
        transactions: response.data?.transactions || [],
        total: response.data?.total || 0,
        page,
      };
    } catch (error) {
      return {
        transactions: [],
        total: 0,
        page,
      };
    }
  }

  /**
   * Generate RRR (Remita Retrieval Reference)
   */
  async generateRRR(
    studentId: string,
    amount: number,
    description: string,
  ): Promise<{
    rrr: string;
    orderId: string;
    amount: string;
  }> {
    const orderId = `ORD-${Date.now()}-${studentId}`;
    
    const hash = this.generateHash(
      `${this.config.merchantId}${orderId}${amount}${this.config.apiKey}`,
    );
    
    const payload = {
      merchantId: this.config.merchantId,
      serviceTypeId: this.config.serviceTypeId,
      amount: amount.toString(),
      orderId,
      hash,
      customFields: [
        { name: 'studentId', value: studentId },
        { name: 'description', value: description },
      ],
    };
    
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.config.baseUrl}/payment/v1/rrr`,
        payload,
      );
      
      if (response.data?.status === '00') {
        return {
          rrr: response.data.RRR,
          orderId,
          amount: amount.toString(),
        };
      }
      
      throw new HttpException(
        response.data?.message || 'Failed to generate RRR',
        HttpStatus.BAD_GATEWAY,
      );
    } catch (error) {
      throw new HttpException(
        `RRR generation failed: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Verify RRR payment
   */
  async verifyRRR(rrr: string): Promise<{
    status: string;
    amount: number;
    transactionDate: string;
  }> {
    const hash = this.generateHash(`${rrr}${this.config.apiKey}`);
    
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/payment/v1/rrr/${rrr}/${hash}/status`,
      );
      
      return {
        status: response.data?.status || 'pending',
        amount: parseFloat(response.data?.amount || '0'),
        transactionDate: response.data?.transactionDate || '',
      };
    } catch (error) {
      return {
        status: 'error',
        amount: 0,
        transactionDate: '',
      };
    }
  }

  /**
   * Validate account for bank transfer
   */
  async validateAccount(
    bankCode: string,
    accountNumber: string,
  ): Promise<{
    valid: boolean;
    accountName: string;
    bankName: string;
  }> {
    try {
      const hash = this.generateHash(
        `${bankCode}${accountNumber}${this.config.apiKey}`,
      );
      
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/payments/v1/banks/validate/account`,
        {
          params: {
            bankCode,
            accountNumber,
            hash,
          },
        },
      );
      
      return {
        valid: response.data?.status === '00',
        accountName: response.data?.accountName || '',
        bankName: response.data?.bankName || '',
      };
    } catch (error) {
      return {
        valid: false,
        accountName: '',
        bankName: '',
      };
    }
  }

  /**
   * Get bank list
   */
  async getBankList(): Promise<{
    banks: { code: string; name: string }[];
  }> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.config.baseUrl}/payment/v1/banks/list`,
      );
      
      return {
        banks: response.data?.banks || [],
      };
    } catch (error) {
      return { banks: [] };
    }
  }
}