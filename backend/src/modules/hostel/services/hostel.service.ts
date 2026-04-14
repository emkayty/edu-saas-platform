import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hostel, HostelRoom, HostelBed, HostelAllocation, HostelMaintenance, HostelComplaint, RoomStatus, BedStatus } from './entities/hostel.entity';
import { 
  CreateHostelDto, UpdateHostelDto,
  CreateRoomDto, UpdateRoomDto,
  AllocateStudentDto,
  CreateMaintenanceDto, UpdateMaintenanceDto,
  CreateComplaintDto
} from './dto/hostel.dto';

@Injectable()
export class HostelService {
  constructor(
    @InjectRepository(Hostel)
    private hostelRepo: Repository<Hostel>,
    @InjectRepository(HostelRoom)
    private roomRepo: Repository<HostelRoom>,
    @InjectRepository(HostelBed)
    private bedRepo: Repository<HostelBed>,
    @InjectRepository(HostelAllocation)
    private allocationRepo: Repository<HostelAllocation>,
    @InjectRepository(HostelMaintenance)
    private maintenanceRepo: Repository<HostelMaintenance>,
    @InjectRepository(HostelComplaint)
    private complaintRepo: Repository<HostelComplaint>,
  ) {}

  // ============== HOSTELS ==============

  async createHostel(dto: CreateHostelDto, tenantId?: string): Promise<Hostel> {
    const hostel = this.hostelRepo.create({ ...dto, tenantId });
    return this.hostelRepo.save(hostel);
  }

  async getHostels(tenantId?: string, gender?: string): Promise<Hostel[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (gender) where.gender = gender;
    
    return this.hostelRepo.find({ 
      where,
      order: { name: 'ASC' }
    });
  }

  async getHostelById(id: string): Promise<Hostel> {
    const hostel = await this.hostelRepo.findOne({ where: { id } });
    if (!hostel) throw new NotFoundException('Hostel not found');
    return hostel;
  }

  async updateHostel(id: string, dto: UpdateHostelDto): Promise<Hostel> {
    const hostel = await this.getHostelById(id);
    Object.assign(hostel, dto);
    return this.hostelRepo.save(hostel);
  }

  // ============== ROOMS ==============

  async createRoom(dto: CreateRoomDto, tenantId?: string): Promise<HostelRoom> {
    const hostel = await this.getHostelById(dto.hostelId);
    
    const room = this.roomRepo.create({ ...dto, tenantId });
    const saved = await this.roomRepo.save(room);
    
    // Create beds for the room
    for (let i = 1; i <= saved.capacity; i++) {
      await this.bedRepo.save({
        roomId: saved.id,
        bedNumber: `${String.fromCharCode(64 + i)}`, // A, B, C...
        status: BedStatus.AVAILABLE,
        tenantId,
      });
    }
    
    // Update hostel counts
    hostel.totalRooms += 1;
    hostel.totalBeds += saved.capacity;
    hostel.availableBeds += saved.capacity;
    await this.hostelRepo.save(hostel);
    
    return saved;
  }

  async getRooms(hostelId?: string, tenantId?: string): Promise<HostelRoom[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (hostelId) where.hostelId = hostelId;
    
    return this.roomRepo.find({ where, order: { roomNumber: 'ASC' } });
  }

  async getAvailableRooms(tenantId?: string, gender?: string): Promise<HostelRoom[]> {
    const hostels = await this.getHostels(tenantId, gender);
    const hostelIds = hostels.map(h => h.id);
    
    return this.roomRepo
      .createQueryBuilder('room')
      .where('room.status = :status', { status: RoomStatus.AVAILABLE })
      .andWhere('room.currentOccupancy < room.capacity')
      .andWhere(room => room.hostelId.in(hostelIds))
      .orderBy('room.pricePerBed', 'ASC')
      .getMany();
  }

  // ============== ALLOCATIONS ==============

  async allocateStudent(dto: AllocateStudentDto, tenantId?: string): Promise<HostelAllocation> {
    // Find available bed
    const room = await this.roomRepo.findOne({
      where: { id: dto.roomId, status: RoomStatus.AVAILABLE },
    });
    
    if (!room || room.currentOccupancy >= room.capacity) {
      throw new ConflictException('Room not available or at capacity');
    }
    
    const bed = await this.bedRepo.findOne({
      where: { roomId: dto.roomId, status: BedStatus.AVAILABLE },
    });
    
    if (!bed) throw new ConflictException('No available bed');
    
    // Check for existing allocation
    const existing = await this.allocationRepo.findOne({
      where: { studentId: dto.studentId, status: 'active' }
    });
    
    if (existing) throw new ConflictException('Student already has active hostel allocation');
    
    // Create allocation
    const allocation = this.allocationRepo.create({
      studentId: dto.studentId,
      hostelId: dto.hostelId,
      roomId: dto.roomId,
      bedId: bed.id,
      sessionId: dto.sessionId,
      allocationDate: new Date(),
      status: 'active',
      tenantId,
    });
    
    const saved = await this.allocationRepo.save(allocation);
    
    // Update bed and room status
    bed.status = BedStatus.OCCUPIED;
    bed.studentId = dto.studentId;
    await this.bedRepo.save(bed);
    
    room.currentOccupancy += 1;
    if (room.currentOccupancy >= room.capacity) {
      room.status = RoomStatus.OCCUPIED;
    }
    await this.roomRepo.save(room);
    
    // Update hostel counts
    const hostel = await this.getHostelById(dto.hostelId);
    hostel.availableBeds -= 1;
    await this.hostelRepo.save(hostel);
    
    return saved;
  }

  async checkIn(allocationId: string): Promise<HostelAllocation> {
    const allocation = await this.allocationRepo.findOne({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundException('Allocation not found');
    
    allocation.checkInDate = new Date();
    return this.allocationRepo.save(allocation);
  }

  async checkOut(allocationId: string, reason?: string): Promise<HostelAllocation> {
    const allocation = await this.allocationRepo.findOne({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundException('Allocation not found');
    
    allocation.checkOutDate = new Date();
    allocation.status = 'checked_out';
    allocation.exitReason = reason;
    await this.allocationRepo.save(allocation);
    
    // Free the bed
    const bed = await this.bedRepo.findOne({ where: { id: allocation.bedId } });
    if (bed) {
      bed.status = BedStatus.AVAILABLE;
      bed.studentId = undefined;
      await this.bedRepo.save(bed);
    }
    
    // Update room
    const room = await this.roomRepo.findOne({ where: { id: allocation.roomId } });
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      room.status = RoomStatus.AVAILABLE;
      await this.roomRepo.save(room);
    }
    
    // Update hostel
    const hostel = await this.getHostelById(allocation.hostelId);
    hostel.availableBeds += 1;
    await this.hostelRepo.save(hostel);
    
    return allocation;
  }

  async getStudentAllocation(studentId: string, tenantId?: string): Promise<HostelAllocation> {
    const allocation = await this.allocationRepo.findOne({
      where: { studentId, status: 'active', ...(tenantId ? { tenantId } : {}) },
      relations: ['hostel', 'room'],
    });
    
    if (!allocation) throw new NotFoundException('No active allocation found');
    
    return allocation;
  }

  // ============== MAINTENANCE ==============

  async createMaintenance(dto: CreateMaintenanceDto, tenantId?: string): Promise<HostelMaintenance> {
    const maintenance = this.maintenanceRepo.create({ ...dto, tenantId });
    return this.maintenanceRepo.save(maintenance);
  }

  async getMaintenanceRequests(roomId?: string, tenantId?: string): Promise<HostelMaintenance[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (roomId) where.roomId = roomId;
    
    return this.maintenanceRepo.find({ 
      where, 
      order: { createdAt: 'DESC' } 
    });
  }

  async updateMaintenance(id: string, dto: UpdateMaintenanceDto): Promise<HostelMaintenance> {
    const maintenance = await this.maintenanceRepo.findOne({ where: { id } });
    if (!maintenance) throw new NotFoundException('Maintenance request not found');
    
    Object.assign(maintenance, dto);
    
    if (dto.status === 'completed') {
      maintenance.resolvedDate = new Date();
    }
    
    return this.maintenanceRepo.save(maintenance);
  }

  // ============== COMPLAINTS ==============

  async createComplaint(dto: CreateComplaintDto, tenantId?: string): Promise<HostelComplaint> {
    const complaint = this.complaintRepo.create({ ...dto, tenantId });
    return this.complaintRepo.save(complaint);
  }

  async getComplaints(studentId?: string, tenantId?: string): Promise<HostelComplaint[]> {
    const where: any = tenantId ? { tenantId } : {};
    if (studentId) where.studentId = studentId;
    
    return this.complaintRepo.find({ 
      where, 
      order: { createdAt: 'DESC' } 
    });
  }

  async resolveComplaint(id: string, resolution: string): Promise<HostelComplaint> {
    const complaint = await this.complaintRepo.findOne({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    
    complaint.status = 'resolved';
    complaint.resolution = resolution;
    complaint.resolvedAt = new Date();
    
    return this.complaintRepo.save(complaint);
  }

  // ============== STATISTICS ==============

  async getHostelStats(tenantId?: string): Promise<any> {
    const where = tenantId ? { tenantId } : {};
    
    const totalHostels = await this.hostelRepo.count({ where });
    const totalBeds = await this.hostelRepo
      .createQueryBuilder('hostel')
      .select('SUM(hostel.totalBeds)', 'total')
      .where(where)
      .getRawOne();
    
    const occupiedBeds = await this.allocationRepo.count({ 
      where: { ...where, status: 'active' }
    });
    
    const pendingComplaints = await this.complaintRepo.count({ 
      where: { ...where, status: 'pending' }
    });
    
    const pendingMaintenance = await this.maintenanceRepo.count({ 
      where: { ...where, status: 'pending' }
    });
    
    return {
      totalHostels,
      totalBeds: totalBeds?.total || 0,
      occupiedBeds,
      availableBeds: (totalBeds?.total || 0) - occupiedBeds,
      occupancyRate: totalBeds?.total ? ((occupiedBeds / totalBeds.total) * 100).toFixed(1) + '%' : '0%',
      pendingComplaints,
      pendingMaintenance,
    };
  }
}