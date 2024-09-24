import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Agreement } from "./agreement.entity";
import { UUID } from "crypto";

@Entity({ name: "members" })
export class AgreementMember {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @ManyToOne(() => User, {eager: true})
  @JoinColumn()
  user: User;

  @ManyToOne(() => Agreement, (agreement: Agreement) => agreement.members)
  agreement: Agreement;

  @Column()
  status: "Заказчик" | "Подрядчик" | "Юрист";

  @Column()
  inviteStatus: "Подтвердил" | "Приглашен" | "Отклонил";
}