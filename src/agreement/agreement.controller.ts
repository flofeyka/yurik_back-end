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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  constructor(private readonly agreementService: AgreementService) {}

  @ApiOperation({
    summary: 'Получение списка пользовательских договоров',
    description:
      'Параметр type может принимать следующие значения: В работе, Отклонён, У юриста, В поиске юриста, В процессе подтверждения, Черновик, Завершён',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [AgreementDto],
  })
  @Get('/')
  @UseGuards(AuthGuard)
  async getAgreements(
    @Req() request: RequestType,
    @Query('type')
    type:
      | 'В работе'
      | 'Отклонён'
      | 'У юриста'
      | 'В поиске юриста'
      | 'В процессе подтверждения'
      | 'Черновик'
      | 'Завершён',
  ): Promise<AgreementsListDto[]> {
    return this.agreementService.getAgreements(request.user.id, type);
  }

  @ApiOperation({ summary: 'Получение договора по id' })
  @ApiResponse({
    status: 200,
    type: AgreementDto,
  })
  @Get('/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async getAgreement(@Req() request: RequestType): Promise<AgreementDto> {
    return this.agreementService.getAgreement(
      request.agreement,
      request.user.id,
    );
  }

  @ApiOperation({ summary: 'Создание договора' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AgreementDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    example: [
      {
        message: 'Пожалуйста, заполните ваш профиль полностью',
        error: 'Bad Request',
        statusCode: 400,
      },
    ],
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

  @ApiOperation({
    summary: 'Редактирование договора',
    description:
      'Редактирование договора. Выполняется, если не все пункты были заполнены, либо одну из сторон не устроили условия договора.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    type: AgreementDto,
  })
  @ApiBadRequestResponse({
    example: [
      {
        message:
          'Вы не можете отредактировать этот договор, т.к. он уже был утвержден и подписан.',
        error: 'Bad Request',
        statusCode: 400,
      },
      {
        message:
          'Вы не можете редактировать данный договор, т.к. не являетесь его инициатором. Если хотите обговорить изменения - обсудите это в общем чате',
        error: 'Bad Request',
        statusCode: 400,
      },
    ],
  })
  @ApiNotFoundResponse({
    example: {
      message: 'Договор с этим идентификатором не найден',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @Put('/update/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async editAgreement(
    @Req() request: RequestType,
    @Body() agreementDto: EditAgreementDto,
  ) {
    return this.agreementService.editAgreement(
      request.agreement,
      agreementDto,
      request.user.id,
    );
  }

  @ApiOperation({
    summary: 'Удаление договора',
    description:
      'Выполняется при необходимости удаления черновика договора. Выполняется по любой причине и работает столько с черновиками.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      success: 'true',
      message: 'Договор успешно удален',
    },
  })
  @Delete('/delete/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async deleteAgreement(@Req() request: RequestType) {
    return this.agreementService.deleteAgreement(
      request.agreement,
      request.user.id,
    );
  }

  @ApiOperation({
    summary: 'Подтверждение участия в договоре',
    description:
      'Выполняется в случае, если человек получает приглашение в договор, а также условия договора.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      isConfirmed: true,
      message: 'Вы успешно подтвердили участие в договоре',
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    example: [
      {
        message: 'Пожалуйста, заполните ваш профиль полностью',
        error: 'Bad Request',
        statusCode: 400,
      },
    ],
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

  @ApiOperation({
    summary: 'Отказ в участии в договоре',
    description:
      'Отказ в участии в договоре. Выполняется в том случае, если одна из сторон отказывается от участия в договоре по любой причине. То есть отклонение приглашения в соответствующий договор.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      isDeclined: true,
      message: 'Вы успешно отклонили участие в договоре',
    },
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

  @ApiOperation({
    summary: 'Включение договора в работу.',
    description:
      'Включение договора в работу. Выполняется в том случае, если обе стороны устраивает договор, этапы, обязательства, цена и т.д..',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: AgreementDto,
  })
  @ApiBadRequestResponse({
    example: [
      {
        message: 'Текст договора должен быть больше 100 символов',
        error: 'Bad Request',
        statusCode: 400,
      },
      {
        message: 'В договоре должен присутствовать хотя бы один шаг с оплатой',
        error: 'Bad Request',
        statusCode: 400,
      },
      {
        message: 'Дата начала договора не может быть раньше текущей даты',
        error: 'Bad Request',
        statusCode: 400,
      },
      {
        message:
          'Дата конца договора не может быть раньше даты конца последнего этапа',
        error: 'Bad Request',
        statusCode: 400,
      },
    ],
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

  @ApiOperation({
    summary: 'Завершение договора',
    description:
      'Завершение договора применяется в том случае, если обе стороны выполнили все, либо частично не выполнили(и это устроило другую сторону) все обязательства, прописанные в договоре и этапах соответственно.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: AgreementDto,
  })
  @ApiBadRequestResponse({
    example: [
      {
        message: 'Договор не находится в работе.',
        error: 'Bad Request',
        statusCode: 400,
      },
      {
        message:
          'Вы не можете завершить договор, так как все шаги отклонены. Пожалуйста, отклоните договор.',
        error: 'Bad Request',
        statusCode: 400,
      },
    ],
  })
  @Put('/:id/complete')
  @UseGuards(AuthGuard, AgreementGuard)
  async completeAgreement(@Req() request: RequestType) {
    return await this.agreementService.completeAgreement(
      request.agreement,
      request.user.id,
    );
  }

  @ApiOperation({
    summary: 'Разорвать договор',
    description:
      'Разорвать договор. Применяется в том случае, если стороны не выполнили свои обязательства и это не устроило одну из сторон.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AgreementDto,
  })
  @ApiBadRequestResponse({
    example: [
      {
        message: 'Договор не находится в работе.',
        error: 'Bad Request',
        statusCode: 400,
      },
    ],
  })
  @Delete('/:id/reject')
  @UseGuards(AuthGuard, AgreementGuard)
  async rejectAgreement(@Req() request: RequestType) {
    return await this.agreementService.rejectAgreement(
      request.agreement,
      request.user.id,
    );
  }

  @ApiProperty({ title: 'Добавление изображений к договору.' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    type: AgreementDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    example: [
      {
        message: 'Фотография уже была добавлена.',
        error: 'Bad Request',
        statusCode: 400,
      },
      {
        message: 'Соглашение может иметь не более 10 фотографий.',
        error: 'Bad Request',
        statusCode: 400,
      },
    ],
  })
  @Post('/addPhotos/:id')
  @UseGuards(AuthGuard, AgreementGuard)
  async addAgreementPhotos(
    @Req() request: RequestType,
    @Body() imageDto: ImagesDto,
  ): Promise<AgreementDto> {
    return await this.agreementService.addAgreementPhotos(
      request.agreement,
      imageDto.images,
      request.user.id,
    );
  }
}
