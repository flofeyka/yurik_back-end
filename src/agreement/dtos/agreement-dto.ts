import { last } from "rxjs";
import { Step } from "../entities/agreement.entity";
import { AgreementMember } from "../entities/agreement.member.entity";

interface AgreementDtoType {
  readonly id: number;
  readonly title: string;
  readonly text: string;
  readonly initiator: number;
  readonly status: "At work" | "Declined" | "At a lawyer" | "In confirm process";
  readonly price: number;
  // readonly members: Array<>;
  readonly steps: Array<Step>;
  readonly start: Date;
  readonly end: Date;
}

//Доделать информацию подающуяся на выходе.
export class AgreementDto {
  constructor(model: any) {
    Object.assign(this, {
      ...model,
      members: [...model.members.map((member: AgreementMember) => {
        return {
          agreementId: member.agreement.id,
          userId: member.user.id,
          status: member.status,
          inviteStatus: member.inviteStatus,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          middleName: member.user.middleName,
          image: member.user.imageUrl,
          
        }
      })]
    });
  }
}