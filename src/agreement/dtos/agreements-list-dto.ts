import { ApiProperty } from '@nestjs/swagger';
import { ImageDto } from 'src/images/dtos/ImageDto';
import { Agreement } from '../entities/agreement.entity';
import { AgreementMember } from '../members/member.entity';
import { AgreementStep } from '../step/entities/step.entity';

export class AgreementsListDto {
  @ApiProperty({ title: 'ID договора', example: 1 })
  id: number;
  @ApiProperty({
    title: 'Название договора',
    example: 'Договор возмездного оказания услуг',
  })
  title: string;
  @ApiProperty({ title: 'Статус договора', example: 'В работе' })
  status: string;

  members: {
    firstName: string;
    lastName: string;
    middleName: string;
    status: 'Заказчик' | 'Исполнитель' | 'Юрист';
    image: ImageDto | null;
  }[];
  steps: {
    title: string;
    status: 'Готов' | 'Отклонён' | 'В процессе' | 'Ожидает' | 'Завершён' | 'Требуется действие';
    payment: null | {
      price: number;
      paymentLink: string | undefined;
    };
  }[];

  stage: number;
  start: Date;
  end: Date;

  constructor(model: Agreement) {
    this.id = model.id;
    this.title = model.title;
    this.status = model.status;
    this.members = model.members?.map((member: AgreementMember) => ({
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      middleName: member.user.middleName,
      status: member.status,
      image: member.user.image ? new ImageDto(member.user.image) : null,
    }));

    this.steps = model.steps?.map((step: AgreementStep) => {
      return {
        title: step.title,
        status: step.status,
        payment: step.payment
          ? {
              price: step.payment.price,
              paymentLink: step.payment.paymentLink || undefined,
            }
          : null,
      };
    });
    this.stage = model.stage;
    this.start = model.start;
    this.end = model.end;
  }
}
