import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Get settings for a tenant
   */
  async getSettings(tenantId: string): Promise<Record<string, any>> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant.settings || {};
  }

  /**
   * Update settings for a tenant
   */
  async updateSettings(tenantId: string, settings: Record<string, any>): Promise<Record<string, any>> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.settings = {
      ...tenant.settings,
      ...settings,
    };

    await this.tenantRepository.save(tenant);
    return tenant.settings;
  }

  /**
   * Update theme for a tenant
   */
  async updateTheme(tenantId: string, theme: Record<string, any>): Promise<Record<string, any>> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.theme = {
      ...tenant.theme,
      ...theme,
    };

    await this.tenantRepository.save(tenant);
    return tenant.theme;
  }

  /**
   * Get module configuration for a tenant
   */
  async getModuleConfig(tenantId: string): Promise<Record<string, any>> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant.moduleConfig || {};
  }

  /**
   * Update module configuration for a tenant
   */
  async updateModuleConfig(tenantId: string, moduleConfig: Record<string, any>): Promise<Record<string, any>> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.moduleConfig = {
      ...tenant.moduleConfig,
      ...moduleConfig,
    };

    await this.tenantRepository.save(tenant);
    return tenant.moduleConfig;
  }

  /**
   * Toggle a specific module
   */
  async toggleModule(tenantId: string, moduleName: string, enabled: boolean): Promise<void> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const moduleConfig = tenant.moduleConfig || {};
    moduleConfig[moduleName] = {
      ...moduleConfig[moduleName],
      enabled,
    };

    tenant.moduleConfig = moduleConfig;
    await this.tenantRepository.save(tenant);
  }

  /**
   * Get integration settings for a tenant
   */
  async getIntegrations(tenantId: string): Promise<Record<string, any>> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      jambEnabled: tenant.jambEnabled,
      remitaEnabled: tenant.remitaEnabled,
      nucEnabled: tenant.nucEnabled,
      nbteEnabled: tenant.nbteEnabled,
      nyscEnabled: tenant.nyscEnabled,
      customIntegrations: tenant.customIntegrations || {},
    };
  }
}