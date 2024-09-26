import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SmsGuard } from 'src/sms/sms.guard';
import { RequestType } from '../../types/types';
import { AuthGuard } from '../auth/auth.guard';
import { AgreementService } from './agreement.service';
import { AgreementDto } from './dtos/agreement-dto';
import { AgreementsListDto } from './dtos/agreements-list-dto';
import { CreateAgreementDto } from './dtos/create-agreement-dto';
import { EditAgreementDto } from './dtos/edit-agreement-dto';
import { ImagesDto } from './dtos/images-dto';
import { InviteUserDto } from './dtos/invite-user-dto';
import { Agreement } from './entities/agreement.entity';
import { AgreementGuard } from './guards/agreement.guard';
import { LawyerGuard } from './lawyer/lawyer.guard';
import { Step, StepDto } from './dtos/edit-steps-dto';

@ApiTags('Agreement API')
@Controller('agreement')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) { }

  @ApiOperation({ summary: 'Получение списка пользовательских договоров', description: 'Параметр type может принимать следующие значения: В работе, Отклонён, У юриста, В поиске юриста, В процессе подтверждения, Черновик, Завершён' })
  @Get('/')
  @UseGuards(AuthGuard)
  async getAgreements(
    @Req() request: RequestType,
    @Query('type') type: | 'В работе'
      | 'Отклонён'
      | 'У юриста'
      | 'В поиске юриста'
      | 'В процессе подтверждения'
      | 'Черновик'
      | 'Завершён'
  ): Promise<AgreementsListDto[]> {
    return this.agreementService.getAgreements(request.user.id, type);
  }

  @ApiOperation({ summary: 'Получение договора по id' })
  @Get('/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async getAgreement(
    @Req() request: RequestType,
  ): Promise<AgreementDto> {
    return this.agreementService.getAgreement(request.agreement, request.user.id);
  }

  @ApiOperation({ summary: 'Создание договора' })
  @Post('/create')
  @UseGuards(AuthGuard)
  async createAgreement(
    @Body() agreementDto: CreateAgreementDto,
    @Req() request: RequestType,
  ) {
    return this.agreementService.createAgreement(request.user.id, agreementDto);
  }

  @ApiResponse({
    status: HttpStatus.ACCEPTED, example: {
      "id": 18,
      "title": "Договор о импортозамещении строительных материалов",
      "text": "Заказчик обязуется...",
      "initiator": {
        "id": 10,
        "firstName": "Максбетов",
        "lastName": "Максим",
        "middleName": "Максимович",
        "email": "maxmaxbetov@email.com",
        "status": "Заказчик",
        "inviteStatus": "Приглашен"
      },
      "status": "Черновик",
      "images": [
        `https://yurkitgbot.ru/api/images/picture/51552ed5-8fab-4dd3-a0d7-cadb77ba69e6.jpg`,
        `https://yurkitgbot.ru/api/images/picture/84da4e04-b486-490b-8f63-50c35e474152.jpg`,
        `https://yurkitgbot.ru/api/images/picture/80d7622c-6bbe-4a1d-bedc-fd665959bf37.png`,
        `https://yurkitgbot.ru/api/images/picture/9007c520-a13f-42bf-88f4-2a59f7635114.png`,
        `https://yurkitgbot.ru/api/images/picture/7ab682de-3bc3-4a80-938a-dddca567a1f8.jpg`
      ],
      "price": "45245245",
      "members": [
        {
          "id": 10,
          "firstName": "Максбетов",
          "lastName": "Максим",
          "middleName": "Максимович",
          "email": "maxmaxbetov@email.com",
          "status": "Заказчик",
          "inviteStatus": "Приглашен"
        }
      ],
      "steps": [],
      "start": "2024-09-23T19:00:00.000Z",
      "end": "2024-09-25T19:00:00.000Z"
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST, example: [{
      "message": "Фотография уже была добавлена.",
      "error": "Bad Request",
      "statusCode": 400
    }, {
      "message": "Соглашение может иметь не более 10 фотографий.",
      "error": "Bad Request",
      "statusCode": 400
    }],
  })
  @Post('/addPhotos/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async addAgreementPhotos(
    @Req() request: RequestType,
    @Body() imageDto: ImagesDto
  ) {
    return await this.agreementService.addAgreementPhotos(request.agreement, imageDto.images, request.user.id);
  }


  @ApiOperation({ summary: 'Подтверждение участия в договоре' })
  @Post('/confirm/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async confirmAgreement(@Req() request: RequestType): Promise<{
    isConfirmed: boolean;
    message: string;
  }> {
    return this.agreementService.confirmAgreement(
      request.user.id,
      request.agreement,
    );
  }

  @ApiOperation({ summary: 'Отказ в участии в договоре' })
  @Delete('/decline/:id')
  @UseGuards(AuthGuard, Agreement)
  async declineAgreement(@Req() request: RequestType): Promise<{
    isDeclined: boolean;
    message: string;
  }> {
    return this.agreementService.declineAgreement(
      request.user.id,
      request.agreement,
    );
  }

  @ApiOperation({ summary: 'Редактирование договора' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    example: {
      id: 18,
      title: 'Договор о импортозамещении строительных материалов',
      text: 'Заказчик обязуется...',
      initiator: {
        id: 10,
        firstName: 'Максим',
        lastName: 'Максбетов',
        middleName: null,
        email: null,
        status: 'Заказчик',
        inviteStatus: 'Приглашен',
      },
      status: 'Черновик',
      price: '45245245',
      members: [
        {
          id: 10,
          firstName: 'Максим',
          lastName: 'Максбетов',
          middleName: null,
          email: null,
          status: 'Заказчик',
          inviteStatus: 'Приглашен',
        },
      ],
      steps: [],
      start: '2024-09-24',
      end: '2024-09-26',
    },
  })
  @Put('/update/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async editAgreement(
    @Req() request: RequestType,
    @Body() agreementDto: EditAgreementDto,
    @Param('id') id: number,
  ) {
    return this.agreementService.editAgreement(request.agreement, agreementDto, request.user.id);
  }

  

  @ApiOperation({ summary: 'Включение договора в работу.' })
  @Post('/enable/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async enableAgreement(@Req() request: RequestType): Promise<{
    message: string;
    agreement: AgreementDto;
  }> {
    return this.agreementService.enableAgreementAtWork(
      request.user.id,
      request.agreement,
    );
  }
}
