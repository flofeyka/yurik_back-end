import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ChatMember } from './chat-member.entity';
import { Chat } from './chat.entity';
import { UUID } from 'crypto';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  message: string;

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
  chat: Chat;

  @ManyToOne(() => ChatMember, (member: ChatMember) => member.messages, {onDelete: "CASCADE"})
  user: ChatMember;
}
