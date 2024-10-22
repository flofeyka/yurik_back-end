import { Chat } from 'src/chat/entities/chat.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Lawyer } from '../lawyer/lawyer.entity';
import { AgreementMember } from '../members/member.entity';
import { AgreementStep } from '../step/entities/step.entity';
import { AgreementImage } from './agreement-image.entity';
import { Pdf } from 'src/pdf/pdf.entity';

export interface Step {
  title: string;
  userId: number;
  comment: string | null;
  start: Date;
  end: Date;
}

@Entity()
export class Agreement {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column({ nullable: true })
  public text: string;

  @OneToMany(
    () => AgreementMember,
    (member: AgreementMember) => member.agreement,
    { eager: true, onDelete: 'CASCADE' },
  )
  @JoinColumn()
  public members: AgreementMember[];

  @OneToMany(() => AgreementImage, (agreementImage: AgreementImage) => agreementImage.agreement, { onDelete: "CASCADE" })
  public images: AgreementImage[]

  @OneToOne(() => AgreementMember, { eager: true })
  @JoinColumn()
  public initiator: AgreementMember;

  @OneToOne(() => Pdf)
  @JoinColumn()
  public pdf: Pdf;

  @OneToOne(() => Chat, (chat: Chat) => chat, { nullable: true })
  @JoinColumn()
  public chat: Chat;

  @Column({ default: 'Черновик' })
  public status:
    | 'В работе'
    | 'Отклонён'
    | 'У юриста'
    | 'В поиске юриста'
    | 'В процессе подтверждения'
    | 'Черновик'
    | 'Завершён'

  @OneToMany(() => AgreementStep, (step: AgreementStep) => step.agreement, {
    eager: true
  })
  @JoinColumn()
  public steps: AgreementStep[];

  @ManyToOne(() => Lawyer, (lawyer: Lawyer) => lawyer.agreements, {
    nullable: true,
    eager: true,
    onDelete: "CASCADE"
  })
  public lawyer: Lawyer;

  @Column({ nullable: true })
  public start: Date;

  @Column({ nullable: true })
  public end: Date;
}
