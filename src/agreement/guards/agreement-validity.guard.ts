import { BadRequestException, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { AgreementMember } from "../members/member.entity";

export class AgreementValidityGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const { agreement } = request;

            if (!agreement.price) {
                throw new BadRequestException("Пожалуйста, укажите цену");
            }

            if (!agreement.start || !agreement.end) {
                throw new BadRequestException(
                    'У договора не указаны дата начала и его окончания'
                );
            }

            if (new Date(agreement.start) < new Date(agreement.end)) {
                throw new BadRequestException('Дата начала договора не может быть позже даты конца');
            }

            if (agreement.steps.length < 1) {
                throw new BadRequestException('Вы не можете совершить данное действие, так как у договора меньше одного этапа');
            }

            if (new Date(agreement.steps[agreement.steps.length - 1].end) > new Date(agreement.end)) {
                throw new BadRequestException('Дата конца договора не может быть раньше даты конца последнего этапа');
            }

            for (let i of agreement.steps) {
                if (new Date(i.start) > new Date(i.end)) {
                    throw new BadRequestException('Дата начала этапа не может быть позже даты конца');
                }
            }

            for (let i = 0; i = agreement.steps.length - 1; i++) {
                if (i + 1 < agreement.steps.length) {
                    if (new Date(agreement.steps[i].end) > new Date(agreement.steps[i + 1].start)) {
                        throw new BadRequestException('Дата конца этапа не может быть позже даты начала следующего этапа');
                    }
                }
            }

            if (!(agreement.members.length > 2)) {
                throw new BadRequestException(
                    'Вы не можете совершить это действие, так как у договора нет второй стороны.',
                );
            }

            if (agreement.status === 'В работе') {
                throw new BadRequestException(
                    'Договор уже находится в работе.',
                );
            }

            if (
                !agreement.members.every(
                    (member: AgreementMember) => member.inviteStatus === 'Подтвердил',
                )
            ) {
                throw new BadRequestException(
                    'Участие в договоре ещё не было подтверждено всеми участниками. Пожалуйста, свяжитесь с ними.',
                );
            }

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }

    }
}