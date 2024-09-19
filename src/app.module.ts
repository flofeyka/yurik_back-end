import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { GigachatModule } from './gigachat/gigachat.module';
import { AuthToken } from './auth/entities/authToken.entity';
import { AgreementModule } from './agreement/agreement.module';
import { Agreement } from "./agreement/entities/agreement.entity";
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/entities/chat.entity';
import { Message } from './chat/entities/chat.message.entity';
import { AgreementMember } from './agreement/entities/agreement.member.entity';
import { AgreementStep } from './agreement/entities/agreement.step.entity';
import { SmsModule } from './sms/sms.module';
import { Sms } from './sms/sms.entity';
import { Lawyer } from './agreement/entities/agreement.lawyer.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      ssl: true,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      entities: [User, AuthToken, Agreement, Chat, Message, AgreementMember, AgreementStep, Lawyer, Sms],
      synchronize: true,
      autoLoadEntities: true
    }),
    AuthModule,
    UserModule,
    GigachatModule,
    AgreementModule,
    ChatModule,
    SmsModule
    ],
})
export class AppModule { }
