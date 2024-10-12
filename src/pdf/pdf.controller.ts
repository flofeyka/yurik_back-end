import { Controller, Get, Param, Res } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { Response } from 'express';

@Controller('pdf')
export class PdfController {
    constructor(private readonly pdfService: PdfService) { }
    
    @Get(':fileName')
    public async getPdf(@Param('fileName') fileName: string, @Res() res: Response) {
        res.sendFile(fileName, { root: './uploads/pdf' });
    }
}
