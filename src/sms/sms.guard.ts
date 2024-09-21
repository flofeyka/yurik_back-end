import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { SmsService } from "./sms.service";
import { UserService } from "src/user/user.service";
import { User } from "../user/entities/user.entity";
import { RequestType } from "../../types/types";

@Injectable()
export class SmsGuard implements CanActivate {
    constructor(private readonly smsService: SmsService, private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: RequestType = context.switchToHttp().getRequest();
        const user: User = request.user && await this.userService.findUser(request.user.id)
        const isCorrectSms: boolean = await this.smsService.checkSms(request.query.phone || user?.phoneNumber || request.body.phone || request.body.phoneNumber, request.query.code || request.body.code);

        if(!isCorrectSms) {
            throw new BadRequestException("Неверный СМС-код")
        }

        return true;
    }
}