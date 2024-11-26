import { BadRequestException, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { AgreementMember } from "../members/member.entity";
import { AgreementStep } from "../step/entities/step.entity";

export class AgreementValidityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { agreement } = request;
    const errors: {
      path: "text" | "steps" | "start-date" | "end-date" | "date" | "members" | "status",
      error: string
    }[] = [];

    agreement.steps = agreement.steps.sort((a: AgreementStep, b: AgreementStep) => a.order - b.order);

    if (!agreement.is_edited) {
      errors.push({
        path: "text",
        error: "Вы должны перегенерировать текст договора, т.к. в нем поменялись данные"
      });
    }
    if (!agreement.text || agreement.text.length < 100) {
      errors.push({
        path: "text",
        error: "Текст договора должен быть больше 100 символов"
      });
    }

    // if (!agreement.steps.find((step: AgreementStep) => step.payment !== null)) {
    //     throw new BadRequestException("В договоре должен присутствовать хотя бы один шаг с оплатой");
    // }

    if (!agreement.start || !agreement.end) {
      errors.push({
        path: "date",
        error: "У договора не указаны дата начала или его окончания"
      });
    }

    if (new Date(agreement.start) > new Date(agreement.end)) {
      errors.push({
        path: "start-date",
        error: "Дата начала договора не может быть позже даты конца"
      });
    }

    const ONE_DAY: number = 24 * 60 * 60 * 1000;

    if (new Date(Date.now() - ONE_DAY) > new Date(agreement.start)) {
      errors.push({
        path: "start-date",
        error: "Дата начала договора не может быть раньше текущей даты"
      });
    }

    // if (agreement.steps.length < 1) {
    //     throw new BadRequestException('Вы не можете совершить данное действие, так как у договора меньше одного этапа');
    // }

    // if (new Date(agreement.steps[agreement.steps.length - 1].end) > new Date(agreement.end)) {
    //     throw new BadRequestException('Дата конца договора не может быть раньше даты конца последнего этапа');
    // }

    // for (let i of agreement.steps) {
    //     if (new Date(i.start) > new Date(i.end)) {
    //         throw new BadRequestException(`Ошибка в этапе ${i.title}: Дата начала этапа не может быть позже даты конца`);
    //     }
    // }
    // for (let i: number = 0; i < agreement.steps.length - 1; i++) {
    //     if (i + 1 <= agreement.steps.length) {
    //         if (new Date(agreement.steps[i].end) > new Date(agreement.steps[i + 1].start)) {
    //             throw new BadRequestException(`Ошибка в этапе ${agreement.steps[i].title} и ${agreement.steps[i+1].title}: Дата конца этапа не может быть позже даты начала следующего этапа`);
    //         }
    //     }
    // }


    if (agreement.members.length < 2) {
      errors.push({
        path: "members",
        error: "Вы не можете совершить это действие, так как у договора нет второй стороны."
      });
    }

    if (agreement.status === "В работе") {
      errors.push({
        path: "status",
        error: "Договор уже находится в работе."
      });
    }

    if(errors.length > 0) {
      throw new BadRequestException(errors);
    }

    // if (
    //     !agreement.members.every(
    //         (member: AgreementMember) => member.inviteStatus === 'Подтвердил',
    //     )
    // ) {
    //     throw new BadRequestException(
    //         'Участие в договоре ещё не было подтверждено всеми участниками. Пожалуйста, свяжитесь с ними.',
    //     );
    // }

    return true;

  }
}