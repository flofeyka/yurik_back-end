import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { GigaChatMessage } from "./message.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: "gigachat_dialogs"})
export class GigaChatDialog {
  @ApiProperty({ title: "Уникальный идентификатор диалога. ", example: "3b94ab61-6174-4aa8-8e2f-ed008358ff92"})
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ApiProperty({ title: "Сообщения", example: [GigaChatMessage]})
  @OneToMany(() => GigaChatMessage, (message: GigaChatMessage) => message.dialog)
  messages: GigaChatMessage[];

}