import { Chat } from "src/chat/entities/chat.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Lawyer } from "./agreement.lawyer.entity";
import { AgreementMember } from "./agreement.member.entity";
import { AgreementStep } from "./agreement.step.entity";

export interface Step {
  title: string;
  images: Array<string>;
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

  @Column()
  public text: string;

  @OneToMany(() => AgreementMember, (member: AgreementMember) => member.agreement, {cascade: true})
  public members: AgreementMember[];

  @Column()
  public initiator: number;

  @OneToOne(() => Chat, (chat: Chat) => chat.agreement)
  public chat: Chat;

  @Column({ default: "In confirm process" })
  public status: "At work" | "Declined" | "At a lawyer" | "Looking for a lawyer" | "In confirm process";

  @Column({ type: "float" })
  public price: number;

  @OneToMany(() => AgreementStep, (step: AgreementStep) => step.agreement, {cascade: true})
  public steps: AgreementStep[];

  @ManyToOne(() => Lawyer, (lawyer: Lawyer) => lawyer.agreements, {nullable: true})
  public lawyer: Lawyer;

  @Column('varchar', {array: true, nullable: true})
  public images: Array<string>;

  @Column()
  public start: Date;

  @Column()
  public end: Date;
}