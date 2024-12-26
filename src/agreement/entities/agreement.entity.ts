import { Chat } from 'src/chat/entities/chat.entity';
import { Pdf } from 'src/pdf/pdf.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { AgreementMember } from '../members/member.entity';
import { AgreementStep } from '../step/entities/step.entity';
import { AgreementImage } from './agreement-image.entity';

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

  @Column({nullable: true})
  public description: string;

  @Column({ nullable: true })
  public text: string;

  @Column({default: false})
  public is_edited: boolean;

  @OneToMany(
    () => AgreementMember,
    (member: AgreementMember) => member.agreement,
    { onDelete: 'SET NULL', onUpdate: "CASCADE" },
  )
  @JoinColumn()
  public members: AgreementMember[];

  @OneToMany(() => AgreementImage, (agreementImage: AgreementImage) => agreementImage.agreement, { onDelete: "SET NULL" })
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
    | 'Активный'
    | 'Расторгнут'
    | 'У юриста'
    | 'В поиске юриста'
    | 'Требуется действие'
    | 'Черновик'
    | 'Выполнен'

  @OneToMany(() => AgreementStep, (step: AgreementStep) => step.agreement, {
    eager: true,
    onDelete: "SET NULL"
  })
  @JoinColumn()
  public steps: AgreementStep[];
  
  @Column({ nullable: true })
  public stage: number;

  @Column({ nullable: true })
  public start: Date;

  @Column({ nullable: true })
  public end: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;
}
