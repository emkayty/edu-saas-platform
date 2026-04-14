import { Controller, Req, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request as ExpressRequest } from 'express';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get tenant settings' })
  async getSettings(@Req() req: any) {
    return this.settingsService.getSettings(req.user?.tenantId);
  }

  @Patch()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update tenant settings' })
  async updateSettings(@Req() req: any, @Body() settings: Record<string, any>) {
    return this.settingsService.updateSettings(req.user?.tenantId, settings);
  }

  @Patch('theme')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update theme settings' })
  async updateTheme(@Req() req: any, @Body() theme: Record<string, any>) {
    return this.settingsService.updateTheme(req.user?.tenantId, theme);
  }

  @Get('modules')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get module configuration' })
  async getModuleConfig(@Req() req: any) {
    return this.settingsService.getModuleConfig(req.user?.tenantId);
  }

  @Patch('modules')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update module configuration' })
  async updateModuleConfig(@Req() req: any, @Body() moduleConfig: Record<string, any>) {
    return this.settingsService.updateModuleConfig(req.user?.tenantId, moduleConfig);
  }

  @Patch('modules/:moduleName/toggle')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Toggle a specific module' })
  async toggleModule(@Req() req: any, @Param('moduleName') moduleName: string, @Body('enabled') enabled: boolean) {
    await this.settingsService.toggleModule(req.user?.tenantId, moduleName, enabled);
    return { message: `Module ${moduleName} ${enabled ? 'enabled' : 'disabled'}` };
  }

  @Get('integrations')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get integration settings' })
  async getIntegrations(@Req() req: any) {
    return this.settingsService.getIntegrations(req.user?.tenantId);
  }
}