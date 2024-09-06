import { Module } from '@nestjs/common';
import { AgreementController } from './agreement.controller';
import { AgreementService } from './agreement.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agreement } from "./entities/agreement.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Agreement])],
  controllers: [AgreementController],
  providers: [AgreementService]
})
export class AgreementModule {}
