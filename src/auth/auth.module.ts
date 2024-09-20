import { forwardRef, Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "src/user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { AuthToken } from "./entities/authToken.entity";
import { UserModule } from "src/user/user.module";
import { SmsModule } from "src/sms/sms.module";
import { TelegramAccount } from "src/user/entities/telegram-account.entity";
import { AppModule } from "../app.module";

@Global()
@Module({
  imports: [
    UserModule,
    SmsModule,
    forwardRef(() => AppModule),
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      signOptions: {
        expiresIn: "14d"
      }
    }), TypeOrmModule.forFeature([User, AuthToken, TelegramAccount])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService]
})
export class AuthModule {
}
