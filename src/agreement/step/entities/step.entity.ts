import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Agreement } from '../../entities/agreement.entity';
import { AgreementMember } from '../../members/member.entity';
import { StepImage } from './step-image.entity';
import { UUID } from 'crypto';

@Entity({name: "agreement_steps"})
export class AgreementStep {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @ManyToOne(() => Agreement, (agreement: Agreement) => agreement.steps, {onDelete: "CASCADE"})
  agreement: Agreement;

  @Column()
  title: string;

  @OneToMany(() => StepImage, (image: StepImage) => image.step, { cascade: true, eager: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn()
  images: StepImage[];

  @ManyToOne(
    () => AgreementMember,
    (agreementMember: AgreementMember) => agreementMember.agreement,
    { nullable: true, eager: true, onUpdate: "CASCADE", onDelete: "CASCADE" },
  )
  user: AgreementMember;

  @Column({ default: "Ожидает" })
  status: "Готов" | "Отклонён" | "В процессе" | "Ожидает" | "Завершён";

  @Column({ nullable: true, type: "json" })
  payment: {
    price: number;
    paymentLink: string;
  }

  @Column()
  public order: number;

  @Column({ nullable: true })
  comment: string | null;

  @Column({ type: 'date' })
  start: Date;

  @Column({ type: 'date' })
  end: Date;
}
