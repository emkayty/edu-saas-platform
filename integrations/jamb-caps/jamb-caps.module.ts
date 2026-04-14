/**
 * JAMB CAPS Module
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JambCapsController } from './jamb-caps.controller';
import { JambCapsService } from './jamb-caps.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [JambCapsController],
  providers: [JambCapsService],
  exports: [JambCapsService],
})
export class JambCapsModule {}