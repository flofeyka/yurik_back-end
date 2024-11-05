import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { EditUserDto } from './dtos/edit-user-dto';
import { RequestType } from '../../types/types';
import { TelegramAccount } from './entities/telegram-account.entity';
import { ImagesService } from '../images/images.service';
import { UserDto } from './dtos/user-dto';

@ApiTags('Users API')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @ApiOperation({ summary: 'Регистрация аккаунта Telegram в системе' })
  @ApiResponse({ status: HttpStatus.CREATED, example: true })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    example: {
      message: 'Telegram-аккаунт уже зарегистрирован в системе.',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/telegram/add/:telegram_id')
  async addTelegramAccount(@Param('telegram_id') telegramID: number): Promise<boolean> {
    return this.userService.addTelegramAccount(telegramID);
  }

  @ApiOperation({ summary: "Получение пользователя по id" })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ example: new NotFoundException("Пользователь с данным id 1 не был найден в системе")})
  @Get("/:id")
  getUserById(@Param("id") id: number) {
    return this.userService.getProfileById(id);
  }

  @ApiOperation({ summary: 'Изменение и добавление пользовательских данных.' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    example: {
      id: 10,
      firstName: 'Максбетов',
      lastName: 'Максбет',
      middleName: 'Максбетович',
      birthDate: '2000-04-23',
      telegramID: '5539208326',
      email: 'danilbashirov0@vk.com',
      personalData: {
        authority: 'УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ',
        serial: '1234',
        number: '123456',
        address: 'Г. Тюмень, улица Мориса Тореза, 1, 1',
        passportDate: '2002-11-10',
        TIN: '12345678901',
      },
      filled: true,
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_GATEWAY,
    example: {
      message: 'Возраст пользователя должен быть больше 18 лет',
      error: 'Bad Gateway',
      statusCode: 502,
    },
  })
  @Put('/edit')
  @UseGuards(AuthGuard)
  async EditData(@Req() request: RequestType, @Body() userDto: EditUserDto) {
    return this.userService.editUser(request.user.id, userDto);
  }

}
