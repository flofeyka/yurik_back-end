import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { AgreementValidityGuard } from './guards/agreement-validity.guard';

@ApiTags('Agreement API')
@Controller('agreement')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) { }

  @ApiOperation({ summary: 'Получение списка пользовательских договоров', description: 'Параметр type может принимать следующие значения: В работе, Отклонён, У юриста, В поиске юриста, В процессе подтверждения, Черновик, Завершён' })
  @ApiResponse({
    status: HttpStatus.OK, example: [
      {
        "id": 51,
        "title": "Договор о импортозамещении строительных материалов",
        "members": [
          {
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "status": "Заказчик",
            "image": {
              "id": 20,
              "name": "01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png",
              "userId": 10,
              "imgUrl": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
            }
          }
        ],
        "steps": [
          {
            "title": "Закупка материалов",
            "status": "false",
            "payment": null
          }
        ],
        "start": null,
        "end": null
      },
      {
        "id": 35,
        "title": "Договор о импортозамещении строительных материалов",
        "members": [
          {
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "status": "Подрядчик",
            "image": {
              "id": 20,
              "name": "01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png",
              "userId": 10,
              "imgUrl": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
            }
          }
        ],
        "steps": [],
        "start": null,
        "end": null
      },
      {
        "id": 36,
        "title": "Договор о импортозамещении строительных материалов",
        "members": [
          {
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "status": "Подрядчик",
            "image": {
              "id": 20,
              "name": "01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png",
              "userId": 10,
              "imgUrl": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
            }
          }
        ],
        "steps": [],
        "start": null,
        "end": null
      }]
  })
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
  @ApiResponse({
    status: 200, example: {
      "id": 29,
      "title": "Договор о импортозамещении строительных материалов",
      "text": "Заказчик обязуется...",
      "initiator": {
        "id": 9,
        "firstName": "Владислав",
        "lastName": "Чумак",
        "middleName": null,
        "email": null,
        "status": "Заказчик",
        "inviteStatus": "Приглашен"
      },
      "status": "Черновик",
      "images": [
        "http://localhost:3000/api/images/picture/cca2e63f-beea-4bc8-8e55-41d89b0d785f.jpg"
      ],
      "members": [
        {
          "id": 10,
          "firstName": "Данил",
          "lastName": "Баширов",
          "middleName": "Владленович",
          "email": "danilbashirov0@vk.com",
          "status": "Подрядчик",
          "inviteStatus": "Приглашен"
        },
        {
          "id": 9,
          "firstName": "Владислав",
          "lastName": "Чумак",
          "middleName": null,
          "email": null,
          "status": "Заказчик",
          "inviteStatus": "Приглашен"
        }
      ],
      "steps": [],
      "start": "2024-09-23T19:00:00.000Z",
      "end": "2024-09-25T19:00:00.000Z"
    }
  })
  @Get('/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async getAgreement(
    @Req() request: RequestType,
  ): Promise<AgreementDto> {
    return this.agreementService.getAgreement(request.agreement, request.user.id);
  }

  @ApiOperation({ summary: 'Создание договора' })
  @ApiResponse({
    status: HttpStatus.CREATED, example: {
      "id": 52,
      "title": "Договор о импортозамещении строительных материалов",
      "text": null,
      "initiator": {
        "id": 10,
        "firstName": "Данил",
        "lastName": "Баширов",
        "middleName": "Владленович",
        "email": "danilbashirov0@vk.com",
        "status": "Заказчик",
        "inviteStatus": "Подтвердил"
      },
      "status": "Черновик",
      "images": [],
      "price": null,
      "members": [
        {
          "id": 10,
          "firstName": "Данил",
          "lastName": "Баширов",
          "middleName": "Владленович",
          "email": "danilbashirov0@vk.com",
          "status": "Заказчик",
          "inviteStatus": "Подтвердил"
        }
      ],
      "steps": [],
      "start": null,
      "end": null
    }
  })
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
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
  @ApiResponse({
    status: HttpStatus.OK, example: {
      "isConfirmed": true,
      "message": "Вы успешно подтвердили участие в договоре"
    }
  })
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
  @ApiResponse({
    status: HttpStatus.OK, example: {
      "message": "Договор был успешно включён в работу.",
      "agreement": {
        "id": 52,
        "title": "Договор о импортозамещении строительных материалов",
        "text": null,
        "initiator": {
          "id": 10,
          "firstName": "Данил",
          "lastName": "Баширов",
          "middleName": "Владленович",
          "email": "danilbashirov0@vk.com",
          "status": "Заказчик",
          "inviteStatus": "Подтвердил"
        },
        "status": "В работе",
        "images": [],
        "price": null,
        "members": [
          {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "email": "danilbashirov0@vk.com",
            "status": "Заказчик",
            "inviteStatus": "Подтвердил"
          },
          {
            "id": 9,
            "firstName": "Владислав",
            "lastName": "Чумак",
            "middleName": null,
            "email": null,
            "status": "Подрядчик",
            "inviteStatus": "Подтвердил"
          }
        ],
        "steps": [],
        "start": null,
        "end": null
      }
    }
  })
  @Post('/enable/:id')
  @UseGuards(AuthGuard, AgreementGuard, AgreementValidityGuard)
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
