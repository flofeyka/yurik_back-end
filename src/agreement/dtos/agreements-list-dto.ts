import { Agreement } from '../entities/agreement.entity';
import { AgreementMember } from '../members/member.entity';
import { AgreementStep } from '../step/entities/step.entity';

export class AgreementsListDto {
  id: number;
  title: string;
  status: string;
  members: boolean;
  steps: {
    title: string;
    status: "Готов" | "Отклонён" | "В процессе" | "Ожидает";
    payment: null | {
      price: number;
      paymentLink: string | undefined
    }
  }[];
  start: Date;
  end: Date;

  constructor(model: Agreement) {
    this.id = model.id;
    this.title = model.title;
    this.members = model.members.length === 2;
    this.steps = model.steps?.map((step: AgreementStep) => {
      return {
        title: step.title,
        status: step.status,
        payment: step.payment ? {
          price: step.payment.price,
          paymentLink: step.payment.paymentLink || undefined
        } : null
      };
    });
    this.start = model.start;
    this.end = model.end;
  }
}
