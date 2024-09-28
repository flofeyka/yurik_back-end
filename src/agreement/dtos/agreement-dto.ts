import { LegalInformationDto } from "src/user/dtos/legal-information-dto";
import { Image } from "../../images/image.entity";
import { AgreementImage } from "../entities/agreement-image.entity";
import { Agreement } from "../entities/agreement.entity";
import { AgreementMember } from "../members/member.entity";
import { AgreementStep } from "../step/entities/step.entity";
import { StepImage } from "../step/entities/step-image.entity";

export class AgreementMemberDto {
  public id: number;
  public firstName: string;
  public lastName: string;
  public middleName: string;
  // public personalData: LegalInformationDto;
  public email: string;
  public status: "Заказчик" | "Подрядчик" | "Юрист";
  public inviteStatus: "Подтвердил" | "Приглашен" | "Отклонил";

  constructor(model: AgreementMember) {
    this.id = model.user.id;
    this.firstName = model.user.firstName;
    this.lastName = model.user.lastName;
    // this.personalData = model.user.personalData;
    this.middleName = model.user.middleName;
    this.email = model.user.email;
    this.status = model.status;
    this.inviteStatus = model.inviteStatus;
  }
}

export class AgreementStepDto {
  public id: number;
  public title: string;
  public status: "Готов" | "Отклонён" | "В процессе" | "Ожидает";
  public images: string[];
  public payment: null | {
    price: number;
    paymentLink: string | undefined;
  }
  public user: AgreementMemberDto;
  public start: Date;
  public end: Date;

  constructor(model: AgreementStep, userId: number) {
    Object.assign(this, {
      id: model.id,
      title: model.title,
      user: new AgreementMemberDto({ ...model.user }),
      images: model.images?.map((stepImage: StepImage) => `${process.env.API_URL}/images/picture/${stepImage.image.name}`),
      payment: model.payment ? {
        price: model.payment.price,
        paymentLink: model.user.user.id === userId ? model.payment.paymentLink : undefined
      } : null,
      status: model.status,
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
  public images: string[];
  public members: AgreementMemberDto[] | undefined;
  public steps: AgreementStepDto[] | undefined;
  public start: Date;
  public end: Date;

  constructor(model: Agreement, userId: number) {
    this.id = model.id;
    this.title = model.title;
    this.text = model.text;
    this.initiator = new AgreementMemberDto(model.initiator);
    this.status = model.status;
    this.images = model.images?.map((image: AgreementImage) => `${process.env.API_URL}/images/picture/${image.image.name}`);
    this.members = model.members?.map((member: AgreementMember) => new AgreementMemberDto(member));
    this.steps = model.steps?.map((step: AgreementStep) => new AgreementStepDto(step, userId));
    this.start = model.start;
    this.end = model.end;
  }
}