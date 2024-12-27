import { Module } from "@nestjs/common";
import { ReferralService } from "./referral.service";
import { ReferralController } from "./referral.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Referral } from "./referral.entity";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Referral]), UserModule],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService]
})
export class ReferralModule {}