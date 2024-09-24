import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { SmsController } from './sms.controller';
import { Sms } from './sms.entity';
import { SmsService } from './sms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sms]),
    HttpModule,
    forwardRef(() => AppModule),
  ],
  providers: [SmsService],
  exports: [SmsService],
  controllers: [SmsController],
})
export class SmsModule {}
