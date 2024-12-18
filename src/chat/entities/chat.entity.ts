import { Agreement } from 'src/agreement/entities/agreement.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ChatMessage } from './chat.message.entity';
import { UUID } from 'crypto';
import { Image } from 'src/images/image.entity';
import { User } from 'src/user/entities/user.entity';
import { ChatUser } from './chat.user';

@Entity({ name: 'chat' })
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image;

  @Column({nullable: true})
  title: string;

  @ManyToMany(() => ChatUser, (user: ChatUser) => user.chats, { eager: true })
  @JoinTable()
  members: ChatUser[];

  @OneToMany(() => ChatMessage, (chatMessage: ChatMessage) => chatMessage.chat, { eager: true })
  @JoinColumn()
  messages: ChatMessage[];
}
