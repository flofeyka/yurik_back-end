import {
  BadGatewayException,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { RequestType } from 'types/types';
import { MemberService } from '../../members/member.service';
import { StepService } from '../step.service';

@Injectable()
export class StepGuard implements CanActivate {
  constructor(
    private readonly stepService: StepService,
    private readonly memberService: MemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestType = context.switchToHttp().getRequest();
    const stepId =
      request.body.stepId ||
      request.params.stepId ||
      request.params.id ||
      request.body.id ||
      request.query.id;

    const step = await this.stepService.findStep(stepId);

    if (request.user.role !== 'Пользователь') {
      if (
        request.user.role !== 'Админ' &&
        step.agreement.members.find(member => member.status === 'Юрист')?.user.id !== request.user.id
      ) {
        throw new BadRequestException(
          'Вы не являетесь юристом или администратором, чтобы сделать это действие',
        );
      }
      request.step = step;
      return true;
    }
    if (!this.memberService.findMember(step.agreement, request.user.id)) {
      throw new BadGatewayException(
        'Вы не можете совершить это действите, так как не являетесь участником договора этапа',
      );
    }
    request.step = step;
    return true;
  }
}
