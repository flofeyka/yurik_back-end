import { MemberData, MemberEntity, Step } from "../entities/agreement.entity";

interface AgreementDtoType {
  readonly id: number;
  readonly title: string;
  readonly text: string;
  readonly initiator: number;
  readonly status: "At work" | "Declined" | "At a lawyer" | "In confirm process";
  readonly price: number;
  readonly members: Array<MemberData>;
  readonly steps: Array<Step>;
  readonly start: Date;
  readonly end: Date;
}

//Доделать информацию подающуяся на выходе.
export class AgreementDto {
  constructor(model: AgreementDtoType) {
    Object.assign(this, {
      ...model,
      members: [...model.members.map((member: MemberData) => {
        return {
          id: member.id,
          inviteStatus: member.inviteStatus,
          status: member.status
        };
      })]
    });
  }
}