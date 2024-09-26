import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Agreement } from '../entities/agreement.entity';

@Entity({ name: 'lawyers' })
export class Lawyer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => Agreement, (agreement: Agreement) => agreement.lawyer)
  agreements: Agreement[];
}
