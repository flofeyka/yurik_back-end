import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgreementModule } from './agreement/agreement.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GigachatModule } from './gigachat/gigachat.module';
import { ImagesModule } from './images/images.module';
import { PdfModule } from './pdf/pdf.module';
import { SmsModule } from './sms/sms.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
      // ssl: {
      //   rejectUnauthorized: true
      // }
    }),
    forwardRef(() => AuthModule),
    UserModule,
    GigachatModule,
    AgreementModule,
    ChatModule,
    SmsModule,
    HttpModule,
    ImagesModule,
    PdfModule,
  ],
  exports: [AppService],
  providers: [AppService],
})
export class AppModule {}
