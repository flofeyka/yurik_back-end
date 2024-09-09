import { Module } from '@nestjs/common';
import { AgreementController } from './agreement.controller';
import { AgreementService } from './agreement.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agreement } from "./entities/agreement.entity";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Agreement]), UserModule],
  controllers: [AgreementController],
  providers: [AgreementService]
})
export class AgreementModule {}
