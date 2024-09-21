import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GigaChatDialog } from "./dialog.entity";

@Entity({ name: "gigachat_messages" })
export class GigaChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => GigaChatDialog, (gigachat: GigaChatDialog) => gigachat.messages)
  dialog: GigaChatDialog;

  @Column()
  role: "user" | "assistant";

  @Column()
  content: string;
}