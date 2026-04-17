import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { FinanceModule } from './modules/finance/finance.module';
import { LmsModule } from './modules/lms/lms.module';
import { ExaminationModule } from './modules/examination/examination.module';
import { LibraryModule } from './modules/library/library.module';
import { HostelModule } from './modules/hostel/hostel.module';
import { HrModule } from './modules/hr/hr.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TimetableModule } from './modules/timetable/timetable.module';

// Integration Modules (disabled for now - add when integrations are ready)
// import { JambCapsModule } from '../integrations/jamb-caps/jamb-caps.module';
// import { RemitaPaymentModule } from '../integrations/remita/remita-payment.module';
// import { NucNbteReportingModule } from '../integrations/nuc-nbte/nuc-nbte-reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Debug: log the DB_TYPE to see what's being read
        const dbType = (configService.get('DB_TYPE') || configService.get('DB_DRIVER') || 'postgres').toLowerCase();
        
        console.log('[DB Config] DB_TYPE:', dbType);
        
        // SQLite configuration (for development/testing)
        if (dbType === 'sqlite' || dbType === 'better-sqlite3') {
          return {
            type: 'sqlite',
            database: configService.get('SQLITE_DATABASE', './dev.sqlite'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: configService.get('NODE_ENV') === 'development',
          };
        }
        
        // PostgreSQL configuration (default)
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'edusaas'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
          // Enable for better performance in production
          extra: {
            connectionLimit: 10,
          },
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{ 
          ttl: configService.get<number>('THROTTLE_TTL', 60000), 
          limit: configService.get<number>('THROTTLE_LIMIT', 100) 
        }],
      }),
      inject: [ConfigService],
    }),
    // Core Modules
    AuthModule, 
    UsersModule, 
    TenantsModule, 
    SettingsModule, 
    HealthModule,
    AcademicsModule, 
    FinanceModule, 
    LmsModule, 
    ExaminationModule,
    LibraryModule, 
    HostelModule, 
    HrModule, 
    CommunicationModule,
    DocumentsModule, 
    AdminModule, 
    AiModule, 
    AnalyticsModule, 
    TimetableModule,
    // Integration Modules (disabled for now)
    // JambCapsModule,
    // RemitaPaymentModule,
    // NucNbteReportingModule,
  ],
})
export class AppModule {}