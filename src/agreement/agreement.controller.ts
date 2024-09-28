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
import { ApiBadRequestResponse, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestType } from '../../types/types';
import { AuthGuard } from '../auth/auth.guard';
import { AgreementService } from './agreement.service';
import { AgreementDto } from './dtos/agreement-dto';
import { AgreementsListDto } from './dtos/agreements-list-dto';
import { CreateAgreementDto } from './dtos/create-agreement-dto';
import { EditAgreementDto } from './dtos/edit-agreement-dto';
import { ImagesDto } from './dtos/images-dto';
import { Agreement } from './entities/agreement.entity';
import { AgreementValidityGuard } from './guards/agreement-validity.guard';
import { AgreementGuard } from './guards/agreement.guard';
import { UserPersonalDataGuard } from 'src/user/user-personal_data.guard';

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
      "id": 54,
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
      "members": [
        {
          "id": 9,
          "firstName": "Владислав",
          "lastName": "Чумак",
          "middleName": null,
          "email": null,
          "status": "Подрядчик",
          "inviteStatus": "Подтвердил"
        },
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
      "steps": [
        {
          "id": "d5ba443a-a952-4cb0-8021-093eaf534a71",
          "title": "Оплата",
          "user": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "email": "danilbashirov0@vk.com",
            "status": "Заказчик",
            "inviteStatus": "Подтвердил"
          },
          "images": [],
          "payment": {
            "price": 123451
          },
          "isComplete": "Ожидает",
          "start": "2024-09-26",
          "end": "2024-09-28"
        }
      ],
      "start": "2024-09-26T19:00:00.000Z",
      "end": "2024-09-29T19:00:00.000Z"
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    example: [
      {
        "message": "Пожалуйста, заполните ваш профиль полностью",
        "error": "Bad Request",
        "statusCode": 400
      }
    ]
  })
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, UserPersonalDataGuard)
  async createAgreement(
    @Body() agreementDto: CreateAgreementDto,
    @Req() request: RequestType,
  ) {
    return this.agreementService.createAgreement(request.user.id, agreementDto);
  }

  @ApiOperation({ summary: 'Редактирование договора', description: "Редактирование договора. Выполняется, если не все пункты были заполнены, либо одну из сторон не устроили условия договора." })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    example: {
      "id": 54,
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
      "members": [
        {
          "id": 9,
          "firstName": "Владислав",
          "lastName": "Чумак",
          "middleName": null,
          "email": null,
          "status": "Подрядчик",
          "inviteStatus": "Подтвердил"
        },
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
      "steps": [
        {
          "id": "d5ba443a-a952-4cb0-8021-093eaf534a71",
          "title": "Оплата",
          "user": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "email": "danilbashirov0@vk.com",
            "status": "Заказчик",
            "inviteStatus": "Подтвердил"
          },
          "images": [],
          "payment": {
            "price": 123451
          },
          "isComplete": "Ожидает",
          "start": "2024-09-26",
          "end": "2024-09-28"
        }
      ],
      "start": "2024-09-26T19:00:00.000Z",
      "end": "2024-09-29T19:00:00.000Z"
    },
  })
  @Put('/update/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async editAgreement(
    @Req() request: RequestType,
    @Body() agreementDto: EditAgreementDto
  ) {
    return this.agreementService.editAgreement(request.agreement, agreementDto, request.user.id);
  }

  @ApiOperation({ summary: 'Удаление договора', description: "Выполняется при необходимости удаления черновика договора. Выполняется по любой причине и работает столько с черновиками." })
  @ApiResponse({
    status: HttpStatus.OK, example: {
      "success": "true",
      "message": "Договор успешно удален"
    }
  })
  @Delete('/delete/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async deleteAgreement(@Req() request: RequestType) {
    return this.agreementService.deleteAgreement(request.agreement, request.user.id);
  }

  @ApiOperation({ summary: 'Подтверждение участия в договоре', description: "Выполняется в случае, если человек получает приглашение в договор, а также условия договора." })
  @ApiResponse({
    status: HttpStatus.OK, example: {
      "isConfirmed": true,
      "message": "Вы успешно подтвердили участие в договоре"
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    example: [
      {
        "message": "Пожалуйста, заполните ваш профиль полностью",
        "error": "Bad Request",
        "statusCode": 400
      }
    ]
  })
  @Post('/confirm/:id')
  @UseGuards(AuthGuard, AgreementGuard, UserPersonalDataGuard)
  async confirmAgreement(@Req() request: RequestType): Promise<{
    isConfirmed: boolean;
    message: string;
  }> {
    return this.agreementService.confirmAgreement(
      request.user.id,
      request.agreement,
    );
  }
  @ApiOperation({ summary: 'Отказ в участии в договоре', description: "Отказ в участии в договоре. Выполняется в том случае, если одна из сторон отказывается от участия в договоре по любой причине. То есть отклонение приглашения в соответствующий договор." })
  @ApiResponse({
    status: HttpStatus.OK, example: {
      isDeclined: true,
      message: "Вы успешно отклонили участие в договоре"
    }
  })
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

  @ApiOperation({ summary: 'Включение договора в работу.', description: "Включение договора в работу. Выполняется в том случае, если обе стороны устраивает договор, этапы, обязательства, цена и т.д.." })
  @ApiResponse({
    status: HttpStatus.OK, example: {
      "message": "Договор был успешно включён в работу.",
      "agreement": {
        "id": 54,
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
        "members": [
          {
            "id": 9,
            "firstName": "Владислав",
            "lastName": "Чумак",
            "middleName": null,
            "email": null,
            "status": "Подрядчик",
            "inviteStatus": "Подтвердил"
          },
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
        "steps": [
          {
            "id": "d5ba443a-a952-4cb0-8021-093eaf534a71",
            "title": "Оплата",
            "user": {
              "id": 10,
              "firstName": "Данил",
              "lastName": "Баширов",
              "middleName": "Владленович",
              "email": "danilbashirov0@vk.com",
              "status": "Заказчик",
              "inviteStatus": "Подтвердил"
            },
            "images": [],
            "payment": {
              "price": 123451
            },
            "isComplete": "Ожидает",
            "start": "2024-09-26",
            "end": "2024-09-28"
          }
        ],
        "start": "2024-09-26T19:00:00.000Z",
        "end": "2024-09-29T19:00:00.000Z"
      }
    }
  })
  @ApiBadRequestResponse({
    example: [{
      "message": "Текст договора должен быть больше 100 символов",
      "error": "Bad Request",
      "statusCode": 400
    },
    {
      "message": "В договоре должен присутствовать хотя бы один шаг с оплатой",
      "error": "Bad Request",
      "statusCode": 400
    },
    {
      "message": "Дата начала договора не может быть раньше текущей даты",
      "error": "Bad Request",
      "statusCode": 400
    },
    {
      "message": "Дата конца договора не может быть раньше даты конца последнего этапа",
      "error": "Bad Request",
      "statusCode": 400
    },
    ]
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

  @ApiOperation({ summary: "Завершение договора", description: "Завершение договора применяется в том случае, если обе стороны выполнили все, либо частично не выполнили(и это устроило другую сторону) все обязательства, прописанные в договоре и этапах соответственно." })
  @ApiResponse({
    status: HttpStatus.OK, example: {
      "id": 53,
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
      "status": "Завершён",
      "images": [],
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
      "steps": [
        {
          "id": "a35e4321-fb8c-498b-9bf0-e1ef6915ed71",
          "title": "Закупка материаловss",
          "user": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "email": "danilbashirov0@vk.com",
            "status": "Заказчик",
            "inviteStatus": "Подтвердил"
          },
          "images": [],
          "payment": null,
          "status": "Завершён",
          "start": "2024-09-27",
          "end": "2024-09-28"
        },
        {
          "id": "6c5679cf-831c-434e-816f-9a10963cc0bb",
          "title": "Закупка материаловss",
          "user": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "email": "danilbashirov0@vk.com",
            "status": "Заказчик",
            "inviteStatus": "Подтвердил"
          },
          "images": [],
          "payment": null,
          "status": "Завершён",
          "start": "2024-09-27",
          "end": "2024-09-28"
        }
      ],
      "start": null,
      "end": null
    }
  })
  @ApiBadRequestResponse({
    example: [{
      "message": "Договор не находится в работе.",
      "error": "Bad Request",
      "statusCode": 400
    },
    {
      "message": "Вы не можете завершить договор, так как все шаги отклонены. Пожалуйста, отклоните договор.",
      "error": "Bad Request",
      "statusCode": 400
    }]
  })
  @Put('/:id/complete')
  @UseGuards(AuthGuard, AgreementGuard)
  async completeAgreement(@Req() request: RequestType) {
    return await this.agreementService.completeAgreement(request.agreement, request.user.id);
  }

  @ApiOperation({ summary: "Разорвать договор", description: "Разорвать договор. Применяется в том случае, если стороны не выполнили свои обязательства и это не устроило одну из сторон." })
  @ApiResponse({
    status: HttpStatus.OK, example: {
      "id": 56,
      "title": "Договор о импортозамещении строительных материалов",
      "text": "Договор о строительстве школы №123456789 между компанией «СтройМастер» и строительной фирмой «Авангард». Компания «СтройМастер» поручает, а строительная фирма «Авангард» принимает на себя обязательства по строительству новой школы на земельном участке, расположенном по адресу: ул. Новая, д. 10, город Москва. Работы должны быть выполнены в соответствии с проектной документацией, утвержденной заказчиком, в срок до 31 декабря 2024 года. Стоимость работ составляет 100 миллионов рублей.",
      "initiator": {
        "id": 10,
        "firstName": "Данил",
        "lastName": "Баширов",
        "middleName": "Владленович",
        "email": "danilbashirov0@vk.com",
        "status": "Заказчик",
        "inviteStatus": "Подтвердил"
      },
      "status": "Отклонён",
      "images": [],
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
      "steps": [
        {
          "id": "e8091c5c-0010-4e45-a4ef-17cd9d4b885b",
          "title": "Оплата",
          "user": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "email": "danilbashirov0@vk.com",
            "status": "Заказчик",
            "inviteStatus": "Подтвердил"
          },
          "images": [],
          "payment": {
            "price": 123451
          },
          "status": "Отклонён",
          "start": "2024-09-28",
          "end": "2024-10-01"
        }
      ],
      "start": "2024-09-27T19:00:00.000Z",
      "end": "2024-10-01T19:00:00.000Z"
    }
  })
  @ApiBadRequestResponse({
    example: [
      {
        "message": "Договор не находится в работе.",
        "error": "Bad Request",
        "statusCode": 400
      }
    ]
  })
  @Delete('/:id/reject')
  @UseGuards(AuthGuard, AgreementGuard)
  async rejectAgreement(@Req() request: RequestType) {
    return await this.agreementService.rejectAgreement(request.agreement, request.user.id);
  }

  @ApiProperty({ title: "Добавление изображений к договору." })
  @ApiResponse({
    status: HttpStatus.ACCEPTED, example: {
      "id": 54,
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
      "members": [
        {
          "id": 9,
          "firstName": "Владислав",
          "lastName": "Чумак",
          "middleName": null,
          "email": null,
          "status": "Подрядчик",
          "inviteStatus": "Подтвердил"
        },
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
      "steps": [
        {
          "id": "d5ba443a-a952-4cb0-8021-093eaf534a71",
          "title": "Оплата",
          "user": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "email": "danilbashirov0@vk.com",
            "status": "Заказчик",
            "inviteStatus": "Подтвердил"
          },
          "images": [
            `https://yurkitgbot.ru/api/images/picture/51552ed5-8fab-4dd3-a0d7-cadb77ba69e6.jpg`,
            `https://yurkitgbot.ru/api/images/picture/84da4e04-b486-490b-8f63-50c35e474152.jpg`,
            `https://yurkitgbot.ru/api/images/picture/80d7622c-6bbe-4a1d-bedc-fd665959bf37.png`,
            `https://yurkitgbot.ru/api/images/picture/9007c520-a13f-42bf-88f4-2a59f7635114.png`,
            `https://yurkitgbot.ru/api/images/picture/7ab682de-3bc3-4a80-938a-dddca567a1f8.jpg`
          ],
          "payment": {
            "price": 123451
          },
          "isComplete": "Ожидает",
          "start": "2024-09-26",
          "end": "2024-09-28"
        }
      ],
      "start": "2024-09-26T19:00:00.000Z",
      "end": "2024-09-29T19:00:00.000Z"
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
  ): Promise<AgreementDto> {
    return await this.agreementService.addAgreementPhotos(request.agreement, imageDto.images, request.user.id);
  }
}
