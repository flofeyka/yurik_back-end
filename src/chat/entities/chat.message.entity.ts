import { UUID } from 'crypto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Chat } from './chat.entity';
import { ChatUser } from './chat.user';

@Entity('messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  message: string;

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
  @JoinColumn()
  chat: Chat;

  @ManyToOne(() => ChatUser, (chatUser: ChatUser) => chatUser.messages)
  member: ChatUser;
}
