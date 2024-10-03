import { Agreement } from 'src/agreement/entities/agreement.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Message } from './chat.message.entity';
import { UUID } from 'crypto';
import { Image } from 'src/images/image.entity';
import { ChatMember } from './chat-member.entity';

@Entity({ name: 'chat' })
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @OneToOne(() => Agreement, (agreement: Agreement) => agreement.chat)
  @JoinColumn()
  agreement: Agreement;

  @OneToOne(() => Image)
  @JoinColumn()
  image: Image;

  @OneToMany(() => ChatMember, (member: ChatMember) => member.member)
  members: ChatMember[];

  @OneToMany(() => Message, (message: Message) => message.chat, {
    nullable: true,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    cascade: true
  })
  @JoinColumn()
  messages: Message[];
}
