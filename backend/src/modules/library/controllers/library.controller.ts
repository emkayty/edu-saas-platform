import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LibraryService } from '../services/library.service';
import { CreateBookDto, UpdateBookDto, SearchBookQueryDto, CreateBorrowingDto, CreateReservationDto, UpdateHoursDto, BorrowingQueryDto } from '../dto/library.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('library')
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('books')
  @ApiOperation({ summary: 'Search books (OPAC)' })
  async searchBooks(@Query() query: SearchBookQueryDto, @Req() req: any) {
    return this.libraryService.searchBooks(query, req.user?.tenantId);
  }

  @Get('books/:id')
  @ApiOperation({ summary: 'Get book by ID' })
  async getBook(@Param('id') id: string) {
    return this.libraryService.getBookById(id);
  }

  @Post('books')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'librarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add new book' })
  async createBook(@Body() dto: CreateBookDto, @Req() req: any) {
    return this.libraryService.createBook(dto, req.user.tenantId);
  }

  @Patch('books/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'librarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update book' })
  async updateBook(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.libraryService.updateBook(id, dto);
  }

  @Post('borrow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Borrow a book' })
  async borrowBook(@Body() dto: CreateBorrowingDto, @Req() req: any) {
    return this.libraryService.borrowBook({ ...dto, userId: req.user.id }, req.user.tenantId);
  }

  @Post('return/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return a book' })
  async returnBook(@Param('id') id: string) {
    return this.libraryService.returnBook(id);
  }

  @Post('renew/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renew a book' })
  async renewBook(@Param('id') id: string, @Req() req: any) {
    return this.libraryService.renewBook(id, req.user.tenantId);
  }

  @Get('my-borrowings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my borrowings' })
  async getMyBorrowings(@Req() req: any) {
    return this.libraryService.getUserBorrowings(req.user.id, req.user.tenantId);
  }

  @Get('borrowings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'librarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all borrowings' })
  async getBorrowings(@Query() query: BorrowingQueryDto, @Req() req: any) {
    return this.libraryService.getUserBorrowings(query.userId || '', req.user.tenantId);
  }

  @Get('overdue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'librarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get overdue books' })
  async getOverdue(@Req() req: any) {
    return this.libraryService.getOverdueBooks(req.user.tenantId);
  }

  @Post('reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve a book' })
  async createReservation(@Body() dto: CreateReservationDto, @Req() req: any) {
    return this.libraryService.createReservation({ ...dto, userId: req.user.id }, req.user.tenantId);
  }

  @Delete('reservations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel reservation' })
  async cancelReservation(@Param('id') id: string) {
    return this.libraryService.cancelReservation(id);
  }

  @Post('requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a book (inter-library loan)' })
  async createRequest(@Body() body: { bookTitle: string; author?: string; isbn?: string; purpose?: string }, @Req() req: any) {
    return this.libraryService.createBookRequest({ ...body, userId: req.user.id }, req.user.tenantId);
  }

  @Get('hours')
  @ApiOperation({ summary: 'Get library hours' })
  async getHours(@Req() req: any) {
    return this.libraryService.getLibraryHours(req.user?.tenantId);
  }

  @Patch('hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'librarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update library hours' })
  async updateHours(@Body() dto: UpdateHoursDto[], @Req() req: any) {
    return this.libraryService.updateLibraryHours(dto, req.user.tenantId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'librarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get library statistics' })
  async getStats(@Req() req: any) {
    return this.libraryService.getLibraryStats(req.user.tenantId);
  }
}