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
import { Lawyer } from './lawyer/lawyer.entity';
import { AgreementMember } from './members/member.entity';
import { AgreementStep } from './step/entities/step.entity';
import { AgreementImage } from './entities/agreement-image.entity';
import { PersonalData } from 'src/user/entities/user.personal_data';
import { StepController } from './step/step.controller';
import { MemberController } from './members/member.controller';
import { MemberService } from './members/member.service';
import { StepService } from './step/step.service';
import { LawyerController } from './lawyer/lawyer.controller';
import { LawyerService } from './lawyer/lawyer.service';
import { StepImage } from './step/entities/step-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agreement,
      User,
      AgreementMember,
      AgreementStep,
      Lawyer,
      AgreementImage,
      PersonalData,
      StepImage
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
  controllers: [AgreementController, StepController, MemberController, LawyerController],
  providers: [AgreementService, MemberService, StepService, LawyerService],
})
export class AgreementModule {}
