import { Agreement, Step } from "../entities/agreement.entity";
import { AgreementMember } from "../entities/agreement.member.entity";
import { AgreementStep } from "../entities/agreement.step.entity";
import { Image } from "../../images/image.entity";

export class AgreementMemberDto {
  public id: number;
  public firstName: string;
  public lastName: string;
  public middleName: string;
  public email: string;
  public status: "Заказчик" | "Подрядчик" | "Юрист";
  public inviteStatus: "Подтвердил" | "Приглашен" | "Отклонил";
  
  constructor(model: AgreementMember) {
    this.id = model.user.id;
    this.firstName = model.user.firstName;
    this.lastName = model.user.lastName;
    this.middleName = model.user.middleName;
    this.email = model.user.email;
    this.status = model.status;
    this.inviteStatus = model.inviteStatus;
  }
}

export class AgreementStepDto {
  public id: number;
  public title: string;
  public isComplete: boolean;
  public price: number;
  public images: string[];
  public user: AgreementMemberDto;
  public start: Date;
  public end: Date;

  constructor(model: AgreementStep) {
    Object.assign(this, {  
      id: model.id,
      title: model.title,
      user: new AgreementMemberDto({...model.user}),
      images: model.images.map((image: Image) => `${process.env.API_URL}/images/picture/${image.name}`),
      isComplete: model.isComplete,
      start: model.start,
      end: model.end
    });
  }

}
export class AgreementDto {
  public id: number;
  public title: string;
  public text: string;
  public initiator: AgreementMemberDto;
  public initiatorStatus: string;
  public status: string;
  public price: number;
  public members: AgreementMemberDto[] | undefined;
  public steps: AgreementStepDto[] | undefined;
  public start: Date;
  public end: Date;

  constructor(model: Agreement) {
    this.id = model.id;
    this.title = model.title;
    this.text = model.text;
    this.initiator = new AgreementMemberDto(model.initiator);
    this.status = model.status;
    this.price = model.price;
    this.members = model.members?.map((member: AgreementMember) => new AgreementMemberDto(member));
    this.steps = model.steps?.map((step: AgreementStep) => new AgreementStepDto(step));
    this.start = model.start;
    this.end = model.end;
  }
}