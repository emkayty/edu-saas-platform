import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './services/finance.service';
import { FeeStructure, StudentFee, Payment, Invoice, Scholarship, StudentScholarship } from './entities/finance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeStructure, StudentFee, Payment, Invoice, Scholarship, StudentScholarship
    ])
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}