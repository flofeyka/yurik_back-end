import {
  BadGatewayException,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { StepService } from "../step.service";
import { RequestType } from "types/types";
import { MemberService } from "../../members/member.service";

@Injectable()
export class StepGuard implements CanActivate {
  constructor(
    private readonly stepService: StepService,
    private readonly memberService: MemberService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestType = context.switchToHttp().getRequest();
    const stepId = request.body.stepId || request.params.stepId || request.params.id || request.body.id || request.query.id;

    const step = await this.stepService.findStep(stepId);

    if (request.user.role !== "Пользователь") {
      if (request.user.role !== "Админ" && request.agreement?.lawyer.user.id !== request.user.id) {
        throw new BadRequestException("Вы не являетесь юристом или администратором, чтобы сделать это действие");
      }
      request.step = step;
      return true;
    }
    console.log(step.agreement);
    if (!this.memberService.findMember(step.agreement, request.user.id)) {
      throw new BadGatewayException("Вы не можете совершить это действите, так как не являетесь участником договора этапа");
    }
    request.step = step;
    return true;
  }
}