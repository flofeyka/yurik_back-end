import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { StepService } from "../step.service";
import { RequestType } from "types/types";

@Injectable()
export class StepGuard implements CanActivate {
    constructor(private readonly stepService: StepService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request: RequestType = context.switchToHttp().getRequest();
            const stepId = request.body.stepId || request.params.stepId || request.params.id || request.body.id || request.query.id;

            const step = await this.stepService.findStep(stepId);
            
            if(request.user.role.role === "Пользователь") {
                request.step = step;
                return true;
            }
            if(step.user.user.id !== request.user.id) {
                throw new BadRequestException("Вы не можете совершить это действие, так как не являетесь ответственным за этот шаг.")
            }
            request.step = step;
            return true;
        } catch(e) {
            console.log(e);
            return false;
        }
    }
}