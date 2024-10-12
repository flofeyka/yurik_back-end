import { LegalInformationDto } from "src/user/dtos/legal-information-dto";
import { Image } from "../../images/image.entity";
import { AgreementImage } from "../entities/agreement-image.entity";
import { Agreement } from "../entities/agreement.entity";
import { AgreementMember } from "../members/member.entity";
import { AgreementStep } from "../step/entities/step.entity";
import { StepImage } from "../step/entities/step-image.entity";
import { ApiProperty } from "@nestjs/swagger";
import { ImageDto } from "src/images/dtos/ImageDto";
import { PdfDto } from "src/pdf/pdf-dto";

export class AgreementMemberDto {
  @ApiProperty({ title: "ID участника договора", example: 12 })
  public id: number;
  @ApiProperty({ title: "Имя участника договора", example: "Иван" })
  public firstName: string;
  @ApiProperty({ title: "Фамилия участника договора", example: "Иванов" })
  public lastName: string;
  @ApiProperty({ title: "Картинка", type: Image })
  public image: string | null;
  @ApiProperty({ title: "Отчество участника договора", example: "Иванович" })
  public middleName: string;
  @ApiProperty({ title: "Почта участника договора", example: "ivan@mail.ru" })
  public email: string;
  @ApiProperty({ title: "Статус участника договора", example: "Заказчик" })
  public status: "Заказчик" | "Подрядчик" | "Юрист";
  @ApiProperty({ title: "Статус приглашения", example: "Подтвердил" })
  public inviteStatus: "Подтвердил" | "Приглашен" | "Отклонил";

  constructor(model: AgreementMember) {
    this.id = model.user.id;
    this.firstName = model.user.firstName;
    this.lastName = model.user.lastName;
    this.middleName = model.user.middleName;
    this.image = model.user.image ? new ImageDto(model.user.image).imgUrl : null;
    this.email = model.user.email;
    this.status = model.status;
    this.inviteStatus = model.inviteStatus;
  }
}

export class AgreementStepDto {
  @ApiProperty({ title: "ID шага", example: 1 })
  public id: number;
  @ApiProperty({ title: "Заголовок/название шага", example: "Закупка материалов" })
  public title: string;
  @ApiProperty({ title: "Описание шага", example: "Заказчик обязуется..." })
  public comment: string;
  @ApiProperty({ title: "Статус шага", example: "Готов" })
  public status: "Готов" | "Отклонён" | "В процессе" | "Ожидает";
  @ApiProperty({
    title: "Картинки шага", example: {
      "images": [
        "http://localhost:3000/api/images/picture/1aad9b7b-771a-4a37-823c-8de2dd4a8f02.jpg",
        "http://localhost:3000/api/images/picture/356d2593-16f7-4242-9e12-e30e954812ac.jpg",
        "http://localhost:3000/api/images/picture/f090d598-a785-4a95-b3c5-3b2504d897df.jpg",
        "http://localhost:3000/api/images/picture/d458e39b-9721-4f22-95fe-067d1597a817.jpg",
        "http://localhost:3000/api/images/picture/6677b140-981d-42c9-995c-759bbc924568.jpg"
      ]
    }
  })
  public images: string[];
  @ApiProperty({
    title: "Платежные данные(в случае если шаг с оплатой)", example: {
      payment: {
        price: 123132,
        paymentLink: "https://yoomoney.ru/to/4100111334315875"
      }
    }
  })
  public payment: null | {
    price: number;
    paymentLink: string | undefined;
  }
  @ApiProperty({ title: "Данные ответственного за шаг", type: AgreementMemberDto })
  public user: AgreementMemberDto;
  @ApiProperty({ title: "Дата начала", example: "2023-12-12" })
  public start: Date;
  @ApiProperty({ title: "Дата конца", example: "2024-12-12" })
  public end: Date;

  constructor(model: AgreementStep, userId: number) {
    Object.assign(this, {
      id: model.id,
      title: model.title,
      comment: model.comment,
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
  @ApiProperty({ title: "ID договора", example: 1 })
  public id: number;
  @ApiProperty({ title: "Заголовок договора", example: "Договор на ремонт квартиры" })
  public title: string;
  @ApiProperty({ title: "Содержание договора", example: "Двумя сторонами установлено..." })
  public text: string;
  @ApiProperty({ title: "Инициатор договора", type: AgreementMemberDto })
  public initiator: AgreementMemberDto;
  @ApiProperty({ title: "Статус договора", example: "В процессе" })
  public status: string;
  @ApiProperty({
    title: "Картинки договора", example: {
      "images": [
        "http://localhost:3000/api/images/picture/1aad9b7b-771a-4a37-823c-8de2dd4a8f02.jpg",
        "http://localhost:3000/api/images/picture/356d2593-16f7-4242-9e12-e30e954812ac.jpg",
        "http://localhost:3000/api/images/picture/f090d598-a785-4a95-b3c5-3b2504d897df.jpg",
        "http://localhost:3000/api/images/picture/d458e39b-9721-4f22-95fe-067d1597a817.jpg",
        "http://localhost:3000/api/images/picture/6677b140-981d-42c9-995c-759bbc924568.jpg"
      ]
    }
  })
  public images: string[];
  @ApiProperty({ title: "Участники договора", type: AgreementMemberDto, isArray: true })
  public members: AgreementMemberDto[] | undefined;
  @ApiProperty({ title: "Шаги договора", type: AgreementStepDto, isArray: true })
  public steps: AgreementStepDto[] | undefined;
  @ApiProperty({ title: "Дата начала", example: "2023-12-12" })
  public start: Date;
  @ApiProperty({ title: "Дата конца", example: "2024-12-12" })
  public end: Date;
  @ApiProperty({ title: "Ссылка на PDF", example: "http://localhost:3000/api/pdf/1.pdf" })
  public pdfLink: string | null;

  constructor(model: Agreement, userId: number) {
    this.id = model.id;
    this.title = model.title;
    this.text = model.text;
    this.initiator = new AgreementMemberDto(model.initiator);
    this.status = model.status;
    this.images = model.images?.map((image: AgreementImage) => `${process.env.API_URL}/images/picture/${image.image.name}`);
    this.members = model.members?.map((member: AgreementMember) => new AgreementMemberDto(member));
    this.steps = model.steps?.map((step: AgreementStep) => new AgreementStepDto(step, userId));
    this.pdfLink = new PdfDto(model.pdf).pdfLink || null;
    this.start = model.start;
    this.end = model.end;
  }
}