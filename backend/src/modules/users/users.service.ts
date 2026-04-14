import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { User, UserRole, UserStatus } from './user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user (admin only)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, matricNumber, staffNumber } = createUserDto;

    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if matric number already exists
    if (matricNumber) {
      const existingMatric = await this.userRepository.findOne({ where: { matricNumber } });
      if (existingMatric) {
        throw new ConflictException('User with this matric number already exists');
      }
    }

    // Check if staff number already exists
    if (staffNumber) {
      const existingStaff = await this.userRepository.findOne({ where: { staffNumber } });
      if (existingStaff) {
        throw new ConflictException('User with this staff number already exists');
      }
    }

    // Map DTO to entity properties
    const userData: any = { ...createUserDto };
    if (userData.role && typeof userData.role === 'string') {
      userData.role = userData.role as any; // Cast to allow string
    }
    
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * Find all users with pagination and filters
   */
  async findAll(query: UserQueryDto): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, role, status, tenantId } = query;
    
    const where: FindOptionsWhere<User> = {};

    if (role) {
      where.role = role as UserRole;
    }

    if (status) {
      where.status = status as UserStatus;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Apply search filter if provided
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.matricNumber?.toLowerCase().includes(searchLower) ||
        user.staffNumber?.toLowerCase().includes(searchLower)
      );
    }

    return {
      users: filteredUsers,
      total: search ? filteredUsers.length : total,
      page,
      limit,
    };
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Delete user (soft delete)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    user.status = 'inactive';
    user.deactivatedAt = new Date();
    await this.userRepository.save(user);
  }

  /**
   * Get user count by tenant
   */
  async getUserCountByTenant(tenantId: string): Promise<number> {
    return this.userRepository.count({
      where: { tenantId },
    });
  }

  /**
   * Get users by role
   */
  async findByRole(role: UserRole, tenantId?: string): Promise<User[]> {
    const where: FindOptionsWhere<User> = { role };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.userRepository.find({
      where,
      relations: ['tenant'],
    });
  }

  /**
   * Get students by department and level
   */
  async getStudentsByDepartment(department: string, level: number, tenantId?: string): Promise<User[]> {
    const where: FindOptionsWhere<User> = {
      role: 'student' as UserRole,
      department,
      level,
    };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.userRepository.find({
      where,
      relations: ['tenant'],
    });
  }
}