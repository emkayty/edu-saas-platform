import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './controllers/library.controller';
import { LibraryService } from './services/library.service';
import { LibraryBook, BookCopy, BorrowingRecord, BookReservation, BookRequest, LibraryHours } from './entities/library.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LibraryBook, BookCopy, BorrowingRecord, BookReservation, BookRequest, LibraryHours
    ])
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}