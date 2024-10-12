import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdf } from './pdf.entity';

@Module({
  providers: [PdfService],
  controllers: [PdfController],
  imports: [TypeOrmModule.forFeature([Pdf]), HttpModule],
  exports: [PdfService]
})
export class PdfModule {}
