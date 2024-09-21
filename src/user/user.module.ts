import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { TelegramAccount } from "./entities/telegram-account.entity";
import { AppModule } from "src/app.module";
import { SmsModule } from "../sms/sms.module";
import { ImagesModule } from "../images/images.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TelegramAccount]),
    forwardRef(() => AppModule),
    forwardRef(() => SmsModule),
    forwardRef(() => ImagesModule)
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {
}
