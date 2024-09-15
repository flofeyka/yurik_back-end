import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { SmsService } from "./sms.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class SmsGuard implements CanActivate {
    constructor(private readonly smsService: SmsService, private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user && await this.userService.findUser(request.user.id)
        const isCorrectSms = await this.smsService.checkSms(request.query.phone || user?.phoneNumber || request.body.phone || request.body.phoneNumber, request.query.code || request.body.code);

        if(!isCorrectSms) {
            throw new BadRequestException("Неверный СМС-код")
        }

        return true;
    }
}