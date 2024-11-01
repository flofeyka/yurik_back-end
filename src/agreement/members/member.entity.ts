import { UUID } from 'crypto';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Agreement } from '../entities/agreement.entity';

@Entity({ name: 'agreement_members' })
export class AgreementMember {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Agreement, (agreement: Agreement) => agreement.members, {
    onDelete: 'CASCADE',
  })
  agreement: Agreement;

  @Column()
  status: 'Заказчик' | 'Подрядчик' | 'Юрист';

  @Column()
  inviteStatus: 'Подтвердил' | 'Приглашен' | 'Отклонил';
}
