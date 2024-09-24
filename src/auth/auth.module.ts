import { forwardRef, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsModule } from 'src/sms/sms.module';
import { TelegramAccount } from 'src/user/entities/telegram-account.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { AppModule } from '../app.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthToken } from './entities/authToken.entity';

@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    SmsModule,
    forwardRef(() => AppModule),
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      signOptions: {
        expiresIn: '14d',
      },
    }),
    TypeOrmModule.forFeature([User, AuthToken, TelegramAccount]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
