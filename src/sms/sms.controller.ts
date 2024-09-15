import { Controller, Get, Query } from "@nestjs/common";
import { SmsService } from "./sms.service";

@Controller('sms')
export class SmsController {
    constructor(private readonly smsService: SmsService) {} 
    
    @Get('/send')
    async sendSms(@Query('phone') phoneNumber: string): Promise<boolean> {
        return this.smsService.sendSms(phoneNumber);
    }

    @Get('/check')
    async checkSms(@Query('phone') phoneNumber: string, @Query('code') code: number): Promise<boolean> {
        return this.smsService.checkSms(phoneNumber, code);
    }
}