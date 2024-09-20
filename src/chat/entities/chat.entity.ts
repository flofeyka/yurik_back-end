import { Agreement } from "src/agreement/entities/agreement.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./chat.message.entity";
import { User } from "src/user/entities/user.entity";

@Entity({name: 'chat'})
export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @OneToOne(() => Agreement, (agreement: Agreement) => agreement.chat)
    @JoinColumn()
    agreement: Agreement;

    @OneToMany(() => Message, (message: Message) => message.chat, {
        cascade: true, nullable: true
    })
    messages: Message[];
}