import { Body, Controller, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { EditUserDto } from "./dtos/edit-user-dto";
import { RequestType } from "../../types/types";
import { TelegramAccount } from "./entities/telegram-account.entity";
import { ImagesService } from "../images/images.service";


@ApiTags("Users API")
@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({summary: "Изменение и добавление пользовательских данных."})
    @ApiResponse({status: HttpStatus.ACCEPTED})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    @Put("/edit")
    @UseGuards(AuthGuard)
    async EditData(@Req() request: RequestType, @Body() userDto: EditUserDto) {
        return this.userService.editUser(request.user.id, userDto)
    }

    @ApiOperation({ summary: "Регистрация аккаунта Telegram в системе" })
    @ApiResponse({ status: HttpStatus.CREATED, example: {...TelegramAccount} })
    @HttpCode(HttpStatus.CREATED)
    @Post("/telegram/add/:telegram_id")
    async addTelegramAccount(@Param('telegram_id') telegramID: number) {
        return await this.userService.addTelegramAccount(telegramID);
    }
}