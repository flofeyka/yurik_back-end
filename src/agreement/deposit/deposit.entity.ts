import { UUID } from 'crypto';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('agreement_deposits')
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  public id: UUID;

  @OneToOne(() => User)
  @JoinColumn()
  public owner: User;

  @Column({ default: 0 }) //мб поменяется
  public count: number;
}
