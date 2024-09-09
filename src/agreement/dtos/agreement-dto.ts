import { Agreement, MemberEntity } from "../entities/agreement.entity";

//Доделать информацию подающуяся на выходе.
export class AgreementDto {
  constructor(model: Agreement) {
    Object.assign(this, {
      ...model,
      members: [...model.members.map((member: MemberEntity) => {
        return {
          id: member.id,
          isConfirmed: member.isConfirmed,
          status: member.status
        };
      })]
    });
  }
}