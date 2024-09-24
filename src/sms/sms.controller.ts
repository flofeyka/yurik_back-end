import { Controller, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SmsService } from './sms.service';

@ApiTags('SMS API')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiOperation({ summary: 'Отправить СМС-код на номер телефона' })
  @ApiResponse({
    status: 200,
    example: true,
    description: 'Смс было успешно отправлено',
  })
  @Post('/send')
  async sendSms(@Query('phone') phoneNumber: string): Promise<boolean> {
    return this.smsService.sendSms(phoneNumber);
  }
}
