import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserService } from "./user.service";
import { Observable } from "rxjs";
import { RequestType } from "types/types";
import { UserDto } from "./dtos/user-dto";

@Injectable()
export class UserPersonalDataGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestType = context.switchToHttp().getRequest();
        const userId = request.user.id;

        const user = await this.userService.findUser(userId);
        const userDto = new UserDto(user);
        if(!userDto.filled) {
            throw new BadRequestException(`Пожалуйста, заполните ваш профиль полностью. Вы можете сделать это в личном кабинете.`);
        }

        return true;
    }
}