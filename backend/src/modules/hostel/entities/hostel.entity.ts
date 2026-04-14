import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

// Room Status
export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

// Bed Status
export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

// Hostel
@Entity('hostels')
export class Hostel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  gender: string; // 'male', 'female', 'mixed'

  @Column({ default: 0 })
  totalRooms: number;

  @Column({ default: 0 })
  totalBeds: number;

  @Column({ default: 0 })
  availableBeds: number;

  // Contact
  @Column({ nullable: true })
  wardenName: string;

  @Column({ nullable: true })
  wardenPhone: string;

  @Column({ nullable: true })
  wardenEmail: string;

  // Facilities
  @Column({ type: 'jsonb', default: [] })
  facilities: string[]; // ['wifi', 'laundry', 'generator', 'water', 'security']

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Room
@Entity('hostel_rooms')
export class HostelRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hostelId: string;

  @Column()
  roomNumber: string;

  @Column({ nullable: true })
  floor: number;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.AVAILABLE })
  status: RoomStatus;

  @Column({ default: 2 })
  capacity: number;

  @Column({ default: 0 })
  currentOccupancy: number;

  @Column({ type: 'jsonb', default: [] })
  facilities: string[]; // ['ac', 'balcony', 'attached_bath', 'hot_water']

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerBed: number;

  @Column({ nullable: true })
  roomType: string; // 'single', 'double', 'triple', 'dormitory'

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Bed
@Entity('hostel_beds')
export class HostelBed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @Column()
  bedNumber: string; // e.g., "A1", "A2"

  @Column({ type: 'enum', enum: BedStatus, default: BedStatus.AVAILABLE })
  status: BedStatus;

  @Column({ nullable: true })
  studentId: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Hostel Allocation
@Entity('hostel_allocations')
export class HostelAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  hostelId: string;

  @Column()
  roomId: string;

  @Column()
  bedId: string;

  @Column()
  sessionId: string;

  @Column()
  allocationDate: Date;

  @Column({ nullable: true })
  checkInDate: Date;

  @Column({ nullable: true })
  checkOutDate: Date;

  @Column({ default: 'active' })
  status: 'active' | 'checked_out' | 'transferred' | 'evicted';

  @Column({ nullable: true })
  exitReason: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Maintenance Request
@Entity('hostel_maintenance')
export class HostelMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @Column()
  reportedBy: string; // student or staff

  @Column()
  category: string; // 'electrical', 'plumbing', 'furniture', 'cleaning', 'other'

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';

  @Column({ nullable: true })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  resolvedDate: Date;

  @Column({ nullable: true })
  cost: number;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Complaint
@Entity('hostel_complaints')
export class HostelComplaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  hostelId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolution: string;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}