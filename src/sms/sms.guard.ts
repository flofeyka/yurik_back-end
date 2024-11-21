import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RequestType } from '../../types/types';
import { User } from '../user/entities/user.entity';
import { SmsService } from './sms.service';

@Injectable()
export class SmsGuard implements CanActivate {
  constructor(
    private readonly smsService: SmsService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestType = context.switchToHttp().getRequest();
    const user: User = await this.userService.findUser(request.user.id);
    const isCorrectSms: boolean = await this.smsService.checkSms(
        user.phoneNumber,
      request.query.code || request.body.code,
    );

    if (!isCorrectSms) {
      throw new BadRequestException('Неверный СМС-код');
    }

    return true;
  }
}
