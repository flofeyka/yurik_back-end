import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { SmsModule } from 'src/sms/sms.module';
import { ImagesModule } from '../images/images.module';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AgreementController } from './agreement.controller';
import { AgreementService } from './agreement.service';
import { Agreement } from './entities/agreement.entity';
import { Lawyer } from './entities/agreement.lawyer.entity';
import { AgreementMember } from './entities/agreement.member.entity';
import { AgreementStep } from './entities/agreement.step.entity';
import { AgreementImage } from './entities/agreement-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agreement,
      User,
      AgreementMember,
      AgreementStep,
      Lawyer,
      AgreementImage
    ]),
    UserModule,
    SmsModule,
    HttpModule,
    ImagesModule,
    MulterModule.register({
      dest: './uploads/agreements',
    }),
    forwardRef(() => AppModule),
  ],
  controllers: [AgreementController],
  providers: [AgreementService],
})
export class AgreementModule {}
