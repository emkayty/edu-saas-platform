/**
 * Remita Payment Module
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RemitaPaymentController } from './remita-payment.controller';
import { RemitaPaymentService } from './remita-payment.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [RemitaPaymentController],
  providers: [RemitaPaymentService],
  exports: [RemitaPaymentService],
})
export class RemitaPaymentModule {}