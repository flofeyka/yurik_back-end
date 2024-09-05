import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dtos/create-user-dto';
import { LoginDto } from './dtos/login-dto';
@ApiTags("Auth API")
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiResponse({
        example: {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZmlyc3ROYW1lIjoi0JzQsNC60YHQuNC8IiwibGFzdE5hbWUiOiLQnNCw0LrRgdCx0LXRgtC-0LIiLCJtaWRkbGVOYW1lIjoi0KLQsNCz0LjRgNC-0LLQuNGHIn0.CXGuFj9yUwDaQdGsl3aO3dYwKpqQEEd2fsSqv_FsjXI",
            user: {
                id: 1,
                lastName: "Максбетов",
                phoneNumber: "+79123456789",
                telegramID: 135462
            }
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
    @Post("/signup")
    async signUp(@Body() userDto: CreateUserDto) {
        return await this.authService.signUp(userDto);
    }

    @Post("/signin")
    async signIn(@Body() loginDto: LoginDto) {
        return this.authService.signIn(loginDto);
    }
}
