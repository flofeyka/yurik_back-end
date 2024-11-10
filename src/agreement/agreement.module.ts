import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { ChatModule } from 'src/chat/chat.module';
import { SmsModule } from 'src/sms/sms.module';
import { PersonalData } from 'src/user/entities/user.personal_data';
import { ImagesModule } from '../images/images.module';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AgreementController } from './agreement.controller';
import { AgreementService } from './agreement.service';
import { AgreementImage } from './entities/agreement-image.entity';
import { Agreement } from './entities/agreement.entity';
import { LawyerController } from './lawyer/lawyer.controller';
import { Lawyer } from './lawyer/lawyer.entity';
import { LawyerService } from './lawyer/lawyer.service';
import { MemberController } from './members/member.controller';
import { AgreementMember } from './members/member.entity';
import { MemberService } from './members/member.service';
import { StepImage } from './step/entities/step-image.entity';
import { AgreementStep } from './step/entities/step.entity';
import { StepController } from './step/step.controller';
import { StepService } from './step/step.service';
import { GigachatModule } from 'src/gigachat/gigachat.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { AgreementPatternController } from "./pattern/pattern.controller";
import { PatternService } from "./pattern/pattern.service";

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
    SmsModule,
    HttpModule,
    GigachatModule,
    forwardRef(() => ImagesModule),
    forwardRef(() => UserModule),
    forwardRef(() => ChatModule),
    forwardRef(() => AppModule),
    PdfModule
  ],
  controllers: [AgreementController, StepController, MemberController, LawyerController, AgreementPatternController],
  providers: [AgreementService, MemberService, StepService, LawyerService, PatternService],
  exports: [MemberService]
})
export class AgreementModule {}
