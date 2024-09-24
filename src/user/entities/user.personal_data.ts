import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';
import { User } from './user.entity';

@Entity()
export class PersonalData {
  @PrimaryGeneratedColumn('uuid')
  public readonly id: number;

  @OneToOne(() => User, (user: User) => user.personalData)
  @JoinColumn()
  public readonly user: User;

  @Column({
    nullable: true,
    transformer: new EncryptionTransformer({
      key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
      algorithm: 'aes-256-cbc',
      ivLength: 16,
      iv: 'ff5ac19190424b1d88f9419ef949ae56',
    }),
  })
  @ApiProperty({
    title: 'Кем выдан паспорт(В ТОЧНОСТИ КАК В ПАСПОРТЕ).',
    example: 'УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ',
  })
  public readonly authority: string | null;

  @Column({ nullable: true })
  @ApiProperty({
    title: 'Когда выдан паспорт(В ТОЧНОСТИ КАК В ПАСПОРТЕ).',
    example: '2010-01-01',
  })
  public readonly passportDate: Date;

  @Column({
    nullable: true,
    transformer: new EncryptionTransformer({
      key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
      algorithm: 'aes-256-cbc',
      ivLength: 16,
      iv: 'ff5ac19190424b1d88f9419ef949ae56',
    }),
  })
  @ApiProperty({ title: 'Серия паспорта', example: '1234' })
  public readonly serial: string;

  @Column({
    nullable: true,
    unique: true,
    transformer: new EncryptionTransformer({
      key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
      algorithm: 'aes-256-cbc',
      ivLength: 16,
      iv: 'ff5ac19190424b1d88f9419ef949ae56',
    }),
  })
  @ApiProperty({ title: 'Номер паспорта', example: '567890' })
  public readonly number: string;

  @Column({
    nullable: true,
    transformer: new EncryptionTransformer({
      key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
      algorithm: 'aes-256-cbc',
      ivLength: 16,
      iv: 'ff5ac19190424b1d88f9419ef949ae56',
    }),
  })
  @ApiProperty({
    title: 'Адрес прописки(В ТОЧНОСТИ КАК В ПАСПОРТЕ).',
    example: 'Тюменская область, г. Тюмень, улица Мориса Тореза, д. 1, кв. 1',
  })
  public readonly address: string;

  @Column({
    nullable: true,
    unique: true,
    transformer: new EncryptionTransformer({
      key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
      algorithm: 'aes-256-cbc',
      ivLength: 16,
      iv: 'ff5ac19190424b1d88f9419ef949ae56',
    }),
  })
  @ApiProperty({ title: 'ИНН', example: '1234567890' })
  public readonly TIN: string;
}
