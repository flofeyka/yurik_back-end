import { UUID } from "crypto";
import { AgreementMember } from "src/agreement/members/member.entity";
import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./chat.message.entity";
import { Chat } from "./chat.entity";

@Entity({name: "chat_members"})
export class ChatMember {
    @PrimaryGeneratedColumn('uuid')
    public id: UUID;

    @OneToOne(() => AgreementMember)
    @JoinColumn()
    member: AgreementMember;

    @OneToMany(() => Message, (message: Message) => message.message, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    messages: Message[];

    @ManyToOne(() => Chat, (chat: Chat) => chat.members, {cascade: true})
    @JoinColumn()
    chat: Chat;
}