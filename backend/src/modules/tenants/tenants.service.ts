import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, THEME_PRESETS, DEFAULT_MODULE_CONFIG } from './tenant.entity';
import { CreateTenantDto, UpdateTenantDto, ApplyThemePresetDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Create a new tenant (institution)
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if slug already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    // Set default academic config based on type
    const defaultAcademic = createTenantDto.type === 'polytechnic' 
      ? { maxLevels: 5, industrialTrainingEnabled: true }
      : { maxLevels: 4, industrialTrainingEnabled: false };

    // Set default integrations based on type
    const defaultIntegrations = createTenantDto.type === 'polytechnic'
      ? { nucEnabled: false, nbteEnabled: true }
      : { nucEnabled: true, nbteEnabled: false };

    // Create tenant with defaults
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      // Apply default academic config
      ...defaultAcademic,
      // Apply default integrations
      ...defaultIntegrations,
      // Apply default module config
      moduleConfig: DEFAULT_MODULE_CONFIG,
      // Set subscription if provided
      subscription: createTenantDto.subscription ? {
        plan: createTenantDto.subscription.plan || 'trial',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        maxUsers: createTenantDto.subscription.maxUsers || 100,
      } : undefined,
    });

    return this.tenantRepository.save(tenant);
  }

  /**
   * Find all tenants (for super admin)
   */
  async findAll(page = 1, limit = 10): Promise<{ tenants: Tenant[]; total: number }> {
    const [tenants, total] = await this.tenantRepository.findAndCount({
      relations: ['users'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { tenants, total };
  }

  /**
   * Find tenant by ID
   */
  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Update tenant
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findById(id);
    
    // Merge updates
    Object.assign(tenant, updateTenantDto);
    
    return this.tenantRepository.save(tenant);
  }

  /**
   * Delete tenant (soft delete)
   */
  async remove(id: string): Promise<void> {
    const tenant = await this.findById(id);
    tenant.status = 'inactive';
    tenant.deactivatedAt = new Date();
    
    await this.tenantRepository.save(tenant);
  }

  /**
   * Get available theme presets
   */
  getThemePresets() {
    return [
      // University presets
      {
        id: 'traditional-blue',
        name: 'Traditional Blue',
        description: 'Classic academic blue suitable for traditional universities',
        type: 'university' as const,
        colors: {
          primaryColor: '#1E3A8A',
          secondaryColor: '#3B82F6',
          accentColor: '#F59E0B',
          backgroundColor: '#F8FAFC',
          surfaceColor: '#FFFFFF',
          textColor: '#1E293B',
          textSecondaryColor: '#64748B',
          borderColor: '#E2E8F0',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#EF4444',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['federal_university', 'state_university', 'private_university'],
      },
      {
        id: 'science-green',
        name: 'Science Green',
        description: 'Fresh green ideal for science-focused institutions',
        type: 'university' as const,
        colors: {
          primaryColor: '#047857',
          secondaryColor: '#10B981',
          accentColor: '#FCD34D',
          backgroundColor: '#ECFDF5',
          surfaceColor: '#FFFFFF',
          textColor: '#064E3B',
          textSecondaryColor: '#6B7280',
          borderColor: '#D1FAE5',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#EF4444',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['university', 'polytechnic'],
      },
      {
        id: 'heritage-maroon',
        name: 'Heritage Maroon',
        description: 'Traditional maroon for institutions with heritage',
        type: 'university' as const,
        colors: {
          primaryColor: '#7F1D1D',
          secondaryColor: '#DC2626',
          accentColor: '#FEF3C7',
          backgroundColor: '#FEF2F2',
          surfaceColor: '#FFFFFF',
          textColor: '#450A0A',
          textSecondaryColor: '#7F1D1D',
          borderColor: '#FECACA',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#DC2626',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['university'],
      },
      {
        id: 'prestige-gold',
        name: 'Prestige Gold',
        description: 'Premium gold for private elite institutions',
        type: 'university' as const,
        colors: {
          primaryColor: '#B45309',
          secondaryColor: '#D97706',
          accentColor: '#F59E0B',
          backgroundColor: '#FFFBEB',
          surfaceColor: '#FFFFFF',
          textColor: '#451A03',
          textSecondaryColor: '#92400E',
          borderColor: '#FDE68A',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#EF4444',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['private_university', 'private_polytechnic'],
      },
      // Polytechnic presets
      {
        id: 'industrial-orange',
        name: 'Industrial Orange',
        description: 'Technical orange for polytechnic training',
        type: 'polytechnic' as const,
        colors: {
          primaryColor: '#C2410C',
          secondaryColor: '#EA580C',
          accentColor: '#FBBF24',
          backgroundColor: '#FFF7ED',
          surfaceColor: '#FFFFFF',
          textColor: '#431407',
          textSecondaryColor: '#7C2D12',
          borderColor: '#FED7AA',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#EF4444',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['federal_polytechnic', 'state_polytechnic'],
      },
      {
        id: 'technical-blue',
        name: 'Technical Blue',
        description: 'Engineering blue for technical institutions',
        type: 'polytechnic' as const,
        colors: {
          primaryColor: '#1E40AF',
          secondaryColor: '#2563EB',
          accentColor: '#60A5FA',
          backgroundColor: '#EFF6FF',
          surfaceColor: '#FFFFFF',
          textColor: '#1E3A8A',
          textSecondaryColor: '#1E40AF',
          borderColor: '#BFDBFE',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#EF4444',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['polytechnic', 'university'],
      },
      {
        id: 'engineering-red',
        name: 'Engineering Red',
        description: 'Mechanical red for engineering-focused polytechnics',
        type: 'polytechnic' as const,
        colors: {
          primaryColor: '#991B1B',
          secondaryColor: '#DC2626',
          accentColor: '#FCA5A5',
          backgroundColor: '#FEF2F2',
          surfaceColor: '#FFFFFF',
          textColor: '#7F1D1D',
          textSecondaryColor: '#991B1B',
          borderColor: '#FECACA',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#DC2626',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['polytechnic', 'engineering_faculty'],
      },
      {
        id: 'modern-teal',
        name: 'Modern Teal',
        description: 'Innovation-focused teal for modern polytechnics',
        type: 'polytechnic' as const,
        colors: {
          primaryColor: '#0F766E',
          secondaryColor: '#14B8A6',
          accentColor: '#5EEAD4',
          backgroundColor: '#F0FDFA',
          surfaceColor: '#FFFFFF',
          textColor: '#134E4A',
          textSecondaryColor: '#115E59',
          borderColor: '#99F6E4',
          successColor: '#10B981',
          warningColor: '#F59E0B',
          errorColor: '#EF4444',
          infoColor: '#3B82F6',
        },
        recommendedFor: ['private_polytechnic', 'technology_institute'],
      },
    ];
  }

  /**
   * Apply a theme preset to a tenant
   */
  async applyThemePreset(id: string, presetDto: ApplyThemePresetDto): Promise<Tenant> {
    const tenant = await this.findById(id);
    const preset = THEME_PRESETS[presetDto.presetId];

    if (!preset) {
      throw new NotFoundException('Theme preset not found');
    }

    // Apply preset colors
    tenant.primaryColor = preset.primaryColor;
    tenant.secondaryColor = preset.secondaryColor;
    tenant.accentColor = preset.accentColor;
    tenant.backgroundColor = preset.backgroundColor;
    tenant.surfaceColor = preset.surfaceColor;
    tenant.textColor = preset.textColor;
    tenant.textSecondaryColor = preset.textSecondaryColor;
    tenant.borderColor = preset.borderColor;
    tenant.successColor = preset.successColor;
    tenant.warningColor = preset.warningColor;
    tenant.errorColor = preset.errorColor;
    tenant.infoColor = preset.infoColor;
    tenant.fontFamily = preset.fontFamily;

    return this.tenantRepository.save(tenant);
  }

  /**
   * Get tenant public configuration (for frontend)
   */
  async getPublicConfig(slug: string) {
    const tenant = await this.findBySlug(slug);

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      shortName: tenant.shortName,
      type: tenant.type,
      category: tenant.category,
      branding: {
        logo: tenant.logo,
        logoDark: tenant.logoDark,
        favicon: tenant.favicon,
        banner: tenant.banner,
        colors: {
          primary: tenant.primaryColor,
          secondary: tenant.secondaryColor,
          accent: tenant.accentColor,
          background: tenant.backgroundColor,
          surface: tenant.surfaceColor,
          text: tenant.textColor,
          textSecondary: tenant.textSecondaryColor,
          border: tenant.borderColor,
          success: tenant.successColor,
          warning: tenant.warningColor,
          error: tenant.errorColor,
          info: tenant.infoColor,
        },
        typography: {
          fontFamily: tenant.fontFamily,
          fontFamilyHeadings: tenant.fontFamilyHeadings,
        },
      },
      features: {
        aiEnabled: tenant.aiEnabled,
        mobileAppEnabled: tenant.mobileAppEnabled,
        customDomainEnabled: tenant.customDomainEnabled,
      },
      integrations: {
        jambEnabled: tenant.jambEnabled,
        remitaEnabled: tenant.remitaEnabled,
        nucEnabled: tenant.nucEnabled,
        nbteEnabled: tenant.nbteEnabled,
        nyscEnabled: tenant.nyscEnabled,
      },
      academic: {
        gradingSystem: tenant.gradingSystem,
        sessionType: tenant.sessionType,
        maxLevels: tenant.maxLevels,
        carryOverEnabled: tenant.carryOverEnabled,
        industrialTrainingEnabled: tenant.industrialTrainingEnabled,
      },
    };
  }
}