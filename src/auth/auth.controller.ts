import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUserDto } from 'src/user/dtos/create-user-dto';
import { RequestType } from '../../types/types';
import { UserDto } from '../user/dtos/user-dto';
import { AuthGuard } from './auth.guard';
import { AuthService, tokenAndUserType } from './auth.service';
import { LoginDto } from './dtos/login-dto';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Регистрация пользователя в системе' })
  @ApiResponse({
    example: {
      "id": 10,
      "firstName": "Данил",
      "lastName": "Баширов",
      "middleName": "Владленович",
      "birthDate": "2001-04-23",
      "telegramID": "5539208326",
      "image": {
        "id": 20,
        "name": "01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png",
        "userId": 10,
        "imgUrl": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
      },
      "email": "danilbashirov0@vk.com",
      "personalData": {
        "authority": "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ",
        "serial": "1234",
        "number": "123456",
        "address": "Г. Тюмень, улица Мориса Тореза, 1, 1",
        "passportDate": "2001-11-09T19:00:00.000Z",
        "TIN": "12345678901"
      },
      "filled": true
    },
    status: HttpStatus.CREATED,
  })
  @ApiResponse({
    status: HttpStatus.BAD_GATEWAY,
    example: {
      "message": 'Пожалуйста, зарегистрируйте Telegram-аккаунт, прежде чем продолжить.',
      "error": "Bad Gateway",
      "statusCode": 502
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    example: {
      "message": "Телеграм аккаунт уже зарегистрирован.",
      "error": "Bad request",
      "statusCode": 401
    }
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  async signUp(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<tokenAndUserType> {
    return await this.authService.signUp(userDto);
  }

  @ApiOperation({ summary: 'Авторизация существующего пользователя в системе' })
  @ApiResponse({
    example: {
      "id": 10,
      "firstName": "Данил",
      "lastName": "Баширов",
      "middleName": "Владленович",
      "birthDate": "2001-04-23",
      "telegramID": "5539208326",
      "image": {
        "id": 20,
        "name": "01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png",
        "userId": 10,
        "imgUrl": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
      },
      "email": "danilbashirov0@vk.com",
      "personalData": {
        "authority": "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ",
        "serial": "1234",
        "number": "123456",
        "address": "Г. Тюмень, улица Мориса Тореза, 1, 1",
        "passportDate": "2001-11-09T19:00:00.000Z",
        "TIN": "12345678901"
      },
      "filled": true
    },
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    example: {
      "message": "Неверные данные для входа.",
      "error": "Unauthorized",
      "statusCode": 401
    }
  })
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<tokenAndUserType> {
    return await this.authService.signIn(loginDto);
  }

  @ApiOperation({ summary: 'Получение данных юзера' })
  @ApiResponse({
    example: {
      "id": 10,
      "firstName": "Данил",
      "lastName": "Баширов",
      "middleName": "Владленович",
      "birthDate": "2001-04-23",
      "telegramID": "5539208326",
      "image": {
        "id": 20,
        "name": "01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png",
        "userId": 10,
        "imgUrl": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
      },
      "email": "danilbashirov0@vk.com",
      "personalData": {
        "authority": "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ",
        "serial": "1234",
        "number": "123456",
        "address": "Г. Тюмень, улица Мориса Тореза, 1, 1",
        "passportDate": "2001-11-09T19:00:00.000Z",
        "TIN": "12345678901"
      },
      "filled": true
    },
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/data')
  @UseGuards(AuthGuard)
  async getUsersData(@Req() request: RequestType): Promise<UserDto> {
    return this.authService.getUsersData(request.user.id);
  }
}
