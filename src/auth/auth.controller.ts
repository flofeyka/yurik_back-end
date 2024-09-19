import { Body, Controller, HttpCode, HttpStatus, Post, Query, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "src/user/dtos/create-user-dto";
import { LoginDto } from "./dtos/login-dto";
import { UserDto } from "../user/dtos/user-dto";
import { Response } from "express";
import { SmsGuard } from "src/sms/sms.guard";


@ApiTags("Auth API")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }


  @ApiOperation({ summary: "Регистрация пользователя в системе" })
  @ApiResponse({
    example: {
        id: 1,
        lastName: "Максбетов",
        phoneNumber: "+79123456789",
        telegramID: 135462
    }, status: HttpStatus.CREATED
  })
  @ApiResponse({
    example: {
      message: "Электронная почта занята другим пользователем",
      error: "Bad Request",
      statusCode: 400
    }, status: HttpStatus.BAD_REQUEST
  })
  @ApiResponse({
    example: {
      message: "Номер телефона занят другим пользователем",
      error: "Bad Gateway",
      statusCode: HttpStatus.BAD_GATEWAY
    }, status: HttpStatus.BAD_GATEWAY
  })
  @HttpCode(HttpStatus.CREATED)
  @Post("/signup")
  // @UseGuards(SmsGuard)
  async signUp(@Body() userDto: CreateUserDto, @Res({ passthrough: true }) response: Response): Promise<UserDto> {
    const result = await this.authService.signUp(userDto);
    response.cookie("access_token", result.token);

    return result.user;
  }

  @ApiOperation({ summary: "Авторизация существующего пользователя в системе" })
  @ApiResponse({
    example: {
        id: 1,
        lastName: "Максбетов",
        phoneNumber: 79123456789,
        telegramID: 135462
    }, status: HttpStatus.OK
  })
  @HttpCode(HttpStatus.OK)
  @Post("/signin")
  @UseGuards(SmsGuard)
  async signIn(@Body() loginDto: LoginDto, @Res({passthrough: true}) response: Response): Promise<UserDto> {
    const result = await this.authService.signIn(loginDto);
    response.cookie("access_token", result.token);
    return result.user;
  }
}
