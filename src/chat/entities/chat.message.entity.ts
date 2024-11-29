import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
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

  @Column({ default: 'chat' })
  type: 'chat';

  @ManyToOne(() => ChatUser, (chatUser: ChatUser) => chatUser.messages, { eager: true })
  member: ChatUser;

  @CreateDateColumn()
  public created_at: Date;
}
