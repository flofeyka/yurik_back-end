import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sms } from './sms.entity';
import { Repository } from 'typeorm';
import { AppService } from 'src/app.service';

@Injectable()
export class SmsService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Sms) private readonly smsRepository: Repository<Sms>,
    private readonly appService: AppService,
  ) {}

  async sendSms(phoneNumber: string): Promise<boolean> {
    const smsFound: Sms = await this.smsRepository.findOneBy({ phoneNumber });
    // const ONE_MINUTE: number = 1000 * 60;
    // if (smsFound && smsFound.updatedAt.getTime() + ONE_MINUTE < Date.now()) {
    //   throw new BadRequestException(
    //     'Смс код уже был отправлен. Следующий можно будет отправить через 1 минуту',
    //   );
    // }
    if (!phoneNumber || phoneNumber.length !== 11 || phoneNumber.split("")[0] !== '7') {
      throw new BadRequestException('Неверный номер телефона');
    }

    const codeValue: Number = this.appService.getRandomCodeValue();

    const smsText: string = `Смс-код для Yurik: ${codeValue}. Действует 5 минут. Не сообщайте код никому! `;

    const response = await this.httpService.axiosRef.get(
      `https://gateway.api.sc/get/?user=${process.env.SMS_LOGIN}&pwd=${process.env.SMS_PASSWORD}&name_deliver=Yurik&sadr=LinkMind&dadr=${phoneNumber}&text=${smsText}`,
    );
    console.log(response);

    if (response.status !== 200) {
      throw new BadGatewayException('Не удалось отправить смс');
    }

    await this.smsRepository.save({
      id: smsFound?.id,
      phoneNumber: phoneNumber,
      smsUniqueIds: [response.data],
      code: codeValue,
    } as Sms);

    return true;
  }

  async checkSms(phoneNumber: string, code: number): Promise<boolean> {
    if (!phoneNumber || phoneNumber.length !== 11) {
      throw new BadRequestException('Неверный номер телефона');
    }

    const smsFound: Sms = await this.smsRepository.findOneBy({ phoneNumber });
    if (!smsFound) {
      throw new BadRequestException('Не удалось найти смс');
    }
    if (smsFound.code !== Number(code)) {
      throw new UnauthorizedException('Неверный код');
    }

    const five_minutes: number = 1000 * 60 * 5;

    if (smsFound.updatedAt.getTime() + five_minutes > Date.now()) {
      throw new UnauthorizedException('Смс код истек');
    }

    if(smsFound.used) {
        throw new UnauthorizedException("Смс код уже был использован. Пожалуйста, отправьте новый.");
    }

    await this.smsRepository.update(smsFound.id, {
      used: true,
    });

    return true;
  }
}
