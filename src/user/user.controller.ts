import { Body, Controller, HttpStatus, Put, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { EditUserDto } from "./dtos/edit-user-dto";

@ApiTags("Users API")
@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({summary: "Изменение и добавление пользовательских данных."})
    @ApiResponse({status: HttpStatus.ACCEPTED})
    @ApiResponse({status: HttpStatus.BAD_GATEWAY})
    @Put("/edit")
    @UseGuards(AuthGuard)
    async EditData(@Req() request, @Body() userDto: EditUserDto) {
        return this.userService.editUser(request.user.id, userDto)
    }

}