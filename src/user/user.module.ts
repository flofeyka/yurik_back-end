import { forwardRef, Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { TelegramAccount } from './entities/telegram-account.entity';
import { AppService } from 'src/app.service';
import { AppModule } from 'src/app.module';
import { SmsModule } from "../sms/sms.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, TelegramAccount]), forwardRef(() => AppModule), forwardRef(() => SmsModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
