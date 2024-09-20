import { forwardRef, Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sms } from './sms.entity';
import { SmsController } from './sms.controller';
import { AppModule } from 'src/app.module';
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Sms]),HttpModule, forwardRef(() => AppModule)],
  providers: [SmsService],
  exports: [SmsService],
  controllers: [SmsController]
})
export class SmsModule {}
