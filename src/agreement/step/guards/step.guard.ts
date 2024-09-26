import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { StepService } from "../step.service";

@Injectable()
export class StepGuard implements CanActivate {
    constructor(private readonly stepService: StepService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const stepId = request.params.id || request.body.id || request.query.id;

            const step = await this.stepService.findStep(stepId);
            if(step.user.user.id !== request.user.id) {
                throw new UnauthorizedException("Вы не можете совершить это действие, так как не являетесь ответственным за этот шаг.")
            }
            request.step = step;
            return true;
        } catch(e) {
            console.log(e);
            return false;
        }
    }
}