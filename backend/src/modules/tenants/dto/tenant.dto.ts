import { IsString, IsEnum, IsOptional, IsObject, ValidateNested, IsBoolean, IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantBrandingDto {
  @ApiPropertyOptional({ description: 'Primary color in hex format' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary color in hex format' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Accent color in hex format' })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional({ description: 'Background color in hex format' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({ description: 'Surface color in hex format' })
  @IsOptional()
  @IsString()
  surfaceColor?: string;

  @ApiPropertyOptional({ description: 'Text color in hex format' })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ description: 'Secondary text color in hex format' })
  @IsOptional()
  @IsString()
  textSecondaryColor?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsOptional()
  @IsString()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Success color in hex format' })
  @IsOptional()
  @IsString()
  successColor?: string;

  @ApiPropertyOptional({ description: 'Warning color in hex format' })
  @IsOptional()
  @IsString()
  warningColor?: string;

  @ApiPropertyOptional({ description: 'Error color in hex format' })
  @IsOptional()
  @IsString()
  errorColor?: string;

  @ApiPropertyOptional({ description: 'Info color in hex format' })
  @IsOptional()
  @IsString()
  infoColor?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({ description: 'Dark mode logo URL' })
  @IsOptional()
  @IsUrl()
  logoDark?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  @IsOptional()
  @IsUrl()
  favicon?: string;

  @ApiPropertyOptional({ description: 'Login page banner URL' })
  @IsOptional()
  @IsUrl()
  banner?: string;

  @ApiPropertyOptional({ description: 'Primary font family' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ description: 'Headings font family' })
  @IsOptional()
  @IsString()
  fontFamilyHeadings?: string;

  @ApiPropertyOptional({ description: 'Custom CSS' })
  @IsOptional()
  @IsString()
  customCSS?: string;
}

export class CreateTenantAcademicDto {
  @ApiPropertyOptional({ enum: ['4_point', '5_point', 'percentage'] })
  @IsOptional()
  @IsEnum(['4_point', '5_point', 'percentage'])
  gradingSystem?: string;

  @ApiPropertyOptional({ enum: ['semester', 'trimester'] })
  @IsOptional()
  @IsEnum(['semester', 'trimester'])
  sessionType?: string;

  @ApiPropertyOptional({ description: 'Maximum levels (4 for BSc, 5 for HND)' })
  @IsOptional()
  @IsNumber()
  maxLevels?: number;

  @ApiPropertyOptional({ description: 'Enable carry-over system' })
  @IsOptional()
  @IsBoolean()
  carryOverEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable industrial training (SIWES) for polytechnics' })
  @IsOptional()
  @IsBoolean()
  industrialTrainingEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Custom academic configuration' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class CreateTenantModulesDto {
  @ApiPropertyOptional({ description: 'Enable LMS module' })
  @IsOptional()
  @IsBoolean()
  lms?: boolean;

  @ApiPropertyOptional({ description: 'Enable library module' })
  @IsOptional()
  @IsBoolean()
  library?: boolean;

  @ApiPropertyOptional({ description: 'Enable hostel module' })
  @IsOptional()
  @IsBoolean()
  hostel?: boolean;

  @ApiPropertyOptional({ description: 'Enable HR and payroll module' })
  @IsOptional()
  @IsBoolean()
  hrAndPayroll?: boolean;

  @ApiPropertyOptional({ description: 'Enable research module (Universities only)' })
  @IsOptional()
  @IsBoolean()
  research?: boolean;

  @ApiPropertyOptional({ description: 'Enable industrial training module (Polytechnics only)' })
  @IsOptional()
  @IsBoolean()
  industrialTraining?: boolean;

  @ApiPropertyOptional({ description: 'Enable AI analytics' })
  @IsOptional()
  @IsBoolean()
  aiAnalytics?: boolean;

  @ApiPropertyOptional({ description: 'Enable AI chatbot' })
  @IsOptional()
  @IsBoolean()
  aiChatbot?: boolean;

  @ApiPropertyOptional({ description: 'Enable transport module' })
  @IsOptional()
  @IsBoolean()
  transport?: boolean;

  @ApiPropertyOptional({ description: 'Enable health center module' })
  @IsOptional()
  @IsBoolean()
  healthCenter?: boolean;

  @ApiPropertyOptional({ description: 'Enable alumni module' })
  @IsOptional()
  @IsBoolean()
  alumni?: boolean;

  @ApiPropertyOptional({ description: 'Enable quality assurance module' })
  @IsOptional()
  @IsBoolean()
  qualityAssurance?: boolean;

  @ApiPropertyOptional({ description: 'Enable document management module' })
  @IsOptional()
  @IsBoolean()
  documentManagement?: boolean;
}

export class CreateTenantIntegrationsDto {
  @ApiPropertyOptional({ description: 'Enable JAMB integration' })
  @IsOptional()
  @IsBoolean()
  jambEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable Remita payment integration' })
  @IsOptional()
  @IsBoolean()
  remitaEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable NUC reporting (Universities only)' })
  @IsOptional()
  @IsBoolean()
  nucEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable NBTE reporting (Polytechnics only)' })
  @IsOptional()
  @IsBoolean()
  nbteEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable NYSC data export' })
  @IsOptional()
  @IsBoolean()
  nyscEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Custom integrations configuration' })
  @IsOptional()
  @IsObject()
  customIntegrations?: Record<string, any>;
}

export class CreateTenantFeaturesDto {
  @ApiPropertyOptional({ description: 'Enable AI features' })
  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable mobile app' })
  @IsOptional()
  @IsBoolean()
  mobileAppEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable custom domain' })
  @IsOptional()
  @IsBoolean()
  customDomainEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable white-label features' })
  @IsOptional()
  @IsBoolean()
  whiteLabelEnabled?: boolean;
}

export class CreateTenantDto {
  @ApiProperty({ description: 'Unique slug for the tenant' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Full name of the institution' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Short name/abbreviation' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiProperty({ enum: ['university', 'polytechnic'], description: 'Type of institution' })
  @IsEnum(['university', 'polytechnic'])
  type: 'university' | 'polytechnic';

  @ApiProperty({ enum: ['federal', 'state', 'private'], description: 'Category of institution' })
  @IsEnum(['federal', 'state', 'private'])
  category: 'federal' | 'state' | 'private';

  @ApiPropertyOptional({ default: 'Nigeria' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ default: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Branding and color configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantBrandingDto)
  branding?: CreateTenantBrandingDto;

  @ApiPropertyOptional({ description: 'Academic configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantAcademicDto)
  academic?: CreateTenantAcademicDto;

  @ApiPropertyOptional({ description: 'Module configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantModulesDto)
  modules?: CreateTenantModulesDto;

  @ApiPropertyOptional({ description: 'Integration configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantIntegrationsDto)
  integrations?: CreateTenantIntegrationsDto;

  @ApiPropertyOptional({ description: 'Feature flags' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantFeaturesDto)
  features?: CreateTenantFeaturesDto;

  @ApiPropertyOptional({ description: 'Custom domain for white-label' })
  @IsOptional()
  @IsString()
  customDomain?: string;

  @ApiPropertyOptional({ description: 'Subscription plan' })
  @IsOptional()
  @IsObject()
  subscription?: {
    plan: string;
    maxUsers: number;
  };
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: 'Institution name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Short name' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'trial', 'inactive'])
  status?: 'active' | 'suspended' | 'trial' | 'inactive';

  @ApiPropertyOptional({ description: 'Branding and color configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantBrandingDto)
  branding?: CreateTenantBrandingDto;

  @ApiPropertyOptional({ description: 'Academic configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantAcademicDto)
  academic?: CreateTenantAcademicDto;

  @ApiPropertyOptional({ description: 'Module configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantModulesDto)
  modules?: CreateTenantModulesDto;

  @ApiPropertyOptional({ description: 'Integration configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantIntegrationsDto)
  integrations?: CreateTenantIntegrationsDto;

  @ApiPropertyOptional({ description: 'Feature flags' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTenantFeaturesDto)
  features?: CreateTenantFeaturesDto;

  @ApiPropertyOptional({ description: 'Custom domain' })
  @IsOptional()
  @IsString()
  customDomain?: string;
}

export class ApplyThemePresetDto {
  @ApiProperty({ 
    description: 'Theme preset ID',
    enum: [
      'traditional-blue', 'science-green', 'heritage-maroon', 'prestige-gold',
      'industrial-orange', 'technical-blue', 'engineering-red', 'modern-teal'
    ]
  })
  @IsString()
  presetId: string;
}

export class ThemePresetResponseDto {
  id: string;
  name: string;
  description: string;
  type: 'university' | 'polytechnic';
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    textSecondaryColor: string;
    borderColor: string;
    successColor: string;
    warningColor: string;
    errorColor: string;
    infoColor: string;
  };
  recommendedFor: string[];
}