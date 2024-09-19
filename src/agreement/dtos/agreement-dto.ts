import { Agreement, Step } from "../entities/agreement.entity";
import { AgreementMember } from "../entities/agreement.member.entity";
import { AgreementStep } from "../entities/agreement.step.entity";

export class AgreementMemberDto {
  public id: number;
  public firstName: string;
  public lastName: string;
  public middleName: string;
  public email: string;
  public status: "contractor" | "client";
  public inviteStatus: "Confirmed" | "Invited" | "Declined";
  
  constructor(model: AgreementMember) {
    Object.assign(this, {
      id: model.user?.id, 
      firstName: model.user?.firstName, 
      lastName: model.user?.lastName, 
      middleName: model.user?.middleName,
      email: model.user?.email,
      status: model.status,
      inviteStatus: model.inviteStatus
    });
  }
}

export class AgreementStepDto {
  public id: number;
  public title: string;
  public isComplete: boolean;
  public price: number;
  public user: AgreementMemberDto;
  public start: Date;
  public end: Date;

  constructor(model: AgreementStep) {
    Object.assign(this, {  
      id: model.id,
      title: model.title,
      user: new AgreementMemberDto({...model.user}),
      isComplete: model.isComplete,
      start: model.start,
      end: model.end
    });
  }

}
//Доделать информацию подающуяся на выходе.
export class AgreementDto {
  public id: number;
  public title: string;
  public text: string;
  public initiator: number;
  public status: "At work" | "Declined" | "At a lawyer" | "In confirm process";
  public price: number;
  public members: AgreementMember[];
  public steps: AgreementStep[];
  public start: Date;
  public end: Date;

  constructor(model: Agreement) {
    Object.assign(this, {...model, 
      members: [...model.members.map((member: AgreementMember) => new AgreementMemberDto(member))], 
      steps: [...model.steps.map((step: AgreementStep) => new AgreementStepDto(step))]
    });
  }
}