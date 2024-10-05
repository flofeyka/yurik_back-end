import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementModule } from './agreement/agreement.module';
import { Agreement } from './agreement/entities/agreement.entity';
import { Lawyer } from './agreement/lawyer/lawyer.entity';
import { AgreementMember } from './agreement/members/member.entity';
import { AgreementStep } from './agreement/step/entities/step.entity';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthToken } from './auth/entities/authToken.entity';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/entities/chat.entity';
import { ChatMessage } from './chat/entities/chat.message.entity';
import { GigaChatDialog } from './gigachat/entities/dialog.entity';
import { GigaChatMessage } from './gigachat/entities/message.entity';
import { GigachatModule } from './gigachat/gigachat.module';
import { Image } from './images/image.entity';
import { ImagesModule } from './images/images.module';
import { Sms } from './sms/sms.entity';
import { SmsModule } from './sms/sms.module';
import { TelegramAccount } from './user/entities/telegram-account.entity';
import { User } from './user/entities/user.entity';
import { PersonalData } from './user/entities/user.personal_data';
import { UserModule } from './user/user.module';
import { AgreementImage } from './agreement/entities/agreement-image.entity';
import { StepImage } from './agreement/step/entities/step-image.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ssl: true,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      entities: [
        User,
        AuthToken,
        Agreement,
        Chat,
        ChatMessage,
        AgreementMember,
        AgreementStep,
        Lawyer,
        Sms,
        TelegramAccount,
        GigaChatDialog,
        GigaChatMessage,
        Image,
        PersonalData,
        AgreementImage,
        StepImage,
      ],
      synchronize: true,
      autoLoadEntities: true,
    }),
    forwardRef(() => AuthModule),
    UserModule,
    GigachatModule,
    AgreementModule,
    ChatModule,
    SmsModule,
    HttpModule,
    ImagesModule,
  ],
  exports: [AppService],
  providers: [AppService],
})
export class AppModule { }
