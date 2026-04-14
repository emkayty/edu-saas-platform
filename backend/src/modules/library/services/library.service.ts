import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { LibraryBook, BookCopy, BorrowingRecord, BookReservation, BookRequest, LibraryHours, BookStatus, MaterialType } from './entities/library.entity';
import { 
  CreateBookDto, UpdateBookDto, 
  SearchBookQueryDto,
  CreateBorrowingDto, 
  CreateReservationDto,
  UpdateHoursDto
} from './dto/library.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryBook)
    private bookRepo: Repository<LibraryBook>,
    @InjectRepository(BookCopy)
    private copyRepo: Repository<BookCopy>,
    @InjectRepository(BorrowingRecord)
    private borrowingRepo: Repository<BorrowingRecord>,
    @InjectRepository(BookReservation)
    private reservationRepo: Repository<BookReservation>,
    @InjectRepository(BookRequest)
    private requestRepo: Repository<BookRequest>,
    @InjectRepository(LibraryHours)
    private hoursRepo: Repository<LibraryHours>,
  ) {}

  // ============== BOOKS ==============

  async createBook(dto: CreateBookDto, tenantId?: string): Promise<LibraryBook> {
    // Check for duplicate ISBN
    if (dto.isbn) {
      const existing = await this.bookRepo.findOne({ where: { isbn: dto.isbn } });
      if (existing) throw new ConflictException('Book with this ISBN already exists');
    }

    const book = this.bookRepo.create({
      ...dto,
      tenantId,
      availableCopies: dto.totalCopies || 1,
    });
    
    const saved = await this.bookRepo.save(book);
    
    // Create book copies if specified
    if (saved.totalCopies > 1) {
      for (let i = 0; i < saved.totalCopies; i++) {
        await this.copyRepo.save({
          bookId: saved.id,
          barcode: `BK${Date.now()}${i}`,
          tenantId,
        });
      }
    }
    
    return saved;
  }

  async searchBooks(query: SearchBookQueryDto, tenantId?: string): Promise<{ books: LibraryBook[]; total: number }> {
    const { search, materialType, subject, status, page = 1, limit = 20 } = query;
    
    const where: any = tenantId ? { tenantId } : {};
    
    if (materialType) where.materialType = materialType;
    if (subject) where.subject = ILike(`%${subject}%`);
    if (status) where.status = status;
    
    const [books, total] = await this.bookRepo.findAndCount({
      where,
      order: { title: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    // Apply text search filter
    let filteredBooks = books;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBooks = books.filter(book => 
        book.title?.toLowerCase().includes(searchLower) ||
        book.author?.toLowerCase().includes(searchLower) ||
        book.isbn?.includes(search) ||
        book.keywords?.some(k => k.toLowerCase().includes(searchLower))
      );
    }
    
    return { books: filteredBooks, total: search ? filteredBooks.length : total };
  }

  async getBookById(id: string): Promise<LibraryBook> {
    const book = await this.bookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async getBookByISBN(isbn: string): Promise<LibraryBook> {
    const book = await this.bookRepo.findOne({ where: { isbn } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async updateBook(id: string, dto: UpdateBookDto): Promise<LibraryBook> {
    const book = await this.getBookById(id);
    Object.assign(book, dto);
    return this.bookRepo.save(book);
  }

  async deleteBook(id: string): Promise<void> {
    const book = await this.getBookById(id);
    await this.bookRepo.remove(book);
  }

  // ============== BORROWING ==============

  async borrowBook(dto: CreateBorrowingDto, tenantId?: string): Promise<BorrowingRecord> {
    // Check book availability
    const book = await this.getBookById(dto.bookId);
    if (book.availableCopies < 1) throw new ConflictException('Book not available');
    
    // Check user's borrowing limit
    const userBorrowings = await this.borrowingRepo.count({
      where: { userId: dto.userId, status: 'borrowed' }
    });
    
    if (userBorrowings >= 5) throw new ConflictException('You have reached the maximum borrowing limit');
    
    // Get a book copy
    const copy = await this.copyRepo.findOne({
      where: { bookId: dto.bookId, status: BookStatus.AVAILABLE }
    });
    
    if (!copy) throw new ConflictException('No available copy');
    
    // Calculate due date (default 2 weeks)
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    
    // Update copy status
    copy.status = BookStatus.BORROWED;
    await this.copyRepo.save(copy);
    
    // Update book available copies
    book.availableCopies -= 1;
    await this.bookRepo.save(book);
    
    // Create borrowing record
    const borrowing = this.borrowingRepo.create({
      userId: dto.userId,
      bookCopyId: copy.id,
      borrowDate,
      dueDate,
      status: 'borrowed',
      tenantId,
    });
    
    return this.borrowingRepo.save(borrowing);
  }

  async returnBook(borrowingId: string, tenantId?: string): Promise<BorrowingRecord> {
    const borrowing = await this.borrowingRepo.findOne({ where: { id: borrowingId } });
    if (!borrowing) throw new NotFoundException('Borrowing record not found');
    
    if (borrowing.status === 'returned') throw new ConflictException('Book already returned');
    
    // Calculate fine if overdue
    const now = new Date();
    if (now > borrowing.dueDate) {
      const daysOverdue = Math.floor((now.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      borrowing.fineAmount = daysOverdue * 100; // ₦100 per day
      borrowing.status = 'overdue';
    } else {
      borrowing.status = 'returned';
    }
    
    borrowing.returnDate = now;
    await this.borrowingRepo.save(borrowing);
    
    // Update copy status
    const copy = await this.copyRepo.findOne({ where: { id: borrowing.bookCopyId } });
    if (copy) {
      copy.status = BookStatus.AVAILABLE;
      await this.copyRepo.save(copy);
    }
    
    // Update book available copies
    const book = await this.bookRepo.findOne({ where: { id: copy?.bookId } });
    if (book) {
      book.availableCopies += 1;
      await this.bookRepo.save(book);
    }
    
    return borrowing;
  }

  async renewBook(borrowingId: string, tenantId?: string): Promise<BorrowingRecord> {
    const borrowing = await this.borrowingRepo.findOne({ where: { id: borrowingId } });
    if (!borrowing) throw new NotFoundException('Borrowing record not found');
    
    if (borrowing.status === 'returned') throw new ConflictException('Book already returned');
    
    // Extend due date by 2 weeks
    const newDueDate = new Date(borrowing.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);
    
    borrowing.dueDate = newDueDate;
    borrowing.renewalCount = (borrowing.renewalCount || 0) + 1;
    
    return this.borrowingRepo.save(borrowing);
  }

  async getUserBorrowings(userId: string, tenantId?: string): Promise<BorrowingRecord[]> {
    return this.borrowingRepo.find({
      where: { userId, ...(tenantId ? { tenantId } : {}) },
      order: { borrowDate: 'DESC' },
    });
  }

  async getOverdueBooks(tenantId?: string): Promise<BorrowingRecord[]> {
    const where: any = { status: 'overdue' };
    if (tenantId) where.tenantId = tenantId;
    
    return this.borrowingRepo.find({
      where,
      relations: ['bookCopy'],
      order: { dueDate: 'ASC' },
    });
  }

  // ============== RESERVATIONS ==============

  async createReservation(dto: CreateReservationDto, tenantId?: string): Promise<BookReservation> {
    // Check if already reserved
    const existing = await this.reservationRepo.findOne({
      where: { userId: dto.userId, bookId: dto.bookId, status: 'pending' }
    });
    
    if (existing) throw new ConflictException('You already have a pending reservation for this book');
    
    const reservation = this.reservationRepo.create({
      ...dto,
      reservationDate: new Date(),
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'pending',
      tenantId,
    });
    
    return this.reservationRepo.save(reservation);
  }

  async cancelReservation(reservationId: string): Promise<BookReservation> {
    const reservation = await this.reservationRepo.findOne({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found');
    
    reservation.status = 'cancelled';
    return this.reservationRepo.save(reservation);
  }

  // ============== BOOK REQUESTS ==============

  async createBookRequest(dto: { userId: string; bookTitle: string; author?: string; isbn?: string; purpose?: string }, tenantId?: string): Promise<BookRequest> {
    const request = this.requestRepo.create({
      ...dto,
      requestDate: new Date(),
      status: 'pending',
      tenantId,
    });
    
    return this.requestRepo.save(request);
  }

  // ============== LIBRARY HOURS ==============

  async getLibraryHours(tenantId?: string): Promise<LibraryHours[]> {
    return this.hoursRepo.find({
      where: tenantId ? { tenantId } : {},
      order: { dayOfWeek: 'ASC' },
    });
  }

  async updateLibraryHours(dto: UpdateHoursDto[], tenantId?: string): Promise<LibraryHours[]> {
    const results: LibraryHours[] = [];
    
    for (const hours of dto) {
      const existing = await this.hoursRepo.findOne({ 
        where: { dayOfWeek: hours.dayOfWeek, ...(tenantId ? { tenantId } : {}) } 
      });
      
      if (existing) {
        Object.assign(existing, hours);
        results.push(await this.hoursRepo.save(existing));
      } else {
        results.push(await this.hoursRepo.save({ ...hours, tenantId }));
      }
    }
    
    return results;
  }

  // ============== STATISTICS ==============

  async getLibraryStats(tenantId?: string): Promise<any> {
    const where = tenantId ? { tenantId } : {};
    
    const totalBooks = await this.bookRepo.count({ where });
    const availableBooks = await this.bookRepo.count({ 
      where: { ...where, status: BookStatus.AVAILABLE } 
    });
    const totalBorrowed = await this.borrowingRepo.count({ 
      where: { ...where, status: 'borrowed' } 
    });
    const overdueCount = await this.borrowingRepo.count({ 
      where: { ...where, status: 'overdue' } 
    });
    
    return {
      totalBooks,
      availableBooks,
      totalBorrowed,
      overdueCount,
    };
  }
}