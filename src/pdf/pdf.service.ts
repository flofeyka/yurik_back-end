import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from "fs";
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Pdf } from './pdf.entity';

@Injectable()
export class PdfService {
    constructor(private readonly httpService: HttpService,
        @InjectRepository(Pdf) private readonly pdfRepository: Repository<Pdf>
    ) { }

    public async convertMarkdownToPdf(markdown: string, creator: User): Promise<Pdf> {
        try {
            const pdfResponse = await this.httpService.axiosRef.post('https://yurkitgbot.ru:8000/', {
                markdown,
            },
                {
                    responseType: 'stream',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    }
                },);

            const streamReadPromise = new Promise<Buffer>((resolve) => {
                const chunks = [];
                pdfResponse.data.on('data', chunk => {
                    chunks.push(Buffer.from(chunk));
                });
                pdfResponse.data.on('end', () => {
                    resolve(Buffer.concat(chunks));
                });
            });

            const pdfData = await streamReadPromise;
            const uuid = v4();
            fs.writeFileSync(`uploads/pdf/${uuid}.pdf`, pdfData);
            const pdfCreated: Pdf = await this.pdfRepository.save({ fileName: `${uuid}.pdf`, user: creator });
            return pdfCreated;
        } catch (e) {
            console.log(e);
            throw new BadRequestException("Не удалось сконвертировать файл");
        }
    }
}
