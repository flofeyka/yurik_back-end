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

  @OneToMany(() => Message, (message: Message) => message.chat, {
    cascade: true,
    nullable: true,
  })
  messages: Message[];
}
