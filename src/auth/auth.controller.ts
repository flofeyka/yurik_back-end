import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "src/user/dtos/create-user-dto";
import { LoginDto } from "./dtos/login-dto";
import { UserDto } from "../user/dtos/user-dto";
import { Response } from "express";
import { SmsGuard } from "src/sms/sms.guard";
import { UUID } from "crypto";
import { RequestType } from "../../types/types";
import { AuthGuard } from "./auth.guard";


@ApiTags("Auth API")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }


  @ApiOperation({ summary: "Регистрация пользователя в системе" })
  @ApiResponse({
    example: {
      "id": 10,
      "firstName": "Максим",
      "lastName": "Максбетов",
      "middleName": null,
      "birthDate": null,
      "telegramID": "5539208326",
      "email": null,
      "filled": false
    }, status: HttpStatus.CREATED
  })
  @ApiResponse({
    example: {
      message: "Пожалуйста, зарегистрируйте Telegram-аккаунт, прежде чем продолжить.",
      error: "Bad Request",
      statusCode: 400
    }, status: HttpStatus.BAD_REQUEST
  })
  @ApiResponse({
    example: {
      message: "Телеграм аккаунт уже зарегистрирован.",
      error: "Bad Gateway",
      statusCode: HttpStatus.BAD_GATEWAY
    }, status: HttpStatus.BAD_GATEWAY
  })
  @HttpCode(HttpStatus.CREATED)
  @Post("/signup")
  async signUp(@Body() userDto: CreateUserDto, @Res({ passthrough: true }) response: Response): Promise<UserDto> {
    const result = await this.authService.signUp(userDto);
    response.cookie("access_token", result.token);

    return result.user;
  }

  @ApiOperation({summary: "Получение данных юзера"})
  @ApiResponse({example: {
      "id": 10,
      "firstName": "Максим",
      "lastName": "Максбетов",
      "middleName": null,
      "birthDate": null,
      "telegramID": "5539208326",
      "email": null,
      "filled": false
    }, status: HttpStatus.OK})
  @HttpCode(HttpStatus.OK)
  @Get("/data")
  @UseGuards(AuthGuard)
  async getUsersData(@Req() request: RequestType): Promise<UserDto> {
    return this.authService.getUsersData(request.user.id);
  }


  @ApiOperation({ summary: "Авторизация существующего пользователя в системе" })
  @ApiResponse({
    example: {
      "id": 10,
      "firstName": "Максим",
      "lastName": "Максбетов",
      "middleName": null,
      "birthDate": null,
      "telegramID": "5539208326",
      "email": null,
      "filled": false
    }, status: HttpStatus.OK
  })
  @HttpCode(HttpStatus.OK)
  @Post("/signin")
  async signIn(@Body() loginDto: LoginDto, @Res({passthrough: true}) response: Response): Promise<UserDto> {
    const result = await this.authService.signIn(loginDto);
    response.cookie("access_token", result.token);
    return result.user;
  }
}
