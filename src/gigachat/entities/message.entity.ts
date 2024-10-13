import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GigaChatDialog } from './dialog.entity';
import { Chat } from 'src/chat/entities/chat.entity';

@Entity({ name: 'gigachat_messages' })
export class GigaChatMessage {
  @ApiProperty({
    title: 'Уникальный идентификатор сообщения. ',
    example: '3b94ab61-6174-4aa8-8e2f-ed008358ff92',
  })
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @ManyToOne(
    () => GigaChatDialog,
    (gigachat: GigaChatDialog) => gigachat.messages,
  )
  dialog: GigaChatDialog;

  @ApiProperty({ title: 'Роль', example: 'assistant' })
  @Column()
  role: 'user' | 'assistant';

  @ApiProperty({
    title: 'Ответ от ИИ/Вопрос от пользователя',
    example: 'Как дела?',
  })
  @Column()
  content: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
}
