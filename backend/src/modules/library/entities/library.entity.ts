import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/tenant.entity';

// Book Status
export enum BookStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
  RESERVED = 'reserved',
  LOST = 'lost',
  DAMAGED = 'damaged',
  UNDER_REPAIR = 'under_repair',
}

// Material Type
export enum MaterialType {
  BOOK = 'book',
  JOURNAL = 'journal',
  THESIS = 'thesis',
  CD = 'cd',
  DVD = 'dvd',
  NEWSPAPER = 'newspaper',
  MAGAZINE = 'magazine',
  E_BOOK = 'e_book',
}

// Book Entity
@Entity('library_books')
export class LibraryBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ unique: true })
  isbn: string;

  @Column({ nullable: true })
  issn: string;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'jsonb', default: [] })
  authors: string[];

  @Column({ nullable: true })
  publisher: string;

  @Column({ nullable: true })
  publishYear: number;

  @Column({ nullable: true })
  edition: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: MaterialType, default: MaterialType.BOOK })
  materialType: MaterialType;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.AVAILABLE })
  status: BookStatus;

  // Classification
  @Column({ nullable: true })
  deweyDecimal: string;

  @Column({ nullable: true })
  libraryOfCongress: string;

  @Column({ nullable: true })
  subject: string;

  // Physical details
  @Column({ nullable: true })
  pages: number;

  @Column({ nullable: true })
  binding: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  currency: string;

  // Copy management
  @Column({ default: 1 })
  totalCopies: number;

  @Column({ default: 1 })
  availableCopies: number;

  // Location
  @Column({ nullable: true })
  shelfLocation: string;

  @Column({ nullable: true })
  section: string; // Reference, General, Periodicals

  // Digital access
  @Column({ nullable: true })
  eResourceUrl: string;

  @Column({ default: false })
  isEResource: boolean;

  // Cover image
  @Column({ nullable: true })
  coverImage: string;

  // For polytechnics - technical books
  @Column({ default: false })
  isTechnical: boolean;

  // Keywords for search
  @Column({ type: 'jsonb', default: [] })
  keywords: string[];

  // Tenant ID
  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Book Copy (for multiple copies)
@Entity('library_copies')
export class BookCopy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookId: string;

  @Column()
  barcode: string;

  @Column({ nullable: true })
  accessionNumber: string;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.AVAILABLE })
  status: BookStatus;

  @Column({ nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  vendor: string;

  @Column({ default: false })
  isReferenceOnly: boolean;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Borrowing Record
@Entity('library_borrowings')
export class BorrowingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  bookCopyId: string;

  @Column()
  borrowDate: Date;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  returnDate: Date;

  @Column({ default: 'borrowed' })
  status: 'borrowed' | 'returned' | 'overdue' | 'lost';

  @Column({ default: 0 })
  fineAmount: number;

  @Column({ nullable: true })
  finePaid: boolean;

  @Column({ nullable: true })
  renewalCount: number;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Reservation
@Entity('library_reservations')
export class BookReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  bookId: string;

  @Column()
  reservationDate: Date;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'fulfilled' | 'cancelled' | 'expired';

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Book Request (Inter-library loan)
@Entity('library_requests')
export class BookRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  bookTitle: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  isbn: string;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';

  @Column({ nullable: true })
  requestDate: Date;

  @Column({ nullable: true })
  fulfillDate: Date;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Library Hours
@Entity('library_hours')
export class LibraryHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dayOfWeek: number; // 0-6, Sunday-Saturday

  @Column()
  openingTime: string;

  @Column()
  closingTime: string;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;
}