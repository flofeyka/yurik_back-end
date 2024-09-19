import { forwardRef, Module } from '@nestjs/common';
import { AgreementController } from './agreement.controller';
import { AgreementService } from './agreement.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agreement } from "./entities/agreement.entity";
import { UserModule } from "../user/user.module";
import { User } from "../user/user.entity";
import { AgreementMember } from './entities/agreement.member.entity';
import { AgreementStep } from './entities/agreement.step.entity';
import { SmsModule } from 'src/sms/sms.module';
import { Lawyer } from './entities/agreement.lawyer.entity';
import { HttpModule } from '@nestjs/axios';
import { AppModule } from 'src/app.module';

@Module({
  imports: [TypeOrmModule.forFeature([Agreement, User, AgreementMember, AgreementStep, Lawyer]), UserModule, SmsModule, HttpModule, forwardRef(() => AppModule)],
  controllers: [AgreementController],
  providers: [AgreementService]
})
export class AgreementModule {}
