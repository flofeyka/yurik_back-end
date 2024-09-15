import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sms } from './sms.entity';
import { SmsController } from './sms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sms]),HttpModule],
  providers: [SmsService],
  exports: [SmsService],
  controllers: [SmsController]
})
export class SmsModule {}
