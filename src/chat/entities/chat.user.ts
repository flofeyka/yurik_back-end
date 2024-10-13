import { UUID } from "crypto";
import { Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./chat.entity";
import { ChatMessage } from "./chat.message.entity";
import { User } from "src/user/entities/user.entity";

@Entity({ name: "chat_users" })
export class ChatUser {
    @PrimaryGeneratedColumn("uuid")
    public id: UUID;

    @OneToOne(() => User, { eager: true, onUpdate: "CASCADE" })
    @JoinColumn()
    public user: User

    @ManyToMany(() => Chat, (chat: Chat) => chat.members)
    public chats: Chat[]

    @OneToMany(() => ChatMessage, (message: ChatMessage) => message.member)
    public messages: ChatMessage[];
}