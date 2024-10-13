import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'telegram_accounts',
})
export class TelegramAccount {
  @ApiProperty({
    title: 'Уникальный идентификатора аккаунта в Telegram',
    example: 1,
  })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({
    title: 'Пользовательские данные(Если основной аккаунт зарегистрирован)',
  })
  @OneToOne(() => User, (user: User) => user.telegram_account, {onUpdate: 'CASCADE'})
  @JoinColumn()
  public user: User;

  @ApiProperty({
    title: 'Уникальный идентификатор аккаунта в Telegram',
    example: 14538713495,
  })
  @Column({ unique: true, type: 'bigint' })
  public telegramID: number;
}
