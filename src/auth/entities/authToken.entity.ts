import { User } from 'src/user/entities/user.entity';
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique
} from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';

export interface AuthTokenPayload {
  id: number;
  telegramID: number;
  lastName: string;
}

@Entity()
@Unique('userId', ['token'])
export class AuthToken {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @OneToOne(() => User, {onUpdate: "CASCADE"})
  @JoinColumn()
  public readonly user: User;

  @Column({
    unique: true,
    transformer: new EncryptionTransformer({
      key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
      algorithm: 'aes-256-cbc',
      ivLength: 16,
      iv: 'ff5ac19190424b1d88f9419ef949ae56',
    }),
  })
  public readonly token: string;
}
