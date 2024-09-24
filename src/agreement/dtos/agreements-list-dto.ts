import { Agreement } from '../entities/agreement.entity';
import { AgreementMember } from '../entities/agreement.member.entity';
import { AgreementStep } from '../entities/agreement.step.entity';

export class AgreementsListDto {
  id: number;
  title: string;
  status: string;
  members: {
    firstName: string;
    lastName: string;
    middleName: string;
    status: string;
    inviteStatus: string;
  }[];
  steps: {
    title: string;
    isComplete: boolean;
  }[];
  start: Date;
  end: Date;

  constructor(model: Agreement) {
    this.id = model.id;
    this.title = model.title;
    this.members = model.members.map((member: AgreementMember) => {
      return {
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        middleName: member.user.middleName,
        status: member.status,
        inviteStatus: member.inviteStatus,
      };
    });
    this.steps = model.steps.map((step: AgreementStep) => {
      return {
        title: step.title,
        isComplete: step.isComplete,
      };
    });
    this.start = model.start;
    this.end = model.end;
  }
}
