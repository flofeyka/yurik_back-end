import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '../../images/image.entity';
import { TelegramAccount } from './telegram-account.entity';
import { PersonalData } from './user.personal_data';
import { Chat } from 'src/chat/entities/chat.entity';

@Entity()
export class User {
  @ApiProperty({ title: 'Уникальный идентификатор', example: 1 })
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @ApiProperty({ title: 'Аватар пользователя' })
  @OneToOne(() => Image, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  public image: Image;

  @ApiProperty({ title: 'Имя. Обязательное поле', example: 'Максим' })
  @Column({ nullable: true })
  public firstName: string;

  @ApiProperty({ title: 'Фамилия. Обязательное поле', example: 'Максбетов' })
  @Column({ nullable: true })
  public lastName: string;

  @ApiProperty({ title: 'Отчество. Обязательное поле', example: 'Тагирович' })
  @Column({ nullable: true })
  public middleName: string;

  @ApiProperty({
    title: 'Номер телефона. Обязательное поле',
    example: "79123456789",
  })
  @Column({ nullable: true })
  public readonly phoneNumber: string;

  @ApiProperty({ title: 'ID Telegram', example: 312531 })
  @OneToOne(
    () => TelegramAccount,
    (telegram_account: TelegramAccount) => telegram_account.user,
    { eager: true },
  )
  public telegram_account: TelegramAccount;

  @Column({ nullable: true, type: 'date' })
  @ApiProperty({ title: 'Дата рождения', example: '2023-03-22' })
  public readonly BirthDate: Date;

  @Column({ nullable: true })
  @ApiProperty({ title: 'Электронная почта', example: 'email@admin.ru' })
  public readonly email: string;

  @ManyToMany(() => Chat)
  @JoinTable()
  public readonly chats: Chat[]

  @OneToOne(
    () => PersonalData,
    (personalData: PersonalData) => personalData.user,
    { eager: true, nullable: true, onDelete: "SET NULL", cascade: true, onUpdate: "CASCADE" },
  )
  @JoinColumn()
  personalData: PersonalData;
}
