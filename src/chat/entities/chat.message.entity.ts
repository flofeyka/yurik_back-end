import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";
import { User } from "src/user/entities/user.entity";

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