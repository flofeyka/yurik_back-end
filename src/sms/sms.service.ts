import { HttpService } from '@nestjs/axios';
import { BadGatewayException, BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sms } from './sms.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SmsService {
    constructor(private readonly httpService: HttpService,
        @InjectRepository(Sms) private readonly smsRepository: Repository<Sms>,
    ) {}

    async sendSms(phoneNumber: string): Promise<boolean> {
        const smsFound = await this.smsRepository.findOneBy({ phoneNumber});
        const THREE_MINUTES = 1000 * 60 * 3;
        if(smsFound && smsFound.updatedAt.getTime() + THREE_MINUTES < Date.now()) {
            throw new BadRequestException("Смс код уже был отправлен. Следующий можно будет отправить через 3 минуты")
        }
        if (phoneNumber.length !== 11) {
            throw new BadRequestException("Неверный номер телефона");
        }

        const codeValue = this.getRandomCodeValue();

        const smsText = `Смс-код для Yurik: ${codeValue}. Действует 5 минут. Не сообщайте код никому! `;

        const response = await this.httpService.axiosRef.get(`https://gateway.api.sc/get/?user=79393954195&pwd=58%5E[DnSwwm&name_deliver=Title&sadr=SMS%20Info&dadr=${phoneNumber}&text=${smsText}`);

        if (response.status !== 200) {
            throw new BadGatewayException("Не удалось отправить смс");
        }

        await this.smsRepository.save({
            id: smsFound?.id,
            phoneNumber: phoneNumber,
            smsUniqueIds: [response.data],
            code: codeValue
        } as Sms);

        return true;
    }

    async checkSms(phoneNumber: string, code: number): Promise<boolean> {
        if(!phoneNumber || phoneNumber.length !== 11) {
            throw new BadRequestException("Неверный номер телефона");
        }

        const smsFound = await this.smsRepository.findOneBy({ phoneNumber });
        if(!smsFound) {
            throw new BadRequestException("Не удалось найти смс");
        }  
        if(smsFound.code !== Number(code)) {
            throw new UnauthorizedException("Неверный код");
        }

        const five_minutes = 1000 * 60 * 5
        
        if(smsFound.updatedAt.getTime() * five_minutes < Date.now()) {
            throw new UnauthorizedException("Смс код истек");
        }

        // if(smsFound.used) {
        //     throw new UnauthorizedException("Смс код уже был использован. Пожалуйста, отправьте новый.");
        // }

        await this.smsRepository.update(smsFound.id, {
            used: true
        });

        return true;
    }

    private getRandomCodeValue(min: number = 100000, max: number = 999999): Number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}