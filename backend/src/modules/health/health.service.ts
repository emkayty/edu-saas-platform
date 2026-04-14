import { Injectable } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        try {
          await this.dataSource.query('SELECT 1');
          return { status: 'up', database: 'connected' };
        } catch (error) {
          return { status: 'down', database: 'disconnected', error: error.message };
        }
      },
    ]);
  }

  getStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }
}