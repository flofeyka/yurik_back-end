import { User } from 'src/user/entities/user.entity';
import {
    Column,
    Entity,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Chat } from './chat.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  message: string;

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
  chat: Chat;

  @OneToOne(() => User)
  user: User;
}
