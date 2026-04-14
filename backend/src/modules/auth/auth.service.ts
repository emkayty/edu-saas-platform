import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { LoginDto, RegisterDto, RefreshTokenDto, EnableMfaDto } from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const { email, password, firstName, lastName, tenantId, role = 'student' } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate tenant exists if provided
    let tenant: Tenant | null = null;
    if (tenantId) {
      tenant = await this.tenantRepository.findOne({ where: { id: tenantId, status: 'active' } });
      if (!tenant) {
        throw new BadRequestException('Invalid or inactive tenant');
      }
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role: role as UserRole,
      status: 'active',
      isEmailVerified: false,
      tenantId: tenant?.id,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    const { password: _, refreshToken: __, mfaSecret: ___, ...result } = user;

    return {
      user: result,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const { email, password, mfaCode } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaCode) {
        throw new BadRequestException('MFA code required');
      }
      // TODO: Validate MFA code using google-authenticator
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    const { password: _, refreshToken: __, mfaSecret: ___, ...result } = user;

    return {
      user: result,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;

    // Verify refresh token
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET || 'edusaas-refresh-secret',
    });

    // Find user
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);
    
    // Save new refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return tokens;
  }

  /**
   * Enable MFA for user
   */
  async enableMfa(userId: string, enableMfaDto: EnableMfaDto): Promise<{ secret: string; backupCodes: string[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate MFA secret
    const secret = crypto.randomBytes(20).toString('hex');
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    user.mfaSecret = secret;
    user.mfaBackupCodes = JSON.stringify(backupCodes);
    await this.userRepository.save(user);

    return {
      secret,
      backupCodes,
    };
  }

  /**
   * Disable MFA for user
   */
  async disableMfa(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.mfaEnabled = false;
    user.mfaSecret = null;
    user.mfaBackupCodes = null;
    await this.userRepository.save(user);
  }

  /**
   * Validate JWT token
   */
  async validateToken(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'edusaas-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user) return null;

    const { password, refreshToken, mfaSecret, ...result } = user;
    return result;
  }
}