import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '../../images/image.entity';
import { User } from '../../user/entities/user.entity';
import { GigaChatMessage } from './message.entity';

@Entity({ name: 'gigachat_dialogs' })
export class GigaChatDialog {
  @ApiProperty({
    title: 'Уникальный идентификатор диалога. ',
    example: '3b94ab61-6174-4aa8-8e2f-ed008358ff92',
  })
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @ManyToOne(() => User)
  user: User;

  @Column()
  title: string;

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  image: Image;

  @ApiProperty({ title: 'Сообщения', example: [GigaChatMessage] })
  @OneToMany(
    () => GigaChatMessage,
    (message: GigaChatMessage) => message.dialog,
  )
  messages: GigaChatMessage[];
}
