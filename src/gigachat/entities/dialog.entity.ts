import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { GigaChatMessage } from "./message.entity";

@Entity({name: "gigachat_dialogs"})
export class GigaChatDialog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => GigaChatMessage, (message: GigaChatMessage) => message.dialog)
  messages: GigaChatMessage[];

}