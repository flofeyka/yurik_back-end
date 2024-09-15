import { Module } from '@nestjs/common';
import { AgreementController } from './agreement.controller';
import { AgreementService } from './agreement.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agreement } from "./entities/agreement.entity";
import { UserModule } from "../user/user.module";
import { User } from "../user/user.entity";
import { AgreementMember } from './entities/agreement.member.entity';
import { AgreementStep } from './entities/agreement.step.entity';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Agreement, User, AgreementMember, AgreementStep]), UserModule, SmsModule],
  controllers: [AgreementController],
  providers: [AgreementService]
})
export class AgreementModule {}
