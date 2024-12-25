import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async sendNotification(
    message: string,
    telegramID: number,
  ): Promise<boolean> {
    try {
      if (telegramID) {
        const response: AxiosResponse = await this.httpService.axiosRef.post(
          'https://bot.yurkitgbot.ru/send/message',
          {
            user_id: telegramID,
            message_text: message,
          },
        );
        return response.data;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async sendDealNotification(
    user_id: number,
    initiator_id: number,
    user_name: string,
    initiator_name: string,
    contract_id: number,
  ): Promise<boolean> {
    try {
      const response: AxiosResponse = await this.httpService.axiosRef.post(
        'https://bot.yurkitgbot.ru/send/contract',
        {
          user_id,
          initiator_id,
          user_name,
          initiator_name,
          contract_id,
          pdf_link: '',
        },
      );

      if (response.status === 200) {
        return true;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  getRandomCodeValue(min: number = 100000, max: number = 999999): Number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  decryptText(text: string): string {
    const { ENCRYPT_TELEGRAM_ID_KEY, ENCRYPT_TELEGRAM_ID_IV } = process.env;
    const key: Buffer = Buffer.from(ENCRYPT_TELEGRAM_ID_KEY, 'hex');
    const iv: Buffer = Buffer.from(ENCRYPT_TELEGRAM_ID_IV, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(text, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  encryptText(text: string): string {
    const { ENCRYPT_TELEGRAM_ID_KEY, ENCRYPT_TELEGRAM_ID_IV } = process.env;
    const key = Buffer.from(ENCRYPT_TELEGRAM_ID_KEY, 'hex');
    const iv = Buffer.from(ENCRYPT_TELEGRAM_ID_IV, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }
}
