import { Chat } from 'src/chat/entities/chat.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lawyer } from './agreement.lawyer.entity';
import { AgreementMember } from './agreement.member.entity';
import { AgreementStep } from './agreement.step.entity';
import { Image } from 'src/images/image.entity';
import { AgreementImage } from './agreement-image.entity';

export interface Step {
  title: string;
  userId: number;
  isComplete: boolean;
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
    { eager: true },
  )
  public members: AgreementMember[];

  @OneToMany(() => AgreementImage, (agreementImage: AgreementImage) => agreementImage.agreement)
  public images: AgreementImage[]

  @OneToOne(() => AgreementMember, { eager: true })
  @JoinColumn()
  public initiator: AgreementMember;

  @OneToOne(() => Chat, (chat: Chat) => chat.agreement, { nullable: true })
  public chat: Chat;

  @Column({ default: 'Черновик' })
  public status:
    | 'В работе'
    | 'Отклонён'
    | 'У юриста'
    | 'В поиске юриста'
    | 'В процессе подтверждения'
    | 'Черновик';

  @Column({ type: 'bigint', nullable: true })
  public price: number;

  @OneToMany(() => AgreementStep, (step: AgreementStep) => step.agreement, {
    eager: true,
  })
  public steps: AgreementStep[];

  @ManyToOne(() => Lawyer, (lawyer: Lawyer) => lawyer.agreements, {
    nullable: true,
    eager: true,
  })
  public lawyer: Lawyer;

  @Column({ nullable: true })
  public start: Date;

  @Column({ nullable: true })
  public end: Date;
}
